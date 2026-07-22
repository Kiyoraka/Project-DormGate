/* ============================================================
   DormGate — Student app logic
   View router + list rendering + status toggle + move switching
   ============================================================ */
(function () {
  const D = window.DG_DATA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };

  /* ---------- router ---------- */
  function go(id) {
    $$('.s').forEach((s) => s.classList.toggle('active', s.id === id));
    const cur = $('#' + id);
    if (cur) { cur.classList.remove('screen'); void cur.offsetWidth; cur.classList.add('screen'); }
    const sc = cur && cur.querySelector('.scrollable, .dash-body');
    if (sc) sc.scrollTop = 0;
    window.scrollTo(0, 0);
    if (typeof window.dgPaintQR === 'function') window.dgPaintQR();
  }
  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-nav]');
    if (nav) { go(nav.getAttribute('data-nav')); }
  });

  /* ---------- registration fields ---------- */
  $('#regList').append(...D.regFields.map((f) => el(
    `<div class="fieldgroup">
       <div class="field-label">${f.l}</div>
       <div class="field compact">${f.v}</div>
     </div>`)));

  /* ---------- dashboard identity + recent ---------- */
  $('#dashAv').textContent = D.student.initials;
  $('#dashName').textContent = D.student.name;
  $('#dashId').textContent = D.student.id;
  $('#dashRoom').textContent = 'Room ' + D.student.room;
  $('#qrMeta').textContent = `${D.student.id} · ${D.student.name}`;

  const recent = [
    { tone: 'green', t: 'Outing · ECM Mall', s: '18 Jul · 6:15 PM → 9:40 PM', badge: ['NORMAL', 'green'] },
    { tone: 'red', t: 'Outing · Restaurant', s: '19 Jul · 5:45 PM → 10:18 PM', badge: ['LATE RETURN', 'red'] },
  ];
  $('#recentList').append(...recent.map((r) => el(
    `<div class="mini-row">
       <span class="rd dot-${r.tone}"></span>
       <div class="grow"><div class="rt">${r.t}</div><div class="rs">${r.s}</div></div>
       <span class="badge badge-${r.badge[1]}">${r.badge[0]}</span>
     </div>`)));

  /* ---------- status card (inside / outside / goingHome) ---------- */
  const STATES = {
    inside:    { ring: 'green', title: 'Inside',      sub: 'Checked in 4:56 PM · Main Gate',                          tone: 'green' },
    outside:   { ring: 'blue',  title: 'Outside',     sub: `Outing · East Coast Mall · out 6:15 PM · back before ${D.curfew}`, tone: 'blue' },
    goingHome: { ring: 'amber', title: 'Going Home',  sub: 'Johor Bahru · expected return 20 July',                   tone: 'amber' },
  };
  const order = ['inside', 'outside', 'goingHome'];
  let statusKey = 'inside';
  function paintStatus() {
    const s = STATES[statusKey];
    $('#statusCard').innerHTML =
      `<span class="ring ring-${s.ring}"></span>
       <div class="grow"><div class="st-title">${s.title}</div><div class="st-sub">${s.sub}</div></div>
       <span class="tag badge-${s.tone}">CURRENT STATUS</span>`;
  }
  paintStatus();
  $('#cycleStatus').addEventListener('click', () => {
    statusKey = order[(order.indexOf(statusKey) + 1) % order.length];
    paintStatus();
  });

  /* ---------- movement request: destinations + mode switch ---------- */
  const destList = $('#destList');
  D.destinations.forEach((d, i) => {
    const node = el(
      `<div class="dest${d.sel ? ' sel' : ''}">
         <span class="radio"></span>
         <span class="dn">${d.n}</span>
         <svg class="tick" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-10" stroke="#1D5BF0" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
       </div>`);
    node.addEventListener('click', () => {
      $$('.dest', destList).forEach((x) => x.classList.remove('sel'));
      node.classList.add('sel');
    });
    destList.append(node);
  });

  let move = 'outing';
  function setMove(m) {
    move = m;
    $$('#moveSeg .seg').forEach((s) => s.classList.toggle('on', s.dataset.move === m));
    $('#modeOuting').style.display = m === 'outing' ? 'flex' : 'none';
    $('#modeHome').style.display = m === 'home' ? 'flex' : 'none';
    $('#reqSub').textContent = m === 'outing'
      ? 'Choose your movement type before going to the guardhouse.'
      : 'Going home? Add your expected return date.';
    $('#reqFoot').textContent = m === 'outing'
      ? 'This links the outing to your permanent QR — no new code needed.'
      : 'Your parent is notified when you leave and when you return.';
  }
  $$('#moveSeg .seg').forEach((s) => s.addEventListener('click', () => setMove(s.dataset.move)));
  $('#curfewA').textContent = D.curfew;

  /* ---------- pass table (depends on move) ---------- */
  function paintPass() {
    const rows = move === 'outing'
      ? [['Movement type', 'OUTING', 'blue'], ['Destination', 'East Coast Mall'], ['Linked at', '6:12 PM'], ['Return before', D.curfew, 'red']]
      : [['Movement type', 'GOING HOME', 'amber'], ['Destination', 'Johor Bahru'], ['Linked at', '8:30 AM'], ['Expected return', '20 July 2026']];
    $('#passTable').innerHTML = rows.map((r) => {
      const color = r[2] === 'blue' ? 'var(--blue)' : r[2] === 'amber' ? 'var(--amber)' : r[2] === 'red' ? 'var(--red)' : 'var(--ink)';
      const weight = r[2] ? 800 : 700;
      return `<div class="dr"><span class="dk">${r[0]}</span><span class="dv" style="color:${color};font-weight:${weight}">${r[1]}</span></div>`;
    }).join('');
  }
  /* repaint the pass whenever we land on it */
  const passObserver = () => { if ($('#pass').classList.contains('active')) paintPass(); };
  document.addEventListener('click', (e) => { if (e.target.closest('[data-nav="pass"]')) setTimeout(paintPass, 0); });

  /* ---------- history ---------- */
  const badgeFor = (r) => r.late ? ['LATE RETURN', 'red'] : r.ret ? ['RETURNED', 'blue'] : ['NORMAL', 'green'];
  $('#histList').append(...D.histRows.map((r) => {
    const [txt, tone] = badgeFor(r);
    return el(
      `<div class="hist">
         <div class="date"><span class="d">${r.d}</span><span class="m">${r.m}</span></div>
         <div class="grow"><div class="ht">${r.type} · ${r.dest}</div><div class="hs">${r.time}</div></div>
         <span class="badge badge-${tone}">${txt}</span>
       </div>`);
  }));

  /* ---------- notifications ---------- */
  const NICON = {
    red: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 3l10 18H2L12 3z" stroke="#D3382C" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v5" stroke="#D3382C" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="18" r="1.2" fill="#D3382C"/></svg>',
    amber: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#C77700" stroke-width="2"/><path d="M12 7v5l3.5 2" stroke="#C77700" stroke-width="2" stroke-linecap="round"/></svg>',
    blue: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M10 5H5v14h5M14 12H21m0 0l-3.5-3.5M21 12l-3.5 3.5" stroke="#1D5BF0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    green: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-10" stroke="#12923F" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  $('#notifList').append(...D.notifs.map((n) => el(
    `<div class="notif">
       <span class="nico ${n.tone}">${NICON[n.tone]}</span>
       <div class="grow">
         <div class="spread"><span class="nt">${n.t}</span><span class="ntm">${n.tm}</span></div>
         <div class="nb">${n.b}</div>
       </div>
     </div>`)));

  paintPass();
})();
