import React from 'react';

/**
 * Grounds, by shot type. Not by section: the ground says what kind of shot you
 * are looking at, which is what makes the video legible as a sequence.
 *
 *   segment start (title card)   LIGHT_TITLE, always
 *   split screen (camera + top)  SPLIT_DARK, always, plus grain
 *   anything else                its own, whatever suits the visual
 */
export const LIGHT_TITLE = '#F9F9F9';
export const LIGHT_BODY = '#F4F5F1';

/**
 * The split-screen ground.
 *
 * Near-black rather than #000: pure black reads as a hole punched in the feed
 * and gives the encoder a flat field to band across. This still sits in the
 * same family as INK (#16201C), just far enough off zero to be a surface.
 *
 * Remember that the grain lifts this. Screen blend can only lighten, so the
 * rendered ground always measures brighter than the token, and at the first
 * pass it landed at 44 against a token value of 16. Judge the number off a
 * render, never off the hex.
 */
export const SPLIT_DARK = '#050706';

/** True for any ground a viewer would read light text against. */
export const isDark = (hex: string): boolean => {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.5;
};

/**
 * Per-ground colour tokens, published as CSS variables on the shot wrapper.
 *
 * Variables rather than props because the alternative is threading an `onDark`
 * flag through every animation, every card and every label inside them. A
 * component that reads var(--ink) works on both grounds without knowing which
 * one it is on, and any component added later inherits that for free.
 *
 * Only the colours that have to flip live here. Anything with its own surface
 * (a white card, a terminal panel) keeps its own palette, because it is opaque
 * and the ground behind it never shows through.
 */
export const groundVars = (ground: string): React.CSSProperties => {
  const d = isDark(ground);
  return {
    // The ground colour itself, for components that fade content into it
    // (e.g. the category scroll's edge masks).
    '--ground': ground,
    // Body text and any label that has to be read against the ground.
    '--ink': d ? '#E9EFEA' : '#16201C',
    // Second-rank text: ordinals, star counts, captions on artwork.
    '--muted': d ? '#93A39A' : '#6E7A73',
    // Hairlines, dashed frames, and the unfilled half of a progress track.
    '--line': d ? 'rgba(255,255,255,.20)' : '#C6CDC2',
    // Inactive dots and empty track fill.
    '--track': d ? 'rgba(255,255,255,.13)' : '#E4E8E1',
    /*
      Edge for a dark surface sitting on a dark ground. Drop shadows do the
      separating on a light ground and do nothing on a dark one, so anything
      near-black needs an outline instead or it dissolves into the background.
      Transparent on light, where the shadow already works.
    */
    '--rim': d ? 'rgba(255,255,255,.16)' : 'transparent',
  } as React.CSSProperties;
};

/**
 * Static film grain, as a repeating SVG tile.
 *
 * Deliberately static. Per-frame noise would be the obvious way to do this and
 * it is the wrong one twice over: Math.random breaks Remotion's determinism,
 * and grain that changes every frame is the worst possible input to an
 * inter-frame codec. It would survive the local render and then dissolve into
 * mush the moment Instagram re-encoded it, taking the rest of the picture with
 * it. Held still, the grain costs one keyframe and nothing after.
 *
 * feColorMatrix desaturates it: fractalNoise is colour noise by default, which
 * on a near-black ground shows up as stray red and green pixels.
 */
const tile = (freq: number, size: number, gamma: number) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>` +
      `<filter id='g'>` +
      `<feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='3' stitchTiles='stitch'/>` +
      `<feColorMatrix type='saturate' values='0'/>` +
      /*
        Gamma is what keeps the ground dark.

        fractalNoise centres on mid-grey, and screen-blending a mid-grey field
        over near-black lifts the whole ground rather than speckling it: at
        exponent 1 the ground measured 44 against a token of 16. Pushing the
        curve down leaves the mean near black and keeps only the peaks, so the
        grain arrives as specks on black instead of a grey wash.
      */
      `<feComponentTransfer>` +
      `<feFuncR type='gamma' exponent='${gamma}'/>` +
      `<feFuncG type='gamma' exponent='${gamma}'/>` +
      `<feFuncB type='gamma' exponent='${gamma}'/>` +
      `</feComponentTransfer>` +
      `</filter>` +
      `<rect width='100%' height='100%' filter='url(#g)'/>` +
      `</svg>`,
  )}`;

/*
  Grain size matters more than grain strength here. Instagram re-encodes every
  upload, and 1px noise is the first thing a codec throws away, so a fine grain
  that looks right in the render arrives as a flat black field. A coarser blob
  at a lower frequency costs the same and survives.
*/
const GRAIN = tile(0.55, 240, 6.0);

/**
 * The grain layer.
 *
 * Screen blend, so it can only lighten: on the near-black ground it lifts
 * specks out of the black, and it has almost no effect on the white cards and
 * panels sitting above it. Sits under the content, above the ground.
 */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.55 }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: `url("${GRAIN}")`,
      backgroundRepeat: 'repeat',
      backgroundSize: '240px 240px',
      mixBlendMode: 'screen',
      opacity,
      pointerEvents: 'none',
    }}
  />
);
