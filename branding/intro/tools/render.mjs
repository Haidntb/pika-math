// Xuất từng khung hình của preview.html bằng Chrome headless (CDP, không cần npm).
// Dùng: [LOGO=A|B|C|D] [W=1920] [H=1080] node tools/render.mjs <thư-mục-khung> [fps=30] [bg=white|none] [chỉ-các-giây,cách-nhau-dấu-phẩy]
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const [outDir, fpsArg = '30', bg = 'white', only] = process.argv.slice(2);
const fps = +fpsArg;
mkdirSync(outDir, { recursive: true });
const here = dirname(fileURLToPath(import.meta.url));
const url = 'file://' + encodeURI(join(here, '..', 'preview.html')) + `?still&logo=${process.env.LOGO || 'A'}&w=${process.env.W || 1920}&h=${process.env.H || 1080}` + (bg === 'none' ? '&bg=none' : '');
const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'pmc-'))}`,
  '--allow-file-access-from-files', '--no-first-run', '--window-size=1920,1080', url], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));
let pages;
for (let i = 0; i < 50; i++) {
  try { pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (pages.find(p => p.type === 'page')) break; } catch {}
  await sleep(200);
}
const ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const waiting = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } });
const send = (method, params) => new Promise(r => { const i = ++id; waiting.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result?.result?.value;

for (let i = 0; i < 50 && !(await evaluate('typeof window.frame === "function"')); i++) await sleep(200);
const dur = await evaluate('window.DUR');
writeFileSync(join(outDir, 'events.json'), JSON.stringify(await evaluate('window.EVENTS')));
const times = only ? only.split(',').map(Number) : Array.from({ length: Math.round(dur * fps) }, (_, i) => i / fps);
for (let i = 0; i < times.length; i++) {
  const url = await evaluate(`window.frame(${times[i]})`);
  const name = only ? `t${times[i].toFixed(2)}.png` : `f${String(i).padStart(4, '0')}.png`;
  writeFileSync(join(outDir, name), Buffer.from(url.split(',')[1], 'base64'));
}
console.log('frames', times.length, 'dur', dur);
ws.close(); chrome.kill();
process.exit(0);
