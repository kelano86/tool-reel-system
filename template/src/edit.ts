import data from './data/edit.json';

export type Layout = 'stage' | 'stage-slate';

export type Clip = { srcFrom: number; srcTo: number };

export type Beat = {
  key: string;
  label: string;
  srcFrom: number;
  srcTo: number;
  layout: Layout;
  line: string;
  emphasis: string;
  shot: string | null;
  repo?: string;
  stars?: string;
  /** Named animated B-roll, replacing the static screenshot. */
  anim?: string;
  /**
   * Source ranges making up this beat, when one take is not usable end to end.
   * Audio for these beats is pre-spliced by scripts/splice.py into `audio`.
   */
  clips?: Clip[];
  /** Pre-spliced audio file in public/, used instead of the camera original. */
  audio?: string;
  /**
   * Playback rate for THIS beat, overriding the global `speed`.
   *
   * The global knob sets the video's pace, but delivery is not uniform across a
   * take: the NAME beat here came off the camera at 135wpm against 232 for its
   * neighbours, because the repo name is being enunciated. One rate for the
   * whole video either leaves that beat slack or runs the rest ragged.
   *
   * Use sparingly. A per-beat rate is a fix for a measured outlier, not a
   * per-beat styling choice.
   */
  speed?: number;
};

export type Edit = {
  source: string;
  /** The video's own title, shown on the opening frame. Required. */
  title?: string;
  /** The comment-gate keyword, rendered by the CTA card. */
  keyword?: string;
  fps: number;
  width: number;
  height: number;
  /** Playback rate on the footage. Raw delivery is 178wpm; 1.25 lands at ~223. */
  speed: number;
  /** Seconds held between beats. 0 is a butt cut. */
  beatGap: number;
  /** Fraction of an item beat spent in split screen before going full-screen. */
  splitRatio: number;
  beats: Beat[];
};

export const edit = data as Edit;

/** Source dimensions of the camera original. */
export const SRC_W = 1920;
export const SRC_H = 1080;

export const secToFrames = (s: number) => Math.round(s * edit.fps);

/** The rate a beat actually plays at: its own if it sets one, else the global. */
export const beatSpeed = (b: Beat) => b.speed ?? edit.speed;

/** Total source seconds in a beat, across every clip. */
export const beatSourceSeconds = (b: Beat) =>
  b.clips?.length
    ? b.clips.reduce((n, c) => n + (c.srcTo - c.srcFrom), 0)
    : b.srcTo - b.srcFrom;

/** Real-time length of a beat once `speed` is applied. */
export const beatFrames = (b: Beat) =>
  Math.max(1, Math.round((beatSourceSeconds(b) / beatSpeed(b)) * edit.fps));

export const gapFrames = () => Math.round(edit.beatGap * edit.fps);

export type Placed = Beat & { from: number; durationInFrames: number };

export const placed = (): Placed[] => {
  let cursor = 0;
  const g = gapFrames();
  return edit.beats.map((b, i) => {
    const durationInFrames = beatFrames(b);
    const from = cursor;
    cursor += durationInFrames + (i < edit.beats.length - 1 ? g : 0);
    return { ...b, from, durationInFrames };
  });
};

export const totalFrames = () => {
  const p = placed();
  const last = p[p.length - 1];
  return last.from + last.durationInFrames;
};

/**
 * Scale needed for a SRC_W x SRC_H frame to cover a box, plus the offsets that
 * keep it centred. Used instead of object-fit so the crop is explicit and the
 * same maths can be reused for the blurred backdrop.
 */
export const cover = (boxW: number, boxH: number) => {
  const scale = Math.max(boxW / SRC_W, boxH / SRC_H);
  const w = SRC_W * scale;
  const h = SRC_H * scale;
  return { w, h, left: (boxW - w) / 2, top: (boxH - h) / 2, scale };
};
