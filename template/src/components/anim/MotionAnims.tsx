import React from 'react';
import { Img, OffthreadVideo, staticFile, interpolate, Easing } from 'remotion';
import { SAFE_CENTRED_W, seg, CORAL } from '../shots';

/*
 * Animations built for THIS video's sentences. Every fact rendered here is
 * read from assets.json (vendor pages, harvested 2026-08-30), never typed.
 */

const ease = Easing.out(Easing.cubic);
const easeIO = Easing.inOut(Easing.cubic);
const shadow = '0 3px 8px rgba(20,28,24,.12), 0 24px 60px rgba(20,28,24,.24)';
const liftShadow = '0 2px 6px rgba(20,28,24,.10), 0 12px 30px rgba(20,28,24,.14)';

const settle = (f: number, delay = 0) =>
  interpolate(f - delay, [0, 8, 16], [0.6, 1.14, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

const MONO = 'ui-monospace, Menlo, Consolas, monospace';
const SANS = '-apple-system, "Segoe UI", Inter, Roboto, Helvetica, sans-serif';
const SERIF = 'Cambria, Georgia, serif';
/* Small black stroke carried by every serif-italic display word. */
const SERIF_STROKE = '0.02em #050706';

/** Centre-of-zone wrapper: the whole safe-zone story. See skill section 15. */
const Zone: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/* VidCard: a product screen recording inside a browser-chrome card.   */
/* ------------------------------------------------------------------ */

export const VidCard: React.FC<{
  local: number;
  src: string;
  /** Source video dimensions, for the aspect box. */
  vw: number;
  vh: number;
  /** Seconds into the source clip to start. */
  from?: number;
  /** The url pill text. Real domain only. */
  url?: string;
  /** Max box the card may occupy. */
  boxW?: number;
  boxH?: number;
}> = ({ local, src, vw, vh, from = 0, url, boxW = SAFE_CENTRED_W, boxH = 610 }) => {
  const CHROME = url ? 58 : 0;
  const scale = Math.min(boxW / vw, (boxH - CHROME) / vh);
  const w = Math.floor(vw * scale);
  const h = Math.floor(vh * scale);
  return (
    <Zone>
      <div
        style={{
          width: w,
          borderRadius: 22,
          overflow: 'hidden',
          background: '#fff',
          boxShadow: shadow,
          opacity: seg(local, 0, 7),
          transform: `scale(${settle(local)})`,
        }}
      >
        {url ? (
          <div
            style={{
              height: CHROME,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0 20px',
              background: '#EDEFEA',
            }}
          >
            {['#E8837B', '#E9C46A', '#8FBF9F'].map((c) => (
              <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />
            ))}
            <div
              style={{
                marginLeft: 12,
                flex: 1,
                height: 34,
                borderRadius: 17,
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 16,
                fontFamily: MONO,
                fontSize: 20,
                color: '#6E7A73',
              }}
            >
              {url}
            </div>
          </div>
        ) : null}
        <OffthreadVideo
          muted
          src={staticFile(`shots/${src}`)}
          trimBefore={Math.round(from * 60)}
          style={{ width: w, height: h, display: 'block', objectFit: 'cover' }}
        />
      </div>
    </Zone>
  );
};

/* ------------------------------------------------------------------ */
/* DuoCards: both products running side by side. The payoff shot.      */
/* ------------------------------------------------------------------ */

export const DuoCards: React.FC<{
  local: number;
  a: { src: string; vw: number; vh: number; from?: number; url: string };
  b: { src: string; vw: number; vh: number; from?: number; url: string };
}> = ({ local, a, b }) => {
  const W = 430;
  const CHROME = 46;
  const card = (v: typeof a, delay: number) => {
    const h = Math.floor((v.vh / v.vw) * W);
    return (
      <div
        key={v.url}
        style={{
          width: W,
          borderRadius: 18,
          overflow: 'hidden',
          background: '#fff',
          boxShadow: shadow,
          opacity: seg(local, delay, delay + 8),
          transform: `scale(${settle(local, delay)})`,
        }}
      >
        <div
          style={{
            height: CHROME,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 14px',
            background: '#EDEFEA',
          }}
        >
          {['#E8837B', '#E9C46A', '#8FBF9F'].map((c) => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: 5, background: c }} />
          ))}
          <div
            style={{
              marginLeft: 8,
              flex: 1,
              height: 26,
              borderRadius: 13,
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 12,
              fontFamily: MONO,
              fontSize: 17,
              color: '#6E7A73',
            }}
          >
            {v.url}
          </div>
        </div>
        <OffthreadVideo
          muted
          src={staticFile(`shots/${v.src}`)}
          trimBefore={Math.round((v.from ?? 0) * 60)}
          style={{ width: W, height: Math.min(h, 460), display: 'block', objectFit: 'cover' }}
        />
      </div>
    );
  };
  return (
    <Zone>
      <div style={{ display: 'flex', gap: 20 }}>
        {card(a, 0)}
        {card(b, 5)}
      </div>
    </Zone>
  );
};

/* ------------------------------------------------------------------ */
/* FlatMock: the intro imagery. A flat mockup sits still; the two      */
/* marks of the video arrive over it. Sized for the 900x430 slot.      */
/* ------------------------------------------------------------------ */

export const FlatMock: React.FC<{
  local: number;
  marks: { art: string; contain?: boolean }[];
}> = ({ local, marks }) => {
  const CARD_W = 560;
  return (
    <Zone>
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: CARD_W,
            borderRadius: 18,
            background: '#fff',
            boxShadow: liftShadow,
            padding: 22,
            boxSizing: 'border-box',
            opacity: seg(local, 0, 8),
          }}
        >
          {/* a deliberately flat, lifeless mockup */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: '#D8DCD4' }} />
            <div style={{ flex: 1 }} />
            {[44, 44, 44].map((w, i) => (
              <div key={i} style={{ width: w, height: 10, borderRadius: 5, background: '#E3E6E0' }} />
            ))}
          </div>
          <div style={{ width: '72%', height: 22, borderRadius: 8, background: '#D8DCD4', marginBottom: 10 }} />
          <div style={{ width: '52%', height: 22, borderRadius: 8, background: '#E3E6E0', marginBottom: 20 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 120, height: 40, borderRadius: 20, background: '#CBD0C8' }} />
            <div style={{ width: 90, height: 40, borderRadius: 20, background: '#EDEFEA' }} />
          </div>
        </div>
        {/* the two tools arrive on top */}
        <div style={{ position: 'absolute', right: -70, bottom: -34, display: 'flex', gap: 18 }}>
          {marks.map((m, i) => {
            const d = 34 + i * 8;
            return (
              <div
                key={m.art}
                style={{
                  width: 148,
                  height: 148,
                  borderRadius: 34,
                  background: '#fff',
                  boxShadow: shadow,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: seg(local, d, d + 9),
                  transform: `scale(${settle(local, d)})`,
                }}
              >
                <Img
                  src={staticFile(`shots/${m.art}`)}
                  style={
                    m.contain
                      ? { width: '80%', height: '80%', objectFit: 'contain', display: 'block' }
                      : { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </Zone>
  );
};

/* ------------------------------------------------------------------ */
/* PresetDrop: a preset chip lands on a layer and it comes alive.      */
/* The line: "you just drop an animation preset onto a layer".         */
/* ------------------------------------------------------------------ */

const CurveIcon: React.FC<{ size?: number; stroke?: string }> = ({ size = 34, stroke = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 34 34" fill="none">
    <path
      d="M4 29 C 14 29, 20 5, 30 5"
      stroke={stroke}
      strokeWidth="3.4"
      strokeLinecap="round"
    />
    <circle cx="4" cy="29" r="3.2" fill={stroke} />
    <circle cx="30" cy="5" r="3.2" fill={stroke} />
  </svg>
);

export const PresetDrop: React.FC<{
  local: number;
  /** A real preset name from the product. */
  preset: string;
  /** Frame at which the chip lands. Tie it to "onto a layer". */
  landAt?: number;
}> = ({ local, preset, landAt = 60 }) => {
  const p = interpolate(local, [10, landAt], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeIO,
  });
  const chipX = interpolate(p, [0, 1], [250, 0]);
  const chipY = interpolate(p, [0, 1], [-260, 0]);
  const landed = local >= landAt;
  const pulse = landed
    ? interpolate(local - landAt, [0, 6, 20], [0, 1, 0], {
        extrapolateRight: 'clamp',
        easing: ease,
      })
    : 0;
  const wob = landed
    ? 1 + 0.05 * Math.exp(-(local - landAt) / 9) * Math.sin((local - landAt) / 1.6)
    : 1;
  return (
    <Zone>
      <div style={{ position: 'relative' }}>
        {/* the layer */}
        <div
          style={{
            width: 620,
            height: 380,
            borderRadius: 26,
            background: '#fff',
            boxShadow: shadow,
            opacity: seg(local, 0, 8),
            transform: `scale(${settle(local) * wob})`,
            outline: pulse > 0 ? `${4 + pulse * 3}px solid ${CORAL}` : 'none',
            outlineOffset: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
          }}
        >
          <div style={{ width: '58%', height: 26, borderRadius: 9, background: '#D8DCD4' }} />
          <div style={{ width: '40%', height: 26, borderRadius: 9, background: '#E3E6E0' }} />
          <div
            style={{
              marginTop: 12,
              width: 170,
              height: 54,
              borderRadius: 27,
              background: landed ? CORAL : '#CBD0C8',
              transition: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 22,
              top: 18,
              fontFamily: MONO,
              fontSize: 22,
              color: '#9AA396',
              letterSpacing: '.08em',
            }}
          >
            LAYER
          </div>
        </div>
        {/* the chip */}
        <div
          style={{
            position: 'absolute',
            right: -40,
            top: -50,
            transform: `translate(${chipX}px, ${chipY}px) rotate(${(1 - p) * 8}deg)`,
            opacity: seg(local, 6, 14),
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '18px 30px',
            borderRadius: 999,
            background: '#16201C',
            color: '#fff',
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 34,
            boxShadow: shadow,
          }}
        >
          <CurveIcon />
          {preset}
        </div>
      </div>
    </Zone>
  );
};

/* ------------------------------------------------------------------ */
/* UiKit: toggle, slider, button coming alive in turn.                 */
/* The line: "your toggles, sliders and buttons".                      */
/* ------------------------------------------------------------------ */

export const UiKit: React.FC<{
  local: number;
  /** Frames at which each control wakes: [toggle, slider, button]. */
  at?: [number, number, number];
}> = ({ local, at = [4, 34, 60] }) => {
  const tp = interpolate(local, [at[0], at[0] + 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeIO,
  });
  const sp = interpolate(local, [at[1], at[1] + 20], [0.12, 0.78], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeIO,
  });
  const press = interpolate(local, [at[2], at[2] + 6, at[2] + 14], [1, 0.93, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeIO,
  });
  const on = local >= at[0] + 8;
  const ROW = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 560,
  } as const;
  const label = (t: string) => (
    <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, color: '#16201C' }}>{t}</div>
  );
  return (
    <Zone>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 44,
          background: '#fff',
          borderRadius: 30,
          boxShadow: shadow,
          padding: '54px 60px',
          opacity: seg(local, 0, 8),
          transform: `scale(${settle(local)})`,
        }}
      >
        <div style={ROW}>
          {label('Dark mode')}
          <div
            style={{
              width: 108,
              height: 60,
              borderRadius: 30,
              background: on ? CORAL : '#DDE1DA',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 6,
                left: 6 + tp * 48,
                width: 48,
                height: 48,
                borderRadius: 24,
                background: '#fff',
                boxShadow: liftShadow,
              }}
            />
          </div>
        </div>
        <div style={ROW}>
          {label('Volume')}
          <div style={{ width: 250, height: 14, borderRadius: 7, background: '#DDE1DA', position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${sp * 100}%`,
                borderRadius: 7,
                background: CORAL,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: -14,
                left: `calc(${sp * 100}% - 21px)`,
                width: 42,
                height: 42,
                borderRadius: 21,
                background: '#fff',
                boxShadow: liftShadow,
              }}
            />
          </div>
        </div>
        <div style={{ ...ROW, justifyContent: 'center' }}>
          <div
            style={{
              padding: '22px 66px',
              borderRadius: 999,
              background: '#16201C',
              color: '#fff',
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 36,
              transform: `scale(${press})`,
              boxShadow: liftShadow,
            }}
          >
            Get started
          </div>
        </div>
      </div>
    </Zone>
  );
};

/* ------------------------------------------------------------------ */
/* ImageDrop: an image falls into a media slot. Slot copy is the       */
/* product's own: "Slot 1 · Drop or click to add".                     */
/* ------------------------------------------------------------------ */

export const ImageDrop: React.FC<{ local: number; img: string; landAt?: number }> = ({
  local,
  img,
  landAt = 46,
}) => {
  const p = interpolate(local, [8, landAt], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeIO,
  });
  const landed = local >= landAt;
  const wob = landed
    ? 1 + 0.05 * Math.exp(-(local - landAt) / 9) * Math.sin((local - landAt) / 1.6)
    : 1;
  return (
    <Zone>
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: 600,
            borderRadius: 24,
            background: '#fff',
            boxShadow: shadow,
            padding: 26,
            boxSizing: 'border-box',
            opacity: seg(local, 0, 8),
            transform: `scale(${settle(local) * wob})`,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
          }}
        >
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: 18,
              border: landed ? 'none' : '3px dashed #C6CDC2',
              background: landed ? 'transparent' : '#F6F7F4',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {landed ? (
              <Img
                src={staticFile(`shots/${img}`)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{ fontSize: 54, color: '#C6CDC2', fontFamily: SANS }}>+</div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: '#16201C' }}>
              Slot 1
            </div>
            <div style={{ fontFamily: SANS, fontSize: 30, color: '#6E7A73' }}>
              Drop or click to add
            </div>
          </div>
        </div>
        {/* the falling image */}
        <div
          style={{
            position: 'absolute',
            left: 26 + 8,
            top: 26 + 8,
            width: 134,
            height: 134,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: shadow,
            opacity: landed ? 0 : seg(local, 8, 15),
            transform: `translate(${(1 - p) * 300}px, ${(1 - p) * -300}px) rotate(${(1 - p) * 10}deg)`,
          }}
        >
          <Img
            src={staticFile(`shots/${img}`)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      </div>
    </Zone>
  );
};

/* ------------------------------------------------------------------ */
/* CatRoll: the real template categories rolling past. No count pill:  */
/* the spoken count and the live product currently disagree, so the    */
/* screen shows the categories themselves and no number.               */
/* ------------------------------------------------------------------ */

export const CatRoll: React.FC<{ local: number; total: number; categories: string[] }> = ({
  local,
  total,
  categories,
}) => {
  const ROW = 104;
  const H = 700;
  const travel = categories.length * ROW - H;
  const p = interpolate(local, [6, Math.max(12, total - 8)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeIO,
  });
  return (
    <Zone>
      <div
        style={{
          width: SAFE_CENTRED_W,
          height: H,
          position: 'relative',
          overflow: 'hidden',
          opacity: seg(local, 0, 8),
        }}
      >
        <div style={{ position: 'absolute', left: 0, right: 0, top: -p * Math.max(0, travel) }}>
          {categories.map((c) => (
            <div
              key={c}
              style={{
                height: ROW,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: SERIF,
                fontStyle: 'italic',
                WebkitTextStroke: SERIF_STROKE,
                fontWeight: 700,
                fontSize: 64,
                color: 'var(--ink)',
                opacity: 0.94,
                whiteSpace: 'nowrap',
              }}
            >
              {c}
            </div>
          ))}
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, var(--ground) 0%, transparent 18%, transparent 82%, var(--ground) 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </Zone>
  );
};

/* ------------------------------------------------------------------ */
/* ExportLadder: 720p up to 8K, the top rung accented. Values read     */
/* from assets.json (the vendor's own pricing/FAQ copy).               */
/* ------------------------------------------------------------------ */

export const ExportLadder: React.FC<{ local: number; resolutions: string[] }> = ({
  local,
  resolutions,
}) => {
  const last = resolutions.length - 1;
  return (
    <Zone>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 30 }}>
        {resolutions.map((r, i) => {
          const d = 2 + i * 5;
          const top = i === last;
          return (
            <div
              key={r}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                opacity: seg(local, d, d + 8),
                transform: `scale(${settle(local, d)})`,
              }}
            >
              <div
                style={{
                  width: top ? 170 : 104,
                  height: 70 + i * 62,
                  borderRadius: 18,
                  background: top ? CORAL : '#fff',
                  boxShadow: top ? shadow : liftShadow,
                }}
              />
              <div
                style={{
                  fontFamily: top ? SERIF : MONO,
                  fontStyle: top ? 'italic' : 'normal',
                  WebkitTextStroke: top ? SERIF_STROKE : undefined,
                  fontWeight: 700,
                  fontSize: top ? 84 : 38,
                  color: top ? CORAL : 'var(--ink)',
                }}
              >
                {r}
              </div>
            </div>
          );
        })}
      </div>
    </Zone>
  );
};

/* ------------------------------------------------------------------ */
/* RatioMorph: one clip reshaping through the product's frame ratios.  */
/* ------------------------------------------------------------------ */

export const RatioMorph: React.FC<{
  local: number;
  total: number;
  src: string;
  vw: number;
  vh: number;
  /** Which of the product's ratio labels to morph through. */
  steps: { label: string; w: number; h: number }[];
}> = ({ local, total, src, steps }) => {
  const span = total / steps.length;
  const idx = Math.min(steps.length - 1, Math.floor(local / span));
  const within = (local - idx * span) / span;
  const m = interpolate(within, [0, 0.35], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeIO,
  });
  const prev = steps[Math.max(0, idx - 1)];
  const cur = steps[idx];
  const BOX = 520;
  const dim = (s: { w: number; h: number }) => {
    const k = Math.min(BOX / s.w, BOX / s.h);
    return { w: s.w * k, h: s.h * k };
  };
  const a = dim(prev);
  const b = dim(cur);
  const w = a.w + (b.w - a.w) * m;
  const h = a.h + (b.h - a.h) * m;
  return (
    <Zone>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 }}>
        <div
          style={{
            width: w,
            height: h,
            borderRadius: 22,
            overflow: 'hidden',
            boxShadow: shadow,
            opacity: seg(local, 0, 8),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0B0D0C',
          }}
        >
          <OffthreadVideo
            muted
            src={staticFile(`shots/${src}`)}
            style={{ width: Math.max(w, h * 0.8), height: h, objectFit: 'cover', display: 'block' }}
          />
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 40,
            color: 'var(--ink)',
            letterSpacing: '.08em',
            opacity: seg(local, 6, 14),
          }}
        >
          {cur.label}
        </div>
      </div>
    </Zone>
  );
};

/* ------------------------------------------------------------------ */
/* ClaudeCard: "built entirely with Claude Code". Dark structure shot. */
/* ------------------------------------------------------------------ */

export const ClaudeCard: React.FC<{ local: number; domain: string; claim: string }> = ({
  local,
  domain,
  claim,
}) => {
  const words = claim.split(' ');
  const shown = Math.min(words.length, Math.floor(interpolate(local, [8, 34], [0, words.length], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })));
  const caret = Math.floor(local / 16) % 2 === 0;
  return (
    <Zone>
      <div
        style={{
          width: SAFE_CENTRED_W - 60,
          borderRadius: 26,
          background: '#0B0D0C',
          boxShadow: 'inset 0 0 0 1.5px var(--rim, rgba(255,255,255,.16))',
          padding: '46px 50px',
          boxSizing: 'border-box',
          opacity: seg(local, 0, 8),
          transform: `scale(${settle(local)})`,
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 26,
            color: 'rgba(255,255,255,.45)',
            letterSpacing: '.1em',
            marginBottom: 26,
          }}
        >
          {domain}
        </div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 46, lineHeight: 1.4, color: '#F4F5F1' }}>
          {words.slice(0, shown).map((w, i) => (
            <span key={i} style={{ color: /claude|code/i.test(w) ? CORAL : undefined }}>
              {w}{' '}
            </span>
          ))}
          <span style={{ color: CORAL, opacity: caret ? 1 : 0 }}>▍</span>
        </div>
      </div>
    </Zone>
  );
};
