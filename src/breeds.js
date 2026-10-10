// ─── Breeds ────────────────────────────────────────────────────────────────
// LNZ-equivalent breed specs (original designs). Each breed dresses the one
// shared skeleton: color slots -> [ramp, shade], per-slot fuzz/outline/speckle,
// size diffs, paint spots, eye colors, scales, personality factors.
var BZ = window.BZ || (window.BZ = {});

BZ.RAMPS = {
  ginger: ['#4a1f0a', '#7f3a12', '#b45a1c', '#d97f2e', '#eda457', '#f8cd92'],
  cream:  ['#6f5a46', '#9e8366', '#c8ad8b', '#e4d0b0', '#f2e6d2', '#fbf6ec'],
  ink:    ['#08080b', '#141419', '#202028', '#2e2e38', '#44444f', '#5d5d6a'],
  snow:   ['#8d8c94', '#b3b2ba', '#d2d1d8', '#e7e6ec', '#f4f3f7', '#ffffff'],
  smoke:  ['#2b2f38', '#434957', '#5f6676', '#7d8494', '#a0a6b4', '#c6cad4'],
  seal:   ['#1f130d', '#352218', '#4d3326', '#664637', '#82604f', '#a07d6b'],
  pink:   ['#6e2c35', '#9a4552', '#c66472', '#e08b97', '#f0b3bb', '#fbdadf'],
  amber:  ['#5a3b00', '#8a5c00', '#b98400', '#dcab16', '#efcc4a', '#f9e590'],
  jade:   ['#103d22', '#1f5f36', '#2f844b', '#4ba865', '#78c98a', '#acdfb6'],
  ice:    ['#14305a', '#1f4c87', '#2f6eb5', '#4f93d8', '#80b6ea', '#b5d6f6'],
  bo:     ['#6e604c', '#9a8a70', '#b8a888', '#d0c0a0', '#e2d6be', '#f2ebdc'],
  bowhite: ['#9b958c', '#bdb6ac', '#d8d2c8', '#ebe6dd', '#f6f2ec', '#fffdf9'],
  boseal: ['#1a1414', '#2a2222', '#3a3030', '#4f4343', '#685a58', '#857574'],
  boteal: ['#1f4a3e', '#2f6e5c', '#4b917c', '#70b8a0', '#9ccfbd', '#c9e6dc'],
  copper: ['#4d1d05', '#7a330c', '#a84d14', '#cf6c22', '#e69243', '#f4bb7c'],
};

// slot -> [ramp, shade]; defaults per slot for fuzz / outline mode / speckle
const SLOT_FX = {
  coat:   { fuzz: 2, mode: 1, speckle: false },
  back:   { fuzz: 2, mode: 0, speckle: true },
  belly:  { fuzz: 3, mode: 0, speckle: true },
  chest:  { fuzz: 3, mode: 0, speckle: true },
  cheek:  { fuzz: 3, mode: 0, speckle: true },
  muzzle: { fuzz: 1, mode: 1, speckle: false },
  leg:    { fuzz: 1, mode: 1, speckle: false },
  paw:    { fuzz: 0, mode: 1, speckle: false },
  ear:    { fuzz: 0, mode: 1, speckle: false },
  inner:  { fuzz: 0, mode: -1, speckle: false },
  nose:   { fuzz: 0, mode: 1, speckle: false },
  tail:   { fuzz: 2, mode: -1, speckle: false },
  tip:    { fuzz: 2, mode: -1, speckle: false },
  limb:   { fuzz: 2, mode: 0, speckle: true },
  head:   { fuzz: 2, mode: 1, speckle: false },
};
BZ.SLOT_FX = SLOT_FX;

BZ.BREEDS = {
  bo: {
    // Julia's real cat: 19yo seal point Cornish Rex. Canon palette from Bosyphus
    // (body #d0c0a0, points #3a3030, eyes #70b8a0); white chest/legs/blaze from photos.
    label: 'Bo', blurb: 'seal point Cornish Rex · 19, indifferent', name: 'Bo',
    colors: { coat: ['bo', 3], back: ['bo', 3], head: ['bo', 1], limb: ['bo', 3], belly: ['bo', 3], chest: ['bowhite', 4], cheek: ['bowhite', 3], muzzle: ['bowhite', 4], leg: ['bowhite', 4], paw: ['bowhite', 5], ear: ['boseal', 4], inner: ['pink', 4], nose: ['pink', 3], tail: ['bo', 3], tip: ['bo', 2] },
    outline: ['boseal', 2], lineOutline: null,
    silhouette: true,          // ours: one 1px outline round the whole cat instead of per-ball rims
    curls: 'wave',             // ours: marcel-wave rows instead of random speckles
    eye: { white: ['boteal', 5], iris: ['boteal', 3], rim: ['boseal', 3], lid: ['boseal', 4] },
    whisker: '#efeae2', whiskerCurl: true,
    spots: [
      { ball: 'head', dir: [0.8, 0.3, 0.5], size: 0.38, color: ['boseal', 4] },
      { ball: 'head', dir: [0.8, 0.3, -0.5], size: 0.38, color: ['boseal', 4] },
      { ball: 'head', dir: [0.97, -0.08, 0], size: 0.3, color: ['bowhite', 4] },
      { ball: 'head', dir: [0.9, 0.38, 0], size: 0.17, color: ['bowhite', 3] },
    ],
    slotFx: {
      coat: { fuzz: 0, mode: -1, speckle: true }, back: { fuzz: 0, mode: -1, speckle: true }, limb: { fuzz: 0, mode: -1, speckle: true },
      head: { fuzz: 0, mode: -1, speckle: false }, belly: { fuzz: 1, mode: -1, speckle: true }, chest: { fuzz: 1, mode: -1, speckle: true },
      cheek: { fuzz: 0, mode: -1, speckle: false }, muzzle: { fuzz: 0, mode: -1, speckle: false }, leg: { fuzz: 0, mode: -1, speckle: false },
      paw: { fuzz: 0, mode: -1, speckle: false }, ear: { fuzz: 0, mode: -1, speckle: false }, nose: { fuzz: 0, mode: -1, speckle: false },
      tail: { fuzz: 0, mode: -1, speckle: false }, tip: { fuzz: 0, mode: -1, speckle: false },
    },
    sizeDiffs: { head: -3, cheekL: -4, cheekR: -4, muzL: -1.5, muzR: -1.5, chin: -1, chest: -2, belly: -9, hips: -5, back: -6, neck: -3, shL: -3, shR: -3, thL: -4, thR: -4,
      earLt: -2, earRt: -2, earL: -1, earR: -1, eyeL: 0.5, eyeR: 0.5, t0: -3, t1: -3, t2: -3.5, t3: -3.5, t4: -4, t5: -4, t6: -4.5,
      elL: -1.5, elR: -1.5, knL: -1.5, knR: -1.5, wrL: -2, wrR: -2, hkL: -2, hkR: -2, pawL: -2.5, pawR: -2.5, bpL: -2.5, bpR: -2.5 },
    lineScale: { tail: 2.2 },
    earScale: 1.65, earWidth: [8, 0.8], innerWidth: [4.4, 0.6],
    extraLines: [['chest', 'neck', 'chest', 0, 9, 7.5], ['neck', 'head', 'cheek', 0, 7.5, 8]],
    legLen: 1.35, tailLen: 1.35,
    poseAdd: { lift: 8, headDX: 5, headDY: 7, neckDX: 3, neckDY: 4, lidMin: 0.45 },
    idleMood: 'indifferent',
    fuzzBoost: 0,
    factors: { excitement: [30, 10], playful: [35, 15], affection: [65, 10], naughty: [30, 10], appetite: [60, 10], lazy: [75, 10] },
  },
  marmalade: {
    label: 'Marmalade', blurb: 'ginger tabby · sunny, food-motivated',
    colors: { coat: ['ginger', 3], back: ['ginger', 2], head: ['ginger', 3], belly: ['cream', 4], chest: ['cream', 4], cheek: ['ginger', 4], muzzle: ['cream', 5], leg: ['ginger', 3], paw: ['cream', 4], ear: ['ginger', 2], inner: ['pink', 4], nose: ['pink', 3], tail: ['ginger', 3], tip: ['ginger', 1] },
    outline: ['ginger', 0], lineOutline: ['ginger', 0],
    eye: { white: ['amber', 5], iris: ['amber', 3], rim: ['ginger', 0] },
    whisker: '#fff6e6',
    stripes: { ramp: 'ginger', shade: 1 },
    spots: [],
    sizeDiffs: {},
    fuzzBoost: 0,
    factors: { excitement: [55, 15], playful: [60, 20], affection: [70, 15], naughty: [30, 15], appetite: [85, 10], lazy: [45, 15] },
  },
  inkwell: {
    label: 'Inkwell', blurb: 'tuxedo · dignified, secretly goofy',
    colors: { coat: ['ink', 2], back: ['ink', 2], head: ['ink', 2], belly: ['snow', 4], chest: ['snow', 4], cheek: ['ink', 3], muzzle: ['snow', 4], leg: ['ink', 2], paw: ['snow', 4], ear: ['ink', 1], inner: ['pink', 2], nose: ['pink', 2], tail: ['ink', 2], tip: ['ink', 2] },
    outline: ['ink', 0], lineOutline: ['ink', 0],
    eye: { white: ['amber', 5], iris: ['amber', 4], rim: ['ink', 0] },
    whisker: '#ffffff',
    spots: [{ ball: 'head', dir: [0.9, -0.2, 0], size: 0.38, color: ['snow', 4] }],
    sizeDiffs: {},
    fuzzBoost: 0,
    factors: { excitement: [45, 20], playful: [55, 20], affection: [55, 20], naughty: [55, 20], appetite: [60, 15], lazy: [50, 15] },
  },
  patchwork: {
    label: 'Patchwork', blurb: 'calico · bossy, chatty',
    colors: { coat: ['snow', 4], back: ['snow', 4], head: ['snow', 4], belly: ['snow', 5], chest: ['snow', 5], cheek: ['snow', 4], muzzle: ['snow', 5], leg: ['snow', 4], paw: ['snow', 5], ear: ['ginger', 3], inner: ['pink', 4], nose: ['pink', 3], tail: ['ginger', 3], tip: ['ink', 2] },
    outline: ['smoke', 1], lineOutline: ['smoke', 1],
    eye: { white: ['jade', 5], iris: ['jade', 3], rim: ['smoke', 0] },
    whisker: '#ffffff',
    spots: [
      { ball: 'hips', dir: [-0.3, 0.7, 0.5], size: 0.75, color: ['ginger', 3] },
      { ball: 'hips', dir: [-0.2, 0.6, -0.6], size: 0.6, color: ['ink', 2] },
      { ball: 'back', dir: [0.2, 0.9, 0.3], size: 0.7, color: ['ink', 2] },
      { ball: 'chest', dir: [0.1, 0.8, -0.5], size: 0.6, color: ['ginger', 3] },
      { ball: 'head', dir: [0.2, 0.8, 0.55], size: 0.55, color: ['ginger', 3] },
      { ball: 'head', dir: [0.2, 0.8, -0.55], size: 0.5, color: ['ink', 2] },
    ],
    sizeDiffs: {},
    fuzzBoost: 0,
    factors: { excitement: [60, 20], playful: [50, 20], affection: [50, 25], naughty: [65, 15], appetite: [70, 15], lazy: [35, 15] },
  },
  smoke: {
    label: 'Smoke', blurb: 'grey longhair · slow, sweet, enormous',
    colors: { coat: ['smoke', 3], back: ['smoke', 3], head: ['smoke', 3], belly: ['smoke', 4], chest: ['smoke', 5], cheek: ['smoke', 4], muzzle: ['smoke', 5], leg: ['smoke', 3], paw: ['smoke', 4], ear: ['smoke', 2], inner: ['pink', 3], nose: ['smoke', 1], tail: ['smoke', 3], tip: ['smoke', 4] },
    outline: ['smoke', 0], lineOutline: ['smoke', 0],
    eye: { white: ['copper', 5], iris: ['copper', 3], rim: ['smoke', 0] },
    whisker: '#ffffff',
    spots: [],
    sizeDiffs: { cheekL: 7, cheekR: 7, chest: 6, neck: 6, belly: 4, hips: 4, t1: 4, t2: 5, t3: 5, t4: 5, t5: 4, t6: 3, earLt: -1, earRt: -1 },
    lineScale: { tail: 1.7 },
    fuzzBoost: 2,
    factors: { excitement: [30, 15], playful: [35, 15], affection: [80, 10], naughty: [20, 10], appetite: [70, 15], lazy: [75, 10] },
  },
  pointed: {
    label: 'Pointed', blurb: 'cream with seal points · loud, clingy',
    colors: { coat: ['cream', 4], back: ['cream', 3], head: ['cream', 4], belly: ['cream', 5], chest: ['cream', 5], cheek: ['cream', 4], muzzle: ['seal', 2], leg: ['seal', 3], paw: ['seal', 2], ear: ['seal', 1], inner: ['seal', 3], nose: ['seal', 0], tail: ['seal', 2], tip: ['seal', 1] },
    outline: ['seal', 1], lineOutline: ['seal', 1],
    eye: { white: ['ice', 5], iris: ['ice', 3], rim: ['seal', 0] },
    whisker: '#f5efe6',
    spots: [{ ball: 'head', dir: [0.95, 0, 0], size: 0.5, color: ['seal', 3] }],
    sizeDiffs: { earL: 2, earR: 2, earLt: 1, earRt: 1, belly: -2, hips: -2, t1: -1, t2: -1, t3: -1 },
    fuzzBoost: -1,
    factors: { excitement: [70, 15], playful: [65, 15], affection: [85, 10], naughty: [40, 20], appetite: [60, 15], lazy: [30, 15] },
  },
};

BZ.NAMES = ['Biscuit', 'Mochi', 'Pickle', 'Noodle', 'Tofu', 'Juniper', 'Olive', 'Pepper', 'Waffles', 'Miso', 'Clementine', 'Bean', 'Turnip', 'Pudding', 'Ziggy', 'Dumpling', 'Fig', 'Basil', 'Sardine', 'Moth', 'Pilot', 'Velvet', 'Crumb', 'Radish'];

BZ.color = function (spec) { return spec ? BZ.RAMPS[spec[0]][spec[1]] : null; };
// speckle = the mirror shade in the same ramp (read_out: s + (s + R - 1 - c))
BZ.speckle = function (spec) { return spec ? BZ.RAMPS[spec[0]][5 - spec[1]] : null; };
