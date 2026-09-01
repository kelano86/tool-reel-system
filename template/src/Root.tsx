import React from 'react';
import { Composition } from 'remotion';
import { ToolReel } from './ToolReel';
import { edit, totalFrames } from './edit';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="ToolReel"
    component={ToolReel}
    durationInFrames={totalFrames()}
    fps={edit.fps}
    width={edit.width}
    height={edit.height}
  />
);

