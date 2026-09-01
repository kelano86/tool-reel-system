import React from 'react';
import { Img, staticFile, interpolate, Easing } from 'remotion';
import { CORAL, SAFE_CENTRED_W, seg } from '../shots';

/*
  Every number and name these components render arrives through props from
  src/data/assets.json - the harvest is the one place a fact lives. Nothing on
  screen is typed here.
*/

const ease = Easing.out(Easing.cubic);
const easeIO = Easing.inOut(Easing.cubic);
const shadow = '0 3px 8px rgba(20,28,24,.12), 0 24px 60px rgba(20,28,24,.24)';
const liftShadow = '0 2px 6px rgba(20,28,24,.10), 0 12px 30px rgba(20,28,24,.14)';

const settle = (f: number, delay = 0) =>
  interpolate(f, [delay, delay + 7, delay + 16], [1.14, 0.985, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

const MONO = 'ui-monospace, Menlo, Consolas, monospace';
const SANS = '-apple-system, "Segoe UI", Inter, Roboto, Helvetica, sans-serif';
const SERIF = 'Cambria, Georgia, serif';
/* Small black stroke carried by every serif-italic display word. */
const SERIF_STROKE = '0.02em #050706';

/** Centre-in-zone wrapper: the top-zone formula, every time. */
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

/** One product mark on a white rounded tile. `contain` for wordmarks. */
const Mark: React.FC<{ art: string; size: number; contain?: boolean; radius?: number }> = ({
  art,
  size,
  contain,
  radius,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: radius ?? size * 0.22,
      background: '#fff',
      boxShadow: liftShadow,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Img
      src={staticFile(`shots/${art}`)}
      style={
        contain
          ? { width: '84%', height: '84%', objectFit: 'contain', display: 'block' }
          : { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
      }
    />
  </div>
);

export type RowItem = { art: string; contain?: boolean };

/**
 * The five marks in a row, staggered in with the overshoot-settle. Sized for
 * the intro imagery slot: five 158px tiles with 22px gaps come to 878, inside
 * the centred-safe 880. The same row pre-introduces the marks that reappear on
 * each title card.
 */
export const LogoRow: React.FC<{ local: number; items: RowItem[]; size?: number }> = ({
  local,
  items,
  size = 158,
}) => (
  <Zone>
    <div style={{ display: 'flex', gap: 22 }}>
      {items.map((it, i) => {
        const a = seg(local, 4 + i * 4, 14 + i * 4);
        return (
          <div key={it.art} style={{ opacity: a, transform: `scale(${settle(local, 4 + i * 4)})` }}>
            <Mark art={it.art} size={size} contain={it.contain} />
          </div>
        );
      })}
    </div>
  </Zone>
);

/**
 * The segment title card on the locked grid: group bottom-anchored at y=665,
 * logo dead centre, elements staggering in with the overshoot-settle.
 *
 * These items are APIs, not repos, so the star slot carries the item's own
 * credibility fact instead ("no key needed" / "one free key") - same geometry,
 * same stagger.
 */
export const ApiTitleCard: React.FC<{
  local: number;
  /** Small line above the name: "#1" for items, "github.com/" for the repo. */
  topline: string;
  /** Sans bold rank vs mono host prefix. */
  toplineMono?: boolean;
  name: string;
  art: string;
  contain?: boolean;
  /** The fact line under the name. Rendered sans bold, coral lead. */
  fact: string;
  factLead?: string;
}> = ({ local, topline, toplineMono, name, art, contain, fact, factLead }) => {
  const inRank = seg(local, 0, 8);
  const inText = seg(local, 3, 13);
  const inFact = seg(local, 8, 18);
  const LOGO = 440;
  const n = name.length;
  const ladder = n <= 10 ? 140 : n <= 14 ? 112 : n <= 18 ? 92 : 78;
  const size = n <= 18 ? Math.floor(Math.min(ladder, (SAFE_CENTRED_W - 24) / (n * 0.61))) : ladder;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: '65.36%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: SAFE_CENTRED_W,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            fontFamily: toplineMono ? MONO : SANS,
            fontWeight: toplineMono ? 700 : 800,
            fontSize: toplineMono ? 54 : 96,
            lineHeight: 1.12,
            color: toplineMono ? 'var(--muted)' : 'var(--ink)',
            letterSpacing: toplineMono ? '.04em' : '-.02em',
            opacity: inRank,
            transform: `scale(${settle(local)})`,
          }}
        >
          {topline}
        </div>
        <div
          style={{
            marginTop: 10,
            textAlign: 'center',
            opacity: inText,
            transform: `scale(${settle(local, 3)})`,
            whiteSpace: n <= 18 ? 'nowrap' : 'normal',
          }}
        >
          <span
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              WebkitTextStroke: SERIF_STROKE,
              fontWeight: 700,
              fontSize: size,
              lineHeight: 1.06,
              color: CORAL,
              letterSpacing: '.01em',
            }}
          >
            {name}
          </span>
        </div>
        <div
          style={{
            marginTop: 58,
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 54,
            lineHeight: 1.2,
            color: 'var(--ink)',
            letterSpacing: '-.01em',
            opacity: inFact,
            transform: `translateY(${(1 - inFact) * 10}px)`,
            whiteSpace: 'nowrap',
          }}
        >
          {factLead ? <span style={{ color: CORAL, marginRight: 14 }}>{factLead}</span> : null}
          {fact}
        </div>
      </div>
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
          background: '#fff',
          boxShadow: shadow,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: seg(local, 5, 18),
        }}
      >
        <Img
          src={staticFile(`shots/${art}`)}
          style={
            contain
              ? { width: '76%', height: '76%', objectFit: 'contain', display: 'block' }
              : { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
          }
        />
      </div>
    </div>
  );
};
