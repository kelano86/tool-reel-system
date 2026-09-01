import React from 'react';
import { Img, staticFile, interpolate, Easing } from 'remotion';

/* The accent. Historically coral, hence the name; now a deep emerald. */
export const CORAL = '#1F9E6C';
export const BEIGE = '#E1D7C8';
export const INK = '#16201C';
export const MUTED = '#6E7A73';
export const PAPER = '#ffffff';
export const LINE = '#C6CDC2';

const shadow = '0 3px 8px rgba(20,28,24,.12), 0 24px 60px rgba(20,28,24,.24)';
const ease = Easing.out(Easing.cubic);

export const seg = (p: number, a: number, b: number) =>
  interpolate(p, [a, b], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

/**
 * Overshoot-and-settle, which is how Saraev's cards land. They arrive slightly
 * large and settle down rather than fading up, which reads as physical.
 */
const settle = (f: number, delay = 0) =>
  interpolate(f, [delay, delay + 7, delay + 16], [1.14, 0.985, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

/** Logo box on the title card. Sized so it clears both third lines. */
const LOGO = 440;

/**
 * Height of the rank line ("#1", "#2") on a title card, as a fraction of the
 * frame. Derived rather than guessed: the rank/name/stars group is anchored at
 * y=665 and grows upward, which puts the rank block at 308-415 and its centre
 * at 362.
 *
 * The video title sits on this same line, so the opening frame and every
 * chapter card share one horizon.
 */
export const RANK_LINE = 0.1885;

/**
 * Instagram Reels safe zone, from their published spec for 1080x1920.
 *
 *   top    220px   app chrome
 *   bottom 450px   caption, username and the action rail
 *   left    35px
 *   right  100px   like / comment / share buttons
 *
 * Usable area is therefore x 35-980, y 220-1470. Note it is not centred: the
 * right rail takes 100px against 35 on the left, so a centred element of full
 * safe width still leans into the buttons.
 *
 * No TEXT may fall outside this. Video and B-roll may bleed past it - the face
 * box deliberately runs to the frame bottom - but anything that has to be read
 * stays inside.
 */
export const SAFE = { top: 220, bottom: 1920 - 450, left: 35, right: 1080 - 100 };

/**
 * Lowest a caption may be centred and still clear the bottom UI on two lines.
 *
 * 0.71 (y=1363) was budgeted against 208px, which is two lines of the SANS
 * variant at 100/1.04. The serif variant runs at size + 6, so its two-line
 * block is 220 and the same centre line put its foot at 1473 - three past the
 * safe bottom. 0.708 is y=1359, which lands the tallest case at 1469.
 */
export const LOW_CAPTION = 0.708;

/**
 * Widest a CENTRED element can be and still keep its edges inside SAFE.
 *
 * Not the safe width. The safe zone is asymmetric - 35px left, 100px right -
 * so a centred element is limited by the tighter side on both: 2 * (540 - 100)
 * = 880, not 980 - 35 = 945. An element built to 945 and centred hangs 32px
 * under the action rail on the right.
 */
export const SAFE_CENTRED_W = 880;

/**
 * Safe line for the topmost text on a frame.
 *
 * Instagram crops a 9:16 reel to 4:5 in the feed, which takes ~285px off the
 * top of a 1920 canvas, and the app's own chrome sits above that again.
 * Anything near the rank line is at risk of being covered before a viewer ever
 * opens it full screen.
 *
 * 1/3 of the way down (y=640) is two thirds of the frame height measured up
 * from the bottom, which is the rule already used for the title-card grid.
 */
export const SAFE_TOP_LINE = 1 / 3;

/** The intro title slot, in frame pixels. Content is centred in it. */
export const INTRO_TITLE_BOX = { x: 90, y: 240, w: 900, h: 200 };
/** The intro imagery slot, in frame pixels. Content is centred in it. */
export const INTRO_ART_BOX = { x: 90, y: 460, w: 900, h: 430 };

/**
 * Measured average advance of the title face, as a fraction of its size.
 *
 * Two values, because caps are much wider than mixed case in this italic and a
 * single figure cannot cover both. Measured off rendered frames: "5 trending
 * GitHub repos" ran at 0.559, and "GIVE YOUR AGENT" set at 94 measured 980px
 * across 15 characters, which is 0.695. The caps figure agrees with the serif
 * caption advance (0.698), which is the same face doing the same thing.
 *
 * The mixed-case number alone put the first line of this video's title at
 * x 56-1035 - 55px under the action rail - and nothing about the frame looked
 * wrong. Re-measure both if the face changes.
 */
const ADVANCE_MIXED = 0.559;
const ADVANCE_CAPS = 0.698;
const advanceFor = (text: string) =>
  text === text.toUpperCase() ? ADVANCE_CAPS : ADVANCE_MIXED;
/** Line height the title is set at. */
const LEADING = 1.06;
/** Largest the title is ever allowed to get, however much room it has. */
const TITLE_MAX = 116;

/**
 * Break the title into lines.
 *
 * **More than three words always breaks to two.** One long line has to shrink
 * to fit the width, which is the wrong trade: the title is the only claim on the
 * opening frame and it should be the biggest thing on it. Two lines halve the
 * width each line has to fit in, so the type can roughly double.
 *
 * Split at whichever word boundary makes the two lines closest in length.
 * Splitting down the middle by word count gives "5 trending GitHub / repos",
 * which is both lopsided and a bad phrase break.
 */
export const splitTitle = (text: string): string[] => {
  const words = text.trim().split(/\s+/);
  if (words.length <= 3) return [text];
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const diff = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length);
    /*
      <= so a tie goes to the LATER boundary. "730+ FREE APIs. one repo."
      measures the same both ways, and the earlier split gave
      "730+ FREE / APIs. one repo." - a break in the middle of the phrase.
    */
    if (diff <= bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
};

/**
 * Type size for the video title: as large as the slot will allow.
 *
 * Two independent limits, whichever binds first. **Height** because the slot is
 * 200px and two lines of it have to fit. **Width** because the longest line has
 * to stay inside the centred-safe 880, and it is the longest LINE that matters,
 * not the length of the whole title.
 *
 * This replaced a ladder of length buckets tuned by eye, which were not safe at
 * the top of their range: at 84 a 20-character title measures 939px and at 70 a
 * 28-character one measures 1096. The title in the build came out at 900 and sat
 * 8px inside the action rail.
 */
const titleSize = (text: string) => {
  const lines = splitTitle(text);
  const longest = Math.max(...lines.map((l) => l.length));
  const byHeight = INTRO_TITLE_BOX.h / (lines.length * LEADING);
  /*
    Less a slant allowance, the same 24 the title card already budgets. An
    italic block does not sit centred inside its own advance width: the lean
    pushes it right, so a line measured at exactly SAFE_CENTRED_W lands a few
    pixels past the rail. Sized to the full 880 this title measured 875 wide and
    still ran to x=982.
  */
  const byWidth = (SAFE_CENTRED_W - 24) / (longest * advanceFor(text));
  return Math.floor(Math.min(TITLE_MAX, byHeight, byWidth));
};

/**
 * The video's own title, on the opening frame.
 *
 * Every video needs one: without it the first shot is product art with no
 * statement of what the viewer is about to get.
 *
 * It sits centred in INTRO_TITLE_BOX, and `y` is that centre line in FRAME
 * pixels, passed in rather than written here as a percentage. A percentage
 * resolves against the containing block, and the containing block on the
 * opening shot is the 883px B-roll zone, not the frame: `top: 33.3%` put the
 * title at y=294 while every comment and rule said 640. Nothing looked broken,
 * it just left a 380px hole between the title and the artwork under it.
 *
 * Black rather than coral. Coral is the product-name colour on title cards, and
 * the video title is a different kind of statement; sharing the colour made the
 * opening frame read as one more item card. Set from `--ink` so it still works
 * if an opening ever runs on a dark ground.
 */
export const VideoTitle: React.FC<{ text: string; local: number; y: number }> = ({
  text,
  local,
  y,
}) => {
  const a = seg(local, 0, 12);
  const size = titleSize(text);
  const lines = splitTitle(text);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: y,
        transform: `translateY(-50%) scale(${settle(local)})`,
        textAlign: 'center',
        opacity: a,
        padding: '0 40px',
        fontFamily: 'Cambria, Georgia, serif',
        fontStyle: 'italic',
        fontWeight: 700,
        fontSize: size,
        lineHeight: LEADING,
        color: 'var(--ink)',
        letterSpacing: '.01em',
        WebkitTextStroke: '0.02em #050706',
      }}
    >
      {lines.map((l) => (
        <div key={l}>{l}</div>
      ))}
    </div>
  );
};

/**
 * The title card that opens each list item. Roughly 1.5s, no face, white
 * ground.
 *
 * Composition is locked to thirds, and every title card in the video uses it:
 *
 *   H/3   (640)  product name, coral serif italic
 *   H/2   (960)  logo, dead centre
 *   2H/3  (1280) caption
 *
 * That gives an even 320px between each element and stops the name crowding the
 * top of the frame. Saraev puts the ordinal in the name slot; we use the repo
 * name, since the ordinal is already spoken in the line whereas the name is the
 * thing a viewer needs to read.
 *
 * The type steps down with name length because "authentik" and "TencentDB Agent
 * Memory" share this slot.
 */
export const TitleCard: React.FC<{
  name: string;
  art: string;
  local: number;
  /** Position in the list, e.g. "#2". */
  rank: string;
  /** Formatted star count, e.g. "21.9k". */
  stars: string;
}> = ({ name, art, local, rank, stars }) => {
  const inRank = seg(local, 0, 8);
  const inText = seg(local, 3, 13);
  const inStars = seg(local, 8, 18);
  const inCard = seg(local, 5, 18);
  // Step the type down as the name gets longer rather than letting it overflow.
  // Names up to 18 characters are held on one line: a wrap puts the second line
  // straight behind the card, which is where the overlap stops being depth and
  // starts being a bug. Longer names wrap and take a shallower overlap.
  const n = name.length;
  /*
    The ladder, then a width cap on top of it.

    The ladder alone is not safe at the top of its buckets: "UI UX Pro Max" is
    13 characters, so it took the 112 step, and measured 878px on the rendered
    frame with its right edge at x=984 - four past the action rail. Serif italic
    runs about 0.61 of its size per character here, and the slant pushes the
    block right of centre, so the budget is SAFE_CENTRED_W less a little rather
    than all of it.
  */
  const ladder = n <= 10 ? 140 : n <= 14 ? 112 : n <= 18 ? 92 : 78;
  const oneLine = n <= 18;
  // Only the held-on-one-line names have to fit the width; a wrapping name is
  // already free to use two lines and capping it as if it were one makes it
  // needlessly small.
  const size = oneLine
    ? Math.floor(Math.min(ladder, (SAFE_CENTRED_W - 24) / (n * 0.61)))
    : ladder;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/*
        Rank, name and star count stack as one group, anchored by its BOTTOM at
        y=665 so it grows upward. Bottom-anchoring matters: the two long names
        wrap to a second line, and if the group grew downward that line would
        push the star count into the logo.
      */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: '65.36%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          /*
            The group is what makes a long name wrap, so it has to be the width
            a centred element is allowed rather than the frame less a padding.
            At `left:0; right:0; padding:0 30px` the line had 1020 to play with,
            so "Awesome Claude Design" fitted on one line at 999px and ran from
            x=29 to x=1041 - outside the safe zone at both ends, while the
            nowrap flag that was meant to govern this said nothing, because it
            only forbids a wrap and cannot force one.
          */
          width: SAFE_CENTRED_W,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            fontFamily: '-apple-system, "Segoe UI", Inter, Roboto, Helvetica, sans-serif',
            fontWeight: 800,
            fontSize: 96,
            lineHeight: 1.12,
            color: 'var(--ink)',
            letterSpacing: '-.02em',
            opacity: inRank,
            transform: `scale(${settle(local)})`,
          }}
        >
          {rank}
        </div>

        <div
          style={{
            marginTop: 10,
            textAlign: 'center',
            opacity: inText,
            transform: `scale(${settle(local, 3)})`,
            whiteSpace: oneLine ? 'nowrap' : 'normal',
          }}
        >
          <span
            style={{
              fontFamily: 'Cambria, Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: size,
              lineHeight: 1.06,
              color: CORAL,
              letterSpacing: '.01em',
              WebkitTextStroke: '0.02em #050706',
            }}
          >
            {name}
          </span>
        </div>

        <div
          style={{
            marginTop: 58,
            fontFamily: '-apple-system, "Segoe UI", Inter, Roboto, Helvetica, sans-serif',
            fontWeight: 700,
            fontSize: 54,
            lineHeight: 1.2,
            color: 'var(--ink)',
            letterSpacing: '-.01em',
            opacity: inStars,
            transform: `translateY(${(1 - inStars) * 10}px)`,
          }}
        >
          <span style={{ marginRight: 12 }}>â­</span>
          {stars} stars
        </div>
      </div>

      {/* Logo dead centre. */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: LOGO,
          height: LOGO,
          marginLeft: -LOGO / 2,
          marginTop: -LOGO / 2,
          transform: `scale(${settle(local, 5)})`,
          borderRadius: 88,
          overflow: 'hidden',
          background: PAPER,
          boxShadow: shadow,
          opacity: inCard,
        }}
      >
        <Img
          src={staticFile(`shots/${art}`)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    </div>
  );
};

/** A plain product card, for shots that return to the repo itself. */
export const ArtCard: React.FC<{ art: string; local: number }> = ({ art, local }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <div
      style={{
        /*
          Pixels, not 92%. The percentage computed to 993 and the card's right
          edge measured x=1036 on the rendered frame, well under the action
          rail - and these cards are product screenshots, so what is sitting
          under the buttons is text a viewer is meant to read.
        */
        width: SAFE_CENTRED_W,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: shadow,
        /* Dark screenshots dissolve into the split ground without an edge. */
        outline: '1.5px solid var(--rim)',
        background: PAPER,
        opacity: seg(local, 0, 10),
        transform: `scale(${settle(local)})`,
      }}
    >
      <Img src={staticFile(`shots/${art}`)} style={{ width: '100%', display: 'block' }} />
    </div>
  </div>
);

/** A terminal with the command typing itself in. */
export const TerminalCard: React.FC<{ local: number; total: number; command: string }> = ({
  local,
  total,
  command,
}) => {
  const appear = seg(local, 0, 12);
  const chars = Math.round(
    interpolate(local, [8, Math.max(20, total * 0.72)], [0, command.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const caret = Math.floor(local / 16) % 2 === 0;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          /*
            Pixels, not 96%. The percentage computes to 1036 and the panel
            measured x 22-1057 on the rendered frame - 77px under the action
            rail, with shell commands sitting in it. A terminal is all text, so
            none of it may cross the line.
          */
          width: SAFE_CENTRED_W,
          boxSizing: 'border-box',
          background: '#12171A',
          borderRadius: 24,
          boxShadow: shadow,
          /* A dark panel on the dark split ground dissolves without an edge;
             --rim is transparent on light grounds, so this costs nothing there. */
          outline: '1.5px solid var(--rim)',
          overflow: 'hidden',
          opacity: appear,
          transform: `scale(${settle(local)})`,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 12,
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,.09)',
          }}
        >
          {['#E9615A', '#E5B94E', '#59C36A'].map((c) => (
            <span key={c} style={{ width: 20, height: 20, borderRadius: 10, background: c }} />
          ))}
        </div>
        <div
          style={{
            padding: '46px 36px 60px',
            fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
            fontSize: 52,
            lineHeight: 1.5,
            color: '#EAF0EC',
          }}
        >
          <span style={{ color: CORAL }}>$ </span>
          {command.slice(0, chars)}
          <span style={{ opacity: caret ? 1 : 0, color: CORAL }}>â–‹</span>
        </div>
      </div>
    </div>
  );
};

/**
 * A multi-line terminal session. Commands type out, their output appears whole.
 *
 * Used where the claim is "a real machine": showing `uname` and a package
 * install proves it far better than a single invented command would.
 */
export const TerminalSession: React.FC<{
  local: number;
  total: number;
  lines: { cmd?: string; out?: string }[];
}> = ({ local, total, lines }) => {
  const appear = seg(local, 0, 10);
  // One budget of characters spread across the whole block.
  const totalChars = lines.reduce((n, l) => n + (l.cmd ?? l.out ?? '').length, 0);
  const typed = interpolate(local, [8, Math.max(24, total * 0.8)], [0, totalChars], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const caret = Math.floor(local / 16) % 2 === 0;

  let used = 0;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          /*
            Pixels, not 96%. The percentage computes to 1036 and the panel
            measured x 22-1057 on the rendered frame - 77px under the action
            rail, with shell commands sitting in it. A terminal is all text, so
            none of it may cross the line.
          */
          width: SAFE_CENTRED_W,
          boxSizing: 'border-box',
          background: '#12171A',
          borderRadius: 24,
          boxShadow: shadow,
          /* A dark panel on the dark split ground dissolves without an edge;
             --rim is transparent on light grounds, so this costs nothing there. */
          outline: '1.5px solid var(--rim)',
          overflow: 'hidden',
          opacity: appear,
          transform: `scale(${settle(local)})`,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 12,
            padding: '18px 22px',
            borderBottom: '1px solid rgba(255,255,255,.09)',
          }}
        >
          {['#E9615A', '#E5B94E', '#59C36A'].map((c) => (
            <span key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />
          ))}
        </div>
        <div
          style={{
            padding: '30px 30px 38px',
            fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
            fontSize: 40,
            lineHeight: 1.5,
            color: '#EAF0EC',
            minHeight: 300,
          }}
        >
          {lines.map((l, i) => {
            const text = l.cmd ?? l.out ?? '';
            const start = used;
            used += text.length;
            const shown = Math.max(0, Math.min(text.length, Math.round(typed) - start));
            if (shown <= 0) return null;
            const last = Math.round(typed) < used;
            return (
              <div key={i} style={{ whiteSpace: 'pre-wrap' }}>
                {l.cmd ? <span style={{ color: CORAL }}>$ </span> : null}
                <span style={{ color: l.out ? '#93A39A' : '#EAF0EC' }}>
                  {text.slice(0, shown)}
                </span>
                {last && l.cmd ? (
                  <span style={{ opacity: caret ? 1 : 0, color: CORAL }}>â–‹</span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

