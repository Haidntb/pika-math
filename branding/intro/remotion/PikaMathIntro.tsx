// Intro logo Pika Math cho Remotion: vẽ lõi core/ lên canvas theo frame hiện tại, kèm tiếng (tuỳ chọn).
// Đặt trong <Sequence durationInFrames={Math.round(PIKA_MATH_INTRO_DURATION * fps)}> hoặc làm cả một Composition.
import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { createPikaMathIntro, DURATION, type PikaMathLogo } from '../core/pika-math-intro.js';

export const PIKA_MATH_INTRO_DURATION = DURATION;                           // giây

export type PikaMathIntroProps = {
  /** Kiểu logo cuối: A ngang, B hai dòng, C dọc, D hai dòng "Pika" nhỏ. */
  logo?: PikaMathLogo;
  /** Màu nền, hoặc null để nền trong suốt (đặt intro đè lên cảnh khác). */
  background?: string | null;
  /** Đường dẫn tiếng trong public/, hoặc null để tắt tiếng. */
  sound?: string | null;
};

export const PikaMathIntro: React.FC<PikaMathIntroProps> = ({ logo = 'A', background = '#FFFFFF', sound = 'pika-math-intro/mix.wav' }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const canvas = useRef<HTMLCanvasElement>(null);
  const intro = useMemo(() => createPikaMathIntro({ width, height, logo, background }), [width, height, logo, background]);
  useLayoutEffect(() => {
    const g = canvas.current?.getContext('2d');
    if (g) intro.render(g, frame / fps);
  }, [intro, frame, fps]);
  return (
    <AbsoluteFill>
      <canvas ref={canvas} width={width} height={height} style={{ width: '100%', height: '100%' }} />
      {sound ? <Audio src={staticFile(sound)} /> : null}
    </AbsoluteFill>
  );
};
