import React from 'react';
import { Video, staticFile } from 'remotion';
import { edit, SRC_W, SRC_H } from '../edit';

/**
 * Face landmarks in SOURCE pixels, measured off a frame of footage.mov (t=18s).
 *
 * These belong to the footage, not the layout - re-measure on the next shoot.
 * Open a source frame, read off the four numbers, and every pop-out geometry
 * below follows from them.
 */
export const FACE = {
  crownY: 145,
  eyeY: 450,
  chinY: 800,
  centreX: 950,
} as const;

const HEAD_H = FACE.chinY - FACE.crownY;
const SHIFT_X = SRC_W / 2 - FACE.centreX;

type Geometry = {
  /** Card box on the canvas. */
  cardX: number;
  cardTop: number;
  cardW: number;
  cardH: number;
  /** The video layer, in canvas pixels. Shared by both copies. */
  videoW: number;
  videoH: number;
  videoX: number;
  videoY: number;
  scale: number;
};

/**
 * Where the two layers sit, given how much head should break the card's edge.
 *
 * `pop` is the fraction of head height sitting ABOVE the top edge. It is not a
 * free parameter: the deeper the edge cuts into the head, the less source is
 * left below that line to fill the card, so the more the footage has to be
 * scaled up - and the bigger the head gets inside the card. Measured on this
 * footage against a 942-wide card:
 *
 *   pop 0.14, card 514 tall -> 0.61x, head 22.0% of card width
 *   pop 0.30, card 514 tall -> 0.70x, head 25.1%     <- the one in use
 *   pop 0.50, card 514 tall -> 0.85x, head 30.5%     too big
 *   pop 0.50, card 400 tall -> 0.66x, head 23.8%     a deep pop wants a SHORT card
 *
 * The reference this format is lifted from sits at head 20.7% of card width.
 * If a deeper pop is wanted, shorten the card rather than accepting the zoom.
 */
export const popoutGeometry = (
  cardTop: number,
  pop: number,
  cardX = 69,
  cardW = 942,
): Geometry => {
  const cardH = edit.height - cardTop;
  // The source y that lands exactly on the card's top edge.
  const edgeY = FACE.crownY + pop * HEAD_H;
  const scale = Math.max(cardH / (SRC_H - edgeY), cardW / SRC_W, cardH / SRC_H);
  const videoW = SRC_W * scale;
  const videoH = SRC_H * scale;
  return {
    cardX,
    cardTop,
    cardW,
    cardH,
    videoW,
    videoH,
    videoX: cardX + (cardW - videoW) / 2 + SHIFT_X * scale,
    videoY: cardTop - edgeY * scale,
    scale,
  };
};

type Props = {
  /** Source in-point in seconds. Indexes BOTH videos - see cutoutSource. */
  from: number;
  /** Fraction of head height that breaks above the card's top edge. */
  pop?: number;
  /** Top of the card on the canvas. */
  cardTop?: number;
  cardX?: number;
  cardW?: number;
  radius?: number;
  /**
   * Card outline. Off by default, by house decision.
   *
   * Be aware of what it costs on a dark set: this footage's room is near-black
   * against a near-black ground, so with no outline the card has no visible
   * boundary and the pop stops reading - the head has nothing to be in front
   * of. If a shot needs the edge back, turn it on here rather than reaching
   * for a drop shadow, which does nothing on a dark ground.
   */
  border?: string;
  borderWidth?: number;
  speed?: number;
  /**
   * Baked cut-out, relative to public/. Must be the SAME resolution and fps as
   * the camera original or the two layers drift apart. See scripts/bake_cutout.py.
   */
  cutoutSource?: string;
  /**
   * In-point into the cut-out, when it was baked from a range rather than the
   * whole source. Defaults to `from`, which is right for a full-source bake.
   * Baking only the beats that actually pop out is much cheaper than baking
   * 60s of footage at 0.2s a frame.
   */
  cutoutFrom?: number;
};

/**
 * The talking head breaking out of its card.
 *
 * Two copies of the same footage at the same transform:
 *
 *   1. the camera original, clipped to a rounded card
 *   2. a background-removed copy on top, clipped to everything ABOVE the card
 *
 * Layer 2 is why the head reads against the page ground rather than against the
 * room. Its clip is not decorative: without it the cut-out's shoulders hang
 * outside the card's left and right edges and the illusion dies immediately.
 *
 * The card bleeds past the bottom of the canvas, so only its top corners ever
 * round. `radius` is added to the height to keep the bottom pair off-frame.
 */
export const PopoutFaceShot: React.FC<Props> = ({
  from,
  pop = 0.3,
  cardTop = 1406,
  cardX = 69,
  cardW = 942,
  radius = 46,
  border = 'var(--rim, rgba(255,255,255,.16))',
  borderWidth = 0,
  speed,
  cutoutSource = 'cutout.webm',
  cutoutFrom,
}) => {
  const g = popoutGeometry(cardTop, pop, cardX, cardW);
  const trimBefore = Math.round(from * edit.fps);
  const rate = speed ?? edit.speed;

  const layer: React.CSSProperties = {
    position: 'absolute',
    width: g.videoW,
    height: g.videoH,
    left: g.videoX,
    top: g.videoY,
  };

  return (
    <>
      {/* 1. camera original, clipped to the card */}
      <div
        style={{
          position: 'absolute',
          left: g.cardX,
          top: g.cardTop,
          width: g.cardW,
          height: g.cardH + radius,
          borderRadius: radius,
          overflow: 'hidden',
        }}
      >
        <Video
          src={staticFile(edit.source)}
          trimBefore={trimBefore}
          playbackRate={rate}
          muted
          style={{ ...layer, left: g.videoX - g.cardX, top: g.videoY - g.cardTop }}
        />
      </div>

      {borderWidth > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: g.cardX,
            top: g.cardTop,
            width: g.cardW,
            height: g.cardH + radius,
            borderRadius: radius,
            border: `${borderWidth}px solid ${border}`,
            boxSizing: 'border-box',
            pointerEvents: 'none',
          }}
        />
      ) : null}

      {/* 2. cut-out, clipped to above the card so the body cannot spill sideways */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: edit.width,
          height: g.cardTop,
          overflow: 'hidden',
        }}
      >
        <Video
          src={staticFile(cutoutSource)}
          trimBefore={Math.round((cutoutFrom ?? from) * edit.fps)}
          playbackRate={rate}
          muted
          style={layer}
        />
      </div>
    </>
  );
};
