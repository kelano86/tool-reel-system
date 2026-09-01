import React from 'react';
import { Video, staticFile } from 'remotion';
import { cover, edit, SRC_W, SRC_H } from '../edit';

type Props = {
  /** Source in-point in seconds. */
  from: number;
  /** Box to fill, in composition pixels. */
  boxW: number;
  boxH: number;
  /**
   * Horizontal slice of the source to keep, 0-1. 1 uses the full width (most
   * upscaling), lower values crop tighter to the subject (less upscaling).
   * Only meaningful when the box is much taller than the source aspect.
   */
  crop?: number;
  /** Playback rate. Comes from the beat, which may override the global speed. */
  speed?: number;
};

/**
 * Horizontal recentre, in SOURCE pixels, applied to every face shot.
 *
 * Measured off a source frame (50s): the nose sits at x=912 against a frame
 * centre of 960, so the subject was shot ~48px left of centre. Positive moves
 * the subject right on screen. Re-measure on the next shoot; this belongs to
 * the footage, not the layout.
 */
const FACE_SHIFT_X = 48;

/**
 * The talking head, cropped to fill a box.
 *
 * The camera original is 1920x1080 landscape and the composition is vertical,
 * so a naive full-frame crop means a 1.78x upscale. Every layout here is built
 * to keep that number down: the split-screen box is actually a downscale, and
 * the full-frame shot crops horizontally first so the upscale stays near 1.1x.
 */
export const FaceShot: React.FC<Props> = ({ from, boxW, boxH, crop = 1, speed }) => {
  const srcW = SRC_W * crop;
  const scale = Math.max(boxW / srcW, boxH / SRC_H);
  const w = SRC_W * scale;
  const h = SRC_H * scale;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/*
        Always muted. Sound comes from a separate <Audio> mounted once per beat,
        so nothing that happens to the picture - a resize, a remount, a heavy
        component mounting alongside it - can interrupt playback. See BeatAudio
        in DesignSystems.tsx.
      */}
      <Video
        src={staticFile(edit.source)}
        trimBefore={Math.round(from * edit.fps)}
        playbackRate={speed ?? edit.speed}
        muted
        style={{
          position: 'absolute',
          width: w,
          height: h,
          left: (boxW - w) / 2 + FACE_SHIFT_X * scale,
          top: (boxH - h) / 2,
        }}
      />
    </div>
  );
};

/**
 * Full-frame treatment: a blurred, upscaled copy fills the vertical gap while a
 * lightly-cropped sharp copy sits on top. Keeps the face sharp instead of
 * stretching a 1080p landscape frame across a 1920-tall canvas.
 */
export const FaceFull: React.FC<{ from: number }> = ({ from }) => {
  const { width: W, height: H } = edit;
  const fgH = Math.round(H * 0.64);
  const bg = cover(W, H);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#0b0f0d' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          filter: 'blur(48px) brightness(0.55) saturate(1.1)',
          transform: 'scale(1.15)',
        }}
      >
        <Video
          src={staticFile(edit.source)}
          trimBefore={Math.round(from * edit.fps)}
          playbackRate={edit.speed}
          muted
          style={{ position: 'absolute', width: bg.w, height: bg.h, left: bg.left, top: bg.top }}
        />
      </div>
      {/*
        Feathered top and bottom edges. Without the mask the sharp copy meets
        the blurred backdrop on a hard horizontal line, which reads as a bug
        rather than a look.
      */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: (H - fgH) / 2,
          width: W,
          height: fgH,
          overflow: 'hidden',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 9%, black 91%, transparent 100%)',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 9%, black 91%, transparent 100%)',
        }}
      >
        <FaceShot from={from} boxW={W} boxH={fgH} crop={0.5} />
      </div>
    </div>
  );
};
