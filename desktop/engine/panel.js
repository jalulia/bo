// ─── Desktop Bo control panel ("the toy box") ──────────────────────────────
// One DOM component used by the Mac popover and the browser playpen.
// api: { get() -> summary, cmd(name, arg), modes: bool, extras: [{label, cmd, arg, checked?}], onPlace?(type) }
var BZ = window.BZ || (window.BZ = {});
(function () {
  const CSS = `
  @font-face { font-family: 'BoPixel'; src: url(${'${FONT}'}) format('truetype'); font-display: block; }
  .bo-panel { --paper:#f4eee4; --paper2:#ebe2d3; --ink:#3a3030; --muted:#7d6f66; --line:#d8ccba; --fawn:#d0c0a0; --teal:#5fa58d; --pink:#e39aa1; --leaf:#6f9c3e;
    width: 100%; max-width: 340px; box-sizing: border-box; background: var(--paper); color: var(--ink); border: 2px solid var(--ink); border-radius: 14px;
    box-shadow: 0 2px 0 var(--ink), 0 18px 40px rgba(30,20,15,.28); font: 13px/1.35 ui-rounded, "SF Pro Rounded", system-ui, sans-serif; overflow: hidden; user-select: none; -webkit-user-select: none; }
  .bo-panel * { box-sizing: border-box; }
  .bo-pix { font-family: 'BoPixel', ui-monospace, monospace; letter-spacing: .02em; }
  .bo-head { display: grid; grid-template-columns: 76px 1fr; gap: 12px; padding: 14px 14px 10px; align-items: center; background: var(--paper2); border-bottom: 2px dotted var(--line); }
  .bo-portrait { width: 76px; height: 76px; border-radius: 10px; background: #c9d3c4; border: 2px solid var(--ink); image-rendering: pixelated; display: block; }
  .bo-title { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
  .bo-name { font-size: 18px; line-height: 1; }
  .bo-brand { font-size: 9px; color: var(--muted); }
  .bo-mood { margin: 4px 0 6px; color: var(--muted); min-height: 1.35em; }
  .bo-meters { display: grid; grid-template-columns: auto 1fr; gap: 3px 8px; align-items: center; font-size: 10px; }
  .bo-meter { display: grid; grid-template-columns: repeat(10, 1fr); gap: 2px; height: 8px; }
  .bo-meter i { background: var(--line); border-radius: 1px; }
  .bo-meter[data-k="belly"] i.on { background: #d39a52; } .bo-meter[data-k="energy"] i.on { background: var(--teal); } .bo-meter[data-k="love"] i.on { background: var(--pink); }
  .bo-sec { padding: 10px 14px; border-bottom: 2px dotted var(--line); }
  .bo-sec h3 { margin: 0 0 8px; font-size: 10px; font-weight: 400; color: var(--muted); display: flex; justify-content: space-between; align-items: center; }
  .bo-seg { display: grid; grid-template-columns: 1fr 1fr 1fr; background: var(--paper2); border: 2px solid var(--ink); border-radius: 10px; padding: 2px; gap: 2px; }
  .bo-seg button { border: 0; border-radius: 7px; padding: 7px 6px; background: transparent; color: var(--ink); font: inherit; cursor: pointer; }
  .bo-seg button[aria-pressed="true"] { background: var(--ink); color: var(--paper); }
  .bo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
  .bo-tabs { display: flex; gap: 4px; margin: 0 0 8px; }
  .bo-tabs button { flex: 1; border: 1.5px solid var(--line); background: transparent; color: var(--ink); border-radius: 8px; padding: 4px 2px; font: inherit; font-size: 11px; cursor: pointer; }
  .bo-tabs button[aria-selected="true"] { background: var(--ink); color: var(--paper); border-color: var(--ink); }
  .bo-tabs button:focus-visible { outline: 2px solid var(--teal); outline-offset: 1px; }
  .bo-tile { position: relative; border: 2px solid transparent; background: var(--paper2); border-radius: 10px; padding: 4px 2px 5px; cursor: pointer; text-align: center; color: var(--ink); font: inherit; }
  .bo-tile:hover { border-color: var(--line); }
  .bo-tile:focus-visible, .bo-seg button:focus-visible, .bo-btn:focus-visible, .bo-chip:focus-visible { outline: 2px solid var(--teal); outline-offset: 1px; }
  .bo-tile canvas { width: 64px; height: 44px; image-rendering: pixelated; display: block; margin: 0 auto 2px; }
  .bo-tile span { font-size: 11px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .bo-tile.out { background: #fffaf2; border-color: var(--ink); }
  .bo-tile.carry { background: #e2efe6; border-color: var(--teal); }
  .bo-tile .x { position: absolute; top: -6px; right: -6px; width: 18px; height: 18px; border-radius: 50%; background: var(--ink); color: var(--paper); font-size: 11px; line-height: 18px; display: none; }
  .bo-tile.out .x { display: block; }
  .bo-hint { margin-top: 8px; font-size: 11px; color: var(--muted); min-height: 1.3em; }
  .bo-hint b { color: var(--ink); }
  .bo-cats { display: flex; gap: 6px; flex-wrap: wrap; }
  .bo-chip { display: flex; align-items: center; gap: 6px; border: 2px solid var(--line); background: var(--paper2); border-radius: 999px; padding: 2px 10px 2px 2px; cursor: pointer; font: inherit; color: var(--ink); }
  .bo-chip canvas { width: 28px; height: 28px; border-radius: 50%; image-rendering: pixelated; background: #c9d3c4; }
  .bo-chip[aria-pressed="true"] { border-color: var(--ink); background: #fffaf2; }
  .bo-chip.add { padding: 2px 10px; height: 36px; }
  .bo-chip { position: relative; }
  .bo-chip .x { position: absolute; top: -6px; right: -6px; width: 18px; height: 18px; border-radius: 50%; background: var(--ink); color: var(--paper); font-size: 11px; line-height: 18px; text-align: center; font-style: normal; }
  .bo-adopt { display: none; margin-top: 8px; grid-template-columns: repeat(3, 1fr); gap: 6px; }
  .bo-adopt.open { display: grid; }
  .bo-adopt button { border: 2px solid var(--line); background: var(--paper2); border-radius: 10px; padding: 4px; cursor: pointer; font: inherit; color: var(--ink); }
  .bo-adopt button:hover { border-color: var(--ink); }
  .bo-adopt canvas { width: 56px; height: 56px; image-rendering: pixelated; display: block; margin: 0 auto; }
  .bo-adopt small { display: block; font-size: 10px; color: var(--muted); }
  .bo-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
  .bo-btn { border: 2px solid var(--ink); background: var(--paper); color: var(--ink); border-radius: 9px; padding: 6px 10px; font: inherit; cursor: pointer; }
  .bo-btn.primary { background: var(--ink); color: var(--paper); }
  .bo-btn.small { padding: 3px 8px; font-size: 11px; border-width: 1.5px; }
  .bo-foot { padding: 10px 14px 12px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center; justify-content: space-between; font-size: 11px; color: var(--muted); }
  .bo-size { display: inline-flex; gap: 2px; }
  .bo-size button { border: 1.5px solid var(--line); background: transparent; border-radius: 6px; width: 24px; height: 22px; font: inherit; cursor: pointer; color: var(--ink); }
  .bo-size button[aria-pressed="true"] { border-color: var(--ink); background: var(--paper2); }
  .bo-check { display: inline-flex; gap: 5px; align-items: center; cursor: pointer; }
  .bo-check input { accent-color: #3a3030; margin: 0; }
  @media (prefers-reduced-motion: no-preference) { .bo-tile, .bo-chip, .bo-btn { transition: border-color .12s, background .12s; } }
  `;

  // a rex portrait: head and shoulders, three-quarter, sitting
  BZ.portrait = function (cv, coatKey, opts) {
    opts = opts || {};
    const W = cv.width, H = cv.height, ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, W, H);
    const k = opts.scale || W / 64;
    const fake = { size: k, items: [], stage: { x: -999, y: -999, w: 9999, h: 9999 }, floorTop: -999, sound: { purr() {}, meow() {} }, pointer: {} };
    const c = new BZ.Cat({ coat: coatKey, x: W / 2 - 2 * k, y: H + (opts.full ? -3 : 20) * k, theta: Math.PI / 2 + 0.38 }, fake);
    c.state = 'show'; c.anim = 'sit'; c.pose = BZ.clonePose(BZ.POSES.sit);
    if (opts.lid != null) c.pose.lid = opts.lid;
    for (let i = 0; i < 40; i++) { c.t++; c.animate(); if (opts.lid != null) c.pose.lid = opts.lid; }
    // centre the head (ears included) in the frame
    const hp = BZ.project(BZ.camera(c.theta), c.skel.pos[BZ.IDX.head], c.petScale, c.x, c.y);
    c.x += W / 2 - hp[0]; c.y += H * (opts.headY || 0.6) - hp[1];
    c.blink = 0; BZ.drawCat(ctx, c);
  };

  BZ.Panel = function (root, api) {
    if (!document.getElementById('bo-panel-css')) {
      const st = document.createElement('style'); st.id = 'bo-panel-css';
      st.textContent = CSS.replace('${FONT}', BZ.FONT_URI || ''); document.head.appendChild(st);
    }
    const el = document.createElement('div'); el.className = 'bo-panel'; el.setAttribute('data-ui', '');
    el.innerHTML = `
      <div class="bo-head">
        <canvas class="bo-portrait" width="64" height="64" aria-hidden="true"></canvas>
        <div>
          <div class="bo-title"><span class="bo-name bo-pix">Bo</span><button class="bo-btn small bo-home" hidden>Send home</button><span class="bo-brand bo-pix">Desktop Bo</span></div>
          <div class="bo-mood">indifferent</div>
          <div class="bo-meters">
            <span>Belly</span><div class="bo-meter" data-k="belly"></div>
            <span>Energy</span><div class="bo-meter" data-k="energy"></div>
            <span>Love</span><div class="bo-meter" data-k="love"></div>
          </div>
        </div>
      </div>
      <div class="bo-sec bo-where" hidden>
        <h3 class="bo-pix">Where she lives</h3>
        <div class="bo-seg" role="group" aria-label="Where she lives">
          <button data-mode="habitat" data-scene="room" aria-pressed="true">Bo's Jungle</button><button data-mode="habitat" data-scene="yard" aria-pressed="false">Backyard</button><button data-mode="roam" aria-pressed="false">My desktop</button>
        </div>
      </div>
      <div class="bo-sec">
        <h3 class="bo-pix"><span>Put out</span><button class="bo-btn small bo-away">Tidy up</button></h3>
        <div class="bo-tabs" role="tablist"></div>
        <div class="bo-grid" role="tabpanel"></div>
        <div class="bo-hint">Pick something, then click where it goes. Drag things to move them.</div>
      </div>
      <div class="bo-sec">
        <h3 class="bo-pix"><span>Rexes</span><button class="bo-btn small primary bo-call">Call</button></h3>
        <div class="bo-cats"></div>
        <div class="bo-adopt"></div>
      </div>
      <div class="bo-foot">
        <span class="bo-row"><span>Size</span><span class="bo-size"><button data-s="1">S</button><button data-s="1.2">M</button><button data-s="1.5">L</button></span></span>
        <label class="bo-check"><input type="checkbox" class="bo-sound"> Sound</label>
        <span class="bo-extras bo-row"></span>
      </div>`;
    root.appendChild(el);
    const $ = (s) => el.querySelector(s);
    const meters = {};
    for (const m of el.querySelectorAll('.bo-meter')) { m.innerHTML = '<i></i>'.repeat(10); meters[m.dataset.k] = m; }
    // item tiles
    const grid = $('.bo-grid'), tiles = {}, tabs = $('.bo-tabs');
    let tab = 0; try { tab = +(localStorage.getItem('bo-tab') || 0) || 0; } catch (e) {}
    const groups = BZ.ITEM_GROUPS || [['All', BZ.ITEM_ORDER]];
    let place = 'room'; const here = (t) => { const pl = BZ.ITEMS[t] && BZ.ITEMS[t].places; return !pl || pl.includes(place); }; // some things only make sense in some places
    const showTab = (n) => { if (groups[n] && groups[n][2] && groups[n][2] !== place) n = 0; tab = n; try { localStorage.setItem('bo-tab', String(n)); } catch (e) {} for (const [t, el] of Object.entries(tiles)) el.hidden = !groups[n][1].includes(t) || !here(t); for (const b of tabs.children) { b.setAttribute('aria-selected', String(+b.dataset.n === n)); b.hidden = !!(groups[+b.dataset.n][2] && groups[+b.dataset.n][2] !== place); } };
    groups.forEach(([name], n) => { const b = document.createElement('button'); b.textContent = name; b.dataset.n = n; b.setAttribute('role', 'tab'); b.onclick = () => showTab(n); tabs.appendChild(b); });
    for (const type of BZ.ITEM_ORDER) {
      const d = BZ.ITEMS[type];
      const b = document.createElement('button'); b.className = 'bo-tile'; b.title = d.label + ' · ' + d.hint;
      b.innerHTML = `<canvas width="32" height="22"></canvas><span>${d.label}</span><i class="x" role="button" aria-label="Put away ${d.label}">×</i>`;
      BZ.drawIcon(b.querySelector('canvas'), type);
      b.addEventListener('click', (e) => {
        if (e.target.classList.contains('x')) { api.cmd('remove', type); refresh(); return; }
        api.cmd('carry', type); if (api.onPlace) api.onPlace(type); refresh();
      });
      grid.appendChild(b); tiles[type] = b;
    }
    showTab(Math.min(tab, groups.length - 1));
    $('.bo-home').onclick = () => { if (selected) { api.cmd('sendHome', selected); selected = null; catKey = ''; setTimeout(refresh, 50); } };
    $('.bo-away').onclick = () => { api.cmd('away'); refresh(); };
    $('.bo-call').onclick = () => api.cmd('call');
    for (const b of el.querySelectorAll('.bo-seg button')) b.onclick = () => { if (b.dataset.scene) api.cmd('scene', b.dataset.scene); api.cmd('mode', b.dataset.mode); setTimeout(refresh, 50); };
    if (api.modes) $('.bo-where').hidden = false;
    for (const b of el.querySelectorAll('.bo-size button')) b.onclick = () => { api.cmd('size', +b.dataset.s); refresh(); };
    $('.bo-sound').onchange = (e) => { api.cmd('sound', e.target.checked); };
    const ex = $('.bo-extras');
    for (const x of api.extras || []) {
      if (x.checkbox) { const l = document.createElement('label'); l.className = 'bo-check'; l.innerHTML = `<input type="checkbox"> ${x.label}`; const i = l.querySelector('input'); i.checked = !!x.checked; i.onchange = () => api.cmd(x.cmd, i.checked); ex.appendChild(l); }
      else { const b = document.createElement('button'); b.className = 'bo-btn small'; b.textContent = x.label; b.onclick = () => api.cmd(x.cmd, x.arg); ex.appendChild(b); }
    }
    // adopt drawer
    const adopt = $('.bo-adopt');
    for (const k of Object.keys(BZ.COATS)) {
      const c = BZ.COATS[k], b = document.createElement('button');
      b.innerHTML = `<canvas width="56" height="56"></canvas>${c.label}<small>${c.note}</small>`;
      BZ.portrait(b.querySelector('canvas'), k, { scale: 1.25, headY: 0.62 });
      b.onclick = () => { api.cmd('adopt', { coat: k }); adopt.classList.remove('open'); setTimeout(refresh, 60); };
      b.dataset.coat = k;
      adopt.appendChild(b);
    }
    let selected = null, catKey = '', lastPortrait = '';
    function refresh() {
      const s = api.get(); if (!s) return;
      const cats = s.cats || [];
      if (!cats.find((c) => c.id === selected)) selected = cats[0] ? cats[0].id : null;
      const cur = cats.find((c) => c.id === selected);
      if (cur) {
        $('.bo-home').hidden = cur.coat === 'bo';
        $('.bo-name').textContent = cur.name; $('.bo-mood').textContent = cur.mood + (cur.coat === 'bo' ? '' : ' · ' + cur.coatLabel.toLowerCase() + ' rex');
        for (const k in meters) { const v = Math.round((cur.needs[k] || 0) / 10); [...meters[k].children].forEach((i, n) => i.classList.toggle('on', n < v)); }
        const pk = cur.coat + (/asleep|settling/.test(cur.mood) ? 'z' : '');
        if (pk !== lastPortrait) { lastPortrait = pk; BZ.portrait($('.bo-portrait'), cur.coat, { lid: pk.endsWith('z') ? 1 : null, scale: 1.45, headY: 0.62 }); }
      }
      for (const t in tiles) { tiles[t].classList.toggle('out', !!(s.placed && s.placed[t])); tiles[t].classList.toggle('carry', s.carrying === t); }
      const tl = s.tool || (s.placed && (s.placed.laser ? 'laser' : s.placed.brush ? 'brush' : s.placed.wand ? 'wand' : null)), TD = tl && BZ.ITEMS[tl];
      $('.bo-hint').innerHTML = s.carrying ? `Click where the <b>${BZ.ITEMS[s.carrying].label.toLowerCase()}</b> should go.` : tl === 'laser' ? 'Laser is on. Move your cursor; click Laser again to stop.' : tl === 'brush' ? 'Brush in hand. Move it over a cat to groom her; click Brush again to put it down.' : tl === 'wand' ? 'Feather wand out. Dangle and swing it; click it again to put it away.' : TD && TD.seed ? `<b>${TD.label}</b> seeds: click a bed or a grass patch to plant. Water them to speed them up.` : tl === 'can' ? 'Watering can: hold the mouse down over the beds. (The cats would rather you didn’t.)' : tl === 'trowel' ? 'Trowel: click a plant to dig it back up.' : place === 'yard' ? 'Out back: plant seeds from the Garden tab, or put things out. Small things can go on the shelves and steps.' : 'Pick something, then click where it goes. Small things can go on the sill, shelves and table.';
      for (const b of el.querySelectorAll('.bo-seg button')) b.setAttribute('aria-pressed', String(b.dataset.mode === s.mode && (s.mode === 'roam' || b.dataset.scene === (s.scene || 'room'))));
      const np = s.place || (s.mode === 'roam' ? 'desk' : s.scene || 'room'); if (np !== place) { place = np; showTab(tab); }
      for (const b of el.querySelectorAll('.bo-size button')) b.setAttribute('aria-pressed', String(Math.abs(+b.dataset.s - s.size) < 0.01));
      $('.bo-sound').checked = !!s.sound;
      const can = s.adoptable || [];
      for (const b of adopt.querySelectorAll('button')) b.hidden = !can.includes(b.dataset.coat);
      adopt.style.gridTemplateColumns = can.length === 1 ? '1fr' : '';
      const key = cats.map((c) => c.id + c.name).join('|') + selected;
      if (key !== catKey) {
        catKey = key; const box = $('.bo-cats'); box.innerHTML = '';
        for (const c of cats) {
          const b = document.createElement('button'); b.className = 'bo-chip'; b.setAttribute('aria-pressed', String(c.id === selected));
          b.innerHTML = `<canvas width="28" height="28"></canvas><span>${c.name}</span>` + (c.coat === 'bo' ? '' : `<i class="x" role="button" title="Send ${c.name} home" aria-label="Send ${c.name} home">×</i>`);
          BZ.portrait(b.querySelector('canvas'), c.coat, { scale: 0.85, headY: 0.66 });
          b.onclick = (e) => { if (e.target.classList.contains('x')) { api.cmd('sendHome', c.id); if (selected === c.id) selected = null; catKey = ''; setTimeout(refresh, 50); return; } selected = c.id; lastPortrait = ''; catKey = ''; refresh(); };
          box.appendChild(b);
        }
        const add = document.createElement('button'); add.className = 'bo-chip add'; add.textContent = '+ Adopt a rex';
        add.onclick = () => adopt.classList.toggle('open'); box.appendChild(add);
      }
    }
    refresh();
    return { refresh, el };
  };
})();
