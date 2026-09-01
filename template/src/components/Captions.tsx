import React from 'react';
import { interpolate, Easing } from 'remotion';
import captions from '../data/captions.json';
import { CORAL, INK, SAFE_CENTRED_W } from './shots';

type Chunk = { text: string; from: number; to: number; emph: boolean };
const data = captions as Record<string, Chunk[]>;

/**
 * Word-synced captions, 1-2 words at a time (measured: Saraev changes caption
 * roughly every 0.42s).
 *
 * Two treatments, and the rule is not purely about emphasis:
 *   - sans bold      while the face is on screen
 *   - serif italic   on graphics-only shots, AND on the accented phrase wherever
 *                    it falls
 * The clearest evidence for the second half is his CTA, where the keyword is
 * serif italic over a full-bleed face.
 */
export const Captions: React.FC<{
  beatKey: string;
  local: number;
  y: number;
  /** Face visible in this shot. Drives sans vs serif. */
  faceOnScreen: boolean;
  /** Dark ground, so the type flips to light. */
  onDark: boolean;
}> = ({ beatKey, local, y, faceOnScreen, onDark }) => {
  const chunks = data[beatKey];
  if (!chunks) return null;

  const active = chunks.find((c) => local >= c.from && local < c.to);
  if (!active) return null;

  const age = local - active.from;
  const pop = interpolate(age, [0, 5], [0.93, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const fade = interpolate(age, [0, 3], [0, 1], { extrapolateRight: 'clamp' });

  const serif = active.emph || !faceOnScreen;
  const n = active.text.length;

  /*
    A ladder by length, then a width cap on top of it.

    The ladder alone lets a chunk run past the centred-safe 880 and wrap, and a
    wrapped chunk is worse in both directions: "real motion," broke as REAL /
    MOTION, which reads as two captions rather than one phrase, and the two-line
    block's foot measured 1471 against a safe bottom of 1470. Shrinking to fit
    keeps every chunk on one line, which is what 1-to-2-word captions are for.

    The two advances are measured off rendered frames of this build, as a
    fraction of type size: serif italic caps run much wider than the sans.
    Re-measure them if either face changes.
  */
  /*
    Serif re-measured on this build: "production just" set at 82 came out 883px
    wide, which is 0.718 per character, and 0.698 sized it to 82 in the first
    place. The italic also does not sit centred inside its own advance - the
    lean pushes the block right - so it landed at x 101-983, three past the
    rail. Both corrections are needed: the higher advance, and a slant
    allowance on the budget rather than the 12px of breathing room.

    The sans measures 0.43 against the 0.482 assumed here, so that side is
    already conservative and is left alone.
  */
  /*
    Re-measured on THIS build's frames: "AUTOMATIONS" set at 106 rendered
    891px, which is 0.764 per character - the 0.718 measured on the previous
    build let it hang 8px under the action rail. 0.79 buys the slant a little
    room on top of the measurement.
  */
  const advance = serif ? 0.79 : 0.482;
  const budget = SAFE_CENTRED_W - (serif ? 30 : 12);
  const ladder = n > 20 ? 74 : n > 13 ? 88 : 100;
  const size = Math.floor(Math.min(serif ? ladder + 6 : ladder, budget / (n * advance)));
  const colour = active.emph ? CORAL : onDark ? '#F2F5F1' : INK;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: y,
        transform: `translateY(-50%) scale(${pop})`,
        textAlign: 'center',
        /*
          Held to the centred-safe width, not to a padding.

          A padding of 44 a side leaves 992, which is wider than a centred
          element is allowed to be: the right rail takes 100px against 35 on the
          left, so anything over 880 hangs under the buttons. "TYPOGRAPHY, SO"
          set in 94px serif measures 919 and its right edge landed at x=1000,
          twenty past the line. Capping the box makes an over-wide chunk wrap
          onto a second line instead, which the low-caption height already
          budgets for.
        */
        width: SAFE_CENTRED_W,
        margin: '0 auto',
        opacity: fade,
      }}
    >
      <span
        style={
          serif
            ? {
                fontFamily: 'Cambria, Georgia, serif',
                fontStyle: 'italic',
                fontWeight: 700,
                WebkitTextStroke: '0.02em #050706',
                /* The serif's +6 is already in `size`, so the two variants
                   cannot drift apart from the width cap that used it. */
                fontSize: size,
                color: colour,
                textTransform: 'uppercase',
                letterSpacing: '.01em',
                lineHeight: 1.04,
                textShadow: onDark ? '0 3px 20px rgba(0,0,0,.55)' : 'none',
              }
            : {
                fontFamily:
                  '-apple-system, "Segoe UI", Inter, Roboto, Helvetica, Arial, sans-serif',
                fontWeight: 800,
                fontSize: size,
                color: colour,
                letterSpacing: '-.02em',
                lineHeight: 1.04,
                textShadow: onDark ? '0 3px 20px rgba(0,0,0,.55)' : 'none',
              }
        }
      >
        {active.text}
      </span>
    </div>
  );
};
