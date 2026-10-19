"""Trộn câu nói "Pika Math!" vào tiếng động intro: cắt khoảng lặng đầu, đặt ở giây chỉ định, hạ nhỏ tiếng động khi có giọng.
Dùng: python tron_giong.py tieng-dong.wav giong.wav giây_bắt_đầu out.wav
"""
import sys, wave
import numpy as np

SR = 48000


def read(p):
    w = wave.open(p); sr = w.getframerate()
    x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
    if w.getnchannels() == 2: x = x.reshape(-1, 2).mean(1)
    return np.interp(np.arange(int(len(x) * SR / sr)) * sr / SR, np.arange(len(x)), x)


sfx, voice = read(sys.argv[1]), read(sys.argv[2])
start, out = float(sys.argv[3]), sys.argv[4]
on = np.where(np.abs(voice) > 0.03)[0]
voice = voice[max(0, on[0] - int(0.02 * SR)):on[-1] + int(0.15 * SR)]
voice = voice / np.abs(voice).max() * 0.95

i = int(start * SR)
duck = np.ones(len(sfx))
a, b = i - int(0.1 * SR), min(len(sfx), i + len(voice))
duck[max(0, a):b] = 0.45
mix = sfx * duck
mix[i:i + len(voice)] += voice[:len(mix) - i]
mix = mix / max(1e-6, np.abs(mix).max()) * 0.9
w = wave.open(out, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close()
print('ok', out, 'giọng dài %.2fs, hết ở %.2fs' % (len(voice) / SR, start + len(voice) / SR))
