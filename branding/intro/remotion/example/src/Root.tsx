// Ví dụ: mỗi kiểu logo một Composition 16:9, thêm bản dọc 9:16 (kiểu C) và một video ghép intro với cảnh tiếp theo.
import React from 'react';
import { AbsoluteFill, Composition, Img, Sequence, staticFile } from 'remotion';
import { PikaMathIntro, PIKA_MATH_INTRO_DURATION } from './pika-math-intro/remotion/PikaMathIntro';

const FPS = 30, INTRO = Math.round(PIKA_MATH_INTRO_DURATION * FPS);

const WithNextScene: React.FC = () => (
  <AbsoluteFill style={{ background: '#FFFFFF' }}>
    <Sequence durationInFrames={INTRO}><PikaMathIntro logo="A" /></Sequence>
    <Sequence from={INTRO}>
      <AbsoluteFill style={{ background: '#EDFBFD', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 96, fontWeight: 800, color: '#0F172A', fontFamily: 'system-ui, sans-serif' }}>Cảnh tiếp theo</h1>
        <Img src={staticFile('pika-math-intro/pika-math-A-horizontal-color.svg')} style={{ position: 'absolute', left: 72, top: 56, height: 72 }} />
      </AbsoluteFill>
    </Sequence>
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    {(['A', 'B', 'C', 'D'] as const).map(logo => (
      <Composition key={logo} id={`PikaMathIntro-${logo}`} component={PikaMathIntro} defaultProps={{ logo }}
        durationInFrames={INTRO} fps={FPS} width={1920} height={1080} />
    ))}
    <Composition id="PikaMathIntro-C-portrait" component={PikaMathIntro} defaultProps={{ logo: 'C' as const }}
      durationInFrames={INTRO} fps={FPS} width={1080} height={1920} />
    <Composition id="IntroThenScene" component={WithNextScene} durationInFrames={INTRO + 3 * FPS} fps={FPS} width={1920} height={1080} />
  </>
);
