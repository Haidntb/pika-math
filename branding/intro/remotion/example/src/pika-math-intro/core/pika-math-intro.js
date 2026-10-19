// Intro logo Pika Math: lõi chuyển động dùng chung cho HyperFrames, Remotion, trang xem thử và script xuất video.
// 9 mảnh hình học bay xoay vào, đổi dáng dần thành đúng các phần của mặt Pika, mảnh nào chạm chỗ thì nhún và đổi xanh Pika
// -> thở, lấy đà, nhảy về chỗ trong logo -> chữ "Pika Math" hiện ra -> nháy mắt, lấp lánh.
// Vẽ lên canvas 2D; mỗi khung chỉ phụ thuộc thời điểm t (giây), nên tua tới, lùi hay render từng khung đều ra đúng một hình.
import { LOGO_PATHS } from './logo-paths.js';

const PATHS = LOGO_PATHS;
const N = 180;
const TEAL = '#47C3D7', ORANGE = '#FF8A1F', NAVY = '#1F3A5F', FACE_FILL = '#FFFFFF';

export const DURATION = 6.0;
export const LOGOS = ['A', 'B', 'C', 'D'];                                  // A ngang, B hai dòng, C dọc, D hai dòng "Pika" nhỏ
export const COLORS = { pika: TEAL, math: ORANGE, facePlate: FACE_FILL };

// --- Nhịp ---
const T_MERGE = 1.95, T_SQUASH = 2.6, T_JUMP = 2.8, T_LAND = 3.3, T_SLIDE = 3.3, T_BLINK = 4.5;
export const TIMING = { merge: T_MERGE, squash: T_SQUASH, jump: T_JUMP, land: T_LAND, words: T_SLIDE, blink: T_BLINK, voice: 3.9 };
const HC = { x: 333, y: 340 }, MS = 0.95;                                  // tâm mặt Pika (đơn vị SVG của logo), cỡ mặt lúc ở giữa màn (khung 1080)

// --- Toán nhỏ ---
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const easeOut = k => 1 - Math.pow(1 - k, 3);
const easeIn = k => k * k * k;
const easeInOut = k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
function backOut(k, s = 1.7) { k -= 1; return k * k * ((s + 1) * k + s) + 1; }
const wobble = k => k <= 0 || k >= 1 ? 0 : Math.sin(k * Math.PI * 2.5) * Math.exp(-k * 4.5);
const mixHex = (a, b, k) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; };

// Hình học dựng một lần, lúc tạo intro đầu tiên (cần DOM để đo đường SVG)
let G = null;
function geometry() {
  if (G) return G;
  // --- Đường viền thành đa giác cùng số điểm để biến hình ---
  const sub = d => d.split(/(?=M)/).map(s => s.trim()).filter(Boolean);
  const svgNS = 'http://www.w3.org/2000/svg', svgHost = document.createElementNS(svgNS, 'svg');
  svgHost.style.cssText = 'position:absolute;width:0;height:0'; (document.body || document.documentElement).appendChild(svgHost);
  function sampleD(d, n = 900) {
    const p = document.createElementNS(svgNS, 'path'); p.setAttribute('d', d); svgHost.appendChild(p);
    const L = p.getTotalLength(), out = []; for (let i = 0; i < n; i++) { const q = p.getPointAtLength(L * i / n); out.push([q.x, q.y]); }
    p.remove(); return out;
  }
  function resample(pts, n = N) {
    const seg = [], m = pts.length; let tot = 0;
    for (let i = 0; i < m; i++) { const a = pts[i], b = pts[(i + 1) % m]; const l = Math.hypot(b[0] - a[0], b[1] - a[1]); seg.push(l); tot += l; }
    const out = []; let j = 0, acc = 0;
    for (let i = 0; i < n; i++) { const tg = tot * i / n; while (acc + seg[j] < tg) { acc += seg[j]; j++; }
      const a = pts[j], b = pts[(j + 1) % m], k = seg[j] ? (tg - acc) / seg[j] : 0; out.push([lerp(a[0], b[0], k), lerp(a[1], b[1], k)]); }
    return out;
  }
  const area = P => { let s = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };
  const centroid = P => [P.reduce((s, p) => s + p[0], 0) / P.length, P.reduce((s, p) => s + p[1], 0) / P.length];
  // dóng điểm: cùng chiều, xoay vòng điểm đầu để tổng quãng dịch nhỏ nhất
  function align(src, dst) {
    if (Math.sign(area(src)) !== Math.sign(area(dst))) src = src.slice().reverse();
    let best = 0, bd = Infinity;
    for (let o = 0; o < N; o++) { let d = 0; for (let i = 0; i < N; i++) { const a = src[(i + o) % N], b = dst[i]; d += (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2; } if (d < bd) { bd = d; best = o; } }
    return dst.map((_, i) => src[(i + best) % N]);
  }
  const lerpP = (A, B, e) => A.map((a, i) => [lerp(a[0], B[i][0], e), lerp(a[1], B[i][1], e)]);
  const polyPath = P => { const p = new Path2D(); P.forEach(([x, y], i) => i ? p.lineTo(x, y) : p.moveTo(x, y)); p.closePath(); return p; };
  function squashAbout(g, c, dir, amt) {                                     // bẹp theo một hướng quanh một điểm
    const a = Math.atan2(dir[1], dir[0]);
    g.translate(c[0], c[1]); g.rotate(a); g.scale(1 - amt, 1 + amt * 0.7); g.rotate(-a); g.translate(-c[0], -c[1]);
  }

  // --- Mặt Pika thật ---
  const [earLd, earRd] = sub(PATHS.ears).sort((a, b) => centroid(sampleD(a, 60))[0] - centroid(sampleD(b, 60))[0]);
  const [outD, faceD] = sub(PATHS.head).sort((a, b) => Math.abs(area(sampleD(b, 200))) - Math.abs(area(sampleD(a, 200))));
  const P2 = { earL: new Path2D(earLd), earR: new Path2D(earRd), head: new Path2D(PATHS.head), face: new Path2D(faceD), eyeL: new Path2D(PATHS.eyeL), eyeR: new Path2D(PATHS.eyeR) };
  const REAL = { out: resample(sampleD(outD)), face: resample(sampleD(faceD)), earL: resample(sampleD(earLd)), earR: resample(sampleD(earRd)), eyeL: resample(sampleD(PATHS.eyeL)), eyeR: resample(sampleD(PATHS.eyeR)) };
  // tấm mặt là tấm trắng (không rỗng), mắt nháy bằng cách bóp dọc quanh tâm mắt
  function drawRealHead(g, blink = 1) {
    g.fillStyle = TEAL; g.fill(P2.earL); g.fill(P2.earR);
    g.fillStyle = FACE_FILL; g.fill(P2.face); g.fillStyle = TEAL; g.fill(P2.head, 'evenodd');
    for (const [k, cx, cy] of [['eyeL', 287, 353], ['eyeR', 442, 337]]) {
      g.save(); g.translate(cx, cy); g.scale(1, blink); g.translate(-cx, -cy); g.fill(P2[k]); g.restore();
    }
  }

  // --- 9 mảnh hình học (dáng lúc bay) ---
  // đa giác của chữ nhật bo góc kiểu arcTo góc vuông (không kẹp bán kính)
  function rrectPoly(x, y, w, h, [tl, tr, br, bl]) {
    const P = [], arc = (cx, cy, r, a0, a1) => { for (let i = 0; i <= 20; i++) { const a = lerp(a0, a1, i / 20); P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
    P.push([x + tl, y]); arc(x + w - tr, y + tr, tr, -Math.PI / 2, 0); arc(x + w - br, y + h - br, br, 0, Math.PI / 2);
    arc(x + bl, y + h - bl, bl, Math.PI / 2, Math.PI); P.push([x, y + tl]); arc(x + tl, y + tl, tl, Math.PI, Math.PI * 1.5);
    return resample(P);
  }
  function arcStrokePoly(cx, cy, r, a0, a1, w) {                              // viền của một cung nét dày, đầu tròn
    const P = [], h = w / 2, at = (rr, a) => [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
    for (let i = 0; i <= 40; i++) P.push(at(r + h, lerp(a0, a1, i / 40)));
    const e = at(r, a1); for (let i = 1; i < 12; i++) { const a = a1 + Math.PI * i / 12; P.push([e[0] + Math.cos(a) * h, e[1] + Math.sin(a) * h]); }
    for (let i = 0; i <= 40; i++) P.push(at(r - h, lerp(a1, a0, i / 40)));
    const s = at(r, a0); for (let i = 1; i < 12; i++) { const a = a0 + Math.PI + Math.PI * i / 12; P.push([s[0] + Math.cos(a) * h, s[1] + Math.sin(a) * h]); }
    return resample(P);
  }
  const SPLIT = [333, 350];                                                   // đường cắt chữ thập của 4 ô đầu
  const GEO = {
    out: rrectPoly(56, 139, 555, 419, [240, 240, 200, 200]),
    face: rrectPoly(168, 242, 378, 262, [120, 120, 120, 120]),
    eyeL: arcStrokePoly(287, 388, 48, Math.PI + 0.25, Math.PI * 2 - 0.25, 22),
    eyeR: arcStrokePoly(442, 372, 48, Math.PI + 0.25, Math.PI * 2 - 0.25, 22),
    earL: resample([[75, 262], [88, 128], [222, 160]]), earR: resample([[372, 140], [428, 98], [516, 192]]),
  };
  const SRC = {}; for (const k in GEO) SRC[k] = align(GEO[k], REAL[k]);
  const PIECES = [
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map((q, i) => ({ part: 'out', q, col: ['#FF8FC8', '#9B7BFF', '#6BCB77', '#FF6B6B'][i], c: [SPLIT[0] + q[0] * 140, SPLIT[1] + q[1] * 105] })),
    { part: 'face', col: '#FFE7A0', c: [357, 373] }, { part: 'eyeL', col: NAVY, c: [287, 378] }, { part: 'eyeR', col: NAVY, c: [442, 362] },
    { part: 'earL', col: '#FFC93C', c: [128, 183], tri: true }, { part: 'earR', col: ORANGE, c: [439, 143], tri: true },
  ];
  PIECES.forEach((p, i) => {
    const a = i * 2.4 + 0.6;
    p.land = 0.25 + i * 0.15;                                                 // bắt đầu bay; chạm chỗ sau 0,5 s
    p.eye = p.part.startsWith('eye');
    // mắt bay thẳng từ phía của nó, các mảnh khác bay từ nhiều hướng và xoay
    p.from = p.eye ? { dx: p.part === 'eyeL' ? -1100 : 1100, dy: -650, rot: 0 } : { dx: Math.cos(a) * 1500, dy: Math.sin(a) * 900 - 200, rot: (i % 2 ? 1 : -1) * (2.5 + (i % 3)) };
    p.hit = p.land + 0.5;                                                     // lúc chạm chỗ: đổi màu và nhún
  });
  const DONE = 2.6;                                                           // từ đây vẽ thẳng mặt thật (mảnh đã trùng khít)

  function drawPieces(g, t) {
    const allFlipped = PIECES.every(p => t >= p.hit);
    const quadNudge = { sx: 1, sy: 1 };                                       // 4 ô đầu đã chạm nhún chung một khối quanh giao điểm chữ thập
    for (const p of PIECES) if (p.q && t >= p.hit) {
      const w = 0.09 * wobble(clamp((t - p.hit) / 0.4)), pu = 1 + 0.05 * Math.sin(Math.PI * clamp((t - p.hit) / 0.14));
      const horiz = Math.abs(p.from.dx) > Math.abs(p.from.dy);
      quadNudge.sx *= pu * (horiz ? 1 - w : 1 + 0.7 * w); quadNudge.sy *= pu * (horiz ? 1 + 0.7 * w : 1 - w);
    }
    for (const p of PIECES) {
      const k = clamp((t - p.land) / 0.5); if (k <= 0) continue;
      // mảnh lao vào, dừng gọn và đổi dáng ở nửa sau quãng bay; mắt đổi dần suốt quãng bay, không xoay
      const e = p.eye ? easeOut(k) : 1 - (1 - k) * (1 - k), m = p.eye ? easeInOut(k) : easeInOut(clamp((k - 0.5) / 0.5));
      g.save();
      g.translate(lerp(p.from.dx, 0, e) + p.c[0], lerp(p.from.dy, 0, e) + p.c[1]);
      if (!p.eye) g.rotate(p.from.rot * (1 - easeOut(k)));
      const sc = lerp(0.5, 1, easeOut(k)); g.scale(sc, sc);
      g.translate(-p.c[0], -p.c[1]);
      const flipped = t >= p.hit;
      if (flipped) {                                                          // cú nhấn lúc chạm, khớp tiếng gõ
        if (p.q) { g.translate(SPLIT[0], SPLIT[1]); g.scale(quadNudge.sx, quadNudge.sy); g.translate(-SPLIT[0], -SPLIT[1]); }
        else {
          const pu = 1 + (p.eye ? 0.05 : 0.08) * Math.sin(Math.PI * clamp((t - p.hit) / 0.14));
          g.translate(p.c[0], p.c[1]); g.scale(pu, pu); g.translate(-p.c[0], -p.c[1]);
          squashAbout(g, p.c, [-p.from.dx, -p.from.dy], (p.eye ? 0.12 : 0.24) * wobble(clamp((t - p.hit) / 0.4)));
        }
      }
      // đổi màu bằng set đúng lúc chạm (tween giữa hai màu khác hẳn sẽ đi qua màu xỉn); riêng kem sang trắng thì chuyển dần
      const col = p.part === 'face' ? mixHex(p.col, FACE_FILL, clamp((t - p.hit) / 0.1)) : (flipped ? TEAL : p.col);
      g.fillStyle = g.strokeStyle = col;
      const path = polyPath(lerpP(SRC[p.part], REAL[p.part], m));
      if (p.q) {
        if (allFlipped) { if (p.q[0] < 0 && p.q[1] < 0) g.fill(path); g.restore(); continue; }   // tất cả đã chạm: một khối
        const R = 2000, ov = -1; g.beginPath();                               // còn khác màu: chồng mép 1 đơn vị, không lộ vệt
        g.rect(p.q[0] < 0 ? SPLIT[0] - R : SPLIT[0] + ov, p.q[1] < 0 ? SPLIT[1] - R : SPLIT[1] + ov, R - ov, R - ov); g.clip();
        g.fill(path);
      } else {
        g.fill(path);
        if (p.tri) { const w = 30 * (1 - m); if (w > 0.5) { g.lineJoin = 'round'; g.lineWidth = w; g.stroke(path); } }   // tam giác bo góc lúc bay
      }
      g.restore();
    }
  }

  // --- Bố cục logo cuối theo kiểu (đơn vị SVG của mặt Pika). Chữ "Math" theo logo Pika Math (dời mathOffset về hệ của mặt),
  // chữ "Pika" lấy từ wordmark Pika chính thức, cỡ khớp chữ "Math" theo chiều cao chữ "a" ---
  const boxOf = P => { const xs = P.map(p => p[0]), ys = P.map(p => p[1]); const x = Math.min(...xs), y = Math.min(...ys), r = Math.max(...xs), b = Math.max(...ys); return { x, y, r, b, w: r - x, h: b - y }; };
  const union = B => { const x = Math.min(...B.map(b => b.x)), y = Math.min(...B.map(b => b.y)), r = Math.max(...B.map(b => b.r)), b = Math.max(...B.map(b => b.b)); return { x, y, r, b, w: r - x, h: b - y }; };
  const RAW = {};                                                             // nét gốc từng chữ (chưa dời, chưa phóng)
  for (const [w, src] of [['pika', PATHS.pikaWord], ['math', PATHS.math]]) for (const k in src) RAW[w + k] = { path: new Path2D(src[k]), box: boxOf(sampleD(src[k], 300)) };
  const WORDS = { pika: { keys: ['P', 'i', 'k', 'a'], col: TEAL }, math: { keys: ['M', 'a', 't', 'h'], col: ORANGE } };
  for (const w in WORDS) { WORDS[w].box = union(WORDS[w].keys.map(k => RAW[w + k].box)); WORDS[w].aB = RAW[w + 'a'].box; }
  const K = WORDS.math.aB.h / WORDS.pika.aB.h;
  const FB = { x: 56, y: 98, r: 611, b: 558, w: 555, h: 460 };                // mặt Pika gồm tai
  const MO = PATHS.mathOffset;
  const GAP_FACE = WORDS.math.box.x + MO[0] - FB.r, GAP_WORD = WORDS.math.aB.h * 0.42;
  // đặt một chữ: mép trái x, chân chữ "a" ở base, phóng s so với nét gốc
  function placeWord(w, s, x, base) {
    const W0 = WORDS[w], tx = x - W0.box.x * s, ty = base - W0.aB.b * s;
    return W0.keys.map(k => { const R = RAW[w + k]; return { path: R.path, col: W0.col, s, tx, ty, box: { x: R.box.x * s + tx, y: R.box.y * s + ty, r: R.box.r * s + tx, b: R.box.b * s + ty }, base }; });
  }
  function layout(key) {
    const pw = WORDS.pika.box.w * K, mw = WORDS.math.box.w;
    let lines, mode = 'slide';
    if (key === 'A') {                                                        // ngang: mặt + "Pika Math" một hàng
      const x0 = WORDS.math.box.x + MO[0], base = WORDS.math.aB.b + MO[1];
      lines = [[...placeWord('pika', K, x0, base), ...placeWord('math', 1, x0 + pw + GAP_WORD, base)]];
    } else if (key === 'B' || key === 'D') {                                  // hai dòng cạnh mặt, khối chữ cao bằng mặt; D: "Pika" nhỏ bằng nửa
      const rel = key === 'B' ? 1 : 0.5;
      const pikaH = (WORDS.pika.aB.b - WORDS.pika.box.y) * K, mathH = WORDS.math.aB.b - WORDS.math.box.y, lead = mathH * 0.10;
      const sM = (FB.h - lead) / (pikaH * rel + mathH), sP = sM * rel, x0 = FB.r + GAP_FACE * 0.9;
      const pBase = FB.y + pikaH * sP, mBase = pBase + lead + mathH * sM;
      lines = [placeWord('pika', K * sP, x0, pBase), placeWord('math', sM, x0, mBase)];
    } else {                                                                  // dọc: mặt trên, "Pika Math" một hàng bên dưới
      mode = 'rise';
      const lw = pw + GAP_WORD + mw, s = FB.w * 1.9 / lw, xl = FB.x + FB.w / 2 - lw * s / 2;
      const up = Math.max((WORDS.pika.aB.b - WORDS.pika.box.y) * K, WORDS.math.aB.b - WORDS.math.box.y) * s;
      const base = FB.b + FB.h * 0.14 + up;
      lines = [[...placeWord('pika', K * s, xl, base), ...placeWord('math', s, xl + (pw + GAP_WORD) * s, base)]];
    }
    const all = union([FB, ...lines.flat().map(l => ({ ...l.box, w: l.box.r - l.box.x, h: l.box.b - l.box.y }))]);
    return { mode, lines, all };
  }

  // chữ hiện ra: A, B, D trượt ra từ sau mặt, chữ bên phải ra trước, dòng dưới ra sau dòng trên 0,12 s, dừng thì nảy bẹp nhẹ;
  // C bật lên từ dưới chân dòng chữ, lần lượt từ trái sang phải
  function drawWords(g, LAYOUT, t) {
    LAYOUT.lines.forEach((line, li) => {
      const box = union(line.map(l => ({ ...l.box, w: 0, h: 0 })));
      g.save(); g.beginPath();
      if (LAYOUT.mode === 'slide') g.rect(FB.r - 40, -4000, 8000, 8000); else g.rect(-4000, -4000, 8000, 4000 + box.b + 12);
      g.clip();
      const order = LAYOUT.mode === 'slide' ? [...line].sort((a, b) => b.box.r - a.box.r) : [...line].sort((a, b) => a.box.x - b.box.x);
      order.forEach((l, j) => {
        const t0 = T_SLIDE + li * 0.12 + j * 0.05, k = clamp((t - t0) / 0.42); if (k <= 0) return;
        const hit = clamp((t - t0 - 0.42) / 0.5), cx = (l.box.x + l.box.r) / 2;
        g.save();
        if (LAYOUT.mode === 'slide') { g.translate(-(box.r - FB.r + 40) * (1 - backOut(k, 0.7)), 0); squashAbout(g, [cx, l.base], [1, 0], 0.1 * wobble(hit)); }
        else { g.translate(0, (box.b + 12 - box.y) * (1 - backOut(k, 0.7))); squashAbout(g, [cx, l.base], [0, 1], 0.1 * wobble(hit)); }
        g.translate(l.tx, l.ty); g.scale(l.s, l.s); g.fillStyle = l.col; g.fill(l.path); g.restore();
      });
      g.restore();
    });
  }

  G = { DONE, PIECES, drawRealHead, drawPieces, drawWords, layout };
  return G;
}

// Mốc tiếng: một mục cho mỗi tiếng động (tock: mảnh chạm chỗ), giống nhau ở mọi kiểu logo và mọi cỡ khung
export function soundCues() {
  const { PIECES } = geometry();
  return [
    ...PIECES.map((p, i) => ({ t: p.land + 0.5, type: 'tock', n: i })),
    { t: T_MERGE, type: 'shimmer' }, { t: T_JUMP, type: 'boing' }, { t: T_LAND, type: 'pop' },
    { t: T_SLIDE, type: 'swish' }, { t: T_BLINK, type: 'blip' }, { t: T_BLINK + 0.18, type: 'sparkle' },
  ];
}

// Tạo một intro. width/height: cỡ khung (px); logo: 'A' | 'B' | 'C' | 'D'; background: mã màu, hoặc null để nền trong suốt.
// Mọi kích thước theo cạnh ngắn của khung (U = cạnh ngắn / 1080); logo cuối vừa vùng 78% x 59% của khung.
export function createPikaMathIntro({ width = 1920, height = 1080, logo = 'A', background = '#FFFFFF' } = {}) {
  const G = geometry();
  const W = width, H = height, U = Math.min(W, H) / 1080;
  const L = G.layout(LOGOS.includes(logo) ? logo : 'A');
  const S = Math.min(W * 1500 / 1920 / L.all.w, H * 640 / 1080 / L.all.h);
  const OX = (W - L.all.w * S) / 2 - L.all.x * S, OY = (H - L.all.h * S) / 2 - L.all.y * S;
  function render(g, t) {
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
    if (background) { g.fillStyle = background; g.fillRect(0, 0, W, H); }

    // mặt: giữa màn -> thở, lấy đà -> nhảy theo đường cong về chỗ trong logo
    const stage = { x: W / 2, y: H / 2 - 10 * U, s: MS * U };
    const dest = { x: OX + HC.x * S, y: OY + HC.y * S, s: S };
    const jk = clamp((t - T_JUMP) / (T_LAND - T_JUMP)), je = easeInOut(jk);
    const cx = lerp(stage.x, dest.x, je), cy = lerp(stage.y, dest.y, je) - Math.sin(jk * Math.PI) * 220 * U;
    const sc = lerp(stage.s, dest.s, je);
    const sq = clamp((t - T_SQUASH) / (T_JUMP - T_SQUASH)), land = clamp((t - T_LAND) / 0.35);
    let sx = 1, sy = 1;
    if (t < T_JUMP) {                                                         // thở nhẹ rồi lấy đà vào chậm
      const br = Math.sin(Math.PI * clamp((t - 2.25) / (T_SQUASH - 2.25))), a = easeInOut(sq);
      sy = 1 + 0.025 * br - 0.16 * a; sx = 1 - 0.012 * br + 0.08 * a;
    } else if (t < T_LAND) {                                                  // nhả đà dần từ bẹp sang giãn
      const rel = 1 - easeOut(clamp(jk / 0.3));
      sy = 1 + 0.1 * Math.sin(jk * Math.PI) - 0.16 * rel; sx = 1 - 0.05 * Math.sin(jk * Math.PI) + 0.08 * rel;
    } else if (land < 1) { const w = Math.sin(land * Math.PI * 2) * Math.exp(-land * 3) * 0.14; sy = 1 - w; sx = 1 + w * 0.6; }

    if (t >= T_SLIDE) { g.save(); g.transform(S, 0, 0, S, OX, OY); G.drawWords(g, L, t); g.restore(); }

    g.save(); g.translate(cx, cy); g.scale(sc * sx, sc * sy); g.translate(-HC.x, -HC.y);
    const bk = clamp((t - T_BLINK) / 0.22), blink = bk > 0 && bk < 1 ? Math.max(0.08, Math.abs(bk * 2 - 1)) : 1;
    if (t >= G.DONE) G.drawRealHead(g, blink); else G.drawPieces(g, t);
    g.restore();

    // lấp lánh quanh tai khi nháy mắt
    const sk = clamp((t - T_BLINK - 0.15) / 0.6);
    if (sk > 0 && sk < 1) {
      const x0 = OX + HC.x * S, y0 = OY + 60 * S, R = S / 0.7415;              // cỡ lấp lánh theo cỡ mặt (logo chỉ có chữ Math: S = 0,7415)
      const cols = ['#47C3D7', '#FF8A1F', '#FFC93C', '#FF6B6B', '#6BCB77', '#9B7BFF'];
      for (let j = 0; j < 7; j++) {
        const a = -Math.PI / 2 + (j - 3) * 0.42, d = lerp(20, 200, easeOut(sk)) * R;
        g.save(); g.globalAlpha = 1 - sk; g.fillStyle = cols[j % 6];
        g.translate(x0 + Math.cos(a) * d, y0 + Math.sin(a) * d); g.rotate(sk * 3); g.scale(R, R);
        if (j % 3 === 0) { g.beginPath(); g.moveTo(0, -11); g.lineTo(10, 8); g.lineTo(-10, 8); g.closePath(); g.fill(); }
        else if (j % 3 === 1) { g.beginPath(); g.arc(0, 0, 9, 0, Math.PI * 2); g.fill(); }
        else g.fillRect(-8, -8, 16, 16);
        g.restore();
      }
    }
  }
  return { width: W, height: H, logo: LOGOS.includes(logo) ? logo : 'A', duration: DURATION, render };
}
