import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { edit, placed, beatSpeed, type Placed } from './edit';
import { FaceShot } from './components/FaceShot';
import { CtaCard } from './components/Broll';
import { Captions } from './components/Captions';
import { Grain, isDark, groundVars, LIGHT_BODY } from './components/ground';
import { VideoTitle, LOW_CAPTION, SAFE, INTRO_TITLE_BOX, INTRO_ART_BOX } from './components/shots';
import { ApiTitleCard, type RowItem } from './components/anim/ApiAnims';
import {
  VidCard,
  DuoCards,
  FlatMock,
  PresetDrop,
  UiKit,
  ImageDrop,
  CatRoll,
  ExportLadder,
  RatioMorph,
  ClaudeCard,
} from './components/anim/MotionAnims';
import assetData from './data/assets.json';

const W = edit.width;
const H = edit.height;

/**
 * The evidence pack, harvested from jitter.video and animos.app on 2026-08-30
 * by scripts/probe/*. Every fact a shot renders reads from here. No GitHub
 * repos this time: both tools are closed-source SaaS, so the harvest is the
 * vendors' own pages and product demo videos.
 */
type Tool = {
  name: string;
  domain: string;
  icon: string;
  exportClaim: string;
  freeClaim: string;
  videos: Record<string, string>;
  presets?: string[];
  categories?: string[];
  resolutions?: string[];
  ratios?: string[];
  claudeClaim?: string;
};
const A = assetData as unknown as { jitter: Tool; animos: Tool };

/** Source dimensions of each harvested demo video, probed with ffprobe. */
const VID: Record<string, { src: string; vw: number; vh: number }> = {
  hero: { src: A.jitter.videos.hero, vw: 1472, vh: 920 },
  suite: { src: A.jitter.videos.suite, vw: 820, vh: 684 },
  export: { src: A.jitter.videos.export, vw: 680, vh: 850 },
  preview: { src: A.animos.videos.preview, vw: 1400, vh: 824 },
  tpl1: { src: A.animos.videos.tpl1, vw: 640, vh: 800 },
};

/** The two marks, in list order - the intro pair and the title cards. */
const MARKS: RowItem[] = [
  { art: A.jitter.icon, contain: false },
  { art: A.animos.icon, contain: true },
];

/** The ratio labels the animos frame selector actually offers. */
const RATIO_STEPS = [
  { label: '16:9', w: 16, h: 9 },
  { label: '1:1', w: 1, h: 1 },
  { label: '9:16', w: 9, h: 16 },
];

const FACE_TOP = Math.round(H * 0.555);
const FACE_H = H - FACE_TOP;
const FACE_MARGIN = 22;
const BROLL_H = Math.round(H * 0.46);

/** The safe band for a faceless shot's content. */
const FACELESS_BAND = { top: 220, height: 1030 };

/** The split-screen band: the B-roll zone less the strip Instagram covers. */
const SPLIT_BAND = { top: SAFE.top, height: BROLL_H - SAFE.top };

type Shot = {
  to: number;
  kind: string;
  ground: string;
  face: boolean;
  /** Which tool this shot's facts come from. */
  tool?: 'jitter' | 'animos';
  /** Which harvested video plays, for vidcard/duo shots. */
  vid?: string;
  /** Seconds into that video. */
  from?: number;
  /** Frame within the shot when a drop lands. */
  landAt?: number;
};

/**
 * The beat's sound, mounted once per Sequence and never touched again. Every
 * <Video> is muted; audio lives here so nothing the picture does can
 * interrupt it.
 */
const BeatAudio: React.FC<{ beat: Placed }> = ({ beat }) => (
  <Audio
    /*
      voice.wav is the camera audio mastered for the reel (high-pass, denoise,
      de-ess, mud cut, low shelf for body, presence boost, exciter, dark-top
      cut, 3:1 compression, -1.2dB limiter â€” scripts/master_voice.ps1 has the
      exact chain). Same timeline as footage.mov, so the srcFrom trims land
      identically.
    */
    src={staticFile(beat.audio ?? 'voice.wav')}
    trimBefore={beat.audio ? 0 : Math.round(beat.srcFrom * edit.fps)}
    playbackRate={beatSpeed(beat)}
    /*
      NO toneFrequency, deliberately. Browsers set preservesPitch = true, so
      playbackRate already time-stretches without moving the pitch; adding a
      "compensating" toneFrequency applies a real downshift to correct audio.
    */
  />
);

const ShotBeat: React.FC<{ beat: Placed; shots: Shot[] }> = ({ beat, shots }) => {
  const local = useCurrentFrame();
  const idx = Math.max(0, shots.findIndex((s) => local < s.to));
  const shot = shots[idx === -1 ? shots.length - 1 : idx];
  const start = idx === 0 ? 0 : shots[idx - 1].to;
  const sLocal = local - start;
  const sTotal = shot.to - start;

  const fullBleed = shot.kind === 'facefull';

  /* The title card owns the whole frame: its grid is specified against frame
     lines and is inside the safe zone by construction. */
  const band = shot.face
    ? SPLIT_BAND
    : shot.kind === 'title'
      ? { top: 0, height: H }
      : FACELESS_BAND;

  let content: React.ReactNode = null;
  if (shot.kind === 'title') {
    const t = A[shot.tool!];
    const rank = shot.tool === 'jitter' ? '#1' : '#2';
    content = (
      <ApiTitleCard
        local={sLocal}
        topline={rank}
        name={t.name}
        art={t.icon}
        contain={shot.tool === 'animos'}
        factLead="free"
        fact={`Â· ${t.domain}`}
      />
    );
  } else if (shot.kind === 'vidcard') {
    const v = VID[shot.vid!];
    content = (
      <VidCard
        local={sLocal}
        src={v.src}
        vw={v.vw}
        vh={v.vh}
        from={shot.from}
        url={A[shot.tool!].domain}
        boxH={shot.face ? SPLIT_BAND.height - 40 : 900}
      />
    );
  } else if (shot.kind === 'duo') {
    content = (
      <DuoCards
        local={sLocal}
        a={{ ...VID.hero, from: 11, url: A.jitter.domain }}
        b={{ ...VID.preview, from: 3, url: A.animos.domain }}
      />
    );
  } else if (shot.kind === 'presetdrop') {
    content = <PresetDrop local={sLocal} preset={A.jitter.presets![0]} landAt={shot.landAt} />;
  } else if (shot.kind === 'uikit') {
    content = <UiKit local={sLocal} />;
  } else if (shot.kind === 'imagedrop') {
    content = <ImageDrop local={sLocal} img="animos/drop.jpg" landAt={shot.landAt} />;
  } else if (shot.kind === 'catroll') {
    content = <CatRoll local={sLocal} total={sTotal} categories={A.animos.categories!} />;
  } else if (shot.kind === 'exportladder') {
    content = <ExportLadder local={sLocal} resolutions={A.animos.resolutions!} />;
  } else if (shot.kind === 'ratiomorph') {
    content = (
      <RatioMorph
        local={sLocal}
        total={sTotal}
        src={VID.tpl1.src}
        vw={VID.tpl1.vw}
        vh={VID.tpl1.vh}
        steps={RATIO_STEPS}
      />
    );
  } else if (shot.kind === 'claudecard') {
    content = (
      <ClaudeCard local={sLocal} domain={A.animos.domain} claim={A.animos.claudeClaim!} />
    );
  } else if (shot.kind === 'ctacard') {
    content = <CtaCard local={sLocal} keyword={edit.keyword ?? 'ANIMATE'} />;
  } else if (shot.kind === 'hookintro') {
    content = (
      <>
        <VideoTitle
          text={edit.title ?? ''}
          local={sLocal}
          y={INTRO_TITLE_BOX.y + INTRO_TITLE_BOX.h / 2}
        />
        <div
          style={{
            position: 'absolute',
            left: INTRO_ART_BOX.x,
            top: INTRO_ART_BOX.y,
            width: INTRO_ART_BOX.w,
            height: INTRO_ART_BOX.h,
          }}
        >
          {/* The flat mockup of the title, with the two marks arriving over
              it. They reappear on each title card. */}
          <FlatMock local={sLocal} marks={MARKS} />
        </div>
      </>
    );
  } else if (!fullBleed) {
    /* Loud rather than silent: a misspelled kind used to fall through to an
       empty zone and looked like a deliberate shot. */
    throw new Error(`beat "${beat.key}": unknown shot kind "${shot.kind}"`);
  }

  const dark = fullBleed || isDark(shot.ground);

  const box = fullBleed
    ? { left: 0, top: 0, width: W, height: H, borderRadius: 0 }
    : {
        left: FACE_MARGIN,
        top: FACE_TOP,
        width: W - FACE_MARGIN * 2,
        height: FACE_H,
        borderRadius: 46,
      };

  const zone = shot.kind === 'hookintro' ? { top: 0, height: H } : band;

  return (
    <AbsoluteFill style={{ background: shot.ground, ...groundVars(shot.ground) }}>
      {/* Grain belongs to the split screen, not to every dark ground. */}
      {shot.face && !fullBleed && isDark(shot.ground) ? <Grain /> : null}
      <div style={{ position: 'absolute', left: 0, top: zone.top, width: W, height: zone.height }}>
        {content}
      </div>

      <div
        style={{
          position: 'absolute',
          ...box,
          overflow: 'hidden',
          opacity: shot.face ? 1 : 0,
        }}
      >
        <FaceShot
          from={beat.srcFrom}
          boxW={box.width}
          boxH={box.height}
          crop={fullBleed ? 1 : 0.62}
          speed={beatSpeed(beat)}
        />
      </div>

      <Captions
        beatKey={beat.key}
        local={local}
        y={shot.face && !fullBleed ? H / 2 : Math.round(H * LOW_CAPTION)}
        faceOnScreen={shot.face}
        onDark={dark}
      />
    </AbsoluteFill>
  );
};

export const ToolReel: React.FC = () => (
  <AbsoluteFill style={{ background: LIGHT_BODY }}>
    {placed().map((b) => {
      const shots = (b as unknown as { shots?: Shot[] }).shots;
      if (!shots?.length) throw new Error(`beat "${b.key}" has no shots`);
      return (
        <Sequence key={b.key} from={b.from} durationInFrames={b.durationInFrames} name={b.label}>
          <BeatAudio beat={b} />
          <ShotBeat beat={b} shots={shots} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

