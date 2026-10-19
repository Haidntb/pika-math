#!/bin/bash
# Xuất intro Pika Math từ lõi core/: MP4 nền trắng + MOV ProRes 4444 nền trong suốt + chuỗi PNG có alpha, có tiếng.
# Cần: Google Chrome, Node 18+, Python 3 + numpy, ffmpeg (brew install ffmpeg).
# Dùng: tools/export.sh                         4 kiểu logo, khung 1920x1080, ra thư mục export/
#       LOGOS="C" W=1080 H=1920 tools/export.sh   chỉ kiểu C, khung dọc 9:16
set -e
cd "$(dirname "$0")"
FFMPEG="${FFMPEG:-ffmpeg}"
OUT=../export; mkdir -p "$OUT"
TMP=$(mktemp -d)
LOGOS="${LOGOS:-A B C D}"
W="${W:-1920}"; H="${H:-1080}"
name() { case $1 in A) echo A-horizontal;; B) echo B-two-line;; C) echo C-stacked;; D) echo D-two-line-small-pika;; esac; }
SUFFIX=""; if [ "$W" != 1920 ] || [ "$H" != 1080 ]; then SUFFIX="-${W}x${H}"; fi   # khung khác 16:9 thì tên file ghi thêm cỡ

# 1) Dựng lại preview.html (và block HyperFrames) từ core/
node build.mjs >/dev/null

# 2) Khung hình 30 fps của từng kiểu: nền trắng và nền trong suốt
for L in $LOGOS; do
  LOGO=$L W=$W H=$H node render.mjs "$TMP/$L/white" 30 white &
  LOGO=$L W=$W H=$H node render.mjs "$TMP/$L/alpha" 30 none &
  wait
done

# 3) Tiếng động theo mốc của animation (mọi kiểu chung mốc), trộn giọng "Pikamath!" ở giây 3,9
FIRST=$(echo $LOGOS | cut -d' ' -f1)
python3 sfx.py "$TMP/$FIRST/white/events.json" "$OUT/sfx.wav" 6.0
python3 mix_voice.py "$OUT/sfx.wav" ../sound/voice-pikamath.wav 3.9 "$OUT/mix.wav"

# 4) Đóng video; giữ chuỗi PNG nền trong suốt cho After Effects / Premiere
mkdir -p "$OUT/png-alpha"
for L in $LOGOS; do
  N="pika-math-intro-$(name $L)$SUFFIX"
  "$FFMPEG" -y -loglevel error -framerate 30 -i "$TMP/$L/white/f%04d.png" -i "$OUT/mix.wav" \
    -c:v libx264 -pix_fmt yuv420p -crf 16 -c:a aac -b:a 192k -shortest "$OUT/$N.mp4"
  "$FFMPEG" -y -loglevel error -framerate 30 -i "$TMP/$L/alpha/f%04d.png" -i "$OUT/mix.wav" \
    -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le -c:a pcm_s16le -shortest "$OUT/$N-alpha.mov"
  rm -rf "$OUT/png-alpha/$N"; mv "$TMP/$L/alpha" "$OUT/png-alpha/$N"
done
rm -rf "$TMP"
echo "Xong: $OUT"
