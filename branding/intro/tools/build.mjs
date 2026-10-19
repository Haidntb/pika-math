// Sinh các file tự đủ từ lõi core/: preview.html (mở thẳng bằng Chrome, không cần máy chủ) và block HyperFrames
// cho 3 khung (16:9, 9:16, 1:1). Lõi được nhúng thẳng vào từng file dưới dạng script thường, gắn vào window.PikaMathIntro.
// Dùng: node tools/build.mjs   (chạy lại mỗi khi sửa core/)
import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(join(root, p), 'utf8');

// ES module -> script thường: bỏ import, bỏ chữ export, gom các tên xuất vào window.PikaMathIntro
const strip = s => s.replace(/^import .*;\n/gm, '').replace(/^export /gm, '');
const CORE = `(function () {
${strip(read('core/logo-paths.js'))}
${strip(read('core/pika-math-intro.js'))}
window.PikaMathIntro = { createPikaMathIntro, soundCues, DURATION, LOGOS, TIMING, COLORS, LOGO_PATHS };
})();`;

const GENERATED = '<!-- File sinh bởi tools/build.mjs từ core/. Đừng sửa tay: sửa core/ rồi chạy lại node tools/build.mjs -->';

writeFileSync(join(root, 'preview.html'), read('tools/preview.template.html')
  .replace('<!--GENERATED-->', GENERATED).replace('/*__CORE__*/', () => CORE));

const FRAMES = [
  { file: 'pika-math-intro.html', id: 'pika-math-intro', w: 1920, h: 1080 },
  { file: 'pika-math-intro-portrait.html', id: 'pika-math-intro-portrait', w: 1080, h: 1920 },
  { file: 'pika-math-intro-square.html', id: 'pika-math-intro-square', w: 1080, h: 1080 },
];
for (const f of FRAMES) {
  const html = read('tools/hyperframes-block.template.html')
    .replace('<!--GENERATED-->', GENERATED)
    .replaceAll('__ID__', f.id).replaceAll('__W__', f.w).replaceAll('__H__', f.h)
    .replace('/*__CORE__*/', () => CORE);
  writeFileSync(join(root, 'hyperframes', f.file), html);
}

// Ví dụ HyperFrames: chép block 16:9, tiếng và logo vào đúng chỗ dự án HyperFrames hay để (compositions/, assets/)
const ex = join(root, 'hyperframes/example');
mkdirSync(join(ex, 'compositions'), { recursive: true }); mkdirSync(join(ex, 'assets/pika-math-intro'), { recursive: true });
copyFileSync(join(root, 'hyperframes/pika-math-intro.html'), join(ex, 'compositions/pika-math-intro.html'));
copyFileSync(join(root, 'sound/mix.wav'), join(ex, 'assets/pika-math-intro/mix.wav'));
copyFileSync(join(root, 'logo/lockups/pika-math-A-horizontal-color.svg'), join(ex, 'assets/pika-math-intro/pika-math-A-horizontal-color.svg'));
// Ví dụ Remotion: chép lõi + component vào src/pika-math-intro/ (giữ đường dẫn tương đối), tiếng và logo vào public/
const rx = join(root, 'remotion/example');
for (const d of ['src/pika-math-intro/core', 'src/pika-math-intro/remotion', 'public/pika-math-intro']) mkdirSync(join(rx, d), { recursive: true });
for (const f of ['pika-math-intro.js', 'pika-math-intro.d.ts', 'logo-paths.js']) copyFileSync(join(root, 'core', f), join(rx, 'src/pika-math-intro/core', f));
copyFileSync(join(root, 'remotion/PikaMathIntro.tsx'), join(rx, 'src/pika-math-intro/remotion/PikaMathIntro.tsx'));
copyFileSync(join(root, 'sound/mix.wav'), join(rx, 'public/pika-math-intro/mix.wav'));
copyFileSync(join(root, 'logo/lockups/pika-math-A-horizontal-color.svg'), join(rx, 'public/pika-math-intro/pika-math-A-horizontal-color.svg'));
console.log('built preview.html, hyperframes/' + FRAMES.map(f => f.file).join(', ') + ', hyperframes/example, remotion/example');
