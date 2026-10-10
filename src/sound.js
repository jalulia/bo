// ─── Synth sounds (ours). Voiced sounds go through a small formant bank so
//     they read as a mouth, not a buzzer: a soft pulse source + breath noise,
//     three resonances gliding between cat-sized vowels, smooth envelopes,
//     and a gentle master low-pass so nothing is shrill. ─────────────────────
var BZ = window.BZ || (window.BZ = {});
BZ.Sound = function () {
  let ac = null, master = null, noiseBuf = null, enabled = true, lastVoice = 0;
  const purrs = new Map();
  // cat-scale vowels: [F1, F2, F3] in Hz (scaled from human values for a ~4cm tract)
  const V = { m: [420, 1500, 3200], i: [720, 2500, 3800], a: [1150, 1900, 3500], o: [820, 1350, 3000], r: [520, 1350, 2900] };
  function ctx() {
    if (!ac) {
      try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200; lp.Q.value = 0.5;
      const comp = ac.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 4;
      master = ac.createGain(); master.gain.value = 0.32;
      master.connect(lp); lp.connect(comp); comp.connect(ac.destination);
      noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
      const d = noiseBuf.getChannelData(0); let b = 0;
      for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b = (b + 0.02 * w) / 1.02; d[i] = w * 0.5 + b * 3; }
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function noise() { const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true; return s; }
  const ok = () => enabled && ctx();
  // don't let two cats talk over each other every second
  function gate(gap) { const now = ac.currentTime; if (now - lastVoice < gap) return false; lastVoice = now; return true; }

  // one voiced utterance. pts: [[time 0..1, f0 multiplier, vowel, amp 0..1], ...]
  function voice(f0, len, pts, opt = {}) {
    const t0 = ac.currentTime + 0.01, end = t0 + len;
    const src = ac.createOscillator(); src.type = 'sawtooth';
    const soft = ac.createBiquadFilter(); soft.type = 'lowpass'; soft.frequency.value = 2400; soft.Q.value = 0.3; // round off the buzz
    const vib = ac.createOscillator(), vg = ac.createGain(); vib.frequency.value = opt.vibRate || 5.5; vg.gain.value = f0 * (opt.vib || 0.018);
    vib.connect(vg); vg.connect(src.frequency);
    const env = ac.createGain(); env.gain.value = 0;
    const out = ac.createGain(); out.gain.value = opt.gain || 0.5;
    // breath: the raspy part (Bo is 19; she gets more of it)
    const br = noise(), bf = ac.createBiquadFilter(), bg = ac.createGain(); bf.type = 'bandpass'; bf.frequency.value = 2600; bf.Q.value = 0.8; bg.gain.value = opt.breath || 0.05;
    br.connect(bf); bf.connect(bg);
    const sum = ac.createGain(); src.connect(soft); soft.connect(sum); bg.connect(sum);
    // optional rolled-r flutter (trills)
    if (opt.roll) { const am = ac.createGain(), l = ac.createOscillator(), lg = ac.createGain(); am.gain.value = 0.55; l.frequency.value = opt.roll; lg.gain.value = 0.45; l.connect(lg); lg.connect(am.gain); sum.connect(am); am.connect(env); l.start(t0); l.stop(end + 0.05); }
    else sum.connect(env);
    const fb = [0, 1, 2].map((k) => { const f = ac.createBiquadFilter(), g = ac.createGain(); f.type = 'bandpass'; f.Q.value = [6, 9, 11][k]; g.gain.value = [1, 0.55, 0.22][k]; env.connect(f); f.connect(g); g.connect(out); return f; });
    out.connect(master);
    pts.forEach(([u, fm, vw, a], i) => {
      const t = t0 + u * len, F = V[vw];
      if (i === 0) { src.frequency.setValueAtTime(f0 * fm, t); fb.forEach((f, k) => f.frequency.setValueAtTime(F[k], t)); env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(a, t + Math.min(0.05, len * 0.15)); }
      else { src.frequency.linearRampToValueAtTime(f0 * fm, t); fb.forEach((f, k) => f.frequency.linearRampToValueAtTime(F[k], t)); env.gain.linearRampToValueAtTime(a, t); }
    });
    env.gain.linearRampToValueAtTime(0, end);
    src.start(t0); vib.start(t0); br.start(t0); src.stop(end + 0.05); vib.stop(end + 0.05); br.stop(end + 0.05);
  }

  const api = {
    get enabled() { return enabled; },
    set enabled(v) { enabled = v; if (!v) for (const k of [...purrs.keys()]) api.purr(k, false); },
    unlock() { ctx(); },
    // "mi-a-ow": soft nasal onset, open, closing glide. pitch 1 ≈ 560 Hz
    meow(pitch = 1, len = 0.55, rasp = 0.05) {
      if (!ok() || !gate(1.2)) return;
      voice(560 * pitch, len, [[0, 0.88, 'm', 0.3], [0.18, 1.0, 'i', 0.85], [0.45, 1.12, 'a', 1], [0.75, 0.98, 'o', 0.7], [1, 0.8, 'o', 0.1]], { breath: rasp, gain: 0.42 });
    },
    // tiny questioning "mew?" — what she says when scooped up
    mew(pitch = 1, rasp = 0.05) {
      if (!ok() || !gate(0.8)) return;
      voice(640 * pitch, 0.24, [[0, 0.9, 'm', 0.2], [0.3, 1.0, 'i', 0.8], [1, 1.18, 'i', 0.2]], { breath: rasp, gain: 0.32, vib: 0.01 });
    },
    // "mrrp": closed-mouth rolled greeting, low and rising
    trill(pitch = 1, rasp = 0.04) {
      if (!ok() || !gate(0.8)) return;
      voice(330 * pitch, 0.34, [[0, 0.95, 'm', 0.4], [0.35, 1.0, 'r', 0.9], [0.8, 1.32, 'r', 0.75], [1, 1.25, 'i', 0.1]], { roll: 26, breath: rasp, gain: 0.5, vib: 0.006 });
    },
    // short "ek ek" at prey
    chirp(pitch = 1) {
      if (!ok() || !gate(0.6)) return;
      voice(700 * pitch, 0.1, [[0, 1, 'i', 0.6], [1, 1.25, 'a', 0.1]], { gain: 0.3, vib: 0 });
      setTimeout(() => { if (enabled && ac) voice(720 * pitch, 0.09, [[0, 1, 'i', 0.5], [1, 1.2, 'a', 0.1]], { gain: 0.26, vib: 0 }); }, 140);
    },
    chatter(pitch = 1) { // soft teeth-clicking at birds / the dot
      if (!ok() || !gate(0.8)) return;
      for (let k = 0; k < 6; k++) {
        const t = ac.currentTime + k * 0.075, n = noise(), f = ac.createBiquadFilter(), g = ac.createGain();
        f.type = 'bandpass'; f.frequency.value = (1700 + (k % 2) * 250) * pitch; f.Q.value = 4;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.16, t + 0.006); g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
        n.connect(f); f.connect(g); g.connect(master); n.start(t); n.stop(t + 0.06);
      }
    },
    nibble() {
      if (!ok()) return;
      const t = ac.currentTime, n = noise(), f = ac.createBiquadFilter(), g = ac.createGain();
      f.type = 'bandpass'; f.frequency.value = 2800; f.Q.value = 3;
      g.gain.setValueAtTime(0.09, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      n.connect(f); f.connect(g); g.connect(master); n.start(t); n.stop(t + 0.05);
    },
    hiss() { // breathy, short, not an alarm
      if (!ok()) return;
      const t = ac.currentTime, n = noise(), f = ac.createBiquadFilter(), g = ac.createGain();
      f.type = 'bandpass'; f.frequency.value = 4200; f.Q.value = 0.7;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12, t + 0.08); g.gain.linearRampToValueAtTime(0, t + 0.45);
      n.connect(f); f.connect(g); g.connect(master); n.start(t); n.stop(t + 0.5);
    },
    crunch() {
      if (!ok()) return;
      for (let k = 0; k < 3; k++) {
        const t = ac.currentTime + k * 0.08 + Math.random() * 0.03, n = noise(), f = ac.createBiquadFilter(), g = ac.createGain();
        f.type = 'bandpass'; f.frequency.value = 1500 + Math.random() * 1200; f.Q.value = 2;
        g.gain.setValueAtTime(0.16, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        n.connect(f); f.connect(g); g.connect(master); n.start(t); n.stop(t + 0.06);
      }
    },
    thunk() { // something landing on the floor (that she pushed off the table)
      if (!ok()) return;
      const t = ac.currentTime, n = noise(), f = ac.createBiquadFilter(), g = ac.createGain(), o = ac.createOscillator(), og = ac.createGain();
      f.type = 'lowpass'; f.frequency.value = 520; g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.1); og.gain.setValueAtTime(0.25, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      n.connect(f); f.connect(g); g.connect(master); o.connect(og); og.connect(master); n.start(t); n.stop(t + 0.14); o.start(t); o.stop(t + 0.14);
    },
    purr(id, on) {
      if (!on) { const p = purrs.get(id); if (p && ac) { p.g.gain.setTargetAtTime(0, ac.currentTime, 0.25); setTimeout(() => { try { p.n.stop(); p.l.stop(); p.b.stop(); } catch (e) {} }, 1000); purrs.delete(id); } return; }
      if (!enabled || purrs.has(id) || !ctx()) return;
      // low rumble pulsed ~25 Hz, with a slow breath cycle (in louder than out)
      const n = noise(), f = ac.createBiquadFilter(), am = ac.createGain(), g = ac.createGain(), l = ac.createOscillator(), lg = ac.createGain();
      const b = ac.createOscillator(), bg = ac.createGain(), breath = ac.createGain();
      f.type = 'lowpass'; f.frequency.value = 260; f.Q.value = 0.7;
      am.gain.value = 0.5; l.type = 'triangle'; l.frequency.value = 24 + Math.random() * 4; lg.gain.value = 0.5; l.connect(lg); lg.connect(am.gain);
      breath.gain.value = 0.75; b.frequency.value = 0.55 + Math.random() * 0.15; bg.gain.value = 0.25; b.connect(bg); bg.connect(breath.gain);
      g.gain.value = 0; g.gain.setTargetAtTime(0.5, ac.currentTime, 0.5);
      n.connect(f); f.connect(am); am.connect(breath); breath.connect(g); g.connect(master); n.start(); l.start(); b.start();
      purrs.set(id, { n, l, b, g });
    },
  };
  return api;
};
