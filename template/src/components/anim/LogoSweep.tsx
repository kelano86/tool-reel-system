import React from 'react';
import { Img, staticFile, interpolate, Easing } from 'remotion';

/**
 * A screenshot shot as a camera move rather than a still.
 *
 * The authentik shot is a wall of 30-odd app tiles. Held static at the size a
 * card allows, every logo is about 40px and the frame reads as texture: you can
 * tell it is a grid of something, but not of what. The claim in the line is
 * that it connects to the tools you already use, and that claim only lands if
 * the viewer can actually recognise AWS, Google Cloud, HashiCorp.
 *
 * So the shot establishes wide, zooms into the top row, then tracks along it.
 * Same information, but each logo gets a moment at a readable size.
 *
 * All coordinates are in SOURCE pixels of the image, which keeps the framing
 * legible: `x0`/`x1` bracket the row and `cy` is the row's centre line. Read
 * them off the file once and they do not shift when the layout around them
 * changes.
 */
const ease = Easing.inOut(Easing.cubic);

/** Fraction of the shot spent zooming in before the track begins. */
const ZOOM_END = 0.3;

/*
  The pan starts fractionally before the zoom finishes. Run strictly in
  sequence, the move stops dead for a frame between the two and reads as two
  separate shots spliced together; overlapped, it is one continuous gesture.
*/
const PAN_START = ZOOM_END * 0.82;

export const LogoSweep: React.FC<{
  local: number;
  total: number;
  art: string;
  /** Natural size of the source image. */
  imgW: number;
  imgH: number;
  /** Left and right edge of the row to track along, in source pixels. */
  x0: number;
  x1: number;
  /** Centre line of the row, in source pixels. */
  cy: number;
  /** Source width visible at the closest point, i.e. how much of the row fits. */
  close: number;
  /**
   * Source width visible at the widest point. Defaults to the whole row.
   *
   * Worth setting explicitly when the row is much wider than it is tall. The
   * visible ASPECT is fixed by boxW/boxH and does not change as the camera
   * moves, so framing the full six-card row of the UI UX Pro Max stats would
   * have needed 568 source pixels of height around a centre line only 178px
   * from the bottom of the image, and the shot would have panned across blank
   * space below the page. Opening on three cards instead keeps every frame
   * inside the picture.
   */
  wide?: number;
  boxW: number;
  boxH: number;
}> = ({ local, total, art, imgW, imgH, x0, x1, cy, close, wide: wideIn, boxW, boxH }) => {
  const p = Math.max(0, Math.min(1, local / Math.max(1, total)));

  // Wide enough to hold the whole row, so the shot opens on the full context.
  const wide = wideIn ?? x1 - x0;

  const visW = interpolate(p, [0, ZOOM_END], [wide, close], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  const sx = interpolate(p, [PAN_START, 1], [x0, x1 - close], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

  // Scale that maps `visW` source pixels onto the viewport width.
  const k = boxW / visW;
  const sy = cy - boxH / k / 2;

  const appear = interpolate(local, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

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
          width: boxW,
          height: boxH,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 20,
          background: '#fff',
          boxShadow: '0 3px 8px rgba(20,28,24,.12), 0 24px 60px rgba(20,28,24,.24)',
          /* A dark screenshot dissolves into the split ground without an edge. */
          outline: '1.5px solid var(--rim)',
          opacity: appear,
        }}
      >
        <Img
          src={staticFile(`shots/${art}`)}
          style={{
            position: 'absolute',
            left: -sx * k,
            top: -sy * k,
            width: imgW * k,
            height: imgH * k,
            maxWidth: 'none',
            display: 'block',
            willChange: 'transform',
          }}
        />
      </div>
    </div>
  );
};
