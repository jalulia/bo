// ─── Rex body: skeleton, poses, projection, draw ───────────────────────────
// One Cornish Rex skeleton (ours), drawn the Ballz way: flat circles + tapered
// linez sorted far-to-near, then a single silhouette outline. Proportions from
// the CFA standard: small egg head, Roman nose, large high ears, arched back,
// tucked-up waist, high on long slender legs, long whip tail.
var BZ = window.BZ || (window.BZ = {});
(function () {
  const D2R = Math.PI / 180;
  const TAIL_N = 15; // points t0..t14 (more joints = smoother whip)

  // name, diameter, color slot, hit region
  const BALLS = [
    ['hips', 16, 'coat', 'back'], ['belly', 10, 'belly', 'belly'], ['chest', 17, 'chest', 'belly'], ['back', 12, 'back', 'back'],
    ['head', 17, 'head', 'head'], ['cheekL', 8, 'cheek', 'head'], ['cheekR', 8, 'cheek', 'head'],
    ['muzL', 5.5, 'muzzle', 'face'], ['muzR', 5.5, 'muzzle', 'face'], ['chin', 4, 'muzzle', 'face'],
    ['mouth', 0, 'mouth', 'face'], ['tongue', 0, 'tongue', 'face'], ['nose', 3.2, 'nose', 'face'],
    ['earL', 6.5, 'ear', 'head'], ['earLt', 0, 'ear', 'head'], ['earR', 6.5, 'ear', 'head'], ['earRt', 0, 'ear', 'head'],
    ['earLi', 0, 'inner', 'head'], ['earLti', 0, 'inner', 'head'], ['earRi', 0, 'inner', 'head'], ['earRti', 0, 'inner', 'head'],
    ['eyeL', 7.2, 'eye', 'face'], ['eyeR', 7.2, 'eye', 'face'],
    ['shL', 8, 'limb', 'leg'], ['elL', 4.6, 'leg', 'leg'], ['wrL', 3.8, 'leg', 'leg'], ['pawL', 4.4, 'paw', 'leg'],
    ['shR', 8, 'limb', 'leg'], ['elR', 4.6, 'leg', 'leg'], ['wrR', 3.8, 'leg', 'leg'], ['pawR', 4.4, 'paw', 'leg'],
    ['thL', 9.5, 'limb', 'back'], ['knL', 4.2, 'limb', 'leg'], ['hkL', 3.8, 'leg', 'leg'], ['bpL', 4.4, 'paw', 'leg'],
    ['thR', 9.5, 'limb', 'back'], ['knR', 4.2, 'limb', 'leg'], ['hkR', 3.8, 'leg', 'leg'], ['bpR', 4.4, 'paw', 'leg'],
  ];
  for (let i = 0; i < TAIL_N; i++) BALLS.push(['t' + i, 0, i > 10 ? 'tip' : 'tail', 'tail']);
  const IDX = {}; BALLS.forEach((b, i) => (IDX[b[0]] = i));
  BZ.BALLS = BALLS; BZ.IDX = IDX; BZ.TAIL_N = TAIL_N;

  // offsets from the head centre (rotate with the head). Roman nose: the
  // nose sits low and forward of a high bridge; ears tall, set high.
  const HEAD_OFF = {
    head: [0, 0, 0], cheekL: [2.6, -3.6, 4.8], cheekR: [2.6, -3.6, -4.8],
    muzL: [8, -4.6, 2.1], muzR: [8, -4.6, -2.1], chin: [6.6, -7, 0], mouth: [7.8, -6.2, 0], tongue: [9.2, -6.9, 0], nose: [10.1, -2.9, 0],
    earL: [-2.4, 7.2, 5.2], earLt: [-4.6, 23.5, 9.8], earR: [-2.4, 7.2, -5.2], earRt: [-4.6, 23.5, -9.8],
    earLi: [-1.4, 8, 4.9], earLti: [-3.6, 21, 9.1], earRi: [-1.4, 8, -4.9], earRti: [-3.6, 21, -9.1],
    eyeL: [6.3, 1.9, 4.5], eyeR: [6.3, 1.9, -4.5],
  };

  // linez: a, b, slot, widths at a and b (explicit, in body units)
  const LINES = [
    ['hips', 'back', 'back', 13, 10.5], ['back', 'chest', 'back', 10.5, 12.5],
    ['chest', 'head', 'coat', 10, 5.6], ['chin', 'chest', 'chest', 2.6, 8.5],
    ['earL', 'earLt', 'ear', 7.8, 0.8], ['earR', 'earRt', 'ear', 7.8, 0.8],
    ['earLi', 'earLti', 'inner', 4.2, 0.6], ['earRi', 'earRti', 'inner', 4.2, 0.6],
    ['shL', 'elL', 'limb', 5.2, 3.8], ['elL', 'wrL', 'leg', 3.4, 2.6], ['wrL', 'pawL', 'leg', 2.9, 3.4],
    ['shR', 'elR', 'limb', 5.2, 3.8], ['elR', 'wrR', 'leg', 3.4, 2.6], ['wrR', 'pawR', 'leg', 2.9, 3.4],
    ['thL', 'knL', 'limb', 6.5, 3.6], ['knL', 'hkL', 'leg', 3.1, 2.1], ['hkL', 'bpL', 'leg', 2.3, 3],
    ['thR', 'knR', 'limb', 6.5, 3.6], ['knR', 'hkR', 'leg', 3.1, 2.1], ['hkR', 'bpR', 'leg', 2.3, 3],
  ];
  const tw = (i) => 1.1 + 3.4 * Math.pow(1 - i / (TAIL_N - 1), 0.8); // fuller base, fine whip tip
  for (let i = 0; i < TAIL_N - 1; i++) LINES.push(['t' + i, 't' + (i + 1), i > 10 ? 'tip' : 'tail', tw(i), tw(i + 1)]);
  const CURLED = { coat: 1, back: 1, limb: 1, belly: 1, chest: 1 }; // marcel-wave slots

  // ── poses ── (paws: [x, y, z]; leg modes: ik | flat | tuck | sit | hide)
  const STAND = {
    hipX: -12, hipY: 31, chestX: 11, chestY: 30, hipZ: 0, chestZ: 0, backLift: 2.5, bellyLift: 4,
    headDX: 0, headDY: 0, headZ: 0, headYaw: 0, headPitch: 0, headRoll: 0,
    fl: [14, 2.5, 4.6], fr: [14, 2.5, -4.6], bl: [-11.5, 2.5, 4.4], br: [-11.5, 2.5, -4.4],
    tailEl: 70, tailCurl: -5, tailHook: -28, tailSide: 0, tailAmp: 6, tailSpeed: 0.1,
    earBack: 0, earSplay: 0, earTurn: 0, lid: 0, mouth: 0, tongue: 0, rootY: 0, pupil: 0.35, tailLen: 1, roll: 0, tailWave: 0.5, tailWrap: 0,
    flexFL: 0, flexFR: 0, flexBL: 0, flexBR: 0, shL: 0, shR: 0, thL: 0, thR: 0, reach: 0,
  };
  const P = (o, modes) => Object.assign({}, STAND, o, { modes: Object.assign({ fl: 'ik', fr: 'ik', bl: 'ik', br: 'ik' }, modes || {}) });
  const SIT_M = { bl: 'sit', br: 'sit' };
  const LOAF_M = { fl: 'tuck', fr: 'tuck', bl: 'tuck', br: 'tuck' };
  BZ.POSES = {
    stand: P({}),
    sit: P({ hipX: -5, hipY: 9, chestX: 5, chestY: 27, backLift: 1, bellyLift: 0, headDX: -3, headDY: 1,
      fl: [9, 2.5, 3], fr: [9, 2.5, -3], tailEl: -4, tailCurl: 0.4, tailHook: 0, tailSide: 21, tailAmp: 2, tailSpeed: 0.05, tailLen: 1.3, tailWrap: 1 }, SIT_M),
    loaf: P({ hipX: -9, hipY: 8.5, chestX: 8, chestY: 9, backLift: 4.5, bellyLift: -1, headDX: -2, headDY: -6, headPitch: -6,
      tailEl: -6, tailCurl: 0, tailHook: 0, tailSide: 16, tailAmp: 1.5, tailSpeed: 0.04, lid: 0.55, tailWrap: 0.85, tailLen: 1.1 }, LOAF_M),
    sphinx: P({ hipX: -10, hipY: 8.5, chestX: 9, chestY: 10, backLift: 3.5, bellyLift: -1, headDX: -1, headDY: -3,
      fl: [21, 2.3, 3.4], fr: [20, 2.3, -3.4], tailEl: -6, tailCurl: 0, tailHook: 0, tailSide: 12, tailAmp: 1.5, tailSpeed: 0.04, lid: 0.6 },
      { fl: 'flat', fr: 'flat', bl: 'tuck', br: 'tuck' }),
    baguette: P({ hipX: -17, hipY: 7.5, chestX: 13, chestY: 8, backLift: 1.5, bellyLift: -1, headDX: 3, headDY: -9, headPitch: -12, headRoll: 6,
      tailEl: -4, tailCurl: 0, tailHook: 0, tailSide: 3, tailAmp: 1, tailSpeed: 0.03, lid: 1, earBack: 0.15 }, LOAF_M),
    crescent: P({ hipX: -6, hipY: 8, chestX: 5.5, chestY: 8, hipZ: 2, chestZ: 2, backLift: 8, bellyLift: -2, headDX: -2, headDY: -14, headZ: -2, headPitch: -38, headYaw: 35, headRoll: 18,
      tailEl: -6, tailCurl: 0, tailHook: 0, tailSide: 30, tailAmp: 1, tailSpeed: 0.03, lid: 1, earBack: 0.25, tailWrap: 1, tailLen: 1.05 },
      { fl: 'hide', fr: 'hide', bl: 'tuck', br: 'hide' }),
    // curled up, chin down, one foreleg poured out long over the edge and left hanging there (Bo in the felt cube)
    dangle: P({ hipX: -7, hipY: 8, chestX: 6.5, chestY: 8.5, hipZ: 1.5, chestZ: 1, backLift: 6.5, bellyLift: -2, headDX: 1, headDY: -11, headZ: -1, headPitch: -30, headYaw: 18, headRoll: 12,
      fl: [27, -9, 3.2], flexFL: -0.6, tailEl: -6, tailCurl: 0, tailHook: 0, tailSide: 26, tailAmp: 1, tailSpeed: 0.03, lid: 1, earBack: 0.2, tailWrap: 1, tailLen: 1.05 },
      { fl: 'ik', fr: 'tuck', bl: 'tuck', br: 'tuck' }),
    lounge: P({ hipX: -14, hipY: 8, chestX: 10, chestY: 8.5, backLift: 2, bellyLift: 0, headDX: 4, headDY: -9, headPitch: -6, headRoll: 18, roll: 38,
      fl: [27, 2.2, 1.5], bl: [-30, 2.4, 3], tailEl: -4, tailCurl: 0, tailHook: 10, tailSide: 6, tailAmp: 1.5, tailSpeed: 0.03, lid: 1 },
      { fl: 'flat', fr: 'tuck', bl: 'flat', br: 'tuck' }),
    flop: P({ hipX: -14, hipY: 9, chestX: 11, chestY: 9, backLift: 1, bellyLift: 1, headDX: 3, headDY: -5, headPitch: 4, headRoll: 10, roll: 80, earBack: 0.45, earSplay: -1.5,
      fl: [19, -6, 4], fr: [23, -4, -3], bl: [-18, -7, 4], br: [-23, -5, -3], tailEl: -2, tailCurl: 0, tailHook: 16, tailSide: 4, tailAmp: 1.5, tailSpeed: 0.03, lid: 1 }),
    crouch: P({ hipY: 24.5, chestX: 12, chestY: 20.5, bellyLift: 0, headDX: 3, headDY: -9, headPitch: 6, fl: [17, 2.5, 4.6], fr: [17, 2.5, -4.6], bl: [-13, 2.5, 5], br: [-13, 2.5, -5],
      tailEl: -4, tailCurl: 1, tailHook: 0, tailAmp: 3, tailSpeed: 0.45, pupil: 1 }),
    beg: P({ hipX: -5, hipY: 10.5, chestX: -1, chestY: 34, backLift: 0, bellyLift: 0, headDX: -11, headDY: 2, fl: [5, 31, 3.6], fr: [5, 31, -3.6],
      tailEl: -6, tailCurl: 0, tailHook: 0, tailSide: 14, tailAmp: 3, pupil: 0.8 }, SIT_M),
    eat: P({ headDX: 5, headDY: -31, headPitch: -38, tailEl: 35, tailCurl: -4, tailHook: -10 }),
    graze: P({ hipX: -11, hipY: 28, chestX: 12, chestY: 21, headDX: 7, headDY: -23, headPitch: -22, headRoll: 32, headYaw: 15, fl: [17, 2.5, 5.4], fr: [18, 2.5, -5.4],
      tailEl: 25, tailCurl: -3, tailHook: -18, tailAmp: 5, tailSpeed: 0.08 }),
    // downward-dog front stretch: forearms poured out flat, chest to the floor, hips high, spine dipped
    stretch: P({ hipX: -15.5, hipY: 28.5, chestX: 16.5, chestY: 8, backLift: -2.5, bellyLift: 0.5, headDX: 7, headDY: -5, headPitch: 20,
      fl: [38, 2.3, 3.8], fr: [37, 2.3, -3.8], bl: [-15, 2.5, 4.4], br: [-14.5, 2.5, -4.4], tailEl: 82, tailCurl: -0.6, tailHook: -6, tailAmp: 1, tailSpeed: 0.05, lid: 1, earBack: 0.3 },
      { fl: 'flat', fr: 'flat' }),
    // and the back half: weight forward, one hind leg drawn out long behind
    stretchBack: P({ hipX: -16.5, hipY: 21, chestX: 14, chestY: 26, backLift: 0.5, bellyLift: 2, headDX: 3, headDY: 0, headPitch: 8,
      fl: [17, 2.5, 4], fr: [18, 2.5, -4], bl: [-36, 4.5, 4.4], br: [-13, 2.5, -4.4], flexBL: 2.2, tailEl: 8, tailCurl: 0, tailHook: 4, tailAmp: 1.5, tailSpeed: 0.05, lid: 0.7 }),
    // play-fight: up on the hind legs, forepaws boxing, ears back
    // the slink: how a rex actually stalks. Legs stay long, the body lowers only a little,
    // shoulder blades ride up, head drops low and level out in front, tail low and still
    slink: P({ hipY: 27.5, chestY: 25, backLift: 1.2, bellyLift: 3, headDX: 5, headDY: -7, headPitch: -6, fl: [15.5, 2.5, 4.4], fr: [15.5, 2.5, -4.4], bl: [-12.5, 2.5, 4.4], br: [-12.5, 2.5, -4.4],
      tailEl: 8, tailCurl: 0.5, tailHook: 6, tailAmp: 3, tailSpeed: 0.12, earBack: -0.15, pupil: 0.9 }),
    rear: P({ hipX: -7, hipY: 21, chestX: 1, chestY: 38, backLift: 0, bellyLift: 0, headDX: -8, headDY: 2, headPitch: 8,
      fl: [12, 31, 4], fr: [10, 26, -4], bl: [-6, 2.5, 4.4], br: [-8, 2.5, -4.4], tailEl: 8, tailCurl: -1, tailHook: 0, tailAmp: 12, tailSpeed: 0.4, earBack: 0.7, pupil: 1 }),
    // knocked over: rolled onto her back, all four kicking
    tussle: P({ hipX: -13, hipY: 9, chestX: 10, chestY: 9, backLift: 1, bellyLift: 1, headDX: 3, headDY: -4, headPitch: 14, headRoll: 20, roll: 128, earBack: 0.7,
      fl: [17, -9, 4], fr: [20, -7, -4], bl: [-17, -10, 4], br: [-21, -8, -4], tailEl: -2, tailCurl: 0, tailHook: 10, tailSide: 6, tailAmp: 14, tailSpeed: 0.45, pupil: 1 }),
    // the wall stretch: up on her hind legs, front paws high on the wall, the whole body long
    wallStretch: P({ hipX: -7, hipY: 21, chestX: 3, chestY: 41, backLift: -1, bellyLift: 1, headDX: 1, headDY: 3, headPitch: 18, fl: [21, 55, 3.6], fr: [20, 52, -3.6], bl: [-5, 2.5, 4.4], br: [-7, 2.5, -4.4],
      tailEl: -18, tailCurl: 0.5, tailHook: 18, tailAmp: 3, tailSpeed: 0.08, lid: 0.55, earBack: 0.15 }),
    // belly up in the sun: rolled over, paws curled loosely, chin tipped back
    bellyup: P({ hipX: -13, hipY: 9, chestX: 10, chestY: 9.5, backLift: 1, bellyLift: 1, headDX: 4, headDY: -4, headPitch: 22, headRoll: 25, roll: 125, earBack: 0.2,
      fl: [13, 9, 3], fr: [12, 7, -3], bl: [-8, 8, 4], br: [-10, 6, -4], flexFL: 1.5, flexFR: 1.5, tailEl: -2, tailCurl: 0, tailHook: 12, tailSide: 8, tailAmp: 3, tailSpeed: 0.05, lid: 0.85 }),
    // bunny-kick: flopped on her side, forepaws hugging the toy, hind feet raking it
    kick: P({ hipX: -12, hipY: 9, chestX: 9, chestY: 10, backLift: 2, bellyLift: 1, headDX: 4, headDY: -3, headPitch: -18, headRoll: 14, roll: 100, earBack: 0.5,
      fl: [17, 7, 2.5], fr: [18, 5, -2.5], bl: [2, 6, 3], br: [4, 4, -3], flexBL: 1.2, flexBR: 1.2, tailEl: -2, tailCurl: 0, tailHook: 8, tailSide: 4, tailAmp: 16, tailSpeed: 0.45, pupil: 1 }),
    // on top: low over her, forelegs wrapped, head down for the scruff bite
    pin: P({ hipX: -11, hipY: 22, chestX: 12, chestY: 14, backLift: 3, bellyLift: 2, headDX: 6, headDY: -10, headPitch: -26, earBack: 0.6,
      fl: [22, 6, 4], fr: [21, 4, -4], bl: [-12, 2.5, 4.4], br: [-13, 2.5, -4.4], tailEl: 10, tailCurl: 0, tailHook: 0, tailAmp: 14, tailSpeed: 0.4, pupil: 1 }),
    // the long lunge (Bo after the string): everything stretched, the near forepaw reaching way out and down
    lunge: P({ hipX: -18, hipY: 21, chestX: 19, chestY: 17, backLift: -1.5, bellyLift: 2.5, headDX: 6, headDY: -6, headPitch: -12, fl: [41, 5, 3.4], fr: [33, 10, -3.6], bl: [-34, 5, 4.4], br: [-30, 8, -4.4],
      flexFL: -0.4, tailEl: 22, tailCurl: 0.5, tailHook: 8, tailAmp: 2, earBack: 0.35, pupil: 1 }),
    // the crab hop (Bo on the couch): back hunched high, hips up, legs long and stiff, head low, tail up in an S with the tip hooked
    crabArch: P({ hipX: -13, hipY: 31, chestX: 11, chestY: 25, backLift: 13, bellyLift: 6, headDX: -1, headDY: -10, headPitch: 12, fl: [11, 2.5, 5.4], fr: [12, 2.5, -5.4], bl: [-15, 2.5, 5.4], br: [-16, 2.5, -5.4],
      tailEl: 62, tailCurl: 7, tailHook: 34, tailAmp: 3, tailSpeed: 0.3, earBack: 0.55, pupil: 1 }),
    leap: P({ hipX: -14, hipY: 22, chestX: 15, chestY: 25, headDX: 3, headDY: -2, headPitch: -6, fl: [27, 13, 4.6], fr: [26, 11, -4.6], bl: [-27, 8, 4.4], br: [-26, 7, -4.4],
      tailEl: 15, tailCurl: 1, tailHook: 0, tailAmp: 2, earBack: 0.3, pupil: 1 }),
    held: P({ hipX: 1, hipY: -18, chestX: 2, chestY: 6, backLift: 0, bellyLift: 0, headDX: -9, headDY: 6, fl: [4, -6, 4], fr: [4, -6, -4], bl: [0, -34, 5], br: [0, -34, -5],
      tailEl: -88, tailCurl: 0, tailHook: 0, tailAmp: 3, tailSpeed: 0.12, earBack: 0.7, pupil: 0.9 }),
    flinch: P({ hipX: -13, hipY: 26, chestX: 10, chestY: 21, backLift: 9, bellyLift: 3, headDX: -4, headDY: -6, headPitch: 6, fl: [13, 2.5, 5], fr: [13, 2.5, -5], bl: [-16, 2.5, 5], br: [-16, 2.5, -5],
      tailEl: 55, tailCurl: 9, tailHook: 0, tailAmp: 2, earBack: 1, mouth: 1, pupil: 1 }),
  };

  // ── math ──
  function ik(A, T, l1, l2, s) {
    const dx = T[0] - A[0], dy = T[1] - A[1];
    let d = Math.hypot(dx, dy); d = Math.max(0.01, Math.min(d, l1 + l2 - 0.01));
    const a = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
    const phi = Math.atan2(dy, dx) + s * a;
    return [A[0] + l1 * Math.cos(phi), A[1] + l1 * Math.sin(phi), (A[2] + T[2]) / 2];
  }
  function rotHead(v, yaw, pitch, roll) {
    let [x, y, z] = v;
    let c = Math.cos(roll), s = Math.sin(roll);
    [y, z] = [y * c - z * s, y * s + z * c];
    c = Math.cos(pitch); s = Math.sin(pitch);
    [x, y] = [x * c - y * s, x * s + y * c];
    c = Math.cos(yaw); s = Math.sin(yaw);
    [x, z] = [x * c - z * s, x * s + z * c];
    return [x, y, z];
  }
  BZ.rotHead = rotHead;

  // tail angles straight from the pose (used when no dynamics are running)
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  BZ.tailTargets = function (p, t) {
    const el = [], sd = [], n = TAIL_N - 1, sc = 10 / n; // per-joint angles scaled so the total bend matches the old 10-joint tail
    for (let i = 0; i < n; i++) {
      const k = i / (n - 1), amp = p.tailAmp * (0.2 + 1.1 * k * k);
      const hook = k > 0.62 ? p.tailHook * sc * ((k - 0.62) / 0.38) * 2.2 : 0;
      const ph = t * p.tailSpeed - i * p.tailWave * sc;
      let elv = p.tailEl + p.tailCurl * i * sc + hook;
      if (p.tailWrap) elv += ((k < 0.16 ? -80 : k < 0.85 ? -9 : 12) - elv) * p.tailWrap; // drop to the floor first, tip lifts at the end
      el.push((elv + amp * 0.5 * Math.sin(ph)) * D2R);
      let side = p.tailSide * i * sc;
      if (p.tailWrap) { // ours: wrap snug around the body — a tight turn, run forward along the flank, tip curls in over the paws
        const dir = p.tailSide < 0 ? -1 : 1, u = clamp01((k - 0.14) / 0.34), w = k > 0.78 ? 178 + 80 * ((k - 0.78) / 0.22) : u < 0.35 ? 95 * (u / 0.35) : u < 0.6 ? 95 : 95 + 83 * ((u - 0.6) / 0.4);
        side += (dir * w - side) * p.tailWrap;
      }
      sd.push((side + amp * Math.sin(ph * 0.8 + 1.3)) * D2R);
    }
    return { el, sd };
  };

  // pose descriptor -> local ball positions + per-frame omissions
  BZ.buildSkeleton = function (p, t, tail, shape) {
    const pos = new Array(BALLS.length), omit = {};
    const set = (n, v) => (pos[IDX[n]] = v);
    const hips = [p.hipX, p.hipY, p.hipZ], chest = [p.chestX, p.chestY, p.chestZ];
    set('hips', hips); set('chest', chest);
    const mid = [(hips[0] + chest[0]) / 2, (hips[1] + chest[1]) / 2, (hips[2] + chest[2]) / 2];
    set('belly', [mid[0] + 1, mid[1] - 2.5 + p.bellyLift, mid[2]]);
    set('back', [mid[0], mid[1] + 3 + p.backLift, mid[2]]);
    const H = [chest[0] + 12 + p.headDX, chest[1] + 18 + p.headDY, chest[2] + p.headZ];
    const yaw = p.headYaw * D2R, pitch = p.headPitch * D2R, roll = p.headRoll * D2R;
    for (const n in HEAD_OFF) {
      let o = HEAD_OFF[n].slice();
      if (n.startsWith('ear') && (n.endsWith('t') || n.endsWith('ti'))) {
        const sd = n[3] === 'L' ? 1 : -1;
        o[2] += 2.5 * p.earSplay * sd;
        if (p.earBack) { const k = p.earBack; o[0] -= 9 * k; o[1] -= 8 * k; o[2] += 4 * k * sd; }
        const base = HEAD_OFF[n.slice(0, 4)];
        if (shape && shape.ear) { o = [base[0] + (o[0] - base[0]) * shape.ear, base[1] + (o[1] - base[1]) * shape.ear, base[2] + (o[2] - base[2]) * shape.ear]; }
        if (p.earTurn) { const a = p.earTurn * D2R * sd, dx = o[0] - base[0], dz = o[2] - base[2]; o[0] = base[0] + dx * Math.cos(a) - dz * Math.sin(a); o[2] = base[2] + dx * Math.sin(a) + dz * Math.cos(a); }
      }
      const r = rotHead(o, yaw, pitch, roll);
      set(n, [H[0] + r[0], H[1] + r[1], H[2] + r[2]]);
    }
    // legs
    const M = p.modes || {};
    for (const [key, side, z] of [['fl', 'L', 4.6], ['fr', 'R', -4.6]]) {
      const m = M[key] || 'ik', paw = p[key], R = [chest[0], chest[1] - 1.8 + (side === 'L' ? p.shL : p.shR), chest[2] + z], fx = side === 'L' ? p.flexFL : p.flexFR;
      set('sh' + side, R);
      if (m === 'tuck' || m === 'hide') {
        omit['el' + side] = omit['wr' + side] = 1;
        set('el' + side, R); set('wr' + side, R);
        set('paw' + side, [chest[0] + 6, 2, chest[2] + z * 0.55]);
        if (m === 'hide') omit['paw' + side] = 1;
      } else if (m === 'flat') { // forearm along the ground (sphinx / lounge)
        set('paw' + side, paw.slice()); set('wr' + side, [paw[0] - 3.2, 2.6, paw[2]]);
        set('el' + side, [chest[0] - 1, 3.2, chest[2] + z * 0.95]);
      } else {
        const W = [paw[0] - 1.2 + fx * 1.7, paw[1] + 2.4 + fx * 0.9, paw[2]]; // flex: wrist leads, paw trails curled
        set('paw' + side, paw.slice()); set('wr' + side, W); set('el' + side, ik(R, W, 12, 12, -1));
      }
    }
    for (const [key, side, z] of [['bl', 'L', 4.6], ['br', 'R', -4.6]]) {
      const m = M[key] || 'ik', paw = p[key], T = [hips[0], hips[1] - 2 + (side === 'L' ? p.thL : p.thR), hips[2] + z], fx = side === 'L' ? p.flexBL : p.flexBR;
      set('th' + side, T);
      if (m === 'sit') { // haunch folded, hock flat on the ground, paw forward
        set('kn' + side, [hips[0] + 7.5, hips[1] - 1, hips[2] + z * 1.15]);
        set('hk' + side, [hips[0] + 1.5, 2.6, hips[2] + z * 1.05]);
        set('bp' + side, [hips[0] + 5, 2.2, hips[2] + z * 0.95]);
      } else if (m === 'tuck' || m === 'hide') {
        omit['kn' + side] = omit['hk' + side] = 1;
        set('kn' + side, T); set('hk' + side, T);
        set('bp' + side, [hips[0] + 6, 2, hips[2] + z * 1.05]);
        if (m === 'hide') { omit['bp' + side] = 1; }
      } else if (m === 'flat') {
        set('kn' + side, [hips[0] - 4, 4.6, hips[2] + z]); set('hk' + side, [paw[0] + 4, 3, paw[2]]); set('bp' + side, paw.slice());
      } else {
        const Hk = [paw[0] - 4.5 + fx * 4.5, paw[1] + 11 - fx * 2.6, paw[2]]; // flex: hock folds, foot lifts under
        set('bp' + side, paw.slice()); set('hk' + side, Hk); set('kn' + side, ik(T, Hk, 7.5, 10.5, 1)); // short thigh, long shank: the knee rides up by the belly
      }
    }
    // tail: dynamic angles if given, else straight from the pose
    const ang = tail || BZ.tailTargets(p, t);
    let q = [hips[0] - 8.5, hips[1] + 4, hips[2]];
    const seg = (3.4 * 10 / (TAIL_N - 1)) * (p.tailLen || 1) * ((shape && shape.tailLen) || 1);
    for (let i = 0; i < TAIL_N; i++) {
      set('t' + i, q.slice());
      if (i === TAIL_N - 1) break;
      const el = ang.el[i], sd = ang.sd[i];
      q = [q[0] - Math.cos(el) * Math.cos(sd) * seg, Math.max(1.6, q[1] + Math.sin(el) * seg), q[2] + Math.cos(el) * Math.sin(sd) * seg];
    }
    if (Math.abs(p.roll) > 0.05) { // ours: roll about the spine, then rest the low side on the ground (weighted by how far she's rolled, so it fades out as she gets up)
      const r = p.roll * D2R, c = Math.cos(r), s2 = Math.sin(r), py = 8;
      let minY = Infinity;
      for (let i = 0; i < pos.length; i++) { const v = pos[i]; if (!v) continue; const y = v[1] - py, z = v[2]; v[1] = py + y * c - z * s2; v[2] = y * s2 + z * c; }
      for (const nm of ['hips', 'chest', 'belly', 'back', 'head', 'shL', 'shR', 'thL', 'thR']) minY = Math.min(minY, pos[IDX[nm]][1]);
      const lift = (Math.max(0, 6.5 - minY) - Math.max(0, minY - 7.5)) * Math.min(1, Math.abs(p.roll) / 35);
      for (const v of pos) if (v) v[1] += lift;
      for (const [g, par] of [['shL', 'chest'], ['shR', 'chest'], ['thL', 'hips'], ['thR', 'hips']]) { // the uppermost shoulder / haunch sinks into the body instead of poking up as a lump
        const v = pos[IDX[g]], c0 = pos[IDX[par]]; if (v[1] > c0[1] - 1) for (let k = 0; k < 3; k++) v[k] = c0[k] + (v[k] - c0[k]) * 0.3;
      }
      for (const nm of ['pawL', 'pawR', 'bpL', 'bpR', 'wrL', 'wrR', 'hkL', 'hkR']) { const v = pos[IDX[nm]]; if (v[1] < 2) v[1] = 2; }
    }
    return { pos, omit, headYaw: yaw, headPitch: pitch, headRoll: roll };
  };

  BZ.lerpPose = function (cur, tgt, k) {
    for (const key in tgt) {
      if (key === 'modes') { cur.modes = tgt.modes; continue; }
      const v = tgt[key];
      if (Array.isArray(v)) for (let i = 0; i < 3; i++) cur[key][i] += (v[i] - cur[key][i]) * k;
      else { cur[key] += (v - cur[key]) * k; if (Math.abs(v - cur[key]) < 0.01) cur[key] = v; } // land exactly, never hover a hair off
    }
  };
  BZ.clonePose = (p) => JSON.parse(JSON.stringify(p));

  // ── projection (read_out: yaw, then pitch -7 - |64-|yaw||/10 in 1/256 turn) ──
  BZ.camera = function (theta) {
    let yawP = ((theta - Math.PI / 2) / (2 * Math.PI)) * 256;
    yawP = ((yawP + 128) % 256 + 256) % 256 - 128;
    const pitch = ((7 + Math.abs(64 - Math.abs(yawP)) / 10) / 256) * 2 * Math.PI;
    return { c: Math.cos(theta), s: Math.sin(theta), pc: Math.cos(pitch), ps: Math.sin(pitch) };
  };
  BZ.project = function (cam, v, sc, ox, oy) {
    const X = v[0] * sc, Y = v[1] * sc, Z = v[2] * sc;
    const sx = X * cam.c + Z * cam.s, dz = -X * cam.s + Z * cam.c;
    return [ox + sx, oy - Y * cam.pc - dz * cam.ps, dz * cam.pc - Y * cam.ps];
  };

  function dirToScreen(cat, v, isHead) {
    if (isHead) v = rotHead(v, cat.skel.headYaw, cat.skel.headPitch, cat.skel.headRoll);
    const cam = BZ.camera(cat.theta);
    const sx = v[0] * cam.c + v[2] * cam.s, dz = -v[0] * cam.s + v[2] * cam.c;
    return [sx, -v[1] * cam.pc - dz * cam.ps, dz * cam.pc - v[1] * cam.ps];
  }

  // ── draw (raw: balls + lines + eyes + whiskers, far to near) ──
  function drawCatRaw(ctx, cat) {
    const coat = cat.coat, sk = cat.skel, cam = BZ.camera(cat.theta);
    const ps = cat.petScale, bs = cat.ballScale;
    const ox = cat.x, oy = cat.y - cat.pose.rootY * ps;
    const S = sk.pos.map((v) => BZ.project(cam, v, ps, ox, oy));
    const omit = sk.omit;
    const items = [];
    for (let i = 0; i < BALLS.length; i++) {
      const [name, base, slot, region] = BALLS[i];
      if (omit[name]) continue;
      let d = base * shapeMul(cat, slot);
      if ((name === 'back' || name === 'belly') && cat.pose.roll > 0) d *= 1 + 0.4 * Math.min(1, cat.pose.roll / 70); // lying on her side the waist fills out: no dog-bone silhouette
      if (name === 'mouth') d = 4 * cat.pose.mouth;
      if (name === 'tongue') d = 2.6 * cat.pose.tongue;
      if (d <= 0.3) continue;
      d *= bs;
      items.push({ z: S[i][2], kind: slot === 'eye' ? 'eye' : 'ball', i, d, slot, region, name });
    }
    for (const L of LINES) {
      const a = IDX[L[0]], b = IDX[L[1]];
      if (omit[L[0]] || omit[L[1]]) continue;
      items.push({ z: (S[a][2] + S[b][2]) / 2 + (L[2] === 'back' ? 0.5 : -0.01), kind: 'line', L, a, b });
    }
    items.push({ z: Math.min(S[IDX.muzL][2], S[IDX.muzR][2]) - 0.3, kind: 'whisk' });
    if (cat.sweater) { const C = S[IDX.chest], Hd = S[IDX.head]; items.push({ z: Math.min(C[2], Hd[2]) - 9, kind: 'bow', x: C[0] + (Hd[0] - C[0]) * 0.36, y: C[1] + (Hd[1] - C[1]) * 0.36 + 1, collar: [C[0] + (Hd[0] - C[0]) * 0.3, C[1] + (Hd[1] - C[1]) * 0.3] }); } // the ribbon, tied under her chin
    items.sort((p, q) => q.z - p.z); // farthest first (read_out)

    const hits = [];
    for (const it of items) {
      if (it.kind === 'ball') {
        let spec = coat.colors[it.slot] || coat.colors.coat;
        if (cat.sweater && SWEATER_BALLS[it.name]) { BZ.drawBall(ctx, S[it.i][0], S[it.i][1], it.d, BZ.color(['knit', 4]), null, BZ.color(['knit', 1]), -1, 0, 'knit'); hits.push({ x: S[it.i][0], y: S[it.i][1], r: it.d / 2, region: it.region, name: it.name }); continue; } // in her sweater
        if (it.slot === 'mouth') spec = ['pink', 0];
        if (it.slot === 'tongue') spec = ['pink', 3];
        const col = BZ.color(spec);
        const curl = CURLED[it.slot] ? BZ.RAMPS[spec[0]][Math.max(0, spec[1] - 1)] : null;
        BZ.drawBall(ctx, S[it.i][0], S[it.i][1], it.d, col, null, curl, -1, 0, curl ? 'wave' : false);
        drawSpots(ctx, cat, it, S, it.d);
        hits.push({ x: S[it.i][0], y: S[it.i][1], r: it.d / 2, region: it.region, name: it.name });
      } else if (it.kind === 'line') {
        const L = it.L, A = S[it.a], B = S[it.b], slot = L[2];
        if (slot === 'inner') { // inner ear shows from the front only
          const f = BZ.rotHead([1, 0, 0], sk.headYaw, sk.headPitch, sk.headRoll);
          if (-f[0] * cam.s + f[2] * cam.c > -0.12) continue;
        }
        const sw = cat.sweater && (slot === 'back' || (slot === 'limb' && L[0].startsWith('sh')) || (slot === 'chest' && L[0] === 'chin' && false));
        const spec = sw ? ['knit', 4] : coat.colors[slot] || coat.colors.coat;
        const sm = shapeMul(cat, slot);
        BZ.drawLine(ctx, A[0], A[1], L[3] * bs * sm, B[0], B[1], L[4] * bs * sm, BZ.color(spec), null, 0);
        if (slot === 'tail' || slot === 'tip' || slot === 'back') hits.push({ x: (A[0] + B[0]) / 2, y: (A[1] + B[1]) / 2, r: Math.max(2, L[3] * bs * 0.6), region: slot === 'back' ? 'back' : 'tail', name: L[0] });
      } else if (it.kind === 'bow') { const f = Math.sin(cat.theta); if (f > -0.25) drawBow(ctx, it.x, it.y, cat.sweater.bow, cat.petScale * 1.15, Math.cos(cat.theta)); // only from the front
      } else if (it.kind === 'eye') {
        drawEyeItem(ctx, cat, it, S);
        hits.push({ x: S[it.i][0], y: S[it.i][1], r: it.d / 2, region: 'face', name: it.name });
      } else drawWhiskers(ctx, cat, S);
    }
    cat.screen = S;
    hits.reverse();
    cat.hits = hits;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const v of S) { x0 = Math.min(x0, v[0]); x1 = Math.max(x1, v[0]); y0 = Math.min(y0, v[1]); y1 = Math.max(y1, v[1]); }
    cat.bbox = [x0 - 6 * bs, y0 - 6 * bs, x1 + 6 * bs, y1 + 6 * bs];
  }

  const SWEATER_BALLS = { hips: 1, belly: 1, chest: 1, back: 1, shL: 1, shR: 1 };
  function drawBow(ctx, x, y, col, s, facing) { // a satin ribbon bow: two loops, a knot, two tails, a sheen
    const k = Math.max(0.8, s), lo = mixC(col, '#000000', 0.3), hi = mixC(col, '#ffffff', 0.35);
    for (const sd of [-1, 1]) { BZ.fillPoly(ctx, [[x, y], [x + sd * 4.4 * k, y - 2.6 * k], [x + sd * 4.8 * k, y + 1.4 * k]], col); BZ.drawThin(ctx, x + sd * 1 * k, y - 0.6 * k, x + sd * 4 * k, y - 2.2 * k, hi); BZ.drawThin(ctx, x + sd * 1 * k, y + 1, x + sd * 2.4 * k + sd * facing, y + 4.6 * k, lo); }
    BZ.ellipse(ctx, x, y, 1.4 * k, 1.3 * k, lo); ctx.fillStyle = hi; ctx.fillRect(Math.round(x - 0.5), Math.round(y - 1), 1, 1);
  }
  function mixC(a, b, t) { const A = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), B = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16)); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
  const SHAPE_GROUP = { head: 'head', cheek: 'head', muzzle: 'head', nose: 'head', eye: 'head', mouth: 'head', tongue: 'head', ear: 'earW', inner: 'earW', leg: 'limb', paw: 'limb', limb: 'limb', coat: 'body', back: 'body', belly: 'body', chest: 'body', tail: 'tail', tip: 'tail' };
  function shapeMul(cat, slot) { const sh = cat.shape; if (!sh) return 1; const g = SHAPE_GROUP[slot]; return (g && sh[g]) || 1; }

  function drawSpots(ctx, cat, it, S, d) {
    const spots = cat.spots[it.name]; if (!spots) return;
    const isHead = !!HEAD_OFF[it.name];
    const parent = { x: S[it.i][0], y: S[it.i][1], d, fuzz: 0 };
    for (const sp of spots) {
      const v = dirToScreen(cat, sp.dir, isHead);
      if (v[2] > 0.3) continue;
      const fore = Math.min(1, 0.55 + Math.max(0, -v[2]) * 0.6);
      BZ.drawClipped(ctx, parent.x + v[0] * d * 0.31, parent.y + v[1] * d * 0.31, d * sp.size * fore, BZ.color(sp.color), parent, 0);
    }
  }

  function drawEyeItem(ctx, cat, it, S) {
    const coat = cat.coat, e = cat.eyes[it.name];
    const [x, y] = S[it.i];
    const irisD = it.d * 0.82, maxOff = Math.max(0, it.d / 2 - 0.8 * irisD / 2);
    let tx, ty;
    if (cat.look) {
      const dx = cat.look[0] - x, dy = cat.look[1] - y, dl = Math.hypot(dx, dy) || 1, k = Math.min(1, dl / 60);
      tx = (dx / dl) * maxOff * k; ty = (dy / dl) * maxOff * k;
    } else { const f = dirToScreen(cat, [1, 0, 0], true); tx = f[0] * maxOff * 0.8; ty = f[1] * maxOff * 0.5; }
    e.ix += Math.max(-0.6, Math.min(0.6, tx - e.ix)); e.iy += Math.max(-0.6, Math.min(0.6, ty - e.iy)); // read_out: 0.6px/frame
    e.ix = Math.max(-maxOff, Math.min(maxOff, e.ix)); e.iy = Math.max(-maxOff, Math.min(maxOff, e.iy));
    const lid = Math.min(1, Math.max(cat.pose.lid, cat.blink > 0 ? 1 : 0, cat.slowBlink || 0));
    BZ.drawEye(ctx, {
      x, y, d: it.d, white: BZ.color(coat.eye.white), rim: BZ.color(coat.eye.rim), iris: BZ.color(coat.eye.iris), pupil: '#0b0a0c',
      ix: Math.round(e.ix), iy: Math.round(e.iy), irisD, pupilW: 1 + cat.pose.pupil * (irisD * 0.55),
      lid, lidColor: BZ.color(coat.eye.lid), lidLine: BZ.color(coat.outline),
    });
  }

  // rex whiskers: short, kinked
  const WHISK = [[[1, 0.1, 1.2], 7], [[1, -0.3, 1.1], 6]];
  function drawWhiskers(ctx, cat, S) {
    const col = cat.coat.whisker;
    for (const side of [1, -1]) {
      const m = S[IDX[side > 0 ? 'muzL' : 'muzR']];
      for (const [v, len] of WHISK) {
        const dv = dirToScreen(cat, [v[0] * 0.5, v[1], v[2] * side], true);
        const n = Math.hypot(dv[0], dv[1]) || 1, L = len * cat.petScale, ux = dv[0] / n, uy = dv[1] / n;
        const a = [m[0] + ux * L * 0.4, m[1] + uy * L * 0.4 + 1.2], b = [m[0] + ux * L * 0.7, m[1] + uy * L * 0.7 - 0.8];
        BZ.drawThin(ctx, m[0], m[1], a[0], a[1], col); BZ.drawThin(ctx, a[0], a[1], b[0], b[1], col); BZ.drawThin(ctx, b[0], b[1], b[0] + ux * 2, b[1] + 1.5, col);
      }
    }
  }

  // offscreen pass: one 1px silhouette outline (ours) + optional clip ellipse
  let OFF = null;
  BZ.drawCat = function (ctx, cat) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    if (!OFF || OFF.width !== W || OFF.height !== H) { OFF = document.createElement('canvas'); OFF.width = W; OFF.height = H; }
    const o = OFF.getContext('2d', { willReadFrequently: true });
    o.imageSmoothingEnabled = false;
    o.clearRect(0, 0, W, H);
    drawCatRaw(o, cat);
    const b = cat.bbox;
    const bx = Math.max(0, Math.floor(b[0])), by = Math.max(0, Math.floor(b[1]));
    const bw = Math.min(W, Math.ceil(b[2])) - bx, bh = Math.min(H, Math.ceil(b[3])) - by;
    if (!(bw > 0 && bh > 0)) return;
    const img = o.getImageData(bx, by, bw, bh), d = img.data;
    const a = new Uint8Array(bw * bh);
    for (let i = 0; i < bw * bh; i++) a[i] = d[i * 4 + 3] > 0 ? 1 : 0;
    const oc = BZ.color(cat.coat.outline), r = parseInt(oc.slice(1, 3), 16), g = parseInt(oc.slice(3, 5), 16), bl = parseInt(oc.slice(5, 7), 16);
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
      const i = y * bw + x; if (a[i]) continue;
      if ((x > 0 && a[i - 1]) || (x < bw - 1 && a[i + 1]) || (y > 0 && a[i - bw]) || (y < bh - 1 && a[i + bw])) { d[i * 4] = r; d[i * 4 + 1] = g; d[i * 4 + 2] = bl; d[i * 4 + 3] = 255; }
    }
    if (cat.clip) {
      const c = cat.clip;
      for (let y = 0; y < bh; y++) {
        const sp = BZ.ballSpanE(c.cx, c.cy, c.rx, c.ry, by + y);
        for (let x = 0; x < bw; x++) if (!sp || bx + x < sp[0] || bx + x >= sp[1]) d[(y * bw + x) * 4 + 3] = 0;
      }
    }
    o.putImageData(img, bx, by);
    ctx.drawImage(OFF, bx, by, bw, bh, bx, by, bw, bh);
  };
})();
