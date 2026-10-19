# Pika Math intro

Intro logo Pika Math 6 giây, có 4 bản theo 4 kiểu logo cuối. Chuyển động là code, dùng lại được trong HyperFrames và Remotion; AI đọc `AGENTS.md` để biết cách ghép.

| Kiểu | Logo cuối | Dùng khi |
|---|---|---|
| A | Ngang, logo chính: mặt + "Pika Math" một hàng | Mặc định, video 16:9 |
| B | Hai dòng: "Pika" trên, "Math" dưới | Cần logo gọn chiều ngang |
| C | Dọc: mặt trên, "Pika Math" dưới | Video dọc 9:16, vuông 1:1 |
| D | Như B, "Pika" nhỏ, "Math" to | Khi cần nhấn chữ "Math" |

## Xem

- Mở `preview.html` bằng Chrome: chọn kiểu logo, khung 16:9 / 9:16 / 1:1, nền trắng / trong suốt / tối, kéo thanh thời gian.
- `preview/`: 4 video MP4 16:9 có tiếng.

## Lấy logo

`logo/lockups/` (4 kiểu) và `logo/icon/` (chỉ mặt Pika), mỗi cái 3 bản: `-color`, `-black` (in một màu, nền sáng), `-white` (nền tối). Dùng kiểu nào ở đâu: `logo/brand.json`.

## Xuất video

Cần Chrome, Node 18+, Python 3 có numpy, ffmpeg.

```bash
tools/export.sh                              # 4 kiểu, 16:9, ra export/: MP4, MOV nền trong suốt, PNG có alpha
LOGOS="C" W=1080 H=1920 tools/export.sh      # kiểu C, khung dọc
```

## Mốc thời gian (giây)

| Giây | Chuyện gì xảy ra | Tiếng |
|---|---|---|
| 0,25 – 1,95 | 9 mảnh hình học màu bay xoay vào, đổi dáng dần thành các phần của mặt Pika; mảnh chạm chỗ thì nhún và đổi xanh Pika | gõ gỗ mỗi lần chạm, lấp lánh ở 1,95 |
| 2,25 – 2,8 | Mặt thở nhẹ, lấy đà | |
| 2,8 – 3,3 | Nhảy về chỗ của mặt trong logo | boing, "pop" ở 3,3 |
| 3,3 – 4,1 | Chữ hiện ra: A, B, D trượt ra từ sau mặt; C bật lên từ dưới | vút |
| 3,9 | Giọng bé gái "Pikamath!" | giọng |
| 4,5 | Nháy mắt, lấp lánh quanh tai | blip, lấp lánh |
| 4,7 – 6,0 | Giữ logo | |

## Giọng nói

Giọng bé gái đọc liền "Pikamath!" ở giây 3,9 (`sound/voice-pikamath.wav`). Muốn thay câu hoặc giọng: liên hệ nhóm Pika.

## Bản quyền

Logo Pika, logo Pika Math, nhân vật Pika và giọng nói trong `sound/` là tài sản của Step Up. Không cấp phép dùng lại ngoài các sản phẩm của Step Up.
