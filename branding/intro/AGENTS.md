# Pika Math intro: hướng dẫn cho AI

Intro logo Pika Math 6 giây, vẽ bằng code (canvas 2D), dùng lại được trong HyperFrames và Remotion. Pika là thương hiệu mẹ, Pika Math là sản phẩm con. Kết bằng một trong 4 kiểu logo: A ngang (logo chính), B hai dòng, C dọc, D hai dòng "Pika" nhỏ (biến thể của B).

## Gói có gì

| Đường dẫn | Là gì | Sửa được không |
|---|---|---|
| `core/pika-math-intro.js` | Lõi chuyển động (ES module): `createPikaMathIntro({ width, height, logo, background })` trả `{ duration, render(ctx, t) }`; `soundCues()`; `DURATION`, `LOGOS`, `TIMING`, `COLORS`. Kiểu TypeScript ở `pika-math-intro.d.ts` | Nguồn duy nhất của chuyển động |
| `core/logo-paths.js` | Nét SVG gốc: mặt Pika, chữ "Math", chữ "Pika" | Không sửa tay |
| `hyperframes/pika-math-intro.html` | Block HyperFrames 1920x1080 (`-portrait` 1080x1920, `-square` 1080x1080), lõi nhúng sẵn | Sinh bởi `tools/build.mjs`, không sửa tay |
| `hyperframes/example/` | Dự án HyperFrames mẫu: intro 0–6 s rồi một cảnh có logo nhỏ ở góc | Mẫu để chép |
| `remotion/PikaMathIntro.tsx` | Component Remotion | Sửa được |
| `remotion/example/` | Dự án Remotion mẫu: 4 kiểu 16:9, kiểu C 9:16, intro rồi một cảnh | Mẫu để chép |
| `logo/lockups/`, `logo/icon/` | SVG tĩnh: 4 kiểu + biểu tượng (chỉ mặt), mỗi cái `-color`, `-black`, `-white` | Không sửa tay |
| `logo/brand.json` | Màu, kiểu logo dùng ở đâu, đường dẫn file, tên các phần trong SVG | Đọc trước khi chèn logo |
| `sound/` | `mix.wav` (bản dùng), `sfx.wav` (chỉ tiếng động), `voice-pikamath.wav` (chỉ giọng), `cues.json` (mốc từng tiếng) | |
| `preview.html` | Trang xem thử, mở thẳng bằng Chrome; cũng là trang `tools/render.mjs` chụp khung | Sinh bởi `tools/build.mjs` |
| `preview/` | 4 MP4 xem thử (16:9, có tiếng) | Sinh lại bằng `tools/export.sh` |
| `tools/` | `build.mjs` (sinh file), `export.sh` (xuất video), `render.mjs`, `sfx.py`, `mix_voice.py` | |

## Ghép vào HyperFrames

1. Chép `hyperframes/pika-math-intro.html` vào `compositions/` của dự án; chép `sound/mix.wav` thành `assets/pika-math-intro/mix.wav`.
2. Gắn vào `index.html`:

```html
<div data-composition-id="pika-math-intro"
     data-composition-src="compositions/pika-math-intro.html"
     data-variable-values='{"logo":"A"}'
     data-start="0" data-duration="6" data-track-index="1"
     data-width="1920" data-height="1080"></div>
```

- Biến: `logo` (`A`|`B`|`C`|`D`), `background` (mã màu), `transparent` (`true` để nền trong suốt, đặt đè lên cảnh khác).
- Khung dọc: dùng `pika-math-intro-portrait.html`, `data-composition-id="pika-math-intro-portrait"`, 1080x1920, nên chọn `logo` `C`. Khung vuông: `-square`, 1080x1080.
- `data-composition-id` ở dự án phải trùng id bên trong file block, không đổi tên.
- Mẫu chạy được: `hyperframes/example/` (`hyperframes check`, `hyperframes render`).

## Ghép vào Remotion

1. Chép `core/` và `remotion/PikaMathIntro.tsx` vào `src/` của dự án, giữ nguyên vị trí tương đối (component import `../core/pika-math-intro.js`); chép `sound/mix.wav` thành `public/pika-math-intro/mix.wav`.
2. Dùng:

```tsx
<Sequence durationInFrames={Math.round(PIKA_MATH_INTRO_DURATION * fps)}>
  <PikaMathIntro logo="A" />
</Sequence>
```

- Props: `logo`, `background` (mã màu hoặc `null` để nền trong suốt), `sound` (đường dẫn trong `public/`, hoặc `null` để tắt tiếng).
- Cỡ khung lấy theo Composition (`useVideoConfig`), nên 16:9, 9:16, 1:1 đều chạy; khung dọc nên dùng `logo="C"`.
- Mẫu chạy được: `remotion/example/` (`yarn install`, `npx remotion render PikaMathIntro-A out/a.mp4`).

## Chèn logo tĩnh

- Đọc `logo/brand.json` để chọn file: A cho thanh đầu trang, cảnh ngang; C cho khung dọc, splash, avatar; biểu tượng cho chỗ rất nhỏ. Bản `-color` trên nền sáng, `-black` trên nền sáng khi in một màu, `-white` trên nền tối.
- Tên các phần trong SVG: `pika-face` (gồm `face-plate`, `ears`, `head`, `eye-left`, `eye-right`), `word-pika` (`word-pika-P`, `-i`, `-k`, `-a`), `word-math` (`word-math-M`, `-a`, `-t`, `-h`). Muốn chuyển động riêng một phần thì chọn theo các id này.
- Màu: xanh Pika `#47C3D7`, cam chữ "Math" `#FF8A1F`, tấm mặt `#FFFFFF`.

## Lệnh

- Sửa `core/` xong: `node tools/build.mjs` (sinh lại `preview.html`, block HyperFrames, chép sang 2 dự án mẫu).
- Xuất video: `tools/export.sh` (4 kiểu, 16:9, ra `export/`: MP4, MOV ProRes 4444 nền trong suốt, PNG có alpha). Khung khác: `LOGOS="C" W=1080 H=1920 tools/export.sh`.
- Xem một khung: `LOGO=C node tools/render.mjs /tmp/khung 30 white 2.1,4.6`.

## Luật

- Chuyển động chỉ sửa ở `core/pika-math-intro.js`; file trong `hyperframes/` và `preview.html` là file sinh, sửa tay sẽ bị ghi đè.
- Mỗi khung chỉ phụ thuộc thời điểm `t`: không dùng `Date.now()`, `Math.random()`, không chạy theo đồng hồ thật.
- Đổi màu giữa hai màu khác hẳn nhau (màu mảnh sang xanh Pika, xanh sang cam) phải đổi tức thì đúng lúc, không chuyển dần: chuyển dần sẽ đi qua màu xỉn. Kem sang trắng thì chuyển dần được.
- Biến hình giữa hai đường viền phải cùng số điểm và dóng điểm đầu (`resample` + `align` trong lõi), không thì hình xoắn.
- Tấm mặt Pika là tấm trắng, không rỗng (bản màu). Bản đen trắng của logo tĩnh thì tấm mặt là lỗ khoét.
- Giọng "Pikamath!" đặt ở giây 3,9 (`TIMING.voice`); đổi nhịp trong lõi thì tiếng động tự theo (`soundCues()`), giọng thì phải dời tay trong `tools/export.sh` và `sound/cues.json`.

## Lỗi dễ vấp

- HyperFrames: block để `<canvas>` trong markup sẽ làm Studio không đọc được biến; block tạo canvas lúc chạy, giữ nguyên cách đó.
- HyperFrames: mọi `<audio>` cần `id`, không thì render im lặng.
- `preview.html` nhúng sẵn lõi nên mở bằng `file://` được; đừng đổi sang `<script type="module">`, Chrome chặn module khi mở file trực tiếp.
- Khung dọc với kiểu A: logo phải thu nhỏ cho vừa bề ngang nên mặt Pika cuối rất nhỏ; dùng kiểu C.
