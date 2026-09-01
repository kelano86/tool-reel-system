# Tool Reel — Edit Teardown (frame by frame)

Companion to `formula-teardown.md`, which covers the writing. This one
covers the cut.

Subject: the **2.5m-view Google video**, the studied creator's best performer
and a listicle, so it is the closest match to our 5-repos edit.

Method: scene-change detection for exact cut points, a frame sampled just after
each cut, dense sampling inside single shots to measure motion, and pixel
sampling for the palette.

---

## 1. Hard numbers

| Metric | Measured |
|---|---|
| Format | 1080x1920, **30fps** (not 60), 43.77s, 1313 frames |
| Cuts | 20 |
| Mean shot length | **2.0s** |
| Shot range | **0.26s to 3.43s** |
| Caption cadence | **1 to 2 words, changing every ~0.42s** |
| Face on screen | roughly **half** the shots |

The 0.26s shot matters. He is not cutting on a metronome, he punches.

---

## 2. Shot taxonomy

Six distinct compositions, not two:

1. **Two-zone** — product card top, face in a rounded box bottom, light ground
2. **Full-bleed face** — dark warm room, caption low
3. **Graphics only, light** — no face at all, product UI on white
4. **Graphics only, dark** — near-black ground, code editor or dark UI
5. **Ordinal card** — see below, the beat we do not have
6. **Logo card** — the product's *logo* on a tinted ground, not a screenshot

The important finding is how often the face is simply absent. Our current build
keeps it on screen in nearly every frame.

---

## 3. The ordinal card (the missing beat)

Every list item opens with its own graphics-only shot, roughly 1 to 1.5s:

- Warm beige ground (**#E1D7C8**)
- The ordinal — FIRST, SECOND, THIRD, FIFTH — in **large serif italic caps**,
  coral (**#E7896D**)
- The product's **logo** on a white rounded-square card
- The card overlaps and sits **in front of** the ordinal text, giving depth
- Both elements **scale-settle**: they land slightly large and settle down,
  rather than fading in

This is a chapter marker. It resets attention before each item and is a large
part of why the listicle feels segmented rather than continuous.

---

## 4. Ground colour changes per shot

There is no single background. Measured across the video: white/near-white
(**#F9F9F9**), warm beige (**#E1D7C8**), near-black, dark olive. The ground
tracks whatever product is on screen, so the frame re-colours every few seconds.

The light grounds are also **not flat** — there is a soft palm-frond shadow
texture over them. Ours is a flat fill.

---

## 5. Text system

Three treatments, used deliberately:

| Treatment | Where it appears |
|---|---|
| **Sans bold** (white on dark, ink on light) | connective narration **while the face is on screen** |
| **Serif italic caps** | **graphics-only shots**, and emphasis/keywords wherever they fall |
| **Mono caps** | small labels, e.g. a "11 NEW TOOLS" tag |

So serif italic is doing two jobs at once: it marks the accented word, and it is
the default whenever the face is absent. The clearest exception proves it — in
the CTA, "comment" is serif italic *over* a full-bleed face, because it is the
keyword.

Text is not pinned to one position. It sits over the B-roll, under it, or
several words at different points in the frame within one shot.

---

## 6. Motion inside a shot

B-roll is not a static image with a slow push. Sampling one 2.2s shot at 0.55s
intervals shows the card **fade in, populate with content, then fade out again**
inside that single shot. The product UI animates as its own element.

The ordinal card's scale-settle is the same idea: overshoot, then settle.

---

## 7. Annotation

At least one shot puts a **coral outline box** around part of a screenshot to
point at the thing being described. Cheap, and it directs the eye.

---

## 8. Palette

```
ground-light   #F9F9F9   (with soft frond shadow texture)
ground-beige   #E1D7C8   (ordinal cards)
ground-dark    near-black
coral accent   #E7896D   (ordinals, annotation boxes)
card           #FFFFFF
```

Note the accent is **coral**, not the amber we are using.

---

## 9. Delta against our current 5-repos build

Ordered by how much each would change the feel:

| # | Change | Status in our edit |
|---|---|---|
| 1 | Add ordinal chapter cards per item | missing entirely |
| 2 | Vary ground colour per shot | single flat light ground |
| 3 | Drop the face out of ~half the shots | face in nearly every frame |
| 4 | Cut more often, mean 2.0s, allow sub-second punches | 2 compositions per ~8s beat |
| 5 | Speed captions up to 1-2 words / ~0.42s | 3 words / up to 1.1s |
| 6 | Animate B-roll within a shot, not just a slow push | slow push only |
| 7 | Serif italic whenever the face is absent | serif only on emphasis |
| 8 | Coral accent #E7896D | amber #9C5D11 |
| 9 | Add frond-shadow texture to light grounds | flat fill |
| 10 | Annotation boxes on screenshots | none |
| 11 | Use product logos, not only repo cards | OG cards only |

Items 1, 3 and 4 are the ones that would move it most. They are all the same
underlying point: **his edit is built from many short, varied shots, ours is
built from a few long ones.**

---

## 10. What this implies for our shoot

The 30fps vs our 60fps does not matter for delivery. What does matter is that a
mean shot length of 2.0s over 44s means ~20 distinct visual moments. Ours
currently has 13 (two per item beat, one each for hook and CTA). Closing that
gap is mostly an assets problem: it needs logos, more screenshots, and a
reason to cut, not just more cutting.
