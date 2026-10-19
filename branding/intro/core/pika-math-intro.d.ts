// Kiểu cho core/pika-math-intro.js (dùng trong Remotion / TypeScript).
export type PikaMathLogo = 'A' | 'B' | 'C' | 'D';
export interface PikaMathIntroOptions {
  /** Cỡ khung (px). Mặc định 1920 x 1080. */
  width?: number;
  height?: number;
  /** Kiểu logo cuối: A ngang, B hai dòng, C dọc, D hai dòng "Pika" nhỏ. Mặc định 'A'. */
  logo?: PikaMathLogo;
  /** Màu nền, hoặc null để nền trong suốt. Mặc định '#FFFFFF'. */
  background?: string | null;
}
export interface PikaMathIntro {
  width: number;
  height: number;
  logo: PikaMathLogo;
  /** Thời lượng (giây). */
  duration: number;
  /** Vẽ khung ở thời điểm t (giây) lên context 2D cỡ width x height. */
  render(ctx: CanvasRenderingContext2D, t: number): void;
}
export interface SoundCue { t: number; type: string; n?: number }
export const DURATION: number;
export const LOGOS: PikaMathLogo[];
export const TIMING: { merge: number; squash: number; jump: number; land: number; words: number; blink: number; voice: number };
export const COLORS: { pika: string; math: string; facePlate: string };
export function createPikaMathIntro(options?: PikaMathIntroOptions): PikaMathIntro;
export function soundCues(): SoundCue[];
