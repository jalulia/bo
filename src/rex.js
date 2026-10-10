// ─── Cornish Rex coats + personalities ─────────────────────────────────────
// Every cat shares one rex body (CFA: egg head, Roman nose, large high ears,
// arched back, tucked-up waist, stands high on long slender legs, long whip
// tail, marcel-wave coat). Coats and personalities vary; Bo is the reference.
var BZ = window.BZ || (window.BZ = {});

BZ.RAMPS = {
  bo:      ['#6e604c', '#9a8a70', '#b8a888', '#d0c0a0', '#e2d6be', '#f2ebdc'],
  bowhite: ['#9b958c', '#bdb6ac', '#d8d2c8', '#ebe6dd', '#f6f2ec', '#fffdf9'],
  boseal:  ['#1a1414', '#2a2222', '#3a3030', '#4f4343', '#685a58', '#857574'],
  botail:  ['#1f1a17', '#2b2420', '#3a302a', '#4e3a2a', '#634b38', '#7b604a'],
  aqua:    ['#2b5866', '#3f7a8a', '#5c9daf', '#86bfcf', '#b2dbe6', '#dcf0f5'],
  boblue:  ['#0b4a57', '#11788a', '#1aa6b8', '#3ccbdb', '#8ee8ef', '#e0fbfc'],
  gold:    ['#5c4400', '#8f6d00', '#c49a00', '#e6bf1e', '#f4da58', '#fbefa6'],
  boteal:  ['#1f4a3e', '#2f6e5c', '#4b917c', '#70b8a0', '#9ccfbd', '#c9e6dc'],
  pink:    ['#6e2c35', '#9a4552', '#c66472', '#e08b97', '#f0b3bb', '#fbdadf'],
  blue:    ['#2f3540', '#454d5c', '#5d6676', '#778192', '#959eae', '#b6bdc9'],
  amber:   ['#5a3b00', '#8a5c00', '#b98400', '#dcab16', '#efcc4a', '#f9e590'],
  red:     ['#5a240e', '#863a18', '#b05a26', '#cf7a3c', '#e39c62', '#f2c296'],
  ink:     ['#0c0b0d', '#18161a', '#242127', '#322e35', '#46414a', '#5d5762'],
  copper:  ['#4d1d05', '#7a330c', '#a84d14', '#cf6c22', '#e69243', '#f4bb7c'],
  lilac:   ['#5e5560', '#7b717d', '#988e99', '#b3aab3', '#cbc4cb', '#e2dde2'],
  knit:    ['#8a7a64', '#a8977c', '#c4b496', '#ddd0b4', '#ece4d0', '#f7f2e6'],
  jade:    ['#103d22', '#1f5f36', '#2f844b', '#4ba865', '#78c98a', '#acdfb6'],
};
BZ.color = (spec) => (spec ? BZ.RAMPS[spec[0]][spec[1]] : null);

// Coats. slots: coat back head limb belly chest cheek muzzle leg paw ear inner nose tail tip
// mask: spots drawn on the head (Paint Ballz style), dir = local unit vector on the ball.
BZ.COATS = {
  bo: {
    label: 'Bo', note: 'seal point & white', name: 'Bo',
    colors: { coat: ['bo', 3], back: ['bo', 3], head: ['bo', 1], limb: ['bo', 3], belly: ['bo', 4], chest: ['bowhite', 4], cheek: ['bowhite', 3], muzzle: ['bowhite', 4], leg: ['bowhite', 4], paw: ['bowhite', 5], ear: ['boseal', 4], inner: ['pink', 4], nose: ['pink', 3], tail: ['botail', 1], tip: ['botail', 0] },
    outline: ['boseal', 2],
    eye: { white: ['boblue', 5], iris: ['boblue', 3], rim: ['boseal', 4], lid: ['boseal', 4] },
    whisker: '#efeae2',
    spots: [
      { ball: 'head', dir: [0.78, 0.3, 0.52], size: 0.42, color: ['boseal', 4] },
      { ball: 'head', dir: [0.78, 0.3, -0.52], size: 0.42, color: ['boseal', 4] },
      { ball: 'head', dir: [0.55, 0.8, 0], size: 0.26, color: ['boseal', 4] },
      { ball: 'head', dir: [0.97, -0.08, 0], size: 0.3, color: ['bowhite', 4] },
      { ball: 'head', dir: [0.9, 0.38, 0], size: 0.15, color: ['bowhite', 3] },
      { ball: 'chest', dir: [-0.6, 0.75, 0.3], size: 0.45, color: ['bo', 3] },
    ],
  },
  bunny: {
    label: 'Bunny', note: 'all white, petite', name: 'Bunny',
    colors: { coat: ['bowhite', 4], back: ['bowhite', 4], head: ['bowhite', 4], limb: ['bowhite', 4], belly: ['bowhite', 5], chest: ['bowhite', 5], cheek: ['bowhite', 5], muzzle: ['bowhite', 5], leg: ['bowhite', 5], paw: ['bowhite', 5], ear: ['bowhite', 3], inner: ['pink', 4], nose: ['pink', 4], tail: ['bowhite', 4], tip: ['bowhite', 3] },
    outline: ['bowhite', 0],
    eye: { white: ['gold', 5], iris: ['gold', 3], rim: ['bowhite', 1], lid: ['bowhite', 3] },
    whisker: '#ffffff',
    spots: [{ ball: 'head', dir: [0.85, 0.25, 0.5], size: 0.2, color: ['pink', 5] }, { ball: 'head', dir: [0.85, 0.25, -0.5], size: 0.2, color: ['pink', 5] }],
  },
  blue: {
    label: 'Blue', note: 'solid blue',
    colors: { coat: ['blue', 3], back: ['blue', 3], head: ['blue', 3], limb: ['blue', 3], belly: ['blue', 4], chest: ['blue', 4], cheek: ['blue', 4], muzzle: ['blue', 4], leg: ['blue', 3], paw: ['blue', 4], ear: ['blue', 2], inner: ['pink', 3], nose: ['blue', 1], tail: ['blue', 2], tip: ['blue', 2] },
    outline: ['blue', 0], eye: { white: ['amber', 5], iris: ['amber', 3], rim: ['blue', 1], lid: ['blue', 3] }, whisker: '#dfe3ea', spots: [],
  },
  redwhite: {
    label: 'Red & white', note: 'red bicolor',
    colors: { coat: ['red', 3], back: ['red', 3], head: ['red', 3], limb: ['red', 3], belly: ['bowhite', 4], chest: ['bowhite', 4], cheek: ['bowhite', 4], muzzle: ['bowhite', 4], leg: ['bowhite', 4], paw: ['bowhite', 5], ear: ['red', 2], inner: ['pink', 4], nose: ['pink', 3], tail: ['red', 2], tip: ['red', 1] },
    outline: ['red', 0], eye: { white: ['amber', 5], iris: ['copper', 4], rim: ['red', 1], lid: ['red', 3] }, whisker: '#ffffff',
    spots: [{ ball: 'head', dir: [0.97, -0.05, 0], size: 0.32, color: ['bowhite', 4] }],
  },
  black: {
    label: 'Black', note: 'solid black',
    colors: { coat: ['ink', 3], back: ['ink', 3], head: ['ink', 3], limb: ['ink', 3], belly: ['ink', 4], chest: ['ink', 4], cheek: ['ink', 4], muzzle: ['ink', 4], leg: ['ink', 3], paw: ['ink', 4], ear: ['ink', 2], inner: ['pink', 1], nose: ['ink', 1], tail: ['ink', 2], tip: ['ink', 2] },
    outline: ['ink', 0], eye: { white: ['amber', 5], iris: ['amber', 3], rim: ['ink', 0], lid: ['ink', 3] }, whisker: '#d7d3cf', spots: [],
  },
  tortie: {
    label: 'Tortie', note: 'tortoiseshell',
    colors: { coat: ['ink', 3], back: ['ink', 3], head: ['ink', 3], limb: ['red', 2], belly: ['red', 2], chest: ['ink', 4], cheek: ['red', 3], muzzle: ['ink', 4], leg: ['ink', 3], paw: ['ink', 4], ear: ['ink', 2], inner: ['pink', 2], nose: ['pink', 1], tail: ['ink', 2], tip: ['red', 2] },
    outline: ['ink', 0], eye: { white: ['copper', 5], iris: ['copper', 3], rim: ['ink', 0], lid: ['ink', 3] }, whisker: '#e6dccf',
    spots: [{ ball: 'head', dir: [0.6, 0.6, 0.5], size: 0.42, color: ['red', 3] }, { ball: 'hips', dir: [-0.2, 0.8, 0.5], size: 0.6, color: ['red', 3] }, { ball: 'back', dir: [0.2, 0.9, -0.4], size: 0.55, color: ['red', 2] }],
  },
  lilac: {
    label: 'Lilac', note: 'solid lilac',
    colors: { coat: ['lilac', 3], back: ['lilac', 3], head: ['lilac', 3], limb: ['lilac', 3], belly: ['lilac', 4], chest: ['lilac', 4], cheek: ['lilac', 4], muzzle: ['lilac', 4], leg: ['lilac', 3], paw: ['lilac', 4], ear: ['lilac', 2], inner: ['pink', 4], nose: ['pink', 2], tail: ['lilac', 2], tip: ['lilac', 2] },
    outline: ['lilac', 0], eye: { white: ['jade', 5], iris: ['jade', 3], rim: ['lilac', 1], lid: ['lilac', 3] }, whisker: '#ffffff', spots: [],
  },
};

// Personalities, 0-100. energy: how much she moves; sleepy: nap appetite;
// affection: seeks the cursor; chatty: meows; curious: investigates toys;
// grass: loves greens; sass: swats, snubs, knocks things.
// naps: weights for each nap shape.
BZ.PERSONALITIES = {
  // aloof: watches instead of doing. nerve: low = startles. tempo: speed of
  // everything she does. latency: frames before she notices something.
  bo:     { label: 'Bo', energy: 25, sleepy: 88, affection: 72, chatty: 55, curious: 40, grass: 95, sass: 55, aloof: 80, nerve: 75, tempo: 0.85, latency: [22, 70],
            naps: { baguette: 22, crescent: 20, lounge: 18, dangle: 14, flop: 14, loaf: 13, sphinx: 13 }, baseline: 'indifferent', size: 1 },
  bunny:  { label: 'Bunny', energy: 74, sleepy: 60, affection: 92, chatty: 35, curious: 88, grass: 70, sass: 82, aloof: 22, nerve: 80, tempo: 1.18, latency: [5, 22],
            naps: { crescent: 30, loaf: 18, flop: 16, baguette: 14, lounge: 12, sphinx: 10, dangle: 6 }, baseline: 'curious', size: 0.8,
            shape: { head: 1.06, ear: 1.06, earW: 0.95, limb: 0.82, body: 0.88, tail: 0.85, tailLen: 0.95 } },
  sprite: { label: 'Zoomy', energy: 85, sleepy: 35, affection: 55, chatty: 40, curious: 90, grass: 50, sass: 60, aloof: 20, nerve: 55, tempo: 1.2, latency: [5, 25],
            naps: { baguette: 10, crescent: 35, lounge: 15, flop: 10, loaf: 15, sphinx: 15 }, baseline: 'alert', size: 0.95 },
  velcro: { label: 'Velcro', energy: 45, sleepy: 60, affection: 95, chatty: 70, curious: 50, grass: 60, sass: 15, aloof: 40, nerve: 60, tempo: 1, latency: [12, 40],
            naps: { baguette: 15, crescent: 30, lounge: 20, flop: 10, loaf: 15, sphinx: 10 }, baseline: 'adoring', size: 1 },
  diva:   { label: 'Diva', energy: 40, sleepy: 65, affection: 35, chatty: 85, curious: 45, grass: 40, sass: 85, aloof: 70, nerve: 70, tempo: 0.95, latency: [15, 50],
            naps: { baguette: 30, crescent: 10, lounge: 25, flop: 15, loaf: 10, sphinx: 10 }, baseline: 'unimpressed', size: 1 },
};
BZ.COAT_PERSONALITY = { bo: 'bo', bunny: 'bunny', blue: 'velcro', redwhite: 'sprite', black: 'diva', tortie: 'diva', lilac: 'velcro' };

BZ.ADOPT_ORDER = ['bunny']; // Bunny comes next; the other rex coats unlock after her
BZ.NAMES = ['Mochi', 'Pickle', 'Noodle', 'Tofu', 'Juniper', 'Olive', 'Pepper', 'Miso', 'Fig', 'Basil', 'Moth', 'Pilot', 'Velvet', 'Crumb', 'Radish', 'Wren', 'Pip', 'Marcel', 'Quill', 'Biscotti'];
