// ─── Desktop Bo: character, attention, buddies, beds, loop ─────────────────
// Every cat runs the same machinery, but each decision is weighted by her
// personality and her drifting moods, and every stimulus is filtered through
// an interest level that rises and falls on its own. Two cats looking at the
// same thing should never move the same way.
var BZ = window.BZ || (window.BZ = {});
(function () {
  const FRAME = 33;
  const TURN = (6 / 256) * 2 * Math.PI * (FRAME / 45);    // read_out: 6/256 turn per 45ms frame
  const K = 0.6;
  const ri = (n) => Math.floor(Math.random() * n);
  const rr = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const wrap = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
  const dist = (a, b, c, d) => Math.hypot(c - a, d - b);
  const pick = (w) => { let s = 0; for (const k in w) s += Math.max(0, w[k] || 0); let r = Math.random() * s; for (const k in w) { r -= Math.max(0, w[k] || 0); if (r <= 0) return k; } return Object.keys(w)[0]; };

  const GAITS = { // ours. a = half stride, lift = paw height, stance = duty factor
    creep: { a: 5, lift: 1.3, stance: 0.74, offs: [0.25, 0.75, 0, 0.5], speed: 0.45, low: 1 },
    walk:  { a: 8.5, lift: 2.3, stance: 0.64, offs: [0.25, 0.75, 0, 0.5], speed: 1.1, low: 0 },
    brisk: { a: 9.5, lift: 2.8, stance: 0.58, offs: [0.25, 0.75, 0, 0.5], speed: 1.9, low: 0 },
    run:   { a: 13, lift: 5, stance: 0.38, offs: [0, 0.1, 0.5, 0.6], speed: 4.6, low: 0 },
  };
  const NAPPING = ['nap', 'bed'];
  const EDGY = ['pillow', 'ledge', 'daybed', 'seat', 'adk', 'cubby', 'ctable', 'stoop', 'tire']; // beds with an edge a leg can hang over
  const plantDef = (i) => BZ.PLANTS[i.type] || (i.type === 'sprout' && i.stage >= 2 ? BZ.GARDEN[i.kind] : null); // potted plants, and grown-up garden ones
  const BUSY = ['enter', 'statue', 'brawl', 'sunroll', 'scratch', 'held', 'flinch', 'pounce', 'land', 'eatTreat', 'eatBowl', 'petted', 'bedHop', 'zoom', 'startle', 'flee', 'chaseBuddy', 'react', 'skeptic'];
  BZ.BUSY = BUSY;

  class Cat {
    constructor(data, world) {
      this.w = world;
      this.id = data.id || 'c' + Date.now().toString(36) + ri(1e6).toString(36);
      this.name = data.name || 'Bo';
      this.coatKey = BZ.COATS[data.coat] ? data.coat : 'bo';
      this.coat = BZ.COATS[this.coatKey];
      this.persKey = data.pers && BZ.PERSONALITIES[data.pers] ? data.pers : BZ.COAT_PERSONALITY[this.coatKey] || 'bo';
      this.pers = BZ.PERSONALITIES[this.persKey];
      this.shape = this.pers.shape || null;
      this.tempo = this.pers.tempo || 1;
      this.spots = {};
      for (const s of this.coat.spots || []) { const n = Math.hypot(...s.dir) || 1; (this.spots[s.ball] = this.spots[s.ball] || []).push({ dir: s.dir.map((v) => v / n), size: s.size, color: s.color }); }
      this.eyes = { eyeL: { ix: 0, iy: 0 }, eyeR: { ix: 0, iy: 0 } };
      this.sweater = data.sweater || null;
      this.pose = BZ.clonePose(BZ.POSES.stand);
      this.x = data.x != null ? data.x : 100; this.y = data.y != null ? data.y : 100; this.theta = data.theta != null ? data.theta : 0;
      this.needs = Object.assign({ belly: 70, energy: 75, love: 65, greens: 50 }, data.needs || {});
      this.mood = Object.assign({ play: 0.35, grump: 0.1, cuddle: 0.45 }, data.mood || {});
      this.phi = data.phi != null ? data.phi : Math.random() * 6.28;
      this.ping = Math.random() * 1000; // personal phase for her ebb and flow
      this.t = ri(1000); this.st = 0; this.state = 'idle'; this.act = null; this.gait = null; this.phase = 0;
      this.blink = 0; this.nextBlink = 60 + ri(200); this.slowBlink = 0; this.sb = 0;
      this.mouthT = 0; this.boost = 0; this.enjoy = 0; this.lastStroke = -999; this.cool = {};
      this.interest = {}; this.bored = {}; this.noticed = {};
      this.tailMood = null; this.tailMoodT = 0; this.flickT = 0; this.earT = 0;
      this.stuck = 0; this.lastLeft = Infinity;
      const tt = BZ.tailTargets(this.pose, 0);
      this.tail = { el: tt.el.slice(), sd: tt.sd.slice(), ve: tt.el.map(() => 0), vs: tt.sd.map(() => 0) };
      this.lastTheta = this.theta; this.lastX = this.x; this.vel = 0; this.curV = 0; this.strideK = 1; this.leadYaw = 0; this.lookSweep = 1;
      this.updateScale();
      this.skel = BZ.buildSkeleton(this.pose, this.t, this.tail, this.shape);
    }
    updateScale() { this.petScale = this.ballScale = this.w.size * (this.pers.size || 1); }
    get isBo() { return this.coatKey === 'bo'; }
    get excitement() { // read_out: 100 * ((1 + sin(phi + pi t / 24000)) / 2) ^ ((100 - c) / 25)
      const t = Date.now() / 17, c = this.pers.energy;
      return clamp(100 * Math.pow((1 + Math.sin(this.phi + (Math.PI * t) / 24000)) / 2, (100 - c) / 25) * 0.6 + 15 + this.boost, 0, 100);
    }
    get buddy() { let b = null, bd = Infinity; for (const c of this.w.cats) if (c !== this) { const d = dist(c.x, c.y, this.x, this.y); if (d < bd) { bd = d; b = c; } } return b; }
    get asleep() { return NAPPING.includes(this.state) && !(this.placedT > 0) && (this.napPhase === 'sleep' || this.state === 'bed'); }
    get moodLabel() { // what the hover tag and the panel show: awake state + mood only
      if (this.asleep) return 'asleep';
      if (this.state === 'nap' || this.state === 'toBed' || this.state === 'bedHop' || this.placedT > 0) return 'settling in';
      if (this.state === 'wake') return 'waking up';
      const m = this.mood, n = this.needs;
      if (m.grump > 0.55) return 'grumpy';
      if (n.belly < 22) return 'hungry';
      if (this.state === 'engage' || this.state === 'chaseBuddy' || this.state === 'zoom' || m.play > 0.68) return 'playful';
      if (this.state === 'petted' || m.cuddle > 0.7) return 'cuddly';
      if (n.energy < 25) return 'drowsy';
      return this.pers.baseline;
    }
    serialize() { return { id: this.id, name: this.name, coat: this.coatKey, pers: this.persKey, phi: this.phi, x: Math.round(this.x), y: Math.round(this.y), theta: this.theta, needs: this.needs, mood: this.mood, sweater: this.sweater || undefined }; }

    setState(s) {
      if (this.state === 'enter' && s !== 'enter') this.hidden = false; // pulled out of the doorway early: she's visible
      if (!['toBed', 'bed', 'bedHop', 'pounce'].includes(s)) { this.inBed = null; this.clip = null; this.sortY = null; this.bedRoot = 0; this.releaseBed(); }
      if (s !== 'petted' && this.state === 'petted') this.w.sound.purr(this.id, false);
      if (s !== 'nap') { this.napSpot = null; this.cuddleWith = null; }
      if (s !== 'brawl') { this.fight = null; this.slam0 = null; }
      if (s !== 'bed' && s !== 'bedHop') { if (this.burrowed) this.unburrow(); this.bedPlan = null; this.boxDuck = 0; this.knock = null; }
      if (s !== 'lurk') this.lurkSpot = null;
      this.state = s; this.st = 0; this.gait = null; this.act = null; this.arrived = false; this.eating = false; this.mode = null; this.bats = 0; this.lastBat = 0;
      this.stuck = 0; this.lastLeft = Infinity; this.comeT = 0; this.refollow = 0; this.swat = 0; this.hopY = 0; this.freezeT = this.skidT = this.kickT = this.tossT = this.crabT = this.wallT = 0; this.wiggle = 0; this.licking = false; this.chew = false;
    }
    releaseBed() { for (const it of this.w.items) if (it.occupant === this.id) { it.occupant = null; it.dangle = null; } }
    say(kind) {
      const S = this.w.sound, p = this.isBo ? 0.86 : this.persKey === 'bunny' ? 1.3 : 1.05, rasp = this.isBo ? 0.1 : 0.03;
      if (kind === 'meow') { S.meow(p * rr(0.94, 1.08), this.isBo ? 0.62 : 0.48, rasp); this.mouthT = 12; }
      else if (kind === 'mew') { S.mew(p * rr(0.95, 1.08), rasp); this.mouthT = 6; }
      else if (kind === 'chirp') { S.chirp(p); this.mouthT = 5; }
      else if (kind === 'trill') { S.trill(p * rr(0.95, 1.05), rasp); this.mouthT = 8; }
      else if (kind === 'hiss') { S.hiss(); this.mouthT = 16; }
      else if (kind === 'chatter') { S.chatter(p); this.mouthT = 14; }
    }
    setTail(kind, T) { this.tailMood = kind; this.tailMoodT = T; }

    // ── movement. Fix for circling: inside her turning circle she pivots on
    //    the spot instead of orbiting, and she gives up if she stops gaining ──
    steer(tx, ty, gaitName, speedMul = 1) {
      const g = GAITS[gaitName];
      const want = Math.atan2((ty - this.y) / K, tx - this.x), d = wrap(want - this.theta);
      const left = dist(this.x, this.y, tx, ty);
      const amble = gaitName === 'walk' ? 1 + 0.14 * Math.sin(this.t * 0.017 + this.ping) : 1; // she dawdles, then carries on
      let vt = g.speed * this.petScale * speedMul * amble * (0.85 + 0.15 * this.tempo);
      const turnR = Math.max(vt, this.curV) / TURN;
      if (left < turnR * 1.8 && Math.abs(d) > 0.45) { // pivot: short shuffling steps on the spot, head leads
        this.theta = wrap(this.theta + clamp(d, -TURN * 1.2, TURN * 1.2)); this.gait = 'walk'; this.strideK = 0.3; this.phase += 0.03;
        this.curV *= 0.8; this.leadYaw = clamp(d * 40, -35, 35);
        return left <= Math.max(4, vt + 2);
      }
      this.theta = wrap(this.theta + clamp(d, -TURN * (gaitName === 'run' ? 0.85 : 1), TURN));
      this.leadYaw = clamp(d * 50, -30, 30); // the head turns into the curve before the body does
      if (Math.abs(d) > 1.0) vt *= 0.35;
      if (gaitName !== 'run') vt = Math.min(vt, (0.3 + left * 0.06) * this.petScale); // ease into the stop
      this.curV += (vt - this.curV) * (gaitName === 'run' ? 0.16 : 0.07);
      const v = Math.min(this.curV, left);
      this.x += v * Math.cos(this.theta); this.y += v * Math.sin(this.theta) * K;
      const vs = v / this.petScale;
      this.gait = gaitName; this.strideK = clamp(vs / g.speed, 0.35, 1.1);
      this.phase += (g.stance * (vs + 0.05)) / (2 * g.a * this.strideK);
      this.needs.energy = Math.max(0, this.needs.energy - (gaitName === 'run' ? 0.03 : 0.006));
      this.clampToStage();
      if (left > this.lastLeft - 0.03) this.stuck++; else this.stuck = 0;
      this.lastLeft = left;
      if (this.stuck > 50) { this.stuck = 0; this.lastLeft = Infinity; return true; }
      return left <= Math.max(3, v + 2);
    }
    turnToward(angle, rate = 0.8) {
      const d = wrap(angle - this.theta);
      if (Math.abs(d) < 0.06) { this.gait = null; return true; }
      this.theta = wrap(this.theta + clamp(d, -TURN * rate, TURN * rate)); this.gait = 'walk'; this.strideK = 0.3; this.phase += 0.03; this.leadYaw = clamp(d * 40, -35, 35); return false;
    }
    faceViewer() { return this.turnToward(Math.PI / 2); }
    angleTo(x, y) { return Math.atan2((y - this.y) / K, x - this.x); }
    front(k = 28) { return [this.x + Math.cos(this.theta) * k * this.petScale, this.y + Math.sin(this.theta) * k * this.petScale * K]; }
    clampToStage() {
      const st = this.w.stage, m = 18 * this.petScale;
      this.x = clamp(this.x, st.x + m, st.x + st.w - m); this.y = clamp(this.y, Math.max(st.y + 46 * this.petScale, this.w.floorTop), st.y + st.h - 4);
    }
    newTarget() {
      const st = this.w.stage, m = 30, top = this.w.floorTop + 6, bot = st.y + st.h - 8;
      const need = Math.min(220, Math.hypot(st.w - 2 * m, bot - top) / 2 - 25);
      for (let i = 0; i < 40; i++) { const tx = st.x + m + Math.random() * (st.w - 2 * m), ty = top + Math.random() * (bot - top); if (dist(this.x, this.y, tx, ty) >= need) return [tx, ty]; }
      return [st.x + st.w / 2, (top + bot) / 2];
    }
    reachSpot(it, reach) { const side = this.x < it.x ? 1 : -1; return [it.x - side * reach * this.petScale, it.y + 2]; }

    // ── per frame ──
    think() {
      const n = this.needs, m = this.mood, p = this.pers;
      this.t++; this.st++;
      if (this.boost > 0) this.boost -= 0.02;
      for (const k in this.cool) if (this.cool[k] > 0) this.cool[k]--;
      const napping = NAPPING.includes(this.state);
      n.energy = clamp(n.energy + (napping ? 0.035 * (0.6 + p.sleepy / 100) : -0.0035 * (0.6 + p.sleepy / 100)), 0, 100);
      n.belly = clamp(n.belly - 0.0012, 0, 100);
      n.love = clamp(n.love - 0.0018, 0, 100);
      n.greens = clamp(n.greens + 0.0025 * (p.grass / 100), 0, 100);
      // moods drift on their own, pulled by needs; events push them around
      const wob = Math.sin(this.t * 0.0021 + this.ping) * 0.5 + Math.sin(this.t * 0.0007 + this.ping * 2) * 0.5;
      m.play += ((n.energy / 100) * 0.45 + this.excitement / 250 + wob * 0.15 - m.play) * 0.0008;
      m.grump += (0.08 + (n.belly < 20 ? 0.2 : 0) - m.grump) * 0.0012;
      m.cuddle += ((100 - n.love) / 150 + p.affection / 300 + wob * 0.08 - m.cuddle) * 0.0006;
      for (const k in m) m[k] = clamp(m[k], 0, 1);
      if (this.mouthT > 0) this.mouthT--;
      if (--this.nextBlink <= 0) { this.blink = 3; this.nextBlink = 70 + ri(220); }
      if (this.blink > 0) this.blink--;
      if (this.tailMoodT > 0 && --this.tailMoodT === 0) this.tailMood = null;
      if (this.flickT > 0) this.flickT--;
      if (this.earT > 0) this.earT--;
      if (this.sb > 0) { this.sb--; const u = 34 - this.sb; this.slowBlink = u < 12 ? u / 12 : u < 22 ? 1 : (34 - u) / 12; } else this.slowBlink = 0;
      this.lookAt = null; this.perk = 0;
      if (!napping) this.perceive();
      if (!BUSY.includes(this.state)) this.checkWorld();
      const fn = this['s_' + this.state];
      if (fn) fn.call(this); else this.setState('idle');
    }

    // attention: interest in each moving thing rises and falls; she only
    // commits when it crosses her own threshold
    perceive() {
      const p = this.pers, w = this.w;
      for (const s of w.stimuli) {
        const d = dist(this.x, this.y, s.x, s.y) / this.petScale;
        const sal = clamp(s.speed / 7, 0, 1) * 0.7 + (d < 160 ? 0.3 : d < 320 ? 0.15 : 0.05) * (s.speed < 0.5 ? 0.35 : 1);
        if (this.noticed[s.key] !== true) { // reaction latency: she has to notice it first
          if (this.noticed[s.key] == null) this.noticed[s.key] = -(p.latency ? rr(p.latency[0], p.latency[1]) : 20);
          if (sal > 0.25) this.noticed[s.key] += 1;
          if (this.noticed[s.key] < 0) continue;
          this.noticed[s.key] = true; this.earT = 8;
        }
        let I = this.interest[s.key] || 0;
        const gain = sal * (0.25 + p.curious / 100) * (0.35 + this.mood.play) * 0.02 * this.tempo * (this.needs.energy < 20 ? 0.4 : 1);
        const bored = this.bored[s.key] || 0; // the same toy gets old; it comes back fresh after a while
        const loss = 0.0038 * (0.5 + p.aloof / 100) * (1 + this.mood.grump) + bored * 0.012 + (this.needs.energy < 15 ? 0.006 : 0);
        const ebb = 0.0035 * Math.sin(this.t * 0.011 + this.ping + s.key.length);
        I = clamp(I + gain - loss + ebb, 0, 1);
        this.interest[s.key] = I;
        if (I > 0.15) { this.lookAt = [s.x, s.y]; this.perk = I; }
      }
      for (const k in this.bored) { this.bored[k] = this.state === 'engage' && this.eng === k ? Math.min(1, this.bored[k] + 0.0011 * (0.6 + p.aloof / 100)) : this.bored[k] * 0.9994; }
      if (this.state === 'engage' && this.eng && !(this.eng in this.bored)) this.bored[this.eng] = 0;
      if (this.state === 'engage') this.needs.energy = Math.max(0, this.needs.energy - 0.004);
      for (const k in this.interest) if (!w.stimuli.find((s) => s.key === k)) { this.interest[k] *= 0.97; if (this.interest[k] < 0.01) { delete this.interest[k]; delete this.noticed[k]; } }
    }
    checkWorld() {
      const w = this.w, s = this.state;
      if (w.carrying && BZ.ITEMS[w.carrying] && BZ.ITEMS[w.carrying].snack) { if (s === 'bed') this.exitBed(); else if (s !== 'beg' && s !== 'bedHop') this.setState('beg'); return; }
      if (w.callT > 0 && s !== 'come') {
        if (s === 'bed') this.exitBed();
        else if (s !== 'bedHop' && !(NAPPING.includes(s) && this.pers.aloof > 70 && this.callIgnored !== w.callId && (this.callIgnored = w.callId) && ri(2))) this.setState('come');
        return;
      }
      if (NAPPING.includes(s) || ['toBed', 'wake', 'engage', 'groomBuddy', 'ambush'].includes(s)) return;
      const th = 0.36 + this.pers.aloof / 260 + (this.needs.energy < 30 ? 0.18 : 0) + this.mood.grump * 0.15;
      let best = null;
      for (const st of w.stimuli) { const I = this.interest[st.key] || 0; if (I > th && (!best || I > best.I)) best = { key: st.key, I }; }
      if (best && ['idle', 'wander', 'come', 'visit', 'follow'].includes(s)) { this.setState('engage'); this.eng = best.key; this.modeT = 0; return; }
      const treat = w.items.find((i) => BZ.ITEMS[i.type].snack && !i.held && !i.claimed);
      if (treat && s !== 'eatTreat' && w.nearestCat(treat.x, treat.y, (c) => c.state !== 'held' && !c.inBed) === this) { treat.claimed = this.id; this.setState('eatTreat'); this.food = treat; }
    }

    pickActivity() {
      const p = this.pers, w = this.w, n = this.needs, m = this.mood, e = this.excitement, has = (t) => w.items.find((i) => i.type === t && !i.held && !i.lift);
      const sleepPull = Math.pow((100 - n.energy) / 100, 1.6) * p.sleepy * 0.7 * (w.items.some((i) => i.type === 'sun') ? 1.8 : 1);
      const wts = {
        perch: 10, stand: 3 + p.energy / 20, stare: 2 + p.affection / 14 + (w.pointer.inside ? 3 : 0), groom: 7 + m.grump * 4, stretch: 2, yawn: 1 + p.sleepy / 40,
        loaf: 3 + p.sleepy / 14, sphinx: 2 + p.sleepy / 25, knead: 1 + m.cuddle * 3, wander: 4 + p.energy / 6 + e / 12, meow: p.chatty / 20, nap: sleepPull,
      };
      if (n.love < 70 && w.pointer.inside) wts.seek = ((100 - n.love) / 9) * (p.affection / 60) * (0.5 + m.cuddle);
      const grass = has('grass'); if (grass && grass.servings > 0) wts.grass = (n.greens / 5) * (p.grass / 50);
      const nip = has('catnip'); if (nip && nip.servings > 0 && !this.cool.nip) wts.catnip = 2 + p.curious / 18;
      const sp = has('spider'); if (sp && sp.servings > 0) wts.spider = 1 + p.curious / 20 + n.greens / 30;
      const bowl = has('bowl'); if (bowl && bowl.servings > 0 && n.belly < 55) wts.eat = (60 - n.belly) * 0.8;
      if (w.scene) { const bs = w.scene.birdSpot && w.scene.birdSpot(); wts.chatter = (bs ? 10 : 0.6) + p.chatty / 30; const L = w.items.find((i) => i.type === 'ledge' && !i.occupant); if (L) wts.ledge = 1 + p.curious / 50 + (bs ? 7 : 0); } // a pigeon at the feeder: up on the sill to chatter at it
      wts.scratch = 1.4 + p.energy / 40 + (this.justWoke ? 6 : 0); // the wall stretch (and a good scratch)
      const plants = w.items.filter((i) => plantDef(i) && !i.held && !i.lift);
      const gGrass = w.items.find((i) => i.type === 'sprout' && i.stage >= 3 && i.kind === 'catgrass' && i.servings > 0); if (gGrass) wts.gardenGrass = (n.greens / 5) * (p.grass / 50) + 1; // her grass, growing in the ground
      if (w.scene && w.scene.statueSpot) wts.statue = this.persKey === 'bunny' ? 1.6 + p.curious / 60 : 0.3; // two bunnies
      if (plants.length) wts.plant = (1.2 + p.curious / 30 + n.greens / 40) * Math.min(2.5, 0.6 + plants.length * 0.35);
      const hides = w.items.filter((i) => !i.held && !i.lift && (i.type === 'ctable' || (BZ.PLANTS[i.type] && BZ.PLANTS[i.type].hide)));
      if (hides.length) wts.lurk = 1 + m.play * 2 + (p.sass / 50);
      if (w.inSun(this.x, this.y) && n.energy > 30) wts.sunroll = (m.cuddle + m.play) * 3;
      const fresh = w.items.find((i) => BZ.ITEMS[i.type].box && !i.occupant && !i.lift && w.frame - (i.placedAt || -1e9) < 5400); if (fresh) wts.boxIn = 14; // if she fits
      const softs = w.items.find((i) => (i.type === 'pillow' || i.type === 'blanket') && !i.occupant && !i.lump); if (softs && m.cuddle > 0.4) wts.biscuits = 1.5 + m.cuddle * 3;
      if (e > 65 && p.energy > 45) wts.zoom = 1.5 * m.play;
      const b = this.buddy;
      if (b && b.asleep && w.inSun(b.x, b.y)) { const rel = w.rel(this, b); if (rel.tension < 0.5) wts.nap += 16 * rel.bond * (n.energy < 90 ? 1 : 0.4); } // the comfort zone
      if (b) {
        const rel = w.rel(this, b), bRest = ['nap', 'bed', 'idle'].includes(b.state);
        wts.visit = (p.affection / 30) * rel.bond * (1 - rel.tension) * (b.state === 'nap' ? 0.4 : 1);
        if (bRest && rel.bond > 0.55 && rel.tension < 0.5 && !b.inBed) wts.groomBuddy = (p.affection / 40) * rel.bond * (0.5 + m.cuddle);
        if (!b.asleep && !BUSY.includes(b.state) && !b.inBed) wts.ambush = m.play * (n.energy / 60) * (p.sass / 100 + 0.35) * 3;
        if (p.affection > 80 && b.state === 'wander') wts.follow = 6;
        // play-fighting: the feisty one starts it; it's play, so it rides on bond, not tension
        if (b.burrowed) wts.lumpHunt = (m.play * 3 + 0.5) * (p.sass / 50 + 0.5) * (n.energy / 60);
        if (!b.asleep && !BUSY.includes(b.state) && !b.inBed && n.energy > 35 && rel.tension < 0.6) wts.brawl = m.play * (n.energy / 70) * (p.sass / 50) * rel.bond * 6;
      }
      return pick(wts);
    }

    s_idle() {
      if (!this.act || this.act.T <= 0) {
        const k = this.pickActivity(), b = this.buddy;
        const go = {
          nap: () => this.startNap(),
          wander: () => this.setState('wander'),
          seek: () => this.setState('come'),
          grass: () => this.startGraze('grass'), catnip: () => this.startGraze('catnip'), spider: () => this.startGraze('spider'),
          eat: () => { this.setState('eatBowl'); this.food = this.w.items.find((i) => i.type === 'bowl'); },
          zoom: () => this.setState('zoom'),
          visit: () => { this.setState('visit'); this.mate = b; },
          groomBuddy: () => { this.setState('groomBuddy'); this.mate = b; },
          ambush: () => { this.setState('ambush'); this.mate = b; },
          follow: () => { this.setState('follow'); this.mate = b; },
          ledge: () => { const L = this.w.items.find((i) => i.type === 'ledge' && !i.occupant); if (!L) { this.setState('idle'); return; } L.occupant = this.id; this.setState('toBed'); this.bedItem = L; },
          boxIn: () => { const B = this.w.items.find((i) => BZ.ITEMS[i.type].box && !i.occupant && !i.lift); if (!B) { this.setState('idle'); return; } B.occupant = this.id; this.setState('toBed'); this.bedItem = B; },
          biscuits: () => { const S = this.w.items.find((i) => (i.type === 'pillow' || i.type === 'blanket') && !i.occupant && !i.lump); if (!S) { this.setState('idle'); return; } S.occupant = this.id; this.setState('toBed'); this.bedItem = S; },
          scratch: () => this.startScratch(),
          plant: () => this.startPlant(),
          gardenGrass: () => { const g = this.w.items.filter((i) => i.type === 'sprout' && i.stage >= 3 && i.kind === 'catgrass' && i.servings > 0); if (g.length) this.startPlant(g[ri(g.length)]); else this.setState('idle'); },
          statue: () => { this.setState('statue'); this.statT = rr(260, 520) | 0; },
          lurk: () => this.startLurk(),
          sunroll: () => { this.setState('sunroll'); },
          lumpHunt: () => { this.setState('ambush'); this.mate = b; },
          brawl: () => { this.setState('brawl'); this.fight = { a: this, b, phase: 'approach', t: 0, rounds: 1 + ri(3) }; this.mate = b; },
        }[k];
        if (go) { go(); return; }
        const T = { perch: rr(80, 170), stand: rr(50, 110), stare: rr(110, 220), groom: rr(100, 190), stretch: 116, yawn: 38, loaf: rr(220, 520), sphinx: rr(200, 420), knead: rr(90, 150), meow: 40, chatter: rr(80, 130) }[k];
        this.act = { kind: k, T: (T / this.tempo) | 0, t0: this.t }; if (k === 'groom') this.groomKind = pick({ paw: 4, cello: 2 + (this.isBo ? 1 : 0), flank: 2 });
        this.lookSweep = ri(2) ? 1 : -1;
        if (k === 'meow') this.say(this.needs.belly < 40 ? 'meow' : ri(3) ? 'meow' : 'trill');
        if (k === 'chatter') { const bs = this.w.scene && this.w.scene.birdSpot && this.w.scene.birdSpot(); this.chatterX = bs ? bs[0] : this.w.stage.x + this.w.stage.w * 0.85; }
      }
      const a = this.act, w = this.w, p = w.pointer; a.T--;
      const near = p.inside && dist(p.x, p.y, this.x, this.y) < 220 * w.size;
      this.anim = 'sit';
      switch (a.kind) {
        case 'stand': this.anim = 'stand'; if (near) this.lookAt = this.lookAt || [p.x, p.y]; else this.lookAt = this.lookAt || [this.x + Math.cos(this.t * 0.03) * 200 * this.lookSweep, this.y - 50]; break;
        case 'perch': if (near) this.lookAt = this.lookAt || [p.x, p.y]; else if ((this.t >> 6) % 3 === 0) this.lookAt = this.lookAt || [this.x + 300 * this.lookSweep, this.y - 90]; break;
        case 'stare': this.faceViewer(); if (p.inside) this.lookAt = [p.x, p.y]; if (near && this.sb === 0 && ri(120) === 0) this.sb = 34; break;
        case 'groom': if (this.groomFor !== a) { this.groomFor = a; this.groomKind = pick({ paw: 4, cello: 2 + (this.isBo ? 1 : 0), flank: 2 }); } this.anim = 'groom'; break;
        case 'stretch': this.anim = 'stretch'; break;
        case 'yawn': this.yawn = a.T > 4; break;
        case 'loaf': this.anim = 'loaf'; if (this.needs.energy < 40 && a.T < 10) { this.startNap(null, 'loaf'); return; } break;
        case 'sphinx': this.anim = 'sphinx'; if (near) this.lookAt = this.lookAt || [p.x, p.y]; break;
        case 'knead': this.anim = 'knead'; break;
        case 'meow': this.faceViewer(); if (p.inside) this.lookAt = [p.x, p.y]; break;
        case 'chatter': { const bs = w.scene && w.scene.birdSpot && w.scene.birdSpot(); if (bs) this.chatterX = bs[0]; this.turnToward(this.angleTo(this.chatterX, this.y - 40)); this.lookAt = bs || [this.chatterX, w.stage.y + w.stage.h * 0.2]; } this.perk = 0.8; if (a.T % 45 === 20) this.say('chatter'); this.jaw = this.mouthT > 0; break;
      }
      if (a.kind !== 'yawn') this.yawn = false;
      if (a.kind !== 'chatter') this.jaw = false;
    }
    s_wander() {
      if (this.st === 1) { this.target = this.newTarget(); this.wg = this.excitement > 60 && ri(3) === 0 ? 'brisk' : 'walk'; }
      if (this.steer(this.target[0], this.target[1], this.wg)) this.setState('idle');
      this.anim = 'stand';
    }

    // ── naps ──
    startNap(target, style) {
      const w = this.w, b = this.buddy, p = this.pers, opts = {};
      const freeSlots = (s) => s.slots.filter((sl) => !w.cats.some((c) => c !== this && c.napSpot && dist(c.napSpot[0], c.napSpot[1], sl[0], sl[1]) < 5));
      if (!target) {
        w.items.forEach((it, i) => { if (BZ.ITEMS[it.type].bed && !it.held && !it.occupant && !it.dogOn) opts['bed:' + i] = { pod: this.isBo ? 5 : 3, pillow: 5, blanket: 6, box: 3 + (w.frame - (it.placedAt || -1e9) < 5400 ? 6 : 0), bag: 3.5 + (w.frame - (it.placedAt || -1e9) < 5400 ? 6 : 0), lamptable: 6 + (BZ.isNight() ? 3 : 0), ledge: 2.5, daybed: 7, seat: 7, ctable: 3.5, adk: 7, stoop: 3, tire: 4, cubby: this.isBo ? 7 : 4, dogbed: this.isBo ? 0 : 5 }[it.type] ?? 3.5; if (it.dogSeat) opts['bed:' + i] = this.isBo ? 0 : 4; }); // the cushion beside Juno: Bunny sometimes, Bo never
        if (b && b.asleep && b.bedItem && ['daybed', 'adk', 'lamptable', 'seat'].includes(b.bedItem.type)) { const sib = b.bedItem.type !== 'seat' ? w.items.find((i) => i.type === 'seat' && i.parent === b.bedItem) : b.bedItem.parent; const si = w.items.indexOf(sib); if (sib && si >= 0 && !sib.occupant && !sib.dogOn) opts['bed:' + si] = 16 * w.rel(this, b).bond; } // she's on the daybed: join her
        w.sunSpots().forEach((s, i) => { if (freeSlots(s).length) opts['sun:' + i] = (s.item ? 6 : s.yard ? 5 : 2.5) * (0.6 + p.sleepy / 100); });
        if (b && b.asleep && !b.inBed) { const rel = w.rel(this, b); if (rel.bond > 0.55 && rel.tension < 0.4) opts.buddy = 4 * rel.bond; }
        const sunB = b && b.asleep && !b.inBed && w.inSun(b.x, b.y) && w.rel(this, b).tension < 0.5;
        if (sunB) opts.sunBuddy = 14 * w.rel(this, b).bond;
        opts.floor = 1.5;
        const k = pick(opts);
        if (k.startsWith('bed:')) { const it = w.items[+k.slice(4)]; it.occupant = this.id; this.setState('toBed'); this.bedItem = it; return; }
        if (k.startsWith('sun:')) { const f = freeSlots(w.sunSpots()[+k.slice(4)]); target = f[ri(f.length)]; style = style || pick({ flop: 5, lounge: 4, baguette: 3, crescent: 1 }); }
        else if (k === 'sunBuddy') { // a slot in the same sunbeam, right beside her, mirroring her shape
          const all = w.sunSpots().flatMap((sp) => freeSlots(sp)); all.sort((u, v) => dist(u[0], u[1], b.x, b.y) - dist(v[0], v[1], b.x, b.y));
          const sl = all[0], side = sl && sl[0] < b.x ? -1 : 1; target = sl && dist(sl[0], sl[1], b.x, b.y) < 70 * this.petScale ? sl : [b.x + side * 28 * this.petScale, b.y + rr(-2, 2)];
          style = style || (['flop', 'lounge', 'baguette'].includes(b.napStyle) ? b.napStyle : pick({ flop: 3, lounge: 3, crescent: 1 })); var cuddle = b;
        }
        else if (k === 'buddy') { const side = ri(2) ? 1 : -1; target = [b.x + side * 26 * this.petScale, b.y + rr(-3, 3)]; style = style || pick({ crescent: 3, loaf: 2, baguette: 1 }); var cuddle = b; }
      }
      this.setState('nap');
      this.cuddleWith = cuddle || null;
      this.napSpot = target || null; this.napPhase = target ? 'go' : 'circle'; this.napStyle = style || pick(this.pers.naps);
      this.napLen = rr(2200, 4800); this.nextShift = rr(500, 1100);
      // she settles side-on so her shape reads; next to a buddy she matches or mirrors them
      this.napGoal = Math.cos(this.theta) > 0 ? rr(-0.35, 0.35) : Math.PI + rr(-0.35, 0.35);
      if (this.cuddleWith) this.napGoal = wrap(this.cuddleWith.theta + (ri(2) ? Math.PI : 0) + rr(-0.3, 0.3));
    }
    s_nap() {
      const n = this.needs;
      if (this.napPhase === 'go') { this.anim = 'stand'; if (this.steer(this.napSpot[0], this.napSpot[1], 'walk') || this.st > 600) { this.napPhase = 'circle'; this.st = 0; } return; }
      if (this.napPhase === 'circle') {
        this.gait = 'walk'; this.phase += 0.04; this.anim = 'stand';
        if (this.st < 28) this.theta = wrap(this.theta + 0.12);
        else if (this.turnToward(this.napGoal, 1.4) || this.st > 90) { this.napPhase = 'knead'; this.st = 0; this.gait = null; }
        return;
      }
      if (this.napPhase === 'knead') { this.anim = this.st < 24 && this.mood.cuddle > 0.4 ? 'knead' : 'loaf'; if (this.st > 50) { this.napPhase = 'sleep'; this.st = 0; } return; }
      if (this.napPhase === 'settle') { this.anim = 'loaf'; if (this.st > 30) { this.napPhase = 'sleep'; this.st = 0; } return; }
      this.anim = this.napStyle;
      if (ri(260) === 0) this.flickT = 18;
      if (ri(420) === 0) this.earT = 10;
      if (--this.nextShift <= 0) { this.nextShift = rr(600, 1300); if (ri(2)) { const prev = this.napStyle; this.napStyle = this.w.inSun(this.x, this.y) ? pick({ flop: 4, lounge: 3, baguette: 2, crescent: 1 }) : pick(this.pers.naps); if (prev !== this.napStyle) this.flickT = 20; } }
      const cz = this.cuddleWith && this.cuddleWith.asleep && this.w.inSun(this.x, this.y) && this.st < this.napLen * 1.7; // nobody leaves the sun first
      if (!cz && ((n.energy > 97 && this.st > 600) || this.st > this.napLen)) this.setState('wake');
    }
    s_wake() { this.anim = this.st < 20 ? 'loaf' : this.st < 132 ? 'stretch' : 'sit'; this.yawn = this.st > 140 && this.st < 172; if (this.st > 200) { this.yawn = false; this.justWoke = ri(3) === 0; this.setState('idle'); } }

    // ── beds (pod, armchair) ──
    s_toBed() {
      const it = this.bedItem; if (!it || it.gone || it.held) { this.startNap(); return; }
      const g = BZ.bedGeom(it, this.w.size);
      if (!this.arrived) { if (this.steer(g.front[0], g.front[1], 'walk')) { this.arrived = true; this.st = 0; } this.anim = 'stand'; if (this.st > 900) this.startNap(); return; }
      this.anim = 'crouch';
      if (!this.turnToward(this.angleTo(g.spot[0], g.spot[1] - 40), 1.2) && this.st < 40) return;
      this.hop(g.spot[0], g.spot[1], true, g);
    }
    hop(tx, ty, into, g) {
      this.hz = { x0: this.x, y0: this.y, x1: tx, y1: ty, into, n: 14, r0: this.bedRoot || 0, r1: into ? g.rootPx / this.petScale : 0, arc: (g.clip ? 28 : 16) * this.w.size / this.petScale };
      this.clip = null; this.sortY = this.bedItem ? this.bedItem.y + 2 : null; this.inBed = null;
      this.state = 'bedHop'; this.st = 0; this.gait = null;
    }
    s_bedHop() {
      const z = this.hz, it = this.bedItem; if (!it || it.gone) { this.setState('idle'); return; }
      const u = clamp((this.st - 4) / z.n, 0, 1), g = BZ.bedGeom(it, this.w.size);
      if (this.st <= 4) { this.anim = 'crouch'; return; }
      this.x = z.x0 + (z.x1 - z.x0) * u; this.y = z.y0 + (z.y1 - z.y0) * u;
      this.bedRoot = z.r0 + (z.r1 - z.r0) * u;
      this.pose.rootY = this.bedRoot + z.arc * Math.sin(Math.PI * u);
      this.anim = 'leap';
      if (u >= 1) {
        if (z.into) { this.state = 'bed'; this.st = 0; this.inBed = it; this.theta = g.face; this.sortY = g.sortY; this.clip = g.clip; this.napStyle = it.type === 'pod' ? (ri(3) ? 'crescent' : 'loaf') : pick({ crescent: 3, loaf: 2, baguette: 1, sphinx: 1, dangle: EDGY.includes(it.type) ? (this.isBo ? 2.5 : 1.2) : 0 }); this.napLen = rr(2400, 5200); this.nextShift = rr(600, 1200); }
        else { it.occupant = null; this.bedRoot = 0; this.pose.rootY = 0; this.sortY = null; this.setState('idle'); }
      }
    }
    // what she does in this particular bed before (or instead of) sleeping
    planBed(it) {
      const p = this.pers, D = BZ.ITEMS[it.type] || {}, tired = this.needs.energy < 62, P = {};
      if (it.type === 'ledge' || it.type === 'stoop' || it.type === 'tire') { P.watch = rr(380, 900) | 0; if (!tired) this.napLen = P.watch + 20; if (it.type === 'tire') it.av = (it.av || 0) + 0.012; }
      else if (D.box) { P.peek = rr(260, 700) | 0; if (!tired) this.napLen = P.peek + 30; }
      if (D.soft || it.type === 'seat' || it.type === 'pod') P.knead = p.affection > 40 || this.mood.cuddle > 0.5 ? rr(70, 160) | 0 : rr(0, 40) | 0; // biscuits
      if (it.type === 'blanket' && Math.random() < 0.25 + p.curious / 200) P.burrow = true;
      P.end1 = P.watch || P.peek || 0; P.end2 = P.end1 + (P.knead || 0);
      return P;
    }
    s_bed() {
      const it = this.bedItem; if (!it || it.gone || it.held) { this.unburrow(); this.setState('idle'); return; }
      const g = BZ.bedGeom(it, this.w.size), w = this.w;
      this.x = g.spot[0]; this.y = g.spot[1]; this.clip = g.clip; this.sortY = g.sortY; this.bedRoot = g.rootPx / this.petScale;
      if (this.placedT > 0) { this.placedT--; this.anim = this.placedT > 45 ? 'sit' : 'loaf'; this.napPhase = 'settle'; return; }
      if (!this.bedPlan || this.bedPlan.it !== it) { this.bedPlan = this.planBed(it); this.bedPlan.it = it; }
      const P = this.bedPlan, st = this.st;
      if (!this.knock && st > 60 && st < Math.max(P.end2, 400) + 900 && (it.type === 'ctable' || it.type === 'ledge' || it.type === 'stoop') && ri(this.pers.sass > 60 ? 160 : 380) === 0) { // something on her table. she looks at you. she pushes it off.
        const tgt = w.items.find((i) => i.lift && !i.held && i.surf === (it.surf || (it.type === 'ledge' ? 'sill' : 'ctable')) && Math.abs(i.x - this.x) < 40 * w.size);
        if (tgt) { this.knock = { it: tgt, t: 0, side: tgt.x < this.x ? -1 : 1 }; this.say(ri(2) ? 'trill' : 'chirp'); }
      }
      if (this.knock) {
        const K = this.knock; K.t++; this.napPhase = 'knock'; this.anim = 'sit'; this.perk = 0.9;
        this.lookAt = K.t < 18 || (K.t > 34 && K.t < 46) ? [w.pointer.x, w.pointer.y] : [K.it.x, K.it.y - (K.it.lift || 0) - 4]; // the look back at you first
        this.swatSide = K.side > 0 ? 1 : 0; this.swat = K.t > 46 && K.t < 96 ? Math.min(1, (K.t - 46) / 14) * (K.t % 16 < 11 ? 1 : 0.55) : 0;
        if (K.t === 84 && K.it.lift && !K.it.held) w.knockOff(K.it, K.side);
        if (K.t > 84) this.lookAt = [K.it.x, K.it.y - 4];
        if (K.t > 130) { this.knock = null; this.swat = 0; if (ri(2)) this.tailGesture('flick'); }
        return;
      }
      if (P.watch && st < P.end1) { // up on the sill, looking out; chattering if the pigeon's there
        const bs = w.scene && w.scene.birdSpot && w.scene.birdSpot();
        this.napPhase = 'watch'; this.anim = st < 30 ? 'crouch' : 'sit'; this.theta = g.face + Math.sin(st * 0.004) * 0.25;
        this.lookAt = bs || [this.x + Math.sin(st * 0.01) * 80, this.y - g.rootPx - 60]; this.perk = bs ? 0.9 : 0.4;
        if (bs && st % 50 === 20) this.say('chatter'); this.jaw = !!bs && this.mouthT > 0; if (bs && ri(200) === 0) this.tailGesture('twitch');
        return;
      }
      this.jaw = false;
      if (P.peek && st < P.end1) { // the periscope: up, look about, duck down, pop up again
        this.napPhase = 'peek'; this.anim = 'sit'; this.boxDuck = (Math.sin(st * 0.018) > 0.55 ? 1 : 0) * 0.6 + (Math.sin(st * 0.05) > 0.92 ? 0.4 : 0);
        this.lookAt = [this.x + Math.sin(st * 0.013 + this.ping) * 120, this.y - 30]; this.perk = 0.6;
        const b = this.buddy;
        if (b && !b.asleep && !BUSY.includes(b.state) && !b.inBed && dist(b.x, b.y, this.x, this.y) < 90 * this.petScale && this.mood.play > 0.35 && ri(50) === 0) { // AMBUSH
          this.boxDuck = 0; this.setState('idle'); this.mate = b; this.startPounce(b.x - Math.cos(this.angleTo(b.x, b.y)) * 18 * this.petScale, b.y, 'ambushLand', 'arc'); return;
        }
        return;
      }
      this.boxDuck = 0;
      if (P.knead && st < P.end2) { this.napPhase = 'knead'; this.anim = 'knead'; this.lidT = 0.7; if (st % 120 === 30) w.sound.purr(this.id, true); if (st === P.end2 - 1) w.sound.purr(this.id, false); return; }
      if (P.burrow && !this.burrowed) this.burrow(it);
      if (this.burrowed) this.tickBurrow(it);
      this.anim = st < P.end2 + 40 ? 'loaf' : this.napStyle; this.napPhase = 'sleep';
      if (it.type === 'cubby') { const c = this.coat.colors; it.dangle = this.anim === 'dangle' ? { leg: BZ.color(c.leg || c.limb || c.coat), paw: BZ.color(c.paw || c.leg || c.coat), outline: BZ.color(this.coat.outline) || '#3a3030' } : null; }
      if (ri(300) === 0) this.earT = 10;
      if (ri(280) === 0) this.flickT = 16;
      if (--this.nextShift <= 0) { this.nextShift = rr(700, 1400); this.napStyle = BZ.ITEMS[it.type].box ? (this.napStyle === 'crescent' ? 'loaf' : 'crescent') : pick({ dangle: EDGY.includes(it.type) || BZ.ITEMS[it.type].chair ? 2.5 + (this.isBo ? 1.5 : 0) : 0, crescent: 3, loaf: 2, baguette: it.type === 'ledge' || it.type === 'blanket' || it.type === 'daybed' || it.type === 'seat' ? 2 : 0, lounge: it.type === 'daybed' || it.type === 'seat' || it.type === 'blanket' ? 2 : 0 }); }
      const cz = ['daybed', 'seat', 'adk', 'lamptable'].includes(it.type) ? (() => { const b = this.buddy; return b && b.asleep && b.bedItem && (b.bedItem === it || b.bedItem.parent === it || it.parent === b.bedItem) && st < this.napLen * 1.6; })() : false; // two on the daybed: nobody gets up first
      if (!cz && ((this.needs.energy > 97 && st > 700) || st > this.napLen)) this.exitBed();
    }
    // ── under the blanket ──
    burrow(it) {
      const c = this.coat.colors, col = (k) => BZ.color(c[k] || c.coat);
      this.burrowed = true; this.hidden = true;
      it.lump = { x: this.x, y: this.y + 1, dir: Math.cos(this.theta) >= 0 ? 1 : -1, tail: col('tip'), ear: col('ear'), face: col('head'), eye: BZ.color(this.coat.eye.iris), peek: 60, hop: 0, cat: this.id };
    }
    tickBurrow(it) {
      const L = it.lump; if (!L || L.cat !== this.id) { this.burrowed = false; this.hidden = false; return; }
      L.x = this.x; L.y = this.y + 1; if (L.peek > 0) L.peek--; else if (ri(this.asleep ? 1400 : 500) === 0) L.peek = rr(40, 90) | 0;
      const p = this.w.pointer, near = p.inside && Math.abs(p.x - L.x) < 22 * this.w.size && Math.abs(p.y - L.y) < 14 * this.w.size, moving = Math.hypot(p.x - (this.pX || p.x), p.y - (this.pY || p.y)) > 1.2; this.pX = p.x; this.pY = p.y;
      if (near && moving && (this.needs.energy > 25 || this.st < 500) && !(this.hopT > 0)) { this.hopT = 16; L.peek = 0; } // something wiggling on the blanket: pounce at it from underneath
      if (this.hopT > 0) { this.hopT--; L.hop = 5 * this.w.size * Math.sin(Math.PI * (this.hopT / 16)); L.x += Math.sign(p.x - L.x) * 3 * Math.sin(Math.PI * (this.hopT / 16)); } else L.hop = 0;
    }
    unburrow() { const it = this.bedItem; if (it && it.lump && it.lump.cat === this.id) delete it.lump; this.burrowed = false; this.hidden = false; }
    popOut(by) { // something pounced on the lump (or you tapped it): out she comes
      const it = this.bedItem; this.unburrow(); this.setState('idle'); this.pose.rootY = 0;
      if (it) { this.x = it.x + rr(-10, 10); this.y = it.y + 4; }
      this.setState('startle'); this.from = by ? [by.x, by.y] : [this.x + 10, this.y]; this.say(this.pers.sass > 60 ? 'chirp' : 'mew');
    }
    // set down straight into a bed by hand: a little shuffle, a loaf, then curl up
    placeInBed(it) {
      const g = BZ.bedGeom(it, this.w.size);
      this.bedItem = it; it.occupant = this.id;
      this.setState('bed'); this.inBed = it; this.theta = g.face; this.sortY = g.sortY; this.clip = g.clip;
      this.x = g.spot[0]; this.y = g.spot[1]; this.bedRoot = g.rootPx / this.petScale; this.pose.rootY = this.bedRoot + 4;
      this.napStyle = it.type === 'pod' ? (ri(3) ? 'crescent' : 'loaf') : pick({ crescent: 3, loaf: 2, baguette: 1, sphinx: 1, dangle: EDGY.includes(it.type) ? (this.isBo ? 2.5 : 1.2) : 0 });
      const tired = this.needs.energy < 70;
      this.napLen = tired ? rr(2400, 5200) : rr(500, 1300); this.nextShift = rr(600, 1200);
      this.needs.love = Math.min(100, this.needs.love + 4); this.mood.cuddle = Math.min(1, this.mood.cuddle + 0.08);
      this.placedT = 70; this.flickT = 18;
      if (this.pers.affection > 50) setTimeout(() => this.say('trill'), 350);
    }
    exitBed() { this.unburrow(); this.boxDuck = 0; const it = this.bedItem; if (it) it.dangle = null; if (!it) { this.setState('idle'); return; } const g = BZ.bedGeom(it, this.w.size); this.theta = Math.PI / 2; this.hop(g.front[0], g.front[1] + 6, false, g); }

    // ── greens ──
    startGraze(kind) {
      const it = this.w.items.find((i) => i.type === kind && !i.held && !i.lift);
      if (!it) { this.setState('idle'); return; }
      this.setState('graze'); this.grazeKind = kind; this.food = it; this.bites = 0; this.maxBites = kind === 'grass' ? 3 + ri(4) : kind === 'catnip' ? 2 : 3;
    }
    s_graze() {
      const it = this.food;
      if (!it || it.gone || it.held || it.servings <= 0) { this.setState('idle'); return; }
      const [ax, ay] = this.reachSpot(it, this.grazeKind === 'grass' ? 31 : 29);
      if (!this.arrived) { this.anim = 'stand'; if (this.steer(ax, ay, 'walk')) { this.arrived = true; this.st = 0; } if (this.st > 700) this.setState('idle'); return; }
      this.lookAt = [it.x, it.y - 8];
      if (!this.turnToward(this.angleTo(it.x, it.y)) && this.st < 30) { this.anim = 'stand'; return; }
      this.gait = null;
      if (this.grazeKind === 'spider' && this.bites % 2 === 0) { this.anim = 'stand'; this.swat = (this.st % 24) / 12; if (this.st % 24 === 8) it.swing = 4; if (this.st % 24 === 23) this.bites++; return; }
      this.swat = 0; this.anim = 'graze'; this.chew = true;
      if (this.st % 34 === 20) { it.servings--; it.rustle = 1; this.needs.greens = Math.max(0, this.needs.greens - 14); this.w.sound.nibble(); this.bites++; }
      if (this.bites >= this.maxBites || it.servings <= 0) {
        this.chew = false;
        if (this.grazeKind === 'catnip') { this.cool.nip = 6000; this.setState('zoom'); this.nip = true; this.boost = 40; this.mood.play = 1; this.say('trill'); return; }
        this.setState('idle'); this.act = { kind: 'groom', T: 100 };
      }
    }
    s_zoom() {
      if (this.st === 1) { this.target = this.newTarget(); this.zoomLen = (this.nip ? 420 : 240) * (0.7 + 0.6 * Math.random()); }
      this.setTail('streak', 2);
      if (this.st > this.zoomLen) { this.nip = false; this.startNap(null, ri(2) ? 'crescent' : 'flop'); return; }
      if (this.steer(this.target[0], this.target[1], 'run')) { if (ri(3) === 0) { this.startPounce(this.x + Math.cos(this.theta) * 50, this.y + Math.sin(this.theta) * 30, 'zoom'); return; } this.target = this.newTarget(); }
      this.anim = 'stand';
    }

    // ── engaging a moving thing (laser, yarn): modes chosen by interest,
    //    distance, speed, her personality and what her buddy is doing ──
    s_engage() {
      const w = this.w, p = this.pers, s = w.stimuli.find((x) => x.key === this.eng);
      if (!s) { this.setState(this.eng === 'laser' ? 'confused' : 'idle'); return; }
      const I = this.interest[this.eng] || 0;
      const d = dist(this.x, this.y, s.x, s.y), du = d / this.petScale;
      this.lookAt = [s.x, s.y]; this.perk = Math.max(0.4, I);
      if (I < 0.16) { // over it: a pointed turn away
        this.setState('idle'); this.act = { kind: ri(2) ? 'groom' : 'perch', T: 120 }; this.theta = wrap(this.angleTo(s.x, s.y) + Math.PI + rr(-0.6, 0.6)); this.flickT = 18; return;
      }
      if (p.nerve < 55 && s.speed > 9 && du < 70 && ri(6) === 0) { this.setState('startle'); this.from = [s.x, s.y]; this.engKeep = this.eng; return; } // skittish
      const b = this.buddy, bEng = b && b.state === 'engage' && b.eng === this.eng && ['chase', 'stalk'].includes(b.mode) && dist(b.x, b.y, s.x, s.y) < d;
      const ball = s.item && BZ.ITEMS[s.item.type] && BZ.ITEMS[s.item.type].ball, onWall = !s.item && s.y < w.floorTop - 6, m = this.mood, n = this.needs;
      const tx = s.x, ty = onWall ? w.floorTop + 6 * this.petScale : s.y;
      if (--this.modeT <= 0) {
        const reach = du < 34;
        this.mode = pick({
          watch: (1 - I) * 2 + p.aloof / 40 + (du > 240 ? 1 : 0) + (bEng ? 1.5 : 0) + (n.energy < 35 ? 1.5 : 0),
          stalk: onWall ? 0 : I * 1.6 * (s.speed < 3 ? 1.4 : 0.4) * (1 - p.aloof / 180),
          chase: onWall ? 0 : I * 2.2 * (s.speed > 2.5 ? 1 : 0.2) * (n.energy / 90) * (1 - p.aloof / 130) * (du > 40 ? 1 : 0.2),
          swat: reach && !onWall ? 3 + p.aloof / 40 : 0,
          groom: m.grump * 1.2 + (1 - I) * 0.5,
          kick: ball && du < 40 ? I * (0.5 + m.play) * (n.energy / 70) * (p.energy / 50) * 1.8 : 0, // flop over, hug it, bunny-kick
          toss: ball && du < 40 ? I * 1.4 * (p.curious / 70) : 0,                                   // flick it up and bat it in the air
          crab: !onWall && du > 40 && du < 140 ? I * m.play * ((p.sass + p.energy) / 130) * (n.energy > 40 ? 1 : 0.2) : 0, // the sideways arched-back hop
          wall: onWall ? 3 + I * 4 * (1 - p.aloof / 160) : 0,                                         // it's up the wall: jump for it
        });
        this.modeT = (rr(35, 110) / this.tempo) | 0; this.st = 0; this.wiggle = 0; this.hopY = 0; this.kickT = this.tossT = this.crabT = this.freezeT = this.skidT = 0;
        if (this.mode === 'kick') this.modeT = 220; if (this.mode === 'toss') this.modeT = 140; if (this.mode === 'crab') this.modeT = 80; if (this.mode === 'wall') this.modeT = (rr(90, 200) / this.tempo) | 0;
        this.swatPer = (rr(12, 22) * (1 + p.aloof / 200) / this.tempo) | 0; this.swatAmp = p.aloof > 60 && ri(2) ? 0.55 : 1; // Bo's lazy little taps
        this.watchPose = p.aloof > 60 ? (n.energy < 50 || ri(2) ? 'sphinx' : 'loaf') : ri(3) ? 'sit' : 'slink';
      }
      if (b && b.state === 'engage' && b.eng === this.eng && dist(b.x, b.y, this.x, this.y) < 40 * this.petScale) { // crowding the same prey
        const rel = w.rel(this, b); rel.tension = Math.min(1, rel.tension + 0.004 * (0.5 + p.sass / 100));
        if (rel.tension > 0.6 && ri(90) === 0 && p.sass > 40) { this.swatAt(b); return; }
      }
      const ang = this.angleTo(tx, ty), ps = this.petScale, it = s.item;
      const pounceKind = () => s.speed > 5 ? 'lunge' : s.speed < 1 ? (p.curious > 60 || ri(2) ? 'mouse' : 'arc') : pick({ arc: 2, lunge: 1, mouse: p.curious / 60 });
      switch (this.mode) {
        case 'watch':
          this.anim = this.watchPose;
          if (Math.abs(wrap(ang - this.theta)) > 1.1) this.turnToward(ang, 0.6); else this.gait = null;
          this.setTail('twitch', 2);
          if (p.chatty > 50 && ri(220) === 0) this.say('chatter');
          if (du < 34 && !onWall && ri(20) === 0) { this.mode = 'swat'; this.st = 0; }
          break;
        case 'stalk':
          this.setTail('low', 2);
          if (du > 62) { if (this.st % 70 < 50) { this.steer(tx, ty, 'creep'); this.anim = 'slink'; } else { this.anim = 'slink'; this.gait = null; this.turnToward(ang); } }
          else { this.gait = null; this.turnToward(ang); this.wiggle++; this.anim = this.wiggle > 6 ? 'crouch' : 'slink'; if (this.wiggle > (14 + ri(20)) / this.tempo) this.startPounce(s.x - Math.cos(this.theta) * 16 * ps, s.y - Math.sin(this.theta) * 16 * ps * K, 'engage', pounceKind()); }
          break;
        case 'chase': {
          if (this.freezeT > 0) { this.freezeT--; this.gait = null; this.anim = 'slink'; this.turnToward(ang, 0.6); this.setTail('twitch', 2); break; } // statue: dead still, staring
          if (this.skidT > 0) { this.skidT--; this.gait = null; this.anim = 'crouch'; this.x += Math.cos(this.theta) * this.curV; this.y += Math.sin(this.theta) * this.curV * K; this.curV *= 0.78; this.clampToStage(); this.pose.earBack = 0.4; break; } // overshoot and skid
          this.setTail('twitch', 2); this.anim = 'stand';
          if (du < 30) { this.mode = ri(2) ? 'swat' : 'stalk'; this.st = 0; break; }
          if (this.curV > 2.4 * ps && Math.abs(wrap(ang - this.theta)) > 2.1) { this.skidT = 10; break; }
          if (ri(240) === 0) { this.freezeT = rr(16, 44) | 0; break; }
          this.steer(tx + s.vx * 4, ty + s.vy * 4, du > 200 && n.energy > 30 ? 'run' : 'brisk'); // read_out: aim 4 frames ahead
          break;
        }
        case 'swat': {
          this.anim = this.watchPose && this.watchPose !== 'sit' ? this.watchPose : 'slink'; this.gait = null; this.turnToward(ang);
          const per = Math.max(8, this.swatPer || 16), k = this.st % per;
          if (k === 0) { if (ri(3)) this.swatSide = this.swatSide ? 0 : 1; this.swatDbl = ri(4) === 0; } // alternate paws, sometimes a one-two
          this.swat = k < per * 0.45 ? k / (per * 0.45) : this.swatDbl && k >= per * 0.5 && k < per * 0.85 ? (k - per * 0.5) / (per * 0.35) : 0;
          if (k === Math.round(per * 0.22) || (this.swatDbl && k === Math.round(per * 0.67))) { if (it && du < 40) this.hitBall(it); this.interest[this.eng] = Math.min(1, I + 0.05); }
          if (this.st > per * (1 + ri(3))) { this.swat = 0; this.modeT = 0; }
          break;
        }
        case 'kick': { // bunny-kick: flop over, clutch it, rake it with the hind feet
          if (!it) { this.modeT = 0; break; }
          if (!this.kickT) { if (du > 18) { this.steer(it.x, it.y, 'walk', 0.8); this.anim = 'slink'; if (this.st > 160) this.modeT = 0; break; } this.kickT = 1; this.kickLen = rr(60, 110) | 0; this.gait = null; this.say('chirp'); }
          this.kickT++; this.gait = null; this.anim = this.kickT < 8 ? 'crouch' : 'kick'; this.setTail('lash', 2); this.pupilT = 1;
          if (this.kickT > 8) { it.x = this.x + Math.cos(this.theta) * 7 * ps; it.y = this.y + 1.5; it.z = 6 * ps + Math.abs(Math.sin(this.kickT * 0.45)) * 2.5 * ps; it.vx = it.vy = 0; it.vz = 0; it.spin = (it.spin || 0) + 0.4; }
          if (this.kickT > this.kickLen) { const a = this.theta + rr(-1, 1); it.vx = Math.cos(a) * rr(3, 6) * w.size; it.vy = Math.sin(a) * rr(2, 4) * w.size; it.vz = 3 * w.size; this.kickT = 0; this.modeT = ri(2) ? 0 : 20; this.mode = 'watch'; this.interest[this.eng] = Math.min(1, I + 0.12); this.needs.energy = Math.max(0, this.needs.energy - 2); }
          break;
        }
        case 'toss': { // scoop it up into the air, watch it fall, bat it on the way down
          if (!it) { this.modeT = 0; break; }
          if (!this.tossT) { if (du > 26) { this.steer(it.x, it.y, 'walk', 0.9); this.anim = 'slink'; if (this.st > 160) this.modeT = 0; break; } this.tossT = 1; this.batAir = false; }
          this.tossT++; this.gait = null; this.turnToward(this.angleTo(it.x, it.y), 1.2);
          const T = this.tossT; this.lookAt = [it.x, it.y - (it.z || 0)];
          this.anim = T < 9 ? 'crouch' : T < 24 ? 'rear' : (it.z || 0) > 6 * ps ? 'rear' : 'slink';
          if (T === 11) { it.vz = rr(4.2, 6) * w.size; it.z = 1; it.vx += Math.cos(this.theta) * rr(0.6, 1.8); it.vy += Math.sin(this.theta) * rr(0.3, 1); this.swatSide = ri(2); this.swat = 0.5; if (ri(2)) this.say('chirp'); }
          if (T > 11 && T < 16) this.swat = (T - 11) / 5;
          if (!this.batAir && T > 20 && (it.z || 0) > 7 * ps && (it.vz || 0) < 0 && ri(3) === 0) { this.batAir = true; this.swat = 0.01; this.swatSide = this.swatSide ? 0 : 1; this.hitBall(it); it.vz = Math.abs(it.vz) * 0.5; }
          if (this.batAir && this.swat > 0 && this.swat < 1) this.swat += 0.2; else if (T > 16 && !this.batAir) this.swat = 0;
          if (T > 70) { this.tossT = 0; this.modeT = ri(2) ? 0 : 30; this.swat = 0; }
          break;
        }
        case 'crab': { // the sideways hop: back arched, tail up, bouncing past it sideways
          if (!this.crabT) { this.crabT = 1; this.crabDir = ri(2) ? 1 : -1; this.crabLen = rr(26, 48) | 0; }
          this.crabT++; this.gait = null; this.turnToward(ang, 0.5); this.anim = 'crabArch'; this.setTail('quiver', 2);
          const sa = this.theta + (Math.PI / 2) * this.crabDir, hop = Math.abs(Math.sin(this.crabT * 0.32));
          this.x += Math.cos(sa) * 1.3 * ps; this.y += Math.sin(sa) * 1.3 * ps * K; this.clampToStage(); this.hopY = 6 * hop;
          if (this.crabT > this.crabLen) { this.crabT = 0; this.hopY = 0; if (du < 110 && ri(2)) this.startPounce(s.x - Math.cos(this.theta) * 14 * ps, s.y - Math.sin(this.theta) * 14 * ps * K, 'engage', 'lunge'); else this.modeT = 0; }
          break;
        }
        case 'wall': { // the dot is up the wall: trot under it, rear up, spring at it
          const dx = tx - this.x;
          if (Math.abs(dx) > 24 * ps || Math.abs(ty - this.y) > 24 * ps) { this.hopY = 0; this.steer(tx, ty, du > 160 ? 'brisk' : 'walk'); this.anim = 'stand'; break; }
          this.gait = null; this.turnToward(-Math.PI / 2 + clamp(dx / 60, -0.5, 0.5), 1.2); this.anim = 'rear'; this.setTail('lash', 2); this.lookAt = [s.x, s.y];
          this.wallT = (this.wallT || 0) + 1; const reachH = clamp((this.y - s.y) / ps * 0.25, 4, 22), ph = (this.wallT % 46) / 46;
          this.hopY = ph < 0.5 ? reachH * Math.sin(Math.PI * ph * 2) : 0; this.swat = ph > 0.1 && ph < 0.45 ? (ph - 0.1) / 0.35 : 0;
          if (ph === 0 && ri(3) === 0) this.swatSide = this.swatSide ? 0 : 1;
          break;
        }
        case 'groom': this.anim = 'groom'; this.gait = null; break;
      }
      if (!['swat', 'toss', 'wall'].includes(this.mode)) this.swat = 0;
      if (!['crab', 'wall'].includes(this.mode)) this.hopY = 0;
    }
    s_startle() { // a little hop backwards, fur up, ears back
      if (this.st === 1) { this.mood.grump = Math.min(1, this.mood.grump + 0.1); this.flickT = 20; }
      const u = Math.min(1, this.st / 10);
      this.pose.rootY = 10 * Math.sin(Math.PI * u);
      if (this.st < 10) { const a = this.angleTo(this.from[0], this.from[1]); this.x -= Math.cos(a) * 1.6 * this.petScale; this.y -= Math.sin(a) * 1.0 * this.petScale; this.clampToStage(); }
      this.anim = this.st < 10 ? 'leap' : 'flinch';
      if (this.st > 30) { this.pose.rootY = 0; const k = this.engKeep; this.setState('engage'); this.eng = k || 'laser'; this.mode = 'watch'; this.modeT = 60; this.watchPose = 'crouch'; }
    }
    hitBall(b) {
      const a = this.theta + (Math.random() - 0.5) * 1.4, sp = (3 + Math.random() * 5) * this.w.size;
      b.vx += Math.cos(a) * sp; b.vy += Math.sin(a) * sp * K; this.bats++; this.lastBat = this.st;
      if (ri(4) === 0) this.say('chirp');
    }
    startPounce(tx, ty, back, kind) {
      kind = kind || 'arc'; const K2 = { arc: [14, 16], mouse: [19, 27], lunge: [9, 5] }[kind] || [14, 16];
      if (kind === 'mouse') { tx = this.x + (tx - this.x) * 0.7; ty = this.y + (ty - this.y) * 0.7; } // straight up and down onto it
      this.pz = { kind, H: K2[1], x0: this.x, y0: this.y, x1: tx, y1: ty, n: K2[0] / this.tempo, back, target: this.target, eng: this.eng, zoomLen: this.zoomLen, nip: this.nip, st: this.st, mate: this.mate };
      this.theta = this.angleTo(tx, ty) || this.theta; this.state = 'pounce'; this.st = 0;
    }
    s_pounce() {
      const z = this.pz, pre = (z.kind === 'lunge' ? 4 : 7) / this.tempo, land = z.kind === 'mouse' ? 22 : z.kind === 'lunge' ? 12 : 14;
      if (this.st <= pre) { this.anim = 'crouch'; this.gait = null; this.pose.hipX += Math.sin(this.st * 2) * 0.7; return; }
      const u = Math.min(1, (this.st - pre) / z.n);
      if (u < 1) {
        const e = z.kind === 'lunge' ? 1 - Math.pow(1 - u, 2) : u; // the lunge explodes forward and coasts
        this.x = z.x0 + (z.x1 - z.x0) * e; this.y = z.y0 + (z.y1 - z.y0) * e; this.clampToStage();
        this.pose.rootY = z.H * Math.sin(Math.PI * u); this.anim = z.kind === 'mouse' && u > 0.5 ? 'pin' : z.kind === 'lunge' && u > 0.15 ? 'lunge' : 'leap'; this.vSkid = Math.hypot(z.x1 - z.x0, z.y1 - z.y0) / z.n;
      } else {
        this.pose.rootY = 0;
        if (z.kind === 'lunge' && this.vSkid > 0.3) { this.x += Math.cos(this.theta) * this.vSkid; this.y += Math.sin(this.theta) * this.vSkid * K; this.vSkid *= 0.72; this.clampToStage(); } // skid out of it
        this.anim = z.kind === 'mouse' ? 'pin' : 'crouch';
        if (z.kind === 'mouse') { const s = this.w.stimuli.find((x) => x.key === z.eng); if (s && s.item && dist(this.x, this.y, s.x, s.y) < 40 * this.petScale) { s.item.vx = s.item.vy = 0; s.item.x += (this.x + Math.cos(this.theta) * 9 * this.petScale - s.item.x) * 0.3; } } // got it: pinned under both paws
      }
      if (this.st > pre + z.n + land) {
        this.state = z.back === 'ambushLand' ? 'idle' : z.back; this.st = z.back === 'zoom' ? z.st : 1; this.target = z.target; this.eng = z.eng; this.zoomLen = z.zoomLen; this.nip = z.nip; this.mate = z.mate;
        if (z.back === 'engage') { this.mode = 'swat'; this.modeT = 30; this.interest[this.eng] = Math.min(1, (this.interest[this.eng] || 0) + 0.08); const s = this.w.stimuli.find((x) => x.key === this.eng); if (s && s.item && dist(this.x, this.y, s.x, s.y) < 44 * this.petScale) this.hitBall(s.item); }
        if (z.back === 'ambushLand') this.ambushLand();
      }
    }
    s_skeptic() { // Bo and the dog: she stops, ears half back, and gives her a long flat look; a tail flick; then on her way
      const d = this.skepAt; if (!d) { this.setState('idle'); return; }
      this.gait = null; this.anim = this.st > 30 && this.pers.sleepy > 50 ? 'sit' : 'stand';
      const H = d.screen && d.screen.head ? d.screen.head : [d.x, d.y - 20];
      this.turnToward(this.angleTo(d.x, d.y), 1); this.lookAt = [H[0], H[1]]; this.perk = 0.7; this.pose.earBack = 0.55;
      if (this.st === 10) this.tailGesture('flick'); if (this.st === 40 && ri(2) === 0) this.tailGesture('twitch'); if (this.st === 24 && ri(3) === 0) this.say('meow');
      if (this.st > (this.skepT || 90)) { this.pose.earBack = 0; this.mood.grump = Math.min(1, this.mood.grump + 0.05); this.setState('wander'); this.away = [d.x, d.y]; }
    }
    s_confused() { this.anim = 'sit'; this.lookAt = [this.x + Math.sin(this.st * 0.06) * 300, this.y - 80]; this.perk = 0.6; if (this.st > 80) this.setState('idle'); }

    // ── buddies: love / hate / love ──
    s_visit() {
      const b = this.mate; if (!b || !this.w.cats.includes(b)) { this.setState('idle'); return; }
      const side = this.x < b.x ? -1 : 1, tx = b.x + side * 30 * this.petScale, ty = b.y + 2;
      if (!this.arrived) { this.anim = 'stand'; if (this.steer(tx, ty, 'walk')) { this.arrived = true; this.st = 0; } if (this.st > 700) this.setState('idle'); return; }
      this.lookAt = b.screen ? [b.screen[BZ.IDX.head][0], b.screen[BZ.IDX.head][1]] : [b.x, b.y - 30];
      this.turnToward(this.angleTo(b.x, b.y));
      this.anim = this.st < 30 ? 'stand' : 'sit';
      if (this.st === 20) { this.nuzzle = 18; if (!b.asleep) { this.say('trill'); b.lookAt = [this.x, this.y - 30]; } }
      if (this.st > 160 + (this.ping % 60)) { this.setState('idle'); this.act = { kind: 'perch', T: 120 }; }
    }
    s_groomBuddy() {
      const b = this.mate; if (!b || !this.w.cats.includes(b) || !b.screen || b.inBed) { this.setState('idle'); return; }
      const rel = this.w.rel(this, b);
      const H = b.screen[BZ.IDX.head], side = this.x < H[0] ? -1 : 1;
      const tx = H[0] + side * 26 * this.petScale, ty = b.y + 3;
      if (!this.arrived) { this.anim = 'stand'; if (this.steer(tx, ty, 'walk')) { this.arrived = true; this.st = 0; } if (this.st > 600 || b.state === 'wander') this.setState('idle'); return; }
      this.turnToward(this.angleTo(H[0], b.y));
      this.anim = 'sit'; this.lookAt = [H[0], H[1]]; this.licking = true;
      b.beingGroomed = 4;
      if (this.st > 70 && ri(220) < rel.tension * 6 + this.pers.sass / 60) { this.licking = false; this.swatAt(b); return; } // love... hate
      if (this.st > 150 + (this.ping % 110)) { rel.bond = Math.min(1, rel.bond + 0.05); rel.tension = Math.max(0, rel.tension - 0.1); this.setState('idle'); this.act = { kind: 'groom', T: 80 }; }
    }
    swatAt(b) {
      this.setState('react'); this.reactKind = 'swat'; this.mate = b; this.theta = this.angleTo(b.x, b.y);
      const rel = this.w.rel(this, b); rel.tension = Math.min(1, rel.tension + 0.2);
      if (this.pers.sass > 60 && ri(2)) this.say('hiss');
      b.react('swatted', this);
    }
    react(kind, from) {
      const p = this.pers, rel = this.w.rel(this, from);
      if (this.asleep && p.aloof > 60 && ri(2)) { this.earT = 14; this.flickT = 24; this.setTail('lash', 120); return; } // Bo barely wakes for it
      if (this.inBed) return;
      this.setState('react'); this.mate = from; this.theta = this.angleTo(from.x, from.y);
      if (kind === 'swatted') this.reactKind = p.sass > 50 && ri(3) ? 'swatBack' : p.nerve < 50 ? 'flee' : 'flinch';
      else this.reactKind = p.aloof > 65 ? (p.sass > 50 ? 'hissStay' : 'flinch') : p.energy > 50 ? 'flee' : 'swatBack';
      this.mood.grump = Math.min(1, this.mood.grump + 0.15);
      rel.tension = Math.min(1, rel.tension + 0.08);
    }
    s_react() {
      const b = this.mate, k = this.reactKind;
      this.lookAt = b && b.screen ? [b.screen[BZ.IDX.head][0], b.screen[BZ.IDX.head][1]] : null;
      if (k === 'swat' || k === 'swatBack') {
        this.anim = 'crouch'; this.swat = (this.st % 14) / 7; this.pose.earBack = 0.8; this.setTail('lash', 160);
        if (this.st === 2 && k === 'swatBack') this.say(this.pers.sass > 50 ? 'hiss' : 'chirp');
        if (this.st > 20) {
          this.swat = 0;
          if (k === 'swatBack' && b && this.pers.energy > 50 && ri(2)) { this.setState('chaseBuddy'); this.mate = b; b.setState('flee'); b.mate = this; return; }
          this.setState('wander'); this.wg = 'walk';
        }
        return;
      }
      if (k === 'flee') { this.setState('flee'); this.mate = b; if (b && b.pers.energy > 40 && ri(3)) { b.setState('chaseBuddy'); b.mate = this; } return; }
      if (k === 'hissStay') { this.anim = 'flinch'; this.setTail('lash', 200); if (this.st === 2) this.say('hiss'); if (this.st > 40) { this.setState('idle'); this.act = { kind: 'groom', T: 120 }; } return; }
      this.anim = 'flinch'; this.setTail('lash', 160); if (this.st > 26) { this.setState('idle'); this.act = { kind: 'groom', T: 100 }; }
    }
    s_flee() {
      const b = this.mate;
      if (this.st === 1 || !this.target) { const a = b ? this.angleTo(b.x, b.y) + Math.PI + rr(-0.7, 0.7) : rr(0, 6.28); this.target = [this.x + Math.cos(a) * 220 * this.petScale, this.y + Math.sin(a) * 120 * this.petScale]; }
      this.setTail('streak', 2); this.anim = 'stand';
      if (this.steer(this.target[0], this.target[1], 'run') || this.st > 160) { this.target = null; this.setState('idle'); this.act = { kind: ri(2) ? 'groom' : 'perch', T: 110 }; }
    }
    s_chaseBuddy() {
      const b = this.mate; if (!b || !this.w.cats.includes(b) || b.state !== 'flee') { this.setState('idle'); this.act = { kind: 'perch', T: 90 }; return; }
      this.setTail('twitch', 2); this.anim = 'stand';
      this.steer(b.x, b.y, 'run');
      if (dist(this.x, this.y, b.x, b.y) < 26 * this.petScale && ri(3) === 0) { this.setState('idle'); this.act = { kind: 'perch', T: 80 }; b.target = null; b.setState('idle'); b.act = { kind: 'groom', T: 100 }; } // tag; both pretend it never happened
      if (this.st > 200) { this.setState('idle'); this.act = { kind: 'groom', T: 90 }; }
    }
    s_ambush() {
      const b = this.mate; if (!b || !this.w.cats.includes(b) || ((b.asleep || b.inBed) && !b.burrowed)) { this.setState('idle'); return; }
      const d = dist(this.x, this.y, b.x, b.y) / this.petScale;
      this.lookAt = [b.x, b.y - 20]; this.perk = 0.9; this.setTail('low', 2);
      if (d > 70) { if (this.st % 80 < 55) { this.anim = 'slink'; this.steer(b.x, b.y, 'creep'); } else { this.anim = 'slink'; this.gait = null; } if (this.st > 700) this.setState('idle'); return; }
      this.gait = null; this.turnToward(this.angleTo(b.x, b.y)); this.wiggle++; this.anim = this.wiggle > 6 ? 'crouch' : 'slink';
      if (this.wiggle > 20 + (this.ping % 30)) this.startPounce(b.x - Math.cos(this.theta) * 20 * this.petScale, b.y - Math.sin(this.theta) * 20 * this.petScale * K, 'ambushLand');
    }
    ambushLand() { const b = this.mate; this.setState('idle'); this.act = { kind: 'perch', T: 60 }; if (b && this.w.cats.includes(b)) { if (b.burrowed) { b.popOut(this); if (b.pers.energy > 40 && ri(2)) { const me = this; setTimeout(() => { if (b.state === 'startle' || b.state === 'idle') { b.setState('chaseBuddy'); b.mate = me; me.setState('flee'); me.mate = b; } }, 600); } } else b.react('pounced', this); } }
    // ── brawls: rear up and box, body slam, roll and kick, then usually a chase (or a nap) ──
    s_brawl() {
      const f = this.fight; if (!f) { this.setState('idle'); return; }
      const me = this === f.a, o = me ? f.b : f.a, w = this.w;
      if (!o || !w.cats.includes(o) || o.inBed || (o.state !== 'brawl' && f.phase !== 'approach') || (f.phase === 'approach' && !me)) { this.endBrawl(); return; }
      if (me) f.t++;
      const d = dist(this.x, this.y, o.x, o.y) / this.petScale;
      this.lookAt = o.screen ? [o.screen[BZ.IDX.head][0], o.screen[BZ.IDX.head][1]] : [o.x, o.y - 30]; this.perk = 1;
      if (f.phase === 'approach') { // she trots in, tail up and twitching
        this.setTail('twitch', 2); this.anim = 'stand';
        if (d > 46) { this.steer(o.x, o.y, 'brisk'); if (f.t > 500 || o.asleep || BUSY.includes(o.state)) this.endBrawl(); return; }
        const want = o.mood.play * 0.6 + w.rel(this, o).bond * 0.35 + o.pers.sass / 250 + (o.needs.energy > 30 ? 0.1 : -0.3);
        if (Math.random() > want) { o.react('pounced', this); this.setState('idle'); this.act = { kind: 'groom', T: 80 }; return; } // not in the mood: hiss, or a cold shoulder
        o.setState('brawl'); o.fight = f; o.mate = this; f.phase = 'box'; f.t = 0; f.boxT = rr(40, 80);
        return;
      }
      if (f.phase === 'box') { // face off on hind legs, trading cuffs
        this.gait = null; this.turnToward(this.angleTo(o.x, o.y), 1.5);
        if (d > 34) this.steer(o.x, o.y, 'walk', 0.6); else if (d < 22) { const a = this.angleTo(o.x, o.y); this.x -= Math.cos(a) * 0.6; this.y -= Math.sin(a) * 0.4; }
        const k = (f.t + (me ? 0 : 9)) % 22; this.anim = k < 16 ? 'rear' : 'crouch';
        this.swat = k < 16 ? ((f.t * (me ? 1.1 : 0.9)) % 12) / 6 : 0; this.setTail('lash', 2); this.pose.earBack = 0.8;
        if (me && f.t === 6 && ri(2)) this.say('chirp');
        if (me && f.t > f.boxT) { const atk = ri(3) === 0 && o.pers.sass > 40 ? o : this.pers.sass >= o.pers.sass ? this : o; f.atk = atk; f.phase = 'slam'; f.t = 0; } // the feisty one usually lands it
        return;
      }
      if (f.phase === 'slam') { // a hop and a body slam
        this.swat = 0;
        if (this === f.atk) {
          if (!this.slam0) { this.slam0 = [this.x, this.y]; this.theta = this.angleTo(o.x, o.y); }
          const u = clamp(f.t / 12, 0, 1); this.x = this.slam0[0] + (o.x - this.slam0[0]) * u * 0.8; this.y = this.slam0[1] + (o.y + 2 - this.slam0[1]) * u * 0.8;
          this.pose.rootY = 12 * Math.sin(Math.PI * u); this.anim = u < 1 ? 'leap' : 'pin';
        } else { this.anim = f.t < 9 ? 'rear' : 'tussle'; if (f.t === 10) { this.flickT = 20; this.earT = 12; } }
        if (me && f.t > 14) { f.a.slam0 = f.b.slam0 = null; f.phase = 'roll'; f.t = 0; f.rollT = rr(45, 90); }
        return;
      }
      if (f.phase === 'roll') { // rolling and kicking; the pinner nips the scruff
        const top = this === f.atk; this.gait = null;
        if (top) { // she pins from behind, leaning over, so the kicking legs show in front
          const tx = o.x + Math.cos(o.theta) * 5 * this.petScale + Math.sin(f.t * 0.3) * 2, ty = o.y - 7 * this.petScale; this.x += (tx - this.x) * 0.25; this.y += (ty - this.y) * 0.25;
          this.theta = wrap(this.theta + clamp(wrap(o.theta - this.theta), -0.2, 0.2)); this.anim = 'pin'; this.sortY = o.y - 0.5; this.pose.headDY += Math.sin(f.t * 0.5) * 1.5; }
        else { this.anim = 'tussle'; const k = f.t * 0.75; this.pose.bl[0] += Math.sin(k) * 3; this.pose.br[0] += Math.sin(k + 2) * 3; this.pose.bl[1] += Math.cos(k) * 2; this.pose.fl[1] += Math.sin(k * 1.3) * 1.5; } // bunny kicks
        this.setTail('lash', 2);
        if (me && f.t > f.rollT) {
          f.rounds--; this.sortY = null; o.sortY = null;
          if (f.rounds > 0 && ri(3)) { f.phase = 'box'; f.t = 0; f.boxT = rr(25, 55); return; }
          const loser = f.atk === this ? o : this, winner = f.atk;
          this.endBrawl(true);
          const r = Math.random();
          if (r < 0.55) { loser.setState('flee'); winner.setState('chaseBuddy'); winner.mate = loser; loser.mate = winner; } // and off they go
          else if (r < 0.75) { winner.setState('flee'); loser.setState('chaseBuddy'); loser.mate = winner; winner.mate = loser; } // revenge
          else { for (const c of [winner, loser]) { c.setState('idle'); c.act = { kind: 'groom', T: rr(90, 160) | 0 }; } } // both pretend it never happened
        }
      }
    }
    endBrawl(played) {
      const f = this.fight; if (!f) { this.setState('idle'); return; }
      for (const c of [f.a, f.b]) {
        if (!c) continue; c.fight = null; c.swat = 0; c.sortY = null; c.pose.rootY = 0;
        if (c.state === 'brawl') { c.setState('idle'); c.act = { kind: 'perch', T: 60 }; }
        if (played) { c.needs.energy = Math.max(0, c.needs.energy - 8); c.mood.play *= 0.6; }
      }
      if (played && f.a && f.b) { const rel = this.w.rel(f.a, f.b); rel.bond = Math.min(1, rel.bond + 0.04); rel.tension = Math.max(0, rel.tension - 0.05); }
    }
    s_follow() {
      const b = this.mate; if (!b || !this.w.cats.includes(b) || b.asleep || this.st > 700) { this.setState('idle'); return; }
      const d = dist(this.x, this.y, b.x, b.y) / this.petScale;
      this.lookAt = [b.x, b.y - 25]; this.setTail('happy', 2);
      if (d > 60) { this.steer(b.x - Math.cos(b.theta) * 40 * this.petScale, b.y, d > 160 ? 'brisk' : 'walk'); this.anim = 'stand'; }
      else { this.gait = null; this.anim = b.gait ? 'stand' : 'sit'; this.turnToward(this.angleTo(b.x, b.y)); }
    }

    // ── the wall stretch: up on her hind legs against the wall (or a chair, the box, the table), paws high, a long pull down ──
    startScratch() {
      const w = this.w, st = w.stage, ps = this.petScale; let spot = null, face = null, item = null;
      const objs = w.items.filter((i) => !i.held && (!i.fixed || i.draw) && (BZ.ITEMS[i.type].chair || ['box', 'ctable', 'pod', 'daybed'].includes(i.type)) && dist(i.x, i.y, this.x, this.y) < 260 * ps);
      if (objs.length && (ri(2) || !w.scene)) { item = objs[ri(objs.length)]; const side = this.x < item.x ? -1 : 1, r = BZ.ITEMS[item.type].r * w.size; spot = [item.x + side * (r + 9 * ps), item.y + 3]; face = side < 0 ? 0 : Math.PI; }
      else if (w.scene && w.scene.tree) { const T = w.scene.tree, side = ri(2) ? -1 : 1; spot = [st.x + T.x + side * (T.w / 2 + 9 * ps), st.y + T.base + 1]; face = side < 0 ? 0 : Math.PI; } // the big tree
      else if (w.scene) { spot = [clamp(this.x + rr(-80, 80), st.x + 40, st.x + st.w - 40), w.floorTop + 2]; face = -Math.PI / 2 + (ri(2) ? 0.55 : -0.55); }
      if (!spot) { this.setState('idle'); this.act = { kind: 'stretch', T: 116 }; return; }
      this.setState('scratch'); this.scr = { spot, face, item, T: rr(80, 150) | 0 }; this.justWoke = false;
    }
    s_scratch() {
      const z = this.scr; if (!z) { this.setState('idle'); return; }
      if (!this.arrived) { this.anim = 'stand'; if (this.steer(z.spot[0], z.spot[1], 'walk') || this.st > 500) { this.arrived = true; this.st = 0; } return; }
      if (!this.turnToward(z.face, 1.2) && this.st < 40) { this.anim = 'stand'; return; }
      this.gait = null; this.anim = 'wallStretch'; this.scratching = this.st > 22 && this.st < z.T - 10;
      if (this.scratching && this.st % 14 === 0 && z.item && z.item.type === 'box') z.item.scratches = (z.item.scratches || 0) + 1;
      if (this.st === 26 && ri(3) === 0) this.tailGesture('swish');
      if (this.st > z.T) { this.scratching = false; this.setState('idle'); this.act = { kind: ri(2) ? 'groom' : 'perch', T: 100 }; }
    }
    // ── plants: the safe ones get nibbled, the rest get batted and sniffed; the cactus teaches a lesson ──
    startPlant(only) {
      const w = this.w, all = only ? [only] : w.items.filter((i) => plantDef(i) && !i.held && !i.lift && !(this.cool['plant:' + (i.kind || i.type)] > 0));
      if (!all.length) { this.setState('idle'); return; }
      const wt = (i) => { const D = plantDef(i); return 1 + (D.safe ? this.needs.greens / 25 : 0) + (D.nip ? 2 : 0) + (D.graze ? this.pers.grass / 25 : 0); };
      const it = pick(Object.fromEntries(all.map((i, k) => [k, wt(i)]))), plant = all[+it];
      this.setState('plantPlay'); this.food = plant; this.bites = 0; this.pp = { kind: plantDef(plant), T: rr(140, 260) | 0 };
    }
    s_plantPlay() {
      const it = this.food, z = this.pp; if (!it || it.gone || it.held || !z) { this.setState('idle'); return; }
      const D = z.kind, ps = this.petScale, [ax, ay] = this.reachSpot(it, (D.r + 16) * this.w.size / ps);
      if (!this.arrived) { this.anim = 'stand'; if (this.steer(ax, ay, 'walk') || this.st > 600) { this.arrived = true; this.st = 0; } return; }
      this.lookAt = [it.x, it.y - D.h * this.w.size * 0.5];
      if (!this.turnToward(this.angleTo(it.x, it.y)) && this.st < 30) { this.anim = 'stand'; return; }
      this.gait = null;
      if (D.prickly) { // a careful sniff... OW
        if (this.st < 50) { this.anim = 'slink'; this.pose.headDX += 0.05; return; }
        if (this.st === 50) { this.say('mew'); this.setState('startle'); this.from = [it.x, it.y]; this.cool['plant:' + (it.kind || it.type)] = 9000; this.mood.grump = Math.min(1, this.mood.grump + 0.2); return; }
      }
      if (D.sneeze && this.st > 40 && this.st < 70) { this.anim = 'sit'; if (this.st === 55) { this.sneezeT = 12; this.w.sound.nibble(); } if (this.st === 69) { this.cool['plant:' + (it.kind || it.type)] = 4000; this.setState('idle'); this.act = { kind: 'groom', T: 80 }; } return; }
      if (D.safe && it.servings > 0 && (this.st > 60 || this.needs.greens > 40)) { // nibble
        this.swat = 0; this.anim = 'graze'; this.chew = true;
        if (this.st % 34 === 20) { it.servings--; it.rustle = 1; this.needs.greens = Math.max(0, this.needs.greens - 12); this.w.sound.nibble(); this.bites++; }
        if (D.nip && this.bites >= 2) { this.chew = false; this.cool.nip = 7000; this.setState('sunroll'); this.nipRoll = true; this.mood.play = 1; this.say('trill'); return; } // silvervine: roll around in bliss, then zoomies
        if (this.bites >= 2 + ri(3) || it.servings <= 0) { this.chew = false; this.setState('idle'); this.act = { kind: 'groom', T: 90 }; }
        return;
      }
      // bat the leaves, set them swinging
      this.chew = false; const per = 22, k = this.st % per; this.anim = this.st < 20 ? 'sit' : (ri(2) && k === 0 ? 'rear' : this.anim === 'rear' ? 'rear' : 'slink');
      this.swat = k < 10 ? k / 10 : 0; if (k === 0) this.swatSide = ri(2);
      if (k === 5) { it.rustle = 1; it.swing = 4; if (ri(5) === 0) this.say('chirp'); }
      if (this.st > z.T) { this.swat = 0; this.setState('idle'); this.act = { kind: ri(2) ? 'perch' : 'groom', T: 90 }; this.cool['plant:' + (it.kind || it.type)] = 1500; }
    }
    // ── lurking: under the coffee table or behind a big plant, watching; then the ambush ──
    startLurk() {
      const w = this.w, hides = w.items.filter((i) => !i.held && !i.lift && (i.type === 'ctable' || (BZ.PLANTS[i.type] && BZ.PLANTS[i.type].hide)));
      if (!hides.length) { this.setState('idle'); return; }
      const h = hides[ri(hides.length)], s = w.size;
      this.setState('lurk'); this.lurkAt = h; this.lurkPos = h.type === 'ctable' ? [h.x + rr(-14, 14) * s, h.y - 3 * s] : [h.x + (ri(2) ? 7 : -7) * s, h.y - 3 * s]; this.lurkT = rr(300, 800) | 0;
    }
    s_lurk() {
      const h = this.lurkAt; if (!h || h.gone || h.held) { this.setState('idle'); return; }
      if (!this.arrived) { this.anim = 'slink'; if (this.steer(this.lurkPos[0], this.lurkPos[1] + 10 * this.petScale, 'creep') || this.st > 500) { this.arrived = true; this.st = 0; } return; }
      this.x += (this.lurkPos[0] - this.x) * 0.1; this.y += (this.lurkPos[1] - this.y) * 0.1; this.lurkSpot = h; this.sortY = h.y - 0.4; // tucked in behind / under it
      this.turnToward(Math.PI / 2 + (Math.cos(this.theta) > 0 ? -0.6 : 0.6), 0.8);
      this.anim = h.type === 'ctable' ? (this.st % 400 < 300 ? 'sphinx' : 'loaf') : 'slink'; this.perk = 0.8;
      const b = this.buddy; if (b) this.lookAt = [b.x, b.y - 20];
      if (b && !b.asleep && !BUSY.includes(b.state) && !b.inBed && dist(b.x, b.y, this.x, this.y) < 100 * this.petScale && this.mood.play > 0.3 && ri(40) === 0) { this.sortY = null; this.lurkSpot = null; this.setState('idle'); this.mate = b; this.startPounce(b.x - Math.cos(this.angleTo(b.x, b.y)) * 18 * this.petScale, b.y, 'ambushLand', ri(2) ? 'lunge' : 'arc'); return; }
      if (this.st > this.lurkT) { this.setState('idle'); this.act = { kind: 'groom', T: 80 }; }
    }
    // ── out through the studio doors and down the steps ──
    s_enter() {
      const w = this.w, it = w.items.find((i) => i.type === 'stoop'); if (!it) { this.hidden = false; this.setState('idle'); return; }
      const g = BZ.bedGeom(it, w.size), d = this.enterDelay || 0;
      this.x = g.spot[0]; this.y = g.spot[1]; this.sortY = g.sortY; this.bedRoot = g.rootPx / this.petScale; this.theta = g.face; this.gait = null;
      this.hidden = this.st < d; this.anim = 'sit';
      if (this.st === d) { if (w.scene) w.scene.doorT = 46; it.occupant = this.id; this.say(ri(2) ? 'trill' : 'mew'); }
      if (this.st > d) this.lookAt = [this.x + 120 * Math.cos(this.st * 0.02), this.y + 40];
      if (this.st === d + 22) { this.bedItem = it; this.hop(g.front[0] + rr(-14, 14), g.front[1] + rr(0, 10), false, g); }
    }
    s_statue() { // Bunny goes and sits with the stone bunny, same pose, same direction
      const sp = this.w.scene && this.w.scene.statueSpot && this.w.scene.statueSpot(); if (!sp) { this.setState('idle'); return; }
      if (!this.arrived) { this.anim = 'stand'; if (this.steer(sp[0], sp[1], 'walk') || this.st > 600) { this.arrived = true; this.st = 0; } return; }
      this.gait = null; if (!this.turnToward(-0.25, 1) && this.st < 30) { this.anim = 'stand'; return; }
      this.anim = this.st % 400 < 300 ? 'sit' : 'loaf'; this.perk = 0.5;
      if (this.st % 160 < 30) this.lookAt = [sp[0] + 15, sp[1] - 14]; // a glance at her twin
      if (this.st === 40 && ri(2)) this.say('trill');
      if (this.st > this.statT) { this.setState('idle'); this.act = { kind: 'groom', T: 90 }; }
    }
    // ── rolling in the sun (and the silvervine roll) ──
    s_sunroll() {
      this.gait = null; this.anim = 'bellyup'; const ph = Math.sin(this.st * (this.nipRoll ? 0.09 : 0.05));
      this.rollAmt = 112 + ph * 38; this.pose.lid = Math.max(this.pose.lid, 0.6); if (this.st % 60 === 20) this.tailGesture(ri(2) ? 'wave' : 'curl');
      if (this.st % 90 === 45) this.w.sound.purr(this.id, true);
      if (this.st > (this.nipRoll ? 300 : 220)) { this.w.sound.purr(this.id, false); const nip = this.nipRoll; this.nipRoll = false; this.rollAmt = 0; if (nip) { this.setState('zoom'); this.nip = true; this.boost = 40; } else if (this.needs.energy < 70) this.startNap(null, 'flop'); else { this.setState('idle'); this.act = { kind: 'groom', T: 90 }; } }
    }

    // ── people things ──
    s_come() {
      const p = this.w.pointer, st = this.w.stage;
      this.comeT = (this.comeT || 0) + 1;
      if (!p.inside) { if (this.st > 60) this.setState('idle'); return; }
      const tx = clamp(p.x, st.x + 40, st.x + st.w - 40), ty = clamp(p.y + 24 * this.petScale, this.w.floorTop, st.y + st.h - 4);
      if (!this.arrived) {
        this.setTail('happy', 3);
        const lag = this.pers.aloof > 70 && this.comeT < 30; // Bo takes her time
        if (!lag && this.steer(tx, ty, dist(this.x, this.y, tx, ty) > 260 ? 'brisk' : 'walk')) { this.arrived = true; this.arriveT = this.comeT; if (!this.refollow) this.say(this.pers.chatty > 50 ? 'meow' : 'trill'); }
        this.anim = lag ? 'sit' : 'stand'; if (this.comeT > 520) this.setState('idle');
      } else {
        this.anim = 'sit'; this.faceViewer(); this.lookAt = [p.x, p.y];
        if (this.sb === 0 && this.comeT % 90 === 40 && this.pers.affection > 50) this.sb = 34;
        this.needs.love = Math.min(100, this.needs.love + 0.02);
        if (dist(this.x, this.y, tx, ty) > 110 * this.petScale) { if ((this.refollow = (this.refollow || 0) + 1) <= 1) this.arrived = false; else this.setState('idle'); } // she'll follow you once, not forever
        else if (this.comeT - this.arriveT > 140 + this.pers.affection) this.setState('idle');
      }
    }
    s_beg() {
      const w = this.w, p = w.pointer, st = w.stage;
      if (!(w.carrying && BZ.ITEMS[w.carrying] && BZ.ITEMS[w.carrying].snack)) { this.setState('idle'); return; }
      const beggars = w.cats.filter((c) => c.state === 'beg'), slot = beggars.indexOf(this) - (beggars.length - 1) / 2;
      const tx = clamp(p.x + slot * 44 * this.petScale, st.x + 40, st.x + st.w - 40), ty = clamp(p.y + 34 * this.petScale, w.floorTop, st.y + st.h - 4);
      this.lookAt = [p.x, p.y];
      if (!this.arrived) { if (this.steer(tx, ty, 'brisk')) { this.arrived = true; this.st = 0; } this.anim = 'stand'; this.setTail('happy', 2); return; }
      this.faceViewer();
      const cyc = (this.st + (this.ping | 0)) % 100, aloof = this.pers.aloof > 70;
      this.anim = aloof ? (cyc < 70 ? 'sit' : 'beg') : cyc < 60 ? 'beg' : 'sit';
      this.swat = !aloof && cyc > 60 && cyc < 76 ? (cyc - 60) / 8 : 0;
      if (cyc === 20 && ri(2)) this.say('meow');
      if (dist(this.x, this.y, tx, ty) > 80 * this.petScale) this.arrived = false;
    }
    s_eatTreat() {
      const f = this.food;
      if (!f || f.gone || f.held) { this.setState('idle'); return; }
      const [ax, ay] = this.reachSpot(f, 30);
      if (!this.eating) { this.anim = 'stand'; if (this.steer(ax, ay, 'brisk') || this.st > 400) { this.eating = true; this.st = 0; } return; }
      this.turnToward(this.angleTo(f.x, f.y)); this.gait = null; this.anim = 'eat';
      if (this.st === 10) { this.w.sound.crunch(); this.w.removeItem(f); this.needs.belly = Math.min(100, this.needs.belly + 8); this.needs.love = Math.min(100, this.needs.love + 6); this.mood.cuddle = Math.min(1, this.mood.cuddle + 0.1); }
      if (this.st > 26) { this.setState('idle'); this.act = { kind: 'groom', T: 90 }; }
    }
    s_eatBowl() {
      const b = this.food;
      if (!b || b.gone || b.held || b.servings <= 0) { this.setState('idle'); return; }
      const [ax, ay] = this.reachSpot(b, 32);
      if (!this.eating) { this.anim = 'stand'; if (this.steer(ax, ay, 'walk')) { this.eating = true; this.st = 0; } if (this.st > 700) this.setState('idle'); return; }
      this.turnToward(this.angleTo(b.x, b.y)); this.gait = null; this.anim = 'eat';
      if (this.st % 22 === 21) { b.servings--; this.needs.belly = Math.min(100, this.needs.belly + 5); this.w.sound.crunch(); }
      if (this.needs.belly > 95 || b.servings <= 0) { this.setState('idle'); this.act = { kind: 'groom', T: 110 }; }
    }
    s_petted() {
      const since = this.t - this.lastStroke, p = this.w.pointer;
      if (this.petRegionT > 0) this.petRegionT--; if (this.brushT > 0) this.brushT--;
      this.anim = this.petBase; this.lookAt = [p.x, p.y];
      if (this.sb === 0 && ri(90) === 0) this.sb = 34;
      if (this.petBase !== 'loaf' && this.petBase !== 'bellyup') this.setTail('quiver', 2);
      this.mood.cuddle = Math.min(1, this.mood.cuddle + 0.002); this.mood.grump = Math.max(0, this.mood.grump - 0.002);
      if (since > 45) {
        this.w.sound.purr(this.id, false);
        if (this.enjoy >= 14 && this.needs.energy < 70 && ri(2)) { this.startNap(null, 'loaf'); this.napPhase = 'settle'; return; }
        this.setState('idle');
      }
    }
    s_flinch() {
      const arch = this.pers.sass > 50;
      this.anim = arch ? 'flinch' : 'crouch'; this.pose.earBack = 1;
      if (this.st < 7) { this.x -= Math.cos(this.theta) * 1.6 * this.petScale; this.clampToStage(); }
      if (this.st > 34) { this.setTail('lash', 240); if (this.pers.sass > 50 && ri(2)) { this.setState('wander'); this.wg = 'brisk'; } else { this.setState('idle'); this.act = { kind: 'groom', T: 120 }; } }
    }
    s_held() { this.anim = 'held'; }
    s_land() { this.anim = this.st < 10 ? 'crouch' : 'stand'; if (this.st > 18) { this.setState('idle'); this.act = { kind: 'groom', T: 130 }; this.setTail('lash', 140); this.mood.grump = Math.min(1, this.mood.grump + 0.15); } }

    stroke(region, tool) {
      const brush = tool === 'brush';
      this.lastStroke = this.t;
      this.needs.love = Math.min(100, this.needs.love + (brush ? 0.4 : 0.25));
      if (this.burrowed) return;
      if (NAPPING.includes(this.state)) { this.w.sound.purr(this.id, true); clearTimeout(this.purrT); this.purrT = setTimeout(() => this.w.sound.purr(this.id, false), 1300); if (ri(80) === 0) this.flickT = 14; if (brush && this.napLen) this.napLen += 2; return; }
      if (['held', 'bedHop', 'pounce', 'flinch', 'react', 'startle', 'brawl', 'scratch'].includes(this.state)) return;
      if (this.state !== 'petted') {
        this.petBase = ['loaf', 'sphinx'].includes(this.anim) ? 'loaf' : this.anim === 'stand' && ri(2) ? 'stand' : 'sit';
        this.setState('petted'); this.enjoy = 0; this.brushN = 0;
      }
      this.petRegion = region; this.petRegionT = 40;
      if (brush) { this.brushT = 40; this.brushN = (this.brushN || 0) + 1; }
      if (this.t % (brush ? 3 : 4) === 0) this.enjoy = Math.min(24, this.enjoy + 1);
      this.w.sound.purr(this.id, true);
      if (region === 'back' && this.petBase === 'sit' && this.enjoy > 4) this.petBase = 'stand'; // she gets up into it: elevator butt
      if (region === 'head' && ri(25) === 0) this.nuzzle = 18; // a head bump into your hand
      if (brush && this.enjoy >= 16 && this.pers.affection > 80 && this.petBase !== 'bellyup' && ri(35) === 0) { this.petBase = 'bellyup'; this.rollAmt = 118; this.say('trill'); this.tailGesture('curl'); } // Bunny: belly up, more please
      if (brush && this.pers.aloof > 60 && this.brushN > 150 && ri(80) === 0) { this.brushN = 0; this.nipT = 18; this.swatSide = ri(2); this.say('chirp'); this.setTail('lash', 90); } // Bo: that's enough now
      if (region === 'belly' && this.enjoy > 5 && this.petBase !== 'bellyup' && ri(80) < this.pers.sass / 10) this.poke('belly'); // the belly trap
      if (region === 'tail' && ri(40) === 0) { this.setTail('lash', 90); this.tailGesture('flick'); }
    }
    petPose(tg, a, t) {
      const R = this.petRegion, k = Math.min(1, (this.petRegionT || 0) / 20);
      if (this.brushT > 0) tg.lid = Math.max(tg.lid, 0.78);
      if (!R || k <= 0) return;
      if (R === 'head') { tg.headRoll += 16 * k * Math.sin(t * 0.06); tg.headDX += 1.5 * k; tg.lid = Math.max(tg.lid, 0.8); tg.earBack += 0.25 * k; }
      else if (R === 'face') { tg.headPitch += 24 * k; tg.headDX += 2 * k; tg.lid = Math.max(tg.lid, k); tg.earBack += 0.12 * k; } // chin scratches: chin up, eyes shut
      else if (R === 'back') { if (a === 'stand') { tg.hipY += 4 * k; tg.backLift -= 1.6 * k; tg.headDY -= 1 * k; } tg.lid = Math.max(tg.lid, 0.6); this.setTail('quiver', 2); }
      else if (R === 'tail') tg.earBack += 0.3 * k;
      if (this.nipT > 0) { this.nipT--; this.swat = Math.min(1, (18 - this.nipT) / 9); if (this.nipT === 0) { this.swat = 0; if (ri(2)) { this.setState('wander'); this.wg = 'walk'; } } }
    }
    poke(region) {
      this.w.sound.purr(this.id, false);
      this.mood.grump = Math.min(1, this.mood.grump + 0.3);
      if (this.burrowed) { this.popOut(null); return; }
      if (this.state === 'bed') { this.say('trill'); this.exitBed(); return; }
      if (this.state === 'nap') { this.say('trill'); this.setState('wake'); this.st = 60; return; }
      this.needs.love = Math.max(0, this.needs.love - 4);
      this.setState('flinch'); this.say(this.pers.sass > 50 ? 'hiss' : 'meow');
    }
    tap() {
      if (this.burrowed) { this.popOut(null); return; }
      if (NAPPING.includes(this.state)) { this.earT = 12; this.flickT = 16; return; }
      this.say(ri(2) ? 'trill' : 'chirp'); this.sb = this.sb || 34;
    }

    // ── pose for this frame ──
    animate() {
      const P = BZ.POSES, a = this.anim || 'stand', t = this.t;
      // the stretch is timed, not posed: gather, pour forward slowly, hold and tremble, SNAP into the back stretch, shake it off
      this.strT = a === 'stretch' ? (this.strT || 0) + 1 : 0;
      let lk = null, sk = a;
      if (a === 'stretch') {
        const u = this.strT;
        if (u < 10) { sk = 'crouch'; lk = 0.15; }
        else if (u < 52) { sk = 'stretch'; lk = 0.035 + 0.05 * ((u - 10) / 42); }
        else if (u < 74) { sk = 'stretch'; lk = 0.2; }
        else if (u < 96) { sk = 'stretchBack'; lk = u < 80 ? 0.42 : 0.12; }
        else { sk = 'stand'; lk = 0.3; }
      }
      let baseKey = sk === 'groom' ? 'sit' : sk === 'knead' ? 'loaf' : sk;
      // any step taken from a low pose (sit, loaf, crouch, stretch, rear...) is taken standing up — gait legs on a low body sank her into the floor
      if (this.gait) { // any step is taken on long legs: stalking steps slink, everything else stands up first
        if (GAITS[this.gait].low || baseKey === 'crouch' || baseKey === 'slink') baseKey = 'slink';
        else if ((P[baseKey] || P.stand).hipY < 29) baseKey = 'stand';
      }
      const base = P[baseKey] || P.stand;
      const tg = BZ.clonePose(base);
      if (a === 'stretch') {
        const u = this.strT;
        if (u >= 40 && u < 74) { const q = Math.sin(t * 1.9) * 0.6; tg.fl = [tg.fl[0] + q, tg.fl[1], tg.fl[2]]; tg.fr = [tg.fr[0] - q, tg.fr[1], tg.fr[2]]; tg.hipY += Math.sin(t * 1.3) * 0.4; tg.tailAmp = 2.5; tg.tailSpeed = 0.9; tg.tailWave = 0.15; } // trembling at full length
        if (u >= 46 && u < 70) { tg.mouth = 1; tg.headPitch += 8; tg.earBack = 0.55; } // the yawn at the peak
        if (u >= 96 && u < 112) tg.headRoll += Math.sin((u - 96) * 1.4) * 14 * (1 - (u - 96) / 16); // shake it off
      }
      if (this.gait) applyGait(tg, GAITS[this.gait], this.phase, this.strideK || 1, this.leadYaw || 0); else this.curV = Math.max(0, (this.curV || 0) * 0.6);
      if (this.leadYaw) this.leadYaw *= 0.9;
      if (a === 'groom') { // three kinds of wash: lick a paw and wipe the face, the leg-up 'cello', over the shoulder to the flank
        const gk = this.groomKind || 'paw', lick = Math.sin(t * 0.6) > 0 ? 1 : 0;
        if (gk === 'paw') { const c = t % 90, wash = c > 45, u = (c - 45) / 45; tg.modes = Object.assign({}, tg.modes, { fl: 'ik' });
          if (!wash) { tg.fl = [15, 20 + Math.sin(t * 0.3) * 1.5, 2]; tg.headYaw = 12; tg.headPitch = -32 + Math.sin(t * 0.6) * 6; tg.headDX = -1; tg.headDY = -6; tg.tongue = lick; }
          else { tg.fl = [13 + Math.cos(u * Math.PI) * 3, 30 + Math.sin(u * Math.PI) * 9, 3]; tg.headYaw = 26; tg.headRoll = 22 * Math.sin(u * Math.PI); tg.headPitch = -6; tg.earBack = 0.35 * Math.sin(u * Math.PI); }
          tg.lid = 0.7; }
        else if (gk === 'cello') { tg.modes = Object.assign({}, tg.modes, { br: 'ik' }); tg.hipY -= 1.5; tg.br = [2, 31 + Math.sin(t * 0.05) * 1.5, -6]; tg.flexBR = 0.6; tg.chestX -= 1; tg.headDX = -9; tg.headDY = -13; tg.headPitch = -46; tg.headYaw = -28; tg.headRoll = -12; tg.tongue = lick; tg.lid = 0.8; tg.tailSide = -10; }
        else { tg.headYaw = 105 + Math.sin(t * 0.05) * 8; tg.headDX = -11; tg.headDY = -7; tg.headPitch = -26; tg.headRoll = 14; tg.tongue = lick; tg.lid = 0.75; tg.chestZ += 1.5; }
      }
      if (a === 'wallStretch' && this.scratching) { const k = Math.sin(t * 0.38); tg.fl = [tg.fl[0], tg.fl[1] - 4 - k * 4, tg.fl[2]]; tg.fr = [tg.fr[0], tg.fr[1] - 4 + k * 4, tg.fr[2]]; tg.chestY -= 1 + Math.abs(k); tg.headPitch += 4; tg.earBack = 0.35; }
      if (a === 'bellyup') { tg.roll = this.rollAmt || 120; const k = Math.sin(t * 0.07); tg.fl = [tg.fl[0] + k * 1.5, tg.fl[1] + Math.abs(k) * 2, tg.fl[2]]; tg.fr = [tg.fr[0] - k * 1.5, tg.fr[1] + Math.abs(k) * 2, tg.fr[2]]; }
      if (this.boxDuck) { tg.chestY -= 9 * this.boxDuck; tg.headDY -= 3 * this.boxDuck; tg.hipY -= 2 * this.boxDuck; } // ducking down into the box
      if (this.sneezeT > 0) { this.sneezeT--; const u = this.sneezeT / 12; tg.headPitch -= 22 * Math.sin(Math.PI * u); tg.headDX += 3 * Math.sin(Math.PI * u); tg.lid = 1; tg.earBack = 0.5; }
      if (this.state === 'petted' || this.state === 'brushed') this.petPose(tg, a, t);
      if (a === 'knead') { const k = Math.sin(t * 0.25); tg.modes = Object.assign({}, tg.modes, { fl: 'ik', fr: 'ik' }); tg.fl = [17, 2.5 + Math.max(0, k) * 4, 3]; tg.fr = [17, 2.5 + Math.max(0, -k) * 4, -3]; tg.chestY += 4; tg.lid = 0.7; }
      if (this.swat) { // a swipe works from any pose; either paw, hooking inward at the end
        const u = clamp(this.swat, 0, 1), s = Math.sin(Math.PI * u) * (this.swatAmp || 1), key = this.swatSide ? 'fr' : 'fl', f = base[key], sd = this.swatSide ? -1 : 1;
        tg.modes = Object.assign({}, tg.modes, { [key]: 'ik' }); tg[key] = [Math.max(f[0], tg.chestX + 4) + 11 * s, Math.max(2.5, f[1]) + 12 * s, sd * (3 - 2.2 * Math.sin(Math.PI * u * u))];
        tg.chestY -= 1.2 * s; tg.headDX += 1.5 * s;
      }
      if (a === 'kick') { const k = t * 0.95; tg.bl = [tg.bl[0] + Math.sin(k) * 4.5, tg.bl[1] + Math.cos(k) * 2.5, tg.bl[2]]; tg.br = [tg.br[0] + Math.sin(k + 1.9) * 4.5, tg.br[1] + Math.cos(k + 1.9) * 2.5, tg.br[2]]; tg.headPitch += Math.sin(k * 0.5) * 6; }
      if (this.licking) { tg.headPitch -= 18; tg.headDX += 3; tg.tongue = Math.sin(t * 0.55) > 0 ? 1 : 0; tg.lid = 0.6; }
      if (this.beingGroomed > 0) { this.beingGroomed--; tg.lid = Math.max(tg.lid, 0.85); tg.headPitch += 8; tg.headRoll += 10; }
      if (this.nuzzle > 0) { this.nuzzle--; tg.headDX += 5 * Math.sin((this.nuzzle / 18) * Math.PI); tg.lid = Math.max(tg.lid, 0.6); }
      if (tg.tailWrap) { const c = Math.cos(this.theta); if (Math.abs(c) > 0.3) this.wrapDir = c > 0 ? -1 : 1; tg.tailSide = Math.abs(tg.tailSide) * (this.wrapDir || 1); } // wrap on the side facing you
      const lying = ['loaf', 'sphinx', 'baguette', 'crescent', 'dangle', 'lounge', 'flop', 'kick', 'tussle'].includes(a);
      if (lying) { const b = Math.sin(t * 0.075 + this.ping) * 0.65; tg.backLift += b; tg.chestY += b * 0.4; }
      if (this.asleep && (a === 'lounge' || a === 'flop') && (t % 520) < 26) tg.fl = [tg.fl[0] + Math.sin(t * 0.8) * 1.6, tg.fl[1], tg.fl[2]]; // dream paw
      if (this.chew && a === 'graze') { tg.mouth = Math.max(0, Math.sin(t * 0.55)) * 0.7; tg.headRoll += Math.sin(t * 0.55) * 7; }
      if (this.jaw) tg.mouth = Math.max(tg.mouth, Math.abs(Math.sin(t * 1.4)) * 0.5);
      if (this.state === 'petted') { tg.lid = Math.max(tg.lid, 0.55); tg.headRoll += 14 * Math.sin(t * 0.04); tg.headPitch += 10; }
      if (['engage', 'zoom', 'ambush', 'chaseBuddy'].includes(this.state)) tg.pupil = 0.7 + 0.3 * (this.interest[this.eng] || 1);
      if (this.state === 'engage' && this.mode === 'stalk' && this.wiggle > 0) tg.hipZ += Math.sin(t * 1.5) * 1.3; // butt wiggle
      if (this.yawn) { tg.mouth = 1; tg.lid = 0.85; tg.headPitch += 14; tg.earBack = 0.3; }
      if (this.mouthT > 0) tg.mouth = Math.max(tg.mouth, 0.8);
      if (a === 'eat') { tg.headDY += Math.sin(t * 0.8) * 1.2; tg.mouth = Math.max(0, Math.sin(t * 0.8)) * 0.6; }
      // ears: perk and swivel toward what interests her, flatten when grumpy, twitch in sleep
      if (this.perk > 0 && this.lookAt) { tg.earBack -= 0.3 * this.perk; tg.earTurn += clamp((this.lookAt[0] - this.x) / 8, -14, 14) * Math.sign(Math.cos(this.theta) || 1); }
      tg.earBack += this.mood.grump > 0.5 ? (this.mood.grump - 0.5) * 1.2 : 0;
      if (this.earT > 0) tg.earBack = Math.max(tg.earBack, 0.45 * Math.sin((this.earT / 10) * Math.PI));
      if (this.lookAt && !lying) tg.headRoll += this.isBo ? 7 : 12 * Math.sin(t * 0.01 + this.ping); // signature head tilts
      const alert = ['engage', 'zoom', 'flinch', 'held', 'beg', 'pounce', 'startle', 'react', 'ambush'].includes(this.state);
      if (this.isBo && !alert) tg.lid = Math.max(tg.lid, 0.32);
      // tail moods: her telemetry
      const tm = this.tailMood || (this.gait && this.gait !== 'run' ? (this.mood.grump > 0.5 ? 'lash' : this.needs.love > 45 ? 'happy' : 'low') : null);
      if (tm === 'happy') Object.assign(tg, { tailEl: 80, tailCurl: -3, tailHook: -46, tailAmp: 5, tailSpeed: 0.08, tailWave: 0.45 });
      if (tm === 'low') Object.assign(tg, { tailEl: 18, tailCurl: -2, tailHook: -14, tailAmp: 7, tailSpeed: 0.07, tailWave: 0.55 });
      if (tm === 'quiver') Object.assign(tg, { tailEl: 88, tailCurl: -2, tailHook: -34, tailAmp: 2.5, tailSpeed: 1.1, tailWave: 0.2 });
      if (tm === 'lash') { if (lying || a === 'sit') Object.assign(tg, { tailAmp: 34, tailSpeed: 0.5, tailWave: 0.7 }); else Object.assign(tg, { tailEl: 16, tailCurl: -1, tailHook: 0, tailAmp: 30, tailSpeed: 0.36, tailWave: 0.7 }); }
      if (tm === 'twitch') Object.assign(tg, { tailAmp: 9, tailSpeed: 0.75, tailWave: 0.9 });
      if (tm === 'streak') Object.assign(tg, { tailEl: 6, tailCurl: 0, tailHook: 10, tailAmp: 4, tailSpeed: 0.2, tailWave: 0.4 });
      // head look toward a point, clamped
      if (this.lookAt && !(isFinite(this.lookAt[0]) && isFinite(this.lookAt[1]))) this.lookAt = null; // never look at nowhere
      if (this.lookAt && this.screen && !this.asleep) {
        const H = this.screen[BZ.IDX.head], dx = this.lookAt[0] - H[0], dy = this.lookAt[1] - H[1];
        const lx = dx * Math.cos(this.theta) + 60 * Math.sin(this.theta), lz = dx * Math.sin(this.theta) - 60 * Math.cos(this.theta);
        tg.headYaw += clamp((Math.atan2(lz, lx) * 180) / Math.PI, -70, 70);
        tg.headPitch += clamp(((Math.atan2(-dy, Math.hypot(dx, 60)) * 180) / Math.PI) * 0.6, -25, 30);
        this.look = this.lookAt;
      } else this.look = null;
      const flying = ['pounce', 'bedHop', 'startle'].includes(this.state);
      if (flying) tg.rootY = this.pose.rootY; else tg.rootY += (this.bedRoot || 0) + (this.hopY || 0);
      BZ.lerpPose(this.pose, tg, (lk || (this.gait ? 0.5 : this.state === 'held' ? 0.4 : 0.2)) * (0.8 + 0.2 * this.tempo));
      if (flying || this.hopY) this.pose.rootY = tg.rootY;
      if (!(isFinite(this.pose.headYaw) && isFinite(this.pose.headPitch) && isFinite(this.pose.hipY) && isFinite(this.pose.rootY))) this.pose = BZ.clonePose(tg); // self-heal a bad frame
      this.updateTail();
      this.skel = BZ.buildSkeleton(this.pose, t, this.tail, this.shape);
    }
    // tail: damped springs (stiff base, silky tip) + body inertia, so every
    // change pours down it as a wave
    // ── tail gestures, layered on the springs so every one of them flows ──
    tailGesture(kind) {
      if (!this.tailFx) this.tailFx = []; if (this.tailFx.length > 2) return;
      const T = { flick: 12, twitch: 30, curl: 70, hook: 60, swish: 80, thump: 16, wave: 100, shiver: 45 }[kind] || 40;
      this.tailFx.push({ kind, t: 0, T: (T * rr(0.8, 1.25)) / Math.max(0.6, this.tempo), dir: ri(2) ? 1 : -1 });
    }
    tailSchedule() {
      if ((this.tailGestT = (this.tailGestT || 60) - 1) > 0) return;
      const s = this.state, m = this.mood, lying = ['loaf', 'sphinx', 'baguette', 'crescent', 'dangle', 'lounge', 'flop'].includes(this.anim);
      let k;
      if (this.asleep) k = pick({ flick: 2, curl: 1, none: 6 });
      else if (s === 'engage') k = this.mode === 'stalk' ? pick({ twitch: 3, none: 1 }) : pick({ twitch: 2, flick: 1, swish: 1 });
      else if (['come', 'visit', 'beg', 'follow'].includes(s)) k = pick({ hook: 3, shiver: 2, curl: 1 });
      else if (s === 'petted') k = pick({ shiver: 2, curl: 2, wave: 1 });
      else if (m.grump > 0.5) k = lying ? pick({ thump: 3, flick: 2 }) : pick({ flick: 3, swish: 2, thump: 1 });
      else k = pick({ wave: 2, curl: 2, swish: 2, flick: 1, hook: this.gait ? 2 : 0.5, twitch: this.lookAt ? 1.5 : 0, none: 2 });
      if (k !== 'none') this.tailGesture(k);
      this.tailGestT = (rr(60, 210) / this.tempo) | 0;
    }
    tailFxApply(tt, n) {
      const t = this.t, idle = this.asleep ? 0.35 : 1;
      for (let i = 0; i < n; i++) { const k = i / (n - 1), k2 = k * k; // the tip is never quite still
        tt.sd[i] += k2 * 0.16 * idle * (Math.sin(t * 0.031 + this.ping) + 0.6 * Math.sin(t * 0.053 + this.ping * 2));
        tt.el[i] += k2 * 0.1 * idle * Math.sin(t * 0.023 + this.ping * 3); }
      for (const f of this.tailFx || []) {
        f.t++; const u = f.t / f.T, env = Math.sin(Math.PI * Math.min(1, u)), d = f.dir;
        for (let i = 0; i < n; i++) { const k = i / (n - 1);
          switch (f.kind) {
            case 'flick': if (k > 0.5) tt.sd[i] += d * 1.0 * env * ((k - 0.5) / 0.5); break;
            case 'twitch': if (k > 0.68) tt.sd[i] += 0.34 * Math.sin(f.t * 1.7) * env * ((k - 0.68) / 0.32); break;
            case 'curl': if (k > 0.45) { const w = (k - 0.45) / 0.55; tt.el[i] += 1.3 * env * w * w; tt.sd[i] += d * 0.5 * env * w; } break;
            case 'hook': if (k > 0.62) tt.el[i] -= 1.5 * env * ((k - 0.62) / 0.38); break;
            case 'swish': tt.sd[i] += d * 0.9 * Math.sin(2 * Math.PI * u) * k * env; break;
            case 'thump': tt.el[i] -= 0.7 * env * Math.min(1, k * 2.2); break;
            case 'wave': tt.sd[i] += 0.45 * Math.sin(4 * Math.PI * u - k * 6) * k * env; break;
            case 'shiver': tt.el[i] += 0.1 * Math.sin(f.t * 2.6 + k * 4) * env * (0.3 + k); break;
          }
        }
      }
      if (this.tailFx) this.tailFx = this.tailFx.filter((f) => f.t < f.T);
    }
    updateTail() {
      const tt = BZ.tailTargets(this.pose, this.t), T = this.tail, n = tt.el.length;
      this.tailSchedule(); this.tailFxApply(tt, n);
      const dTheta = wrap(this.theta - this.lastTheta); this.lastTheta = this.theta;
      const v = Math.abs(this.x - this.lastX) / Math.max(0.5, this.petScale); this.lastX = this.x;
      const acc = v - this.vel; this.vel = v;
      for (let i = 0; i < n; i++) {
        const k = i / (n - 1), stiff = 0.26 - 0.19 * k, damp = 0.8 + 0.06 * k;
        let te = tt.el[i] - acc * 0.25 * k - v * 0.03 * k;
        if (this.flickT > 0 && k > 0.7) te += Math.sin((this.flickT / 18) * Math.PI * 2) * 0.55 * ((k - 0.7) / 0.3);
        T.ve[i] = T.ve[i] * damp + (te - T.el[i]) * stiff; T.el[i] += T.ve[i];
        T.vs[i] = T.vs[i] * damp + (tt.sd[i] - T.sd[i]) * stiff; T.sd[i] += T.vs[i] - dTheta * k * 1.1;
      }
    }
  }

  // ours: the walk. Lateral sequence, but every part has intent: front paws
  // peel off with a wrist flick, swing high, reach past the mark and settle;
  // hind paws step into the front prints on a narrow runway track; the
  // shoulder over the planted leg rises (the blades roll), the spine sways,
  // and the head rides level and low, leading turns.
  function applyGait(p, g, phase, k, lead) {
    const legs = ['fl', 'fr', 'bl', 'br'], fk = ['flexFL', 'flexFR', 'flexBL', 'flexBR'], A = g.a * k, run = g.a > 10;
    const girdle = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
      const front = i < 2, side = i % 2 ? -1 : 1;
      const pl = (((phase + g.offs[i]) % 1) + 1) % 1, base = p[legs[i]][0];
      let x, y, f;
      if (pl < g.stance) {
        const u = pl / g.stance; x = base + A * (1 - 2 * u); y = 2.5;
        f = u > 0.82 ? ((u - 0.82) / 0.18) * (front ? 0.55 : 0.7) : 0; // heel peels up before lift-off
        girdle[i] = Math.sin(Math.PI * u);
      } else {
        const u = (pl - g.stance) / (1 - g.stance), sm = (1 - Math.cos(Math.PI * u)) / 2;
        x = base - A + 2 * A * (sm + 0.11 * Math.sin(Math.PI * u) * u * u); // overreach, then set down
        y = 2.5 + g.lift * k * (front ? 1.55 * Math.sin(Math.PI * Math.pow(u, 0.7)) : 0.8 * Math.sin(Math.PI * u));
        f = front ? Math.sin(Math.PI * Math.min(1, u / 0.62)) : 0.9 * Math.sin(Math.PI * Math.min(1, u / 0.78));
        girdle[i] = -0.35 * Math.sin(Math.PI * u);
      }
      const z = run ? p[legs[i]][2] : side * (front ? 2.7 : 3.1);
      p[legs[i]] = [x, y, z]; p[fk[i]] = f;
    }
    p.modes = { fl: 'ik', fr: 'ik', bl: 'ik', br: 'ik' };
    p.roll = 0;
    p.shL = 1.3 * girdle[0]; p.shR = 1.3 * girdle[1]; p.thL = 0.8 * girdle[2]; p.thR = 0.8 * girdle[3];
    const b = Math.sin(phase * Math.PI * 4), sw = Math.sin(phase * Math.PI * 2);
    if (g.low) { p.fl = [p.fl[0] + 1.5, p.fl[1], p.fl[2]]; p.fr = [p.fr[0] + 1.5, p.fr[1], p.fr[2]]; } // prowl: low and level, never belly- or butt-dragging
    p.chestY += b * 0.3 - 0.3 * (1 - g.low); p.hipY += Math.sin(phase * Math.PI * 4 + 1.2) * 0.3 + 0.4;
    p.backLift += 0.5 * Math.sin(phase * Math.PI * 4 + 0.6);
    p.hipZ = 0.9 * sw; p.chestZ = -0.7 * sw; // lateral undulation down the spine
    p.headDY -= b * 0.3 + 0.8 + 4 * g.low; p.headDX += 0.8 + 3 * g.low; p.headPitch -= 2 + 4 * g.low; // low, level, purposeful
    p.headYaw += (lead || 0) + 2.5 * Math.sin(phase * Math.PI * 2 + 0.8);
    if (run) { const f = Math.sin(phase * Math.PI * 2); p.chestX += 3.5 * f; p.hipX -= 3.5 * f; p.rootY = 3 * Math.max(0, f); p.earBack = 0.3; p.headDY -= 3; }
  }

  // ── World ────────────────────────────────────────────────────────────────
  class World {
    constructor(canvas, overlay, host) {
      this.cv = canvas; this.ctx = canvas.getContext('2d'); this.ov = overlay; this.octx = overlay.getContext('2d');
      this.host = host || {};
      this.PX = 2; this.size = 1.2; this.mode = 'roam';
      this.cats = []; this.items = []; this.scene = null; this.rels = {}; this.stimuli = [];
      this.sceneKey = 'room'; this.place = null; this.sets = { room: [], yard: [], desk: [] }; // each place keeps its own things
      this.sound = BZ.Sound();
      this.pointer = { x: -999, y: -999, down: false, inside: false };
      this.laser = { on: false, x: 0, y: 0, vx: 0, vy: 0, speed: 0 }; this.tool = null; this.fx = [];
      this.wand = { hx: 0, hy: 0, fx: 0, fy: 0, vx: 0, vy: 0, caught: null, init: false };
      this.callT = 0; this.callId = 0; this.carrying = null; this.press = null; this.drag = null; this.heldCat = null;
      this.interactive = null; this.frame = 0; this.hover = null; this.hoverT = 0;
      this.cam = { x: 0, tx: 0, hold: 0 }; this.view = null; // on a narrow screen the stage is wider than the window and a camera follows the cats
      this.resize();
      addEventListener('resize', () => this.resize());
      const pt = (e) => [e.clientX / this.PX, e.clientY / this.PX];
      this.touch = false; this.pid = null;
      document.addEventListener('pointermove', (e) => { if (this.pid != null && e.pointerId !== this.pid) return; if (e.pointerType === 'touch' && !this.pointer.down) return; if (this.pan) { const dx = e.clientX - this.pan.x0; if (Math.abs(dx) > 6) this.pan.moved = true; if (this.pan.moved) { this.cam.x = this.cam.tx = clamp(this.pan.cam0 - dx / this.PX, 0, this.stage.w - this.view.w); this.cam.hold = 240; this.press = null; return; } } this.moveTo(e.clientX, e.clientY); });
      document.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 || e.target.closest('[data-ui]') || this.pid != null) return;
        this.pid = e.pointerId; this.touch = e.pointerType === 'touch'; this.sound.unlock();
        const [x, y] = [e.clientX / this.PX + this.cam.x, e.clientY / this.PX]; Object.assign(this.pointer, { x, y, inside: true, down: true }); this.onDown();
        if (this.touch && this.view && !this.drag && !this.press && !this.carrying && !this.tool) this.pan = { x0: e.clientX, cam0: this.cam.x, moved: false }; // a finger on empty ground pans the room
        if (this.touch && !this.drag && !this.press && !this.carrying && !this.tool) this.onMove();
      });
      const up = (e) => { if (e.pointerId !== this.pid) return; this.pid = null; this.pointer.down = false; this.pan = null; this.onUp(); if (this.touch) { this.pointer.inside = false; this.pointer.x = -999; this.pointer.y = -999; } };
      document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up);
      document.documentElement.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') this.pointer.inside = false; });
      this.timer = setInterval(() => this.tick(), FRAME);
    }
    moveTo(cx, cy) {
      const x = cx / this.PX + this.cam.x, y = cy / this.PX;
      this.pointer.inside = cx >= 0 && cy >= 0 && cx < innerWidth && cy < innerHeight;
      if (x === this.pointer.x && y === this.pointer.y) return;
      this.pointer.x = x; this.pointer.y = y; this.onMove();
    }
    resize() {
      const dpr = devicePixelRatio || 1;
      this.W = Math.ceil(innerWidth / this.PX); this.H = Math.ceil(innerHeight / this.PX);
      this.cv.width = this.W; this.cv.height = this.H;
      this.cv.style.width = this.W * this.PX + 'px'; this.cv.style.height = this.H * this.PX + 'px';
      this.ov.width = innerWidth * dpr; this.ov.height = innerHeight * dpr; this.octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.ctx.imageSmoothingEnabled = false;
      this.layoutStage();
    }
    layoutStage() {
      const r = this.stageRect ? this.stageRect() : null;
      this.stage = r ? { x: Math.round(r.x / this.PX), y: Math.round(r.y / this.PX), w: Math.round(r.w / this.PX), h: Math.round(r.h / this.PX) } : { x: 0, y: 0, w: this.W, h: this.H };
      const minW = r && r.minW ? Math.round(r.minW / this.PX) : 0;
      if (minW > this.stage.w) { this.view = { x: this.stage.x, w: this.stage.w }; this.stage.w = minW; this.cam.x = clamp(this.cam.x, 0, minW - this.view.w); } else { this.view = null; this.cam.x = this.cam.tx = 0; }
      if (this.scene) { this.scene.layout(this.stage); this.floorTop = this.stage.y + this.scene.floorY + 4; }
      else this.floorTop = this.stage.y + Math.round(this.stage.h * 0.22);
      for (const c of this.cats) if (!c.inBed && c.state !== 'bedHop') c.clampToStage();
      for (const it of this.items) if (!it.fixed) this.clampItem(it);
      this.syncFixtures(); this.resnap();
    }
    // built-in perches that aren't placeable things: the window ledge (habitat) and the daybed's second seat.
    // Kept as the same objects across relayouts so a cat sitting on one isn't knocked off.
    syncFixtures() {
      const sc = this.scene, st = this.stage, old = this.items.filter((i) => i.fixed), keep = new Set();
      const put = (wf) => { let f = old.find((o) => o.key === wf.key); if (f) Object.assign(f, wf); else { f = Object.assign({ fixed: true, t: 0, vx: 0, vy: 0 }, wf); this.items.push(f); } keep.add(f); return f; };
      if (sc && sc.win) { const y = this.floorTop + 1, top = st.y + sc.win.y1 + 1; put({ key: 'ledgeL', type: 'ledge', x: st.x + sc.win.x0 + 22, y, rootPx: y - top, face: -Math.PI / 2 + 0.3 }); put({ key: 'ledgeR', type: 'ledge', x: st.x + sc.win.x1 - 20, y: y + 0.5, rootPx: y + 0.5 - top, face: -Math.PI / 2 - 0.3 }); }
      if (sc && sc.furniture) for (const f of sc.furniture) put(Object.assign({ draw: true }, f)); // the scene's own furniture: drawn and sat on, never dragged
      if (sc && sc.fixtures) for (const f of sc.fixtures(this)) put(f);
      for (const it of [...this.items]) if ((it.type === 'daybed' || it.type === 'adk' || it.type === 'lamptable') && (!it.fixed || keep.has(it))) put({ key: 'seat:' + (it.uid || (it.uid = it.key || Math.random().toString(36).slice(2))), type: 'seat', parent: it, x: it.x + 1, y: it.y, dogOn: !!it.dogSeat }); // dogOn: Juno's cushion, nobody else's
      for (const o of old) if (!keep.has(o)) { o.gone = true; this.items.splice(this.items.indexOf(o), 1); }
    }
    clampItem(it) { if (it.surf) return; const st = this.stage; it.x = clamp(it.x, st.x + 14, st.x + st.w - 14); it.y = clamp(it.y, this.floorTop + 2, st.y + st.h - 3); }
    // ── surfaces: the window sill, the bookcase top and shelves, the table top — small things can sit up there ──
    surfaces() {
      const out = this.scene && this.scene.surfaces ? this.scene.surfaces() : [], k = this.size * 0.95;
      for (const it of this.items) if (it.type === 'ctable' && !it.held) out.push({ key: it.fixed ? 'ctable' : 'ctable:' + (it.uid || (it.uid = Math.random().toString(36).slice(2))), x0: it.x - 30 * k, x1: it.x + 32 * k, y: it.y - 27.5 * k, ground: it.y + 0.25 });
      return out;
    }
    canPerch(type) { const d = BZ.ITEMS[type]; return !!d && !d.bed && !d.tool && !d.floor && !d.fixed && !d.snack && type !== 'bowl'; }
    surfaceAt(x, gy, type) { if (!this.canPerch(type)) return null; let best = null, bd = 14; for (const s of this.surfaces()) { if (x < s.x0 - 2 || x > s.x1 + 2) continue; const d = Math.abs(gy - s.y); if (d < bd) { bd = d; best = s; } } return best; }
    setOn(it, s, x) { if (!s) { it.surf = null; it.lift = 0; this.clampItem(it); return; } it.surf = s.key; it.x = clamp(x, s.x0, s.x1); it.su = (it.x - s.x0) / Math.max(1, s.x1 - s.x0); it.y = s.ground; it.lift = s.ground - s.y; it.vx = it.vy = 0; it.z = 0; it.vz = 0; }
    resnap() { const sc = this.scene; if (sc && sc.slotPos) for (const it of this.items) if (it.type === 'sprout') { const p = sc.slotPos(it.plot, it.slot); if (p) { it.x = p[0]; it.y = p[1]; } } const S = this.surfaces(); for (const it of this.items) if (it.surf && !it.held) { const s = S.find((q) => q.key === it.surf); if (s) this.setOn(it, s, s.x0 + (it.su || 0) * (s.x1 - s.x0)); else { it.surf = null; it.lift = 0; this.clampItem(it); } } }
    knockOff(it, side) { const h = it.lift || 0; it.surf = null; it.lift = 0; it.z = h; it.vz = 0.8 * this.size; it.vx = side * rr(0.8, 1.8); it.vy = rr(0.5, 1.2); it.knocked = this.frame; }
    // ── places: the room and the yard (in the habitat window) and the desktop each keep their own things ──
    placeFor() { return this.mode === 'habitat' ? this.sceneKey : 'desk'; }
    makeScene() { return this.sceneKey === 'yard' ? new BZ.Yard(this) : new BZ.Jungle(this); }
    swapPlace(next) {
      if (this.place === next) return;
      if (this.place) this.sets[this.place] = this.items.filter((i) => !i.fixed);
      if (this.heldCat) { this.heldCat = null; this.press = null; }
      this.drag = null; this.carrying = null;
      for (const c of this.cats) this.resetCat(c);
      this.place = next; this.items = this.sets[next] || (this.sets[next] = []);
    }
    resetCat(c) { c.unburrow(); c.setState('idle'); c.pose.rootY = 0; c.bedRoot = 0; c.hidden = false; c.bedItem = null; c.food = null; c.lurkAt = null; c.sortY = null; c.clip = null; this.sound.purr(c.id, false); }
    setHabitat(on, stageRect) {
      this.stageRect = stageRect || null;
      this.mode = on ? 'habitat' : 'roam';
      this.swapPlace(this.placeFor());
      if (on && (!this.scene || this.scene.key !== this.sceneKey)) this.scene = this.makeScene();
      if (!on) this.scene = null;
      this.layoutStage();
    }
    setScene(key) {
      if (!['room', 'yard'].includes(key) || key === this.sceneKey) return;
      this.sceneKey = key;
      if (this.mode !== 'habitat') return;
      this.swapPlace(key); this.scene = this.makeScene(); this.layoutStage();
      const st = this.stage;
      if (key === 'yard') { const stoop = this.items.find((i) => i.type === 'stoop'); this.cats.forEach((c, i) => { if (stoop) { c.setState('enter'); c.enterDelay = 12 + i * 50; c.hidden = true; } }); } // out through the studio doors, one at a time
      else this.cats.forEach((c, i) => { c.x = st.x + 24 + i * 26; c.y = this.floorTop + (st.y + st.h - this.floorTop) * (0.3 + 0.2 * i); c.theta = 0; c.setState('wander'); c.target = [st.x + st.w * (0.35 + 0.15 * i), c.y]; c.wg = 'walk'; c.st = 2; });
    }
    rel(a, b) { const k = a.id < b.id ? a.id + '|' + b.id : b.id + '|' + a.id; return this.rels[k] || (this.rels[k] = { bond: 0.75, tension: 0.1, ph: Math.random() * 6 }); }
    sunSpots() {
      const out = [], s = this.size;
      for (const it of this.items) if (it.type === 'sun' && !it.held) out.push({ item: it, slots: BZ.sunSlots(it, s), has: (x, y) => BZ.inSun(it, x, y, s) });
      if (this.scene && this.scene.sunSpots) out.push(...this.scene.sunSpots());
      else if (this.scene) { const sn = this.scene.sun; out.push({ item: null, slots: [[sn.x - 16 * s, sn.y], [sn.x + 18 * s, sn.y - 3]], has: (x, y) => Math.abs(x - sn.x) < 70 * s && Math.abs(y - sn.y) < 24 * s }); }
      return out;
    }
    inSun(x, y) { return this.sunSpots().some((s) => s.has(x, y)); }

    // ── commands ──
    cmd(name, arg) {
      this.sound.unlock();
      switch (name) {
        case 'adopt': this.adopt(arg && arg.coat, arg && arg.name); break;
        case 'call': this.call(); break;
        case 'carry': if (BZ.ITEMS[arg] && BZ.ITEMS[arg].tool) { this.tool = this.tool === arg ? null : arg; this.laser.on = this.tool === 'laser'; this.wand.init = false; this.wand.caught = null; this.carrying = null; } else { this.carrying = this.carrying === arg ? null : arg; } break;
        case 'remove': if (BZ.ITEMS[arg] && BZ.ITEMS[arg].tool) { if (this.tool === arg) this.tool = null; this.laser.on = this.tool === 'laser'; } else for (const it of this.items.filter((i) => i.type === arg)) this.removeItem(it); break;
        case 'away': for (const it of [...this.items]) if (!BZ.ITEMS[it.type].bed && it.type !== 'sun' && !it.fixed && it.type !== 'sprout') this.removeItem(it); this.laser.on = false; this.tool = null; this.carrying = null; break;
        case 'size': this.setSize(arg); break;
        case 'sound': this.sound.enabled = arg != null ? !!arg : !this.sound.enabled; break;
        case 'sendHome': this.sendHome(arg); break;
        case 'save': this.save(); return;
        case 'scene': this.setScene(arg); break;
      }
      this.changed();
    }
    adoptable() { return this.cats.some((c) => c.coatKey === 'bunny') ? Object.keys(BZ.COATS).filter((k) => k !== 'bo' && k !== 'bunny') : ['bunny']; }
    adopt(coat, name) {
      coat = BZ.COATS[coat] ? coat : 'bo';
      const used = new Set(this.cats.map((c) => c.name));
      if (!name) name = BZ.COATS[coat].name && !used.has(BZ.COATS[coat].name) ? BZ.COATS[coat].name : (BZ.NAMES.filter((n) => !used.has(n))[ri(10)] || 'Rex');
      const st = this.stage, fromLeft = ri(2) === 0;
      const c = new Cat({ name, coat, x: fromLeft ? st.x + 20 : st.x + st.w - 20, y: this.floorTop + (st.y + st.h - this.floorTop) * rr(0.35, 0.85), theta: fromLeft ? 0 : Math.PI }, this);
      this.cats.push(c); c.clampToStage(); c.setState('wander'); c.target = [st.x + st.w * rr(0.3, 0.7), c.y]; c.wg = 'walk'; c.st = 2;
      setTimeout(() => c.say('trill'), 700);
      return c;
    }
    defaultsFor(place) {
      const st = this.stage, out = [];
      if (place === 'yard') { // a garden already started: some up, some just sprouting, plenty of empty spots for you
        for (const [kind, plot, slot, g] of [['catgrass', 'patchA', 1, 420], ['catgrass', 'patchA', 2, 300], ['lavender', 'wallBed', 0, 420], ['poppy', 'wallBed', 2, 300], ['cosmos', 'lawnBed', 1, 420], ['tulip', 'lawnBed', 3, 160], ['sunflower', 'lawnBed', 5, 60]]) { const it = Object.assign(BZ.newItem('sprout', 0, 0), { kind, plot, slot, g, water: 0 }); BZ.growSprout(it); out.push(it); }
        return out;
      }
      out.push(BZ.newItem('pod', st.x + st.w * 0.26, st.y + st.h * 0.78), BZ.newItem('grass', st.x + st.w * 0.74, st.y + st.h * 0.88));
      for (const it of out) this.clampItem(it);
      return out;
    }
    load(d) {
      d = d || {};
      if (d.size) this.size = d.size;
      if (d.sound === false) this.sound.enabled = false;
      if (!(d.v >= 3) && d.cats) d.cats = d.cats.filter((c, i) => i === 0 || c.coat === 'bunny'); // v3: launch is Bo only — the old auto-adopted grey (Marcel) goes home
      for (const c of d.cats || []) { if (c.breed && !c.coat) c.coat = c.breed === 'bo' ? 'bo' : null; if (!BZ.COATS[c.coat]) continue; const cat = new Cat(c, this); cat.clampToStage(); this.cats.push(cat); }
      const away = d.savedAt ? Math.min(7200, Math.max(0, (Date.now() - d.savedAt) / 1000)) : 0;
      const mkItems = (list, place) => (list || []).filter((i) => BZ.ITEMS[i.type] && !(place !== 'desk' && (i.type === 'daybed' || i.type === 'ctable'))).map((i) => { const it = Object.assign(BZ.newItem(i.type, i.x, i.y), i); if (it.type === 'sprout') { it.g = (it.g || 0) + away * 0.6; BZ.growSprout(it); } return it; }); // the garden kept growing while you were away
      if (d.sets) for (const k of ['room', 'yard', 'desk']) this.sets[k] = d.sets[k] ? mkItems(d.sets[k], k) : this.defaultsFor(k);
      else if (d.items) { this.sets.room = mkItems(d.items, 'room'); this.sets.desk = mkItems(d.items, 'desk'); } // older saves: the one set of things goes to both
      else { this.sets.room = this.defaultsFor('room'); this.sets.desk = this.defaultsFor('desk'); }
      if (!d.sets || !d.sets.yard) this.sets.yard = this.defaultsFor('yard');
      if (d.rels) this.rels = d.rels;
      if (d.scene === 'yard') this.sceneKey = 'yard';
      if (this.mode === 'habitat' && (!this.scene || this.scene.key !== this.sceneKey)) this.scene = this.makeScene();
      this.place = this.placeFor(); this.items = this.sets[this.place];
      this.layoutStage();
      if (!this.cats.length) this.adopt('bo', 'Bo');
      this.changed(false);
    }
    sendHome(id) { const i = this.cats.findIndex((c) => c.id === id); if (i >= 0) { this.sound.purr(id, false); const c = this.cats[i]; c.setState('idle'); this.cats.splice(i, 1); } }
    call() { this.callT = 40; this.callId++; for (const c of this.cats) c.arrived = false; }
    setSize(s) { this.size = s; for (const c of this.cats) c.updateScale(); this.layoutStage(); }
    removeItem(it) {
      const i = this.items.indexOf(it); if (i >= 0) this.items.splice(i, 1); it.gone = true; if (it.type === 'daybed' || it.type === 'lamptable') this.syncFixtures();
      if (BZ.ITEMS[it.type] && BZ.ITEMS[it.type].bed) for (const c of this.cats) if (c.bedItem === it && ['toBed', 'bed', 'bedHop'].includes(c.state)) { c.setState('idle'); c.pose.rootY = 0; }
    }
    changed(save = true) { if (this.host.onChange) this.host.onChange(this.summary()); if (save) this.save(); }
    summary() {
      const placed = {}; for (const it of this.items) if (!it.fixed) placed[it.type] = true; if (this.tool) placed[this.tool] = true;
      return { cats: this.cats.map((c) => ({ id: c.id, name: c.name, coat: c.coatKey, coatLabel: c.coat.label, coatNote: c.coat.note, pers: c.pers.label, mood: c.moodLabel, needs: { belly: Math.round(c.needs.belly), energy: Math.round(c.needs.energy), love: Math.round(c.needs.love) } })),
        placed, carrying: this.carrying, tool: this.tool, mode: this.mode, scene: this.sceneKey, place: this.place, sound: this.sound.enabled, size: this.size, adoptable: this.adoptable() };
    }
    save() {
      if (!this.host.save) return;
      if (this.place) this.sets[this.place] = this.items.filter((i) => !i.fixed);
      const pack = (list) => (list || []).filter((i) => BZ.ITEMS[i.type] && !BZ.ITEMS[i.type].consumable && !i.fixed).map((i) => ({ type: i.type, x: Math.round(i.x), y: Math.round(i.y), servings: i.servings, surf: i.surf || undefined, su: i.surf ? +(+i.su).toFixed(3) : undefined, kind: i.kind, plot: i.plot, slot: i.slot, g: i.g != null ? Math.round(i.g) : undefined, water: i.water != null ? +i.water.toFixed(2) : undefined }));
      this.host.save({ cats: this.cats.map((c) => c.serialize()), sets: { room: pack(this.sets.room), yard: pack(this.sets.yard), desk: pack(this.sets.desk) }, scene: this.sceneKey, rels: this.rels, size: this.size, sound: this.sound.enabled, v: 4, savedAt: Date.now() });
    }

    nearestCat(x, y, pred) { let b = null, bd = Infinity; for (const c of this.cats) { if (pred && !pred(c)) continue; const d = dist(c.x, c.y, x, y); if (d < bd) { bd = d; b = c; } } return b; }
    dogAt(x, y) { const d = this.scene && this.scene.dog; return d && d.hits ? d.at(x, y) : null; }
    catAt(x, y) { // read_out HitTest: nearest first, each a square as wide as drawn
      const order = [...this.cats].sort((a, b) => (b.sortY ?? b.y) - (a.sortY ?? a.y));
      if (this.heldCat) order.unshift(this.heldCat);
      for (const c of order) {
        if (c.hidden) { const L = c.bedItem && c.bedItem.lump; if (L && Math.abs(x - L.x) < 13 * this.size && Math.abs(y - (L.y - 4 * this.size)) < 8 * this.size) return { cat: c, region: 'back' }; continue; }
        if (c.clip && !BZ.ballSpanE(c.clip.cx, c.clip.cy, c.clip.rx, c.clip.ry, Math.floor(y))) continue;
        for (const h of c.hits || []) if (Math.abs(x - h.x) <= h.r + 1 && Math.abs(y - h.y) <= h.r + 1) return { cat: c, region: h.region };
      }
      return null;
    }
    // a free bed under the pointer (generous target: the whole pod / seat)
    bedUnder(x, y, cat) {
      for (let i = this.items.length - 1; i >= 0; i--) {
        const it = this.items[i]; if (!BZ.ITEMS[it.type].bed || it.held || it.dogOn || (it.occupant && it.occupant !== cat.id)) continue;
        const g = BZ.bedGeom(it, this.size);
        if (BZ.itemHit(it, x, y, this.size) || dist(x, y, g.spot[0], g.spot[1] - g.rootPx - 14 * this.size) < (it.fixed ? 26 : 36) * this.size) return it;
      }
      return null;
    }
    itemAt(x, y) { for (let i = this.items.length - 1; i >= 0; i--) if (BZ.itemHit(this.items[i], x, y, this.size)) return this.items[i]; return null; }

    // ── the feather wand: a feather on a string under the cursor, swinging like a pendulum ──
    tickWand() {
      const W = this.wand, p = this.pointer; if (this.tool !== 'wand') return;
      if (!W.init) { W.hx = p.x; W.hy = p.y; W.fx = p.x; W.fy = p.y + 24 * this.size; W.vx = W.vy = 0; W.init = true; }
      W.hx = p.x; W.hy = p.y;
      if (W.caught) { const c = W.caught.cat; if (!this.cats.includes(c) || --W.caught.T <= 0) { W.caught = null; W.vy = -3; } else { const pw = c.screen ? c.screen[BZ.IDX.pawL] : [c.x, c.y - 10]; W.fx += (pw[0] - W.fx) * 0.5; W.fy += (pw[1] - W.fy) * 0.5; W.vx = W.vy = 0; return; } }
      const Ls = 28 * this.size; W.vy += 0.32 * this.size; W.vx *= 0.965; W.vy *= 0.965; W.fx += W.vx; W.fy += W.vy;
      const dx = W.fx - W.hx, dy = W.fy - W.hy, d = Math.hypot(dx, dy);
      if (d > Ls) { const nx = dx / d, ny = dy / d; W.fx = W.hx + nx * Ls; W.fy = W.hy + ny * Ls; const vr = W.vx * nx + W.vy * ny; if (vr > 0) { W.vx -= vr * nx; W.vy -= vr * ny; } }
      const flo = this.stage.y + this.stage.h - 2; if (W.fy > flo) { W.fy = flo; W.vy *= -0.3; }
    }
    dress(c) { // cream knit, a ribbon bow: green for Bo, brown for Bunny (from the lamp-table photos)
      if (c.sweater) { c.sweater = null; c.say('trill'); if (c.state !== 'bed') { c.setState('idle'); c.act = { kind: 'groom', T: 120 }; } }
      else { c.sweater = { bow: c.coatKey === 'bunny' ? '#8a5a2a' : c.isBo ? '#5f7a3a' : ['#7a3a4a', '#3f5a7a', '#a8843a'][c.name.length % 3] }; c.say('mew'); c.earT = 20;
        if (c.state !== 'bed' && !BUSY.includes(c.state)) { c.setState('idle'); c.act = { kind: c.isBo ? 'sphinx' : 'groom', T: c.isBo ? 220 : 90 }; } // Bo sits down in it, unimpressed; Bunny has a look at herself
        if (c.isBo) c.mood.grump = Math.min(1, c.mood.grump + 0.1); }
      this.changed();
    }
    sproutAt(x, y) { let b = null, bd = 14 * this.size; for (const it of this.items) if (it.type === 'sprout') { const D = BZ.GARDEN[it.kind] || {}, h = (it.stage >= 3 ? D.h || 16 : it.stage === 2 ? (D.h || 16) * 0.6 : 6) * this.size; if (Math.abs(x - it.x) < 9 * this.size && y < it.y + 4 && y > it.y - h - 4) { const d = Math.abs(x - it.x); if (d < bd) { bd = d; b = it; } } } return b; }
    dirt(x, y) { for (let i = 0; i < 6; i++) this.fx.push({ x: x + rr(-3, 3), y: y - 2, vx: rr(-0.8, 0.8), vy: rr(-1.4, -0.4), life: rr(18, 34) | 0, col: ri(2) ? '#4a3524' : '#6b503a', ph: 0, g: 0.12 }); }
    water() { // the watering can: a stream from the rose, the soil darkens, the cats object
      const p = this.pointer, s = this.size, rx = p.x + 14 * s, ry = p.y + 2;
      if (this.frame % 2 === 0) for (let i = 0; i < 2; i++) this.fx.push({ x: rx + rr(-1.5, 1.5), y: ry, vx: rr(0.1, 0.5), vy: rr(1.2, 2), life: 14, col: ri(3) ? '#9cc8e8' : '#e4f2fa', ph: 0, g: 0.18, drop: true });
      for (const it of this.items) if (it.type === 'sprout' && Math.abs(it.x - rx - 4 * s) < 14 * s && it.y > ry - 4 && it.y < ry + 60 * s) it.water = Math.min(1, (it.water || 0) + 0.02);
      for (const c of this.cats) if (!c.asleep && !BUSY.includes(c.state) && Math.abs(c.x - rx) < 22 * s && c.y > ry && c.y < ry + 70 * s && ri(6) === 0) { c.setState('startle'); c.from = [rx, c.y]; if (c.isBo) c.mood.grump = Math.min(1, c.mood.grump + 0.15); c.say(c.isBo ? 'meow' : 'mew'); } // nobody asked for a bath
    }
    wandCatch(cat) { if (this.wand.caught) return false; this.wand.caught = { cat, T: 40 + ri(30) }; return true; }
    spawnFur(x, y, cat) { // loose fur from brushing, in her colors
      const cols = [BZ.color(cat.coat.colors.coat), BZ.color(cat.coat.colors.back || cat.coat.colors.coat), BZ.color(cat.coat.colors.belly || cat.coat.colors.coat)];
      for (let i = 0; i < 2; i++) this.fx.push({ x: x + rr(-3, 3), y: y + rr(-2, 2), vx: rr(-0.4, 0.4), vy: rr(-0.5, -0.1), life: rr(90, 170) | 0, col: cols[i % cols.length], ph: Math.random() * 6 });
      if (this.fx.length > 80) this.fx.splice(0, this.fx.length - 80);
    }
    tickFx() { for (const f of this.fx) { f.life--; f.vy = f.g ? f.vy + f.g : Math.min(0.35, f.vy + 0.012); f.vx *= 0.98; f.x += f.vx + Math.sin(this.frame * 0.07 + f.ph) * 0.15; f.y += f.vy; } this.fx = this.fx.filter((f) => f.life > 0); }

    // ── input ──
    onDown() {
      const p = this.pointer;
      if (this.carrying) {
        const type = this.carrying; this.carrying = null;
        let it = BZ.ITEMS[type].consumable ? null : this.items.find((i) => i.type === type);
        if (it) { it.x = p.x; it.y = p.y + 6; for (const c of this.cats) if (c.bedItem === it && ['toBed', 'bed', 'bedHop'].includes(c.state)) c.setState('idle'); }
        else { it = BZ.newItem(type, p.x, p.y + 6); it.placedAt = this.frame; this.items.push(it); }
        this.setOn(it, this.surfaceAt(p.x, p.y + 6, type), p.x); if (type === 'daybed' || type === 'lamptable') this.syncFixtures();
        if (BZ.ITEMS[type].ball) { it.vx = rr(-6, 6); it.vy = rr(-2, 2); }
        this.changed(); return;
      }
      const T = this.tool && BZ.ITEMS[this.tool];
      if (T && T.seed && this.scene && this.scene.plotSlot) { const sl = this.scene.plotSlot(p.x, p.y); if (sl && !this.items.some((i) => i.type === 'sprout' && i.plot === sl.plot && i.slot === sl.slot)) { const sp = Object.assign(BZ.newItem('sprout', sl.x, sl.y), { kind: T.seed, plot: sl.plot, slot: sl.slot, g: 0, water: 0.4, stage: 0 }); this.items.push(sp); this.dirt(sl.x, sl.y); this.sound.nibble(); this.changed(); } return; }
      if (this.tool === 'can') { this.watering = true; return; }
      if (this.tool === 'sweater') { const h = this.catAt(p.x, p.y); if (h) this.dress(h.cat); return; }
      if (this.tool === 'trowel') { const sp = this.sproutAt(p.x, p.y); if (sp) { this.removeItem(sp); this.dirt(sp.x, sp.y); this.sound.nibble(); this.changed(); } return; }
      const h = this.catAt(p.x, p.y), it = this.itemAt(p.x, p.y), dg = !h && this.dogAt(p.x, p.y);
      if (dg) { this.press = { dog: this.scene.dog, region: dg, t0: performance.now(), strokes: 0, lx: p.x, ly: p.y }; return; }
      if (it && !(h && (BZ.ITEMS[it.type].bed || it.type === 'sun'))) {
        if (it.lift) { it.y -= it.lift; it.lift = 0; it.surf = null; } it.z = 0; it.vz = 0;
        this.drag = { it, ox: it.x - p.x, oy: it.y - p.y, lx: p.x, ly: p.y }; it.held = true; it.vx = it.vy = 0; it.claimed = null;
        for (const c of this.cats) if (c.bedItem === it && ['toBed', 'bed', 'bedHop'].includes(c.state)) { c.setState('idle'); c.pose.rootY = 0; }
        return;
      }
      if (h) this.press = { cat: h.cat, region: h.region, t0: performance.now(), strokes: 0, lx: p.x, ly: p.y };
    }
    onMove() {
      const p = this.pointer;
      if (this.tool === 'brush' && !this.drag && !this.heldCat) { // the brush grooms on contact, no click needed
        const mv = Math.hypot(p.x - (this.bx || p.x), p.y - (this.by || p.y)); this.bx = p.x; this.by = p.y; this.brushTilt = clamp((this.brushTilt || 0) + (p.x - (this.bpx || p.x)) * 0.02, -0.5, 0.5); this.bpx = p.x;
        const h = this.catAt(p.x, p.y);
        if (h && mv > 0.4) { h.cat.stroke(h.region, 'brush'); if (ri(4) === 0) this.spawnFur(p.x, p.y + 2, h.cat); }
      }
      if (this.drag) { const d = this.drag; d.it.x = p.x + d.ox; d.it.y = p.y + d.oy; return; }
      const pr = this.press;
      if (pr && pr.dog) { const moved = Math.hypot(p.x - pr.lx, p.y - pr.ly); pr.lx = p.x; pr.ly = p.y; const rg = this.dogAt(p.x, p.y); if (rg && moved > 0.4 && ++pr.strokes % 5 === 1) pr.dog.pet(rg, p.x, p.y); return; }
      if (pr && !this.heldCat) {
        const moved = Math.hypot(p.x - pr.lx, p.y - pr.ly); pr.lx = p.x; pr.ly = p.y;
        const h = this.catAt(p.x, p.y);
        if (h && h.cat === pr.cat) { if (moved > 0.5 && ++pr.strokes >= 2) pr.cat.stroke(h.region); }
        else {
          const b = pr.cat.bbox, out = p.x < b[0] - 10 || p.x > b[2] + 10 || p.y < b[1] - 10 || p.y > b[3] + 10;
          if (out && pr.strokes < 8 && !pr.cat.inBed && this.tool !== 'brush') { const c = pr.cat; this.heldCat = c; this.sound.purr(c.id, false); c.setState('held'); c.say('mew'); }
        }
      }
    }
    onUp() {
      this.watering = false;
      if (this.drag) { const it = this.drag.it; it.held = false; this.drag = null; this.setOn(it, this.surfaceAt(it.x, it.y, it.type), it.x); this.changed(); return; }
      if (this.heldCat) {
        const c = this.heldCat; this.heldCat = null; this.press = null;
        const bed = this.bedUnder(this.pointer.x, this.pointer.y, c);
        if (bed) { c.placeInBed(bed); this.changed(); return; }
        c.setState('land'); c.pose.rootY = 0; c.clampToStage(); return;
      }
      const pr = this.press; this.press = null;
      if (pr && pr.dog) { if (pr.strokes < 2 && performance.now() - pr.t0 < 350) pr.dog.tap(); return; }
      if (pr && pr.strokes < 2 && performance.now() - pr.t0 < 350) { if (['face', 'leg', 'tail'].includes(pr.region)) pr.cat.poke(pr.region); else pr.cat.tap(); }
    }

    // ── loop ──
    tick() {
      this.frame++;
      const p = this.pointer, L = this.laser;
      if (L.on) { L.vx = p.x - L.x; L.vy = p.y - L.y; L.x = p.x; L.y = p.y; L.speed = L.speed * 0.6 + Math.hypot(L.vx, L.vy) * 0.4; }
      this.tickWand(); this.tickFx();
      if (this.callT > 0) this.callT--;
      for (const it of this.items) {
        it.t = (it.t || 0) + 1;
        if (it.rustle) it.rustle = Math.max(0, it.rustle - 0.03);
        if (it.swing) it.swing *= 0.94;
        if (it.full && it.type !== 'bowl' && it.servings < it.full && this.frame % (it.type === 'grass' ? 1100 : 2200) === 0) it.servings++;
        if (it.held) { if (this.drag && this.drag.it === it) { it.vx = (p.x - this.drag.lx) / 2; it.vy = (p.y - this.drag.ly) / 2; this.drag.lx = p.x; this.drag.ly = p.y; } continue; }
        if (!BZ.ITEMS[it.type].ball) { // a knocked-off plant or toy: falls, lands with a thunk
          if (it.z > 0 || it.vz) { it.vz = (it.vz || 0) - 0.32 * this.size; it.z = (it.z || 0) + it.vz; it.x += it.vx; it.y += it.vy; if (it.z <= 0) { it.z = 0; it.vz = 0; it.vx = it.vy = 0; this.clampItem(it); this.sound.thunk(); this.changed(); } }
          continue;
        }
        it.vx -= it.vx / 40; it.vy -= it.vy / 40;
        if (it.lift) { it.vx = it.vy = 0; continue; } // resting up on a surface
        if (Math.abs(it.vx) < 0.25 && Math.abs(it.vy) < 0.25 && !(it.z > 0)) it.vx = it.vy = 0;
        it.x += it.vx; it.y += it.vy; it.spin = (it.spin || 0) + it.vx * 0.15;
        if (it.z > 0 || it.vz) { it.vz = (it.vz || 0) - 0.32 * this.size; it.z = (it.z || 0) + it.vz; if (it.z <= 0) { it.z = 0; it.vz = Math.abs(it.vz) > 1.6 * this.size ? -it.vz * 0.38 : 0; } } // up in the air: gravity and a little bounce
        const st = this.stage, r = 8 * this.size;
        if (it.x < st.x + r) { it.x = st.x + r; it.vx = Math.abs(it.vx); } if (it.x > st.x + st.w - r) { it.x = st.x + st.w - r; it.vx = -Math.abs(it.vx); }
        if (it.y < this.floorTop) { it.y = this.floorTop; it.vy = Math.abs(it.vy); } if (it.y > st.y + st.h - 2) { it.y = st.y + st.h - 2; it.vy = -Math.abs(it.vy); }
      }
      // what's moving that a cat could care about
      this.stimuli = [];
      if (L.on && p.inside) this.stimuli.push({ key: 'laser', x: L.x, y: L.y, vx: L.vx, vy: L.vy, speed: L.speed });
      const Wd = this.wand;
      if (this.tool === 'wand' && p.inside && Wd.init) { const gy = clamp(Wd.fy + 26 * this.size, this.floorTop, this.stage.y + this.stage.h - 3); this.stimuli.push({ key: 'wand', x: Wd.fx, y: gy, air: gy - Wd.fy, vx: Wd.vx, vy: Wd.vy, speed: Math.hypot(Wd.vx, Wd.vy) * 1.4 + 0.4, wand: true }); }
      this.items.forEach((it, i) => { if (BZ.ITEMS[it.type].ball && !it.held && !it.lift) this.stimuli.push({ key: 'yarn' + i, item: it, x: it.x, y: it.y, vx: it.vx, vy: it.vy, speed: Math.hypot(it.vx, it.vy, it.vz || 0) + 0.15 }); });
      if (this.scene && this.scene.stimuli) this.stimuli.push(...this.scene.stimuli());
      if (this.frame % 30 === 0) for (const it of this.items) if (it.type === 'sprout') { it.g = (it.g || 0) + 1 + 1.6 * (it.water || 0); it.water = Math.max(0, (it.water || 0) - 1 / 300); const was = it.stage; BZ.growSprout(it); if (was !== it.stage && it.stage === 3) this.changed(); }
      for (const it of this.items) if (it.type === 'tire') { const occ = this.cats.find((c) => c.bedItem === it && (c.state === 'bed' || c.state === 'bedHop')); it.av = ((it.av || 0) - 0.0042 * Math.sin(it.ang || 0)) * (occ ? 0.996 : 0.99) + (ri(500) === 0 ? rr(-0.004, 0.004) : 0); it.ang = (it.ang || 0) + it.av; }
      if (this.watering) this.water();
      // relationships: love / hate / love, cooled by shared sunshine
      for (const k in this.rels) {
        const r = this.rels[k]; r.tension = Math.max(0, r.tension - 0.0005); r.ph += 0.00035;
        r.bond = clamp(0.72 + 0.18 * Math.sin(r.ph) - r.tension * 0.25, 0, 1);
      }
      for (let i = 0; i < this.cats.length; i++) for (let j = i + 1; j < this.cats.length; j++) {
        const a = this.cats[i], b = this.cats[j], r = this.rel(a, b);
        if (this.inSun(a.x, a.y) && this.inSun(b.x, b.y)) { r.tension = Math.max(0, r.tension - 0.003); a.mood.grump *= 0.995; b.mood.grump *= 0.995; } // the comfort zone
        else if (!a.asleep && !b.asleep && dist(a.x, a.y, b.x, b.y) < 30 * a.petScale) r.tension = Math.min(1, r.tension + 0.0004 * ((a.pers.sass + b.pers.sass) / 100));
      }
      if (this.heldCat) {
        const c = this.heldCat, st = this.stage; c.x = p.x; c.y = p.y + 40 * c.petScale; c.pose.rootY = 0;
        if (this.scene) { c.x = clamp(c.x, st.x + 20, st.x + st.w - 20); c.y = clamp(c.y, st.y + 60 * c.petScale, st.y + st.h + 30); }
      }
      for (const c of this.cats) { c.think(); c.animate(); }
      if (this.view) { // the camera: follow what matters, gently
        const V = this.view, maxX = this.stage.w - V.w;
        if (this.cam.hold > 0) this.cam.hold--;
        else { let fx; if (this.heldCat) fx = this.heldCat.x; else if (this.drag) fx = this.drag.it.x; else if (this.carrying && this.pointer.inside) fx = this.pointer.x; else { const live = this.cats.filter((c) => !c.hidden); const awake = live.filter((c) => !c.asleep); const pool = awake.length ? awake : live; fx = pool.length ? pool.reduce((a, c) => a + c.x, 0) / pool.length : this.stage.x + this.stage.w / 2; }
          this.cam.tx = clamp(fx - this.stage.x - V.w / 2, 0, maxX); }
        this.cam.x += (this.cam.tx - this.cam.x) * 0.06; if (Math.abs(this.cam.tx - this.cam.x) < 0.05) this.cam.x = this.cam.tx;
      }
      if (this.frame % 30 === 0 && this.host.onChange) this.host.onChange(this.summary());
      if (this.frame % 1800 === 0) this.save();
      this.render();
      this.updateInteractive();
    }
    updateInteractive() {
      const p = this.pointer;
      const over = !!(this.drag || this.heldCat || this.press || this.carrying || (p.inside && (this.catAt(p.x, p.y) || this.itemAt(p.x, p.y) || this.dogAt(p.x, p.y))));
      if (over !== this.interactive) { this.interactive = over; if (this.host.setInteractive) this.host.setInteractive(over); }
      document.body.style.cursor = this.carrying ? 'copy' : this.drag || this.heldCat ? 'grabbing' : over ? 'grab' : '';
    }
    render() {
      const ctx = this.ctx; ctx.clearRect(0, 0, this.W, this.H);
      const s = this.size, sc = this.scene, st = this.stage, ents = [], V = this.view;
      if (V) { ctx.save(); ctx.beginPath(); ctx.rect(V.x, st.y, V.w, st.h); ctx.clip(); ctx.translate(-Math.round(this.cam.x), 0); }
      for (const c of this.cats) if (c !== this.heldCat && !c.hidden) ents.push({ y: c.sortY != null ? c.sortY : c.y, c });
      if (sc && sc.props) for (const pr of sc.props()) ents.push({ y: pr.y, prop: pr });
      for (const it of this.items) if (it.type === 'tire') { ents.push({ y: it.y - 0.2, tireBack: it }); ents.push({ y: it.y + 0.3, tireFront: it }); }
      for (const it of this.items) if (!it.held && (!it.fixed || it.draw) && it.type !== 'sun') { if (it.type === 'pod') { ents.push({ y: it.y - 0.2, podBack: it }); ents.push({ y: it.y, podFront: it }); } else if (BZ.ITEMS[it.type].box) { ents.push({ y: it.y - 0.2, boxBack: it }); ents.push({ y: it.y + 0.2, boxFront: it }); } else ents.push({ y: it.y, it }); }
      ents.sort((a, b) => a.y - b.y);
      if (sc) { ctx.save(); ctx.beginPath(); ctx.rect(st.x, st.y, st.w, st.h); ctx.clip(); sc.drawBack(ctx); }
      BZ._roam = !sc; for (const it of this.items) if (it.type === 'sun' && !it.held) BZ.drawSun(ctx, it, s, this.frame, !sc);
      for (const e of ents) if (e.c && !e.c.inBed && e.c.state !== 'bedHop' && !e.c.lurkSpot) {
        const c = e.c, w = (24 * (0.5 + 0.5 * Math.abs(Math.cos(c.theta))) + 7) * c.petScale;
        BZ.ellipse(ctx, c.x + Math.cos(c.theta) * 2, c.y + 1, w, 4.5 * c.petScale, 'rgba(30,20,10,0.16)');
      }
      for (const e of ents) {
        if (e.prop) e.prop.draw(ctx); else if (e.tireBack) BZ.drawTireBack(ctx, e.tireBack, s); else if (e.tireFront) BZ.drawTireFront(ctx, e.tireFront, s); else if (e.podBack) BZ.drawPodBack(ctx, e.podBack, s); else if (e.podFront) BZ.drawPodFront(ctx, e.podFront, s); else if (e.boxBack) (e.boxBack.type === 'bag' ? BZ.drawBagBack : BZ.drawBoxBack)(ctx, e.boxBack, s); else if (e.boxFront) (e.boxFront.type === 'bag' ? BZ.drawBagFront : BZ.drawBoxFront)(ctx, e.boxFront, s);
        else if (e.c) BZ.drawCat(ctx, e.c); else BZ.drawItem(ctx, e.it, s, e.it.t);
      }
      if (sc) { sc.drawFront(ctx); ctx.restore(); }
      for (const it of this.items) if (it.held) BZ.drawItem(ctx, it, s, it.t);
      if (this.heldCat) {
        const bed = this.bedUnder(this.pointer.x, this.pointer.y, this.heldCat);
        if (bed) { // a warm pulsing ring around the opening / seat: let go here
          const g = BZ.bedGeom(bed, this.size), a = (0.55 + 0.3 * Math.sin(this.frame * 0.25)).toFixed(2), pad = 2 + Math.sin(this.frame * 0.25);
          if (g.clip) { BZ.ellRing(ctx, g.clip.cx, g.clip.cy, g.clip.rx + pad, g.clip.ry + pad, 'rgba(255,240,190,' + a + ')'); BZ.ellRing(ctx, g.clip.cx, g.clip.cy, g.clip.rx + pad + 1, g.clip.ry + pad + 1, 'rgba(255,240,190,' + (a * 0.5).toFixed(2) + ')'); }
          else BZ.ellRing(ctx, g.spot[0], g.spot[1] - g.rootPx, 24 * this.size + pad, 8 * this.size + pad, 'rgba(255,240,190,' + a + ')');
        }
        BZ.drawCat(ctx, this.heldCat);
      }
      for (const f of this.fx) { ctx.globalAlpha = Math.min(1, f.life / 40); ctx.fillStyle = f.col; ctx.fillRect(Math.round(f.x), Math.round(f.y), 2, 1); ctx.fillRect(Math.round(f.x) + (f.ph > 3 ? 1 : 0), Math.round(f.y) - 1, 1, 1); } ctx.globalAlpha = 1;
      const TT = this.tool && BZ.ITEMS[this.tool];
      if (TT && TT.seed && sc && sc.plots && this.pointer.inside) { const hov = sc.plotSlot(this.pointer.x, this.pointer.y); for (const pl of sc.plots) pl.slots.forEach(([x, y], i) => { if (this.items.some((q) => q.type === 'sprout' && q.plot === pl.key && q.slot === i)) return; const on = hov && hov.plot === pl.key && hov.slot === i; BZ.ellRing(ctx, x, y, on ? 4 : 3, on ? 2 : 1.5, on ? 'rgba(255,240,190,0.95)' : 'rgba(255,240,190,0.45)'); }); }
      if (TT && TT.seed && this.pointer.inside) BZ.drawPacket(ctx, this.pointer.x + 2, this.pointer.y + 4, s * 0.9, TT.seed);
      if (this.tool === 'can' && this.pointer.inside) BZ.drawCan(ctx, this.pointer.x, this.pointer.y, s * 0.9, this.watering ? 0.45 : 0.1, this.watering);
      if (this.tool === 'trowel' && this.pointer.inside) BZ.drawTrowel(ctx, this.pointer.x, this.pointer.y, s * 0.9);
      if (this.tool === 'brush' && this.pointer.inside) BZ.drawBrush(ctx, this.pointer.x, this.pointer.y, s, this.brushTilt || 0);
      if (this.tool === 'wand' && this.pointer.inside && this.wand.init) BZ.drawWand(ctx, this.wand, s);
      if (this.carrying && this.pointer.inside && this.carrying !== 'laser') { const pv = BZ.newItem(this.carrying, this.pointer.x, this.pointer.y + 6), su = this.surfaceAt(pv.x, pv.y, pv.type); if (su) { pv.y = su.ground; pv.lift = su.ground - su.y; ctx.fillStyle = 'rgba(255,240,190,0.55)'; ctx.fillRect(Math.round(su.x0), Math.round(su.y), Math.round(su.x1 - su.x0), 1); } ctx.globalAlpha = 0.85; BZ.drawItem(ctx, pv, s, this.frame); ctx.globalAlpha = 1; }
      if (this.laser.on && this.pointer.inside) {
        const x = Math.round(this.laser.x), y = Math.round(this.laser.y);
        ctx.fillStyle = 'rgba(255,40,40,0.35)'; ctx.fillRect(x - 2, y - 1, 5, 3); ctx.fillRect(x - 1, y - 2, 3, 5);
        ctx.fillStyle = '#ff2020'; ctx.fillRect(x - 1, y - 1, 3, 3); ctx.fillStyle = '#ffd0d0'; ctx.fillRect(x, y, 1, 1);
      }
      if (V) ctx.restore();
      if (this.octx && this.ovDirty) { this.octx.clearRect(0, 0, innerWidth, innerHeight); this.ovDirty = false; }
    }
  }

  BZ.Cat = Cat; BZ.World = World; BZ.FRAME = FRAME;
})();
