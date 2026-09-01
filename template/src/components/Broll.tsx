import React from 'react';
import { Img, staticFile, interpolate, Easing } from 'remotion';
import { CORAL, INK, MUTED, SAFE_CENTRED_W } from './shots';

const shadow = '0 2px 6px rgba(20,28,24,.10), 0 26px 70px rgba(20,28,24,.22)';

export const intro = (local: number) => ({
  rise: interpolate(local, [0, 18], [22, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  }),
  fade: interpolate(local, [0, 12], [0, 1], { extrapolateRight: 'clamp' }),
});

/**
 * The opening frame's imagery: the repo's own GitHub card.
 *
 * A list video opens on a row of marks because it has five things to introduce.
 * This one has a single subject, so the strongest opening visual is the artifact
 * itself - `cloudflare/computer`, its tagline, and its star count, in the form a
 * viewer would meet if they went and looked. Nothing on it is ours, which is the
 * point: the opening frame is a claim, and this is the receipt.
 *
 * Fitted to the imagery slot by HEIGHT, not width. The slot is 900x430 and the
 * card is 2:1, so fitting to width would make it 450 tall and push it out of the
 * slot; fitting to height gives 860, which also lands inside the centred-safe
 * 880 without a second cap being needed.
 */
export const IntroCard: React.FC<{
  local: number;
  art: string;
  /** Natural size of the source image, used to fit it to the slot. */
  imgW: number;
  imgH: number;
  slotW: number;
  slotH: number;
}> = ({ local, art, imgW, imgH, slotW, slotH }) => {
  const { fade, rise } = intro(local);
  const scale = Math.min(slotW / imgW, slotH / imgH);
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
          width: Math.round(imgW * scale),
          height: Math.round(imgH * scale),
          borderRadius: 22,
          overflow: 'hidden',
          background: '#fff',
          boxShadow: '0 2px 6px rgba(20,28,24,.12), 0 18px 44px rgba(20,28,24,.20)',
          opacity: fade,
          transform: `translateY(${rise}px)`,
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

/**
 * CTA B-roll: the keyword as a comment, which is the action being asked for.
 *
 * Centred in its zone on both axes, like every other top-zone visual. It used
 * to be a bare width:86% div with no wrapper, which left it pinned to the top
 * left of the zone: hard against x=0, and its top edge at y=0, well inside the
 * 220px Instagram crops away. Centring fixes the alignment and the safe zone in
 * one move, because the zone is 883 tall and a ~280px card centred in it starts
 * at y=302.
 *
 * Width is capped at the centred-safe 880 rather than a percentage. At 86% the
 * card measured 929 and its right edge landed at 1005, under the action rail.
 */
export const CtaCard: React.FC<{ local: number; keyword: string }> = ({ local, keyword }) => {
  const { fade, rise } = intro(local);
  const caret = Math.floor(local / 18) % 2 === 0;
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
          width: SAFE_CENTRED_W,
          background: '#fff',
          borderRadius: 26,
          boxShadow: shadow,
          padding: '46px 44px',
          boxSizing: 'border-box',
          opacity: fade,
          transform: `translateY(${rise}px)`,
          display: 'flex',
          flexDirection: 'column',
          gap: 26,
        }}
      >
        <div
          style={{
            fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
            fontSize: 26,
            letterSpacing: '.16em',
            color: MUTED,
          }}
        >
          ADD A COMMENT
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            borderBottom: `3px solid ${CORAL}`,
            paddingBottom: 18,
          }}
        >
          <span
            style={{
              fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
              fontSize: 92,
              fontWeight: 700,
              color: INK,
              letterSpacing: '.02em',
            }}
          >
            {keyword}
          </span>
          <span style={{ fontSize: 92, color: CORAL, opacity: caret ? 1 : 0 }}>|</span>
        </div>
      </div>
    </div>
  );
};
