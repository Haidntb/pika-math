"""Tạo tiếng động cho intro theo events.json (do render.mjs xuất ra). Không dùng dịch vụ ngoài.
Dùng: python sfx.py events.json out.wav thời_lượng_giây
"""
import json, sys, wave
import numpy as np

SR = 48000
ev, out, dur = json.load(open(sys.argv[1])), sys.argv[2], float(sys.argv[3])
mix = np.zeros(int(SR * (dur + 0.5)))


def env(n, a=0.004, d=0.25):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1) * np.exp(-t / d)


def add(sig, t):
    i = int(t * SR); mix[i:i + len(sig)] += sig[:len(mix) - i]


def tone(f, l, d, harm=(1, .35, .12)):
    t = np.arange(int(SR * l)) / SR
    return sum(a * np.sin(2 * np.pi * f * (k + 1) * t) for k, a in enumerate(harm)) * env(len(t), d=d)


# nốt marimba đi lên theo thang Đô trưởng: mỗi chữ xếp xong một nốt
SCALE = [523.25, 587.33, 659.25, 698.46, 783.99, 880.0, 987.77, 1046.5]
for e in ev:
    t = e['t']
    if e['type'] == 'note':
        add(0.32 * tone(SCALE[e['n']], 0.5, 0.12, (1, .0, .25)), t)
    elif e['type'] == 'tock':   # mảnh gỗ ghép vào: tiếng gõ ngắn, cao dần
        f = SCALE[e['n'] % 8] * (0.5 if e['n'] < 8 else 1)
        add(0.4 * tone(f, 0.25, 0.05, (1, .5, .0, .2)), t)
    elif e['type'] == 'shimmer':
        for j, f in enumerate([1046.5, 1318.5, 1568, 2093]):
            add(0.12 * tone(f, 0.5, 0.2, (1,)), t + j * 0.04)
    elif e['type'] == 'swish':
        n = int(SR * 0.3); noise = np.random.default_rng(2).standard_normal(n)
        k = np.linspace(0, 1, n); s = np.convolve(noise, np.ones(12) / 12, 'same') * np.sin(np.pi * k) * (1 - k)
        add(0.6 * s, t)
    elif e['type'] == 'whoosh':
        n = int(SR * 0.4); noise = np.random.default_rng(1).standard_normal(n)
        k = np.linspace(0, 1, n); s = np.convolve(noise, np.ones(30) / 30, 'same') * np.sin(np.pi * k) ** 2
        add(0.5 * s, t)
    elif e['type'] == 'pop':
        add(0.35 * tone(392, 0.3, 0.08) + 0.25 * tone(784, 0.3, 0.1), t)
    elif e['type'] == 'boing':
        n = int(SR * 0.5); tt = np.arange(n) / SR
        f = 220 + 260 * (1 - np.exp(-tt * 9)) + 30 * np.sin(2 * np.pi * 14 * tt) * np.exp(-tt * 5)
        add(0.38 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, d=0.2), t)
    elif e['type'] == 'blip':
        add(0.22 * tone(1318.5, 0.15, 0.04), t)
    elif e['type'] == 'sparkle':
        for j, f in enumerate([1568, 2093, 2637, 3136]):
            add(0.14 * tone(f, 0.4, 0.15, (1,)), t + j * 0.06)

mix = mix[:int(SR * dur)]
mix = mix / max(1e-6, np.abs(mix).max()) * 0.85
w = wave.open(out, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close()
print('ok', out)
