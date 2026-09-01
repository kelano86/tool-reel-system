"""Harvest usable B-roll and structured claims from each repo.

Run: python scripts/fetch_assets.py

Four sources, in order of how good the resulting shot is:

  1. README screenshots  - the best B-roll there is. Real product UI, already
                           chosen by the maintainer as representative.
  2. Named repo files    - logos and example output that the README never
                           embeds. `assets/taste-skill-logo.png` and the
                           juniper-audit example screenshots are both here, and
                           neither shows up in a README scrape.
  3. Structured facts    - lists a line is making a claim about. "68 design
                           systems" is a claim about a specific catalogue, and
                           the catalogue is in the README.
  4. (nothing)           - the sequence has to be carried by our own animation.

Badges are the main thing to filter out. A README is full of shields.io pills,
and they look like images to a naive scrape but are useless as B-roll. They are
rejected on host, on aspect ratio, and on absolute size.

Star counts are refetched every run: they move daily, and a stale number on
screen is exactly the kind of thing that gets corrected in the comments.

Output goes to public/shots/<key>/ and an index is written to
src/data/assets.json so the composition can see what exists without a scrape.
Nothing that ends up on screen is ever hand-typed into the composition.
"""
import base64, io, json, os, re, sys, time, urllib.parse, urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.path.join(ROOT, 'public', 'shots')
STARS_PATH = os.path.join(ROOT, 'src', 'data', 'stars.json')
STARS = json.load(open(STARS_PATH, encoding='utf-8'))

UA = {"Accept": "application/vnd.github+json", "User-Agent": "asset-fetch"}
BADGE_HOSTS = ('shields.io', 'badge.fury.io', 'travis-ci', 'codecov.io', 'circleci',
               'badgen.net', 'trendshift.io', 'app.netlify.com', 'herokucdn',
               'forthebadge', 'sonarcloud', 'coveralls', 'awesome.re')
MIN_PX = 480          # a real screenshot is at least this wide
MIN_AREA = 480 * 240


def gh(url):
    return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA)))


def raw(repo, branch, path):
    u = f"https://raw.githubusercontent.com/{repo}/{branch}/{path}"
    req = urllib.request.Request(u, headers={"User-Agent": "asset-fetch"})
    return urllib.request.urlopen(req, timeout=40).read()


def readme_text(repo):
    try:
        d = gh(f"https://api.github.com/repos/{repo}/readme")
        return base64.b64decode(d['content']).decode('utf-8', 'replace')
    except Exception:
        return ''


def image_urls(md, repo, branch):
    """Every image reference in the README, markdown and raw HTML alike."""
    urls = []
    urls += re.findall(r'!\[[^\]]*\]\(\s*<?([^)\s>]+)', md)
    urls += re.findall(r'<img[^>]+src=["\']([^"\']+)', md, re.I)
    out, seen = [], set()
    for u in urls:
        u = u.strip()
        if u.startswith('data:'):
            continue
        if not u.startswith('http'):
            # Relative path: resolve against the raw host for this branch.
            u = f"https://raw.githubusercontent.com/{repo}/{branch}/{u.lstrip('./')}"
        if any(h in u for h in BADGE_HOSTS):
            continue
        if u in seen:
            continue
        seen.add(u)
        out.append(u)
    return out


def probe(path):
    """Width/height without a decode library, for the formats we actually get."""
    with open(path, 'rb') as f:
        head = f.read(32)
    try:
        if head[:8] == b'\x89PNG\r\n\x1a\n':
            import struct
            w, h = struct.unpack('>II', head[16:24])
            return w, h
        from PIL import Image
        return Image.open(path).size
    except Exception:
        return 0, 0


def extract_facts(md):
    """Structured claims worth animating, pulled out of the README.

    Screenshots show what a tool looks like; facts say what it does. A list of
    sixty-eight design systems is far better B-roll than a second view of the
    same banner, and it comes straight from the source so nothing has to be
    invented. When a line names a count, this is where the count's evidence is.
    """
    facts = {}

    # Slash commands, e.g. `/spec`. Deduped, order preserved.
    cmds = []
    for m in re.finditer(r'`(/[a-z][a-z0-9-]{1,24})`', md):
        c = m.group(1)
        if c not in cmds:
            cmds.append(c)
    # Compound doc references ("/spec-driven-development") are not commands;
    # drop anything far longer than the rest of the set.
    if cmds:
        typical = sorted(len(c) for c in cmds)[len(cmds) // 2]
        cmds = [c for c in cmds if len(c) <= max(typical + 6, 14)]
    if cmds:
        facts['commands'] = cmds

    # Numbered how-it-works steps, first sentence only.
    steps = re.findall(r'^\s*\d+\.\s+(.{8,120}?)(?:\.|\n|$)', md, re.M)
    if len(steps) >= 2:
        facts['steps'] = [re.sub(r'[`*\[\]]', '', s).strip() for s in steps[:6]]

    # Short bold feature labels, which usually name capabilities.
    bold = re.findall(r'^\s*[-*]\s+\*\*([^*]{3,28})\*\*\s*$', md, re.M)
    bold += re.findall(r'^\s*[-*]\s+\*\*([^*]{3,28})\*\*\s*[-:—]', md, re.M)
    # "- **Container** projects the SQLite state into a sandbox container..."
    # A bold label opening a prose sentence, which is how cloudflare/computer
    # names its three backends. The two patterns above only catch a label that
    # stands alone or is followed by a dash, so all three were being missed.
    bold += re.findall(r'^\s*[-*]\s+\*\*([^*]{3,28})\*\*\s+[A-Za-z]', md, re.M)
    seen, feats = set(), []
    for b in bold:
        b = b.strip().rstrip(':')
        if b.lower() not in seen:
            seen.add(b.lower())
            feats.append(b)
    if len(feats) >= 3:
        facts['features'] = feats[:8]

    # A catalogue: "- [**Name**](url) - one line about it", under ### headings.
    # This is the shape an awesome-list uses, and it is the evidence for any
    # line that names how many things are in the list.
    cat, section = [], ''
    for line in md.splitlines():
        h = re.match(r'^###\s+(.{2,40})\s*$', line)
        if h:
            section = h.group(1).strip()
            continue
        m = re.match(r'^\s*[-*]\s+\[\*\*([^*\]]{2,28})\*\*\]\([^)]+\)\s*[-–—]\s*(.{4,160})$',
                     line)
        if m:
            cat.append({"name": m.group(1).strip(),
                        "note": m.group(2).strip().rstrip('.'),
                        "group": section})
    if len(cat) >= 8:
        facts['catalog'] = cat

    # What the extractor actually reads off a page, in the repo's own words:
    #   "...(typography, colors, spacing, radius, shadows, motion)."
    # The spoken line names three of these. Showing the repo's full six with the
    # three spoken ones picked out is both more than the line claims and
    # checkable, where a hand-typed list of three is neither.
    m = re.search(r'\(((?:[a-z]+,\s*){3,}[a-z]+)\)', md)
    if m:
        facts['signals'] = [s.strip() for s in m.group(1).split(',')]

    # The generated file's own section list, from the "Generated file structure"
    # table. This is what a DESIGN.md contains, so it is what the document shot
    # should be built out of - rendered as live type rather than as an upscaled
    # crop of a 508px screenshot panel.
    sections = re.findall(r'^\|\s*`([A-Z][^`|]{2,32})`\s*\|\s*([^|]{6,120}?)\s*\|\s*$', md, re.M)
    if len(sections) >= 5:
        facts['sections'] = [{"name": a, "note": b.rstrip('.')} for a, b in sections]

    # The egress policies, named in the examples list:
    #   "...with matching `none`, `all`, or custom egress policies."
    # The re-hook line claims the internet can be cut off completely, and `none`
    # is that claim's evidence. Read rather than typed, so the shot cannot end up
    # naming a policy the repo does not have.
    m = re.search(r'`(\w+)`,\s*`(\w+)`,\s*or\s+(\w+)\s+egress polic', md)
    if m:
        facts['egress'] = [m.group(1), m.group(2), m.group(3)]

    # The PREVIEW ONLY callout, which the payoff line states outright. Taken
    # verbatim from the README so the on-screen banner is the repo's own words.
    m = re.search(r'\*\*PREVIEW ONLY\*\*\s*(.{10,120}?\.)', md, re.S)
    if m:
        facts['preview'] = re.sub(r'\s+', ' ', m.group(1)).strip()
    # The callout is a blockquote, so its continuation lines carry a leading
    # "> " that plain \s+ will not cross. Match across the marker instead.
    m = re.search(r'(NOT suitable[\s>]+for production[^.>]*)\.', md, re.S)
    if m:
        facts['notProduction'] = re.sub(r'[\s>]+', ' ', m.group(1)).strip()

    return facts


def extract_motion(md):
    """Real timing and easing values out of a motion reference.

    The line for item 5 claims the skill adds "real motion, timing and easing".
    The only honest way to show that is with the numbers the skill actually
    prescribes, and those live in its reference files rather than its README.
    """
    out = {}
    beziers = re.findall(r'cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*'
                         r'([-\d.]+)\s*,\s*([-\d.]+)\s*\)', md)
    if beziers:
        seen, keep = set(), []
        for b in beziers:
            t = tuple(float(x) for x in b)
            if t not in seen:
                seen.add(t)
                keep.append(list(t))
        out['beziers'] = keep[:6]
    durs = re.findall(r'duration:\s*([\d.]+)', md) + re.findall(r'(\d{2,4})ms', md)
    if durs:
        out['durations'] = sorted({float(d) for d in durs})[:8]
    props = [p for p in ('opacity', 'translateY', 'blur', 'scale', 'spring')
             if re.search(rf'\b{p}\b', md, re.I)]
    if props:
        out['props'] = props
    return out


index = {}
for key, meta in STARS.items():
    repo = meta['repo']
    print(f"\n=== {key}  {repo}")
    outdir = os.path.join(SHOTS, key)
    os.makedirs(outdir, exist_ok=True)

    info = gh(f"https://api.github.com/repos/{repo}")
    branch = info['default_branch']
    stars = info['stargazers_count']
    meta['stars'] = stars
    print(f"    {stars:,} stars  (branch {branch})")

    md = readme_text(repo)
    kept = []

    def keep(dest, label):
        w, h = probe(dest)
        if w < MIN_PX or w * h < MIN_AREA or (w and h and w / h > 8):
            os.remove(dest)
            return False
        kept.append({"file": f"{key}/{os.path.basename(dest)}", "w": w, "h": h})
        print(f"    kept {os.path.basename(dest):22} {w}x{h}  {label}")
        return True

    for i, u in enumerate(image_urls(md, repo, branch)[:14]):
        ext = os.path.splitext(urllib.parse.urlparse(u).path)[1].lower() or '.png'
        if ext not in ('.png', '.jpg', '.jpeg', '.webp', '.gif'):
            continue
        dest = os.path.join(outdir, f"shot{len(kept) + 1}{ext}")
        try:
            req = urllib.request.Request(u, headers={"User-Agent": "asset-fetch"})
            data = urllib.request.urlopen(req, timeout=40).read()
            if len(data) < 6000:                      # too small to be a screenshot
                continue
            open(dest, 'wb').write(data)
            keep(dest, 'readme')
        except Exception as e:
            print(f"    skip ({type(e).__name__})")
        time.sleep(0.2)

    # Named files: logos and example output the README never embeds.
    named = {}
    for path in meta.get('files', []):
        base = os.path.basename(path)
        dest = os.path.join(outdir, base)
        try:
            open(dest, 'wb').write(raw(repo, branch, path))
            w, h = probe(dest)
            named[base] = {"file": f"{key}/{base}", "w": w, "h": h}
            print(f"    kept {base:22} {w}x{h}  named")
        except Exception as e:
            print(f"    named MISS {path} ({type(e).__name__})")
        time.sleep(0.2)

    # Images that are authoritative but live outside the repo tree: the GitHub
    # OG card, the vendor's own announcement card, the org mark. cloudflare/
    # computer embeds no images at all, so without these the only real picture of
    # the product would be its hand-drawn internal architecture doc.
    for base, u in meta.get('urls', {}).items():
        dest = os.path.join(outdir, base)
        try:
            req = urllib.request.Request(u, headers={"User-Agent": "asset-fetch"})
            open(dest, 'wb').write(urllib.request.urlopen(req, timeout=40).read())
            w, h = probe(dest)
            named[base] = {"file": f"{key}/{base}", "w": w, "h": h}
            print(f"    kept {base:22} {w}x{h}  url")
        except Exception as e:
            print(f"    url MISS {base} ({type(e).__name__})")
        time.sleep(0.2)

    if not kept and not named:
        print("    no usable imagery - this one needs custom animation")

    facts = extract_facts(md)
    for path in meta.get('docs', []):
        try:
            doc = raw(repo, branch, path).decode('utf-8', 'replace')
        except Exception:
            continue
        m = extract_motion(doc)
        for k, v in m.items():
            facts.setdefault('motion', {}).setdefault(k, v)

    for k, v in facts.items():
        s = json.dumps(v)
        print(f"    facts.{k}: {len(v) if isinstance(v, list) else ''} "
              f"{s if len(s) < 84 else s[:82] + chr(8230)}")

    index[key] = {"repo": repo, "stars": stars, "screenshots": kept,
                  "named": named, "facts": facts}

json.dump(index, open(os.path.join(ROOT, 'src', 'data', 'assets.json'), 'w'), indent=1)
json.dump(STARS, open(STARS_PATH, 'w'), indent=1)
print("\nwrote src/data/assets.json and refreshed star counts in stars.json")
