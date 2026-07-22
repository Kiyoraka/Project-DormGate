/* ============================================================
   DormGate — Student app logic
   The student SCANS the guard's rotating gate QR. A popup then
   records the movement (or auto-detects a return).
   ============================================================ */
(function () {
  const D = window.DG_DATA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (h) => { const t = document.createElement('template'); t.innerHTML = h.trim(); return t.content.firstChild; };

  /* ---------- state ---------- */
  let statusKey = 'inside';                 // inside | outside | goingHome
  let lastIn = '4:56 PM';
  let movement = { type: 'Outing', dest: 'East Coast Mall', outAt: '6:15 PM', returnDate: '20 July 2026' };
  let pickType = 'outing', pickDest = D.destinations[0].n, pickReturn = '20 July 2026';
  let scanTimer = null;

  /* ---------- time helpers (curfew is 10:00 PM = 22:00) ---------- */
  function nowLabel() {
    const d = new Date(), h = d.getHours(), m = d.getMinutes();
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  }
  const isPastCurfew = () => new Date().getHours() >= 22;

  /* ---------- router ---------- */
  function go(id) {
    $$('.s').forEach((s) => s.classList.toggle('active', s.id === id));
    const cur = $('#' + id);
    if (cur) { cur.classList.remove('screen'); void cur.offsetWidth; cur.classList.add('screen'); }
    const sc = cur && cur.querySelector('.scrollable, .dash-body');
    if (sc) sc.scrollTop = 0;
    window.scrollTo(0, 0);
    clearTimeout(scanTimer);
    if (id === 'scan') startScan();
  }
  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-nav]');
    if (nav) go(nav.getAttribute('data-nav'));
    if (e.target.closest('[data-pop-close]')) closePopup();
    if (e.target === $('#moveOverlay')) closePopup();
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
  $('#scanGate').textContent = D.gate.site;

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

  /* ---------- status card + last scan ---------- */
  function statusView() {
    if (statusKey === 'inside') return {
      ring: 'green', tone: 'green', title: 'Inside',
      sub: `Checked in ${lastIn} · ${D.gate.site}`, scan: `IN · ${lastIn} · ${D.gate.site}`,
    };
    if (statusKey === 'outside') return {
      ring: 'blue', tone: 'blue', title: 'Outside',
      sub: `Outing · ${movement.dest} · out ${movement.outAt} · back before ${D.curfew}`,
      scan: `OUT · ${movement.outAt} · ${D.gate.site}`,
    };
    return {
      ring: 'amber', tone: 'amber', title: 'Going Home',
      sub: `${movement.dest} · expected return ${movement.returnDate}`,
      scan: `OUT · ${movement.outAt} · ${D.gate.site}`,
    };
  }
  function paintStatus() {
    const s = statusView();
    $('#statusCard').innerHTML =
      `<span class="ring ring-${s.ring}"></span>
       <div class="grow"><div class="st-title">${s.title}</div><div class="st-sub">${s.sub}</div></div>
       <span class="tag badge-${s.tone}">CURRENT STATUS</span>`;
    $('#lastScan').textContent = s.scan;
  }
  const order = ['inside', 'outside', 'goingHome'];
  $('#cycleStatus').addEventListener('click', () => {
    statusKey = order[(order.indexOf(statusKey) + 1) % order.length];
    paintStatus();
  });
  paintStatus();

  /* ---------- scan screen ---------- */
  function startScan() {
    $('#scanStatus').textContent = 'Searching…';
    scanTimer = setTimeout(() => {
      $('#scanStatus').textContent = 'Gate QR detected';
      openPopup();
    }, 2200);
  }
  $('#simulateScan').addEventListener('click', () => {
    clearTimeout(scanTimer);
    $('#scanStatus').textContent = 'Gate QR detected';
    openPopup();
  });

  /* ---------- movement popup ---------- */
  const overlay = $('#moveOverlay'), dialog = $('#moveDialog');
  const openPopup = () => { statusKey === 'inside' ? renderOutForm() : renderReturn(); overlay.classList.add('show'); };
  function closePopup() { overlay.classList.remove('show'); }

  const SCAN_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 8V5a2 2 0 012-2h3M16 3h3a2 2 0 012 2v3M21 16v3a2 2 0 01-2 2h-3M8 21H5a2 2 0 01-2-2v-3M3 12h18" stroke="#1D5BF0" stroke-width="2.2" stroke-linecap="round"/></svg>';
  const ARROW = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 12h14m0 0l-4-4m4 4l-4 4" stroke="#8A9AB8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function renderOutForm() {
    const dests = D.destinations.map((d) =>
      `<div class="dest${d.n === pickDest ? ' sel' : ''}" data-dest="${d.n}">
         <span class="radio"></span><span class="dn">${d.n}</span>
         <svg class="tick" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-10" stroke="#1D5BF0" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
       </div>`).join('');

    dialog.innerHTML =
      `<div class="dhead">${SCAN_ICON}<span class="t">Record movement</span>
         <span class="loc">${D.gate.site} · ${nowLabel()}</span></div>
       <div class="dbody">
         <div class="segmented" id="popSeg">
           <div class="seg${pickType === 'outing' ? ' on' : ''}" data-move="outing">Outing</div>
           <div class="seg${pickType === 'home' ? ' on' : ''}" data-move="home">Going Home</div>
         </div>
         <div id="popOuting" style="display:${pickType === 'outing' ? 'flex' : 'none'};flex-direction:column;gap:10px">
           <div class="field-label">DESTINATION</div>
           <div class="dest-list">${dests}</div>
           <div class="banner banner-blue">
             <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#1D5BF0" stroke-width="2"/><path d="M12 7v5l3.5 2" stroke="#1D5BF0" stroke-width="2" stroke-linecap="round"/></svg>
             <span>Curfew is <b>${D.curfew}</b>. Returning later is recorded as a <b>Late Return</b> and your parent is notified.</span>
           </div>
         </div>
         <div id="popHome" style="display:${pickType === 'home' ? 'flex' : 'none'};flex-direction:column;gap:10px">
           <div class="field-label">DESTINATION</div>
           <div class="field focus"><span>Johor Bahru</span></div>
           <div class="field-label">EXPECTED RETURN DATE</div>
           <div class="field" style="justify-content:space-between"><span>${pickReturn}</span>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="3" stroke="#8A9AB8" stroke-width="2"/><path d="M3 10h18M8 3v4M16 3v4" stroke="#8A9AB8" stroke-width="2" stroke-linecap="round"/></svg>
           </div>
           <div class="banner banner-amber">
             <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6" stroke="#C77700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 19a2 2 0 004 0" stroke="#C77700" stroke-width="2" stroke-linecap="round"/></svg>
             <span>Your parent is notified when you leave and again when you return. No Late Return applies to Going Home.</span>
           </div>
         </div>
       </div>
       <div class="dactions">
         <button class="btn btn-outline" data-pop-close>Cancel</button>
         <button class="btn btn-primary wide" id="popConfirm">Confirm</button>
       </div>`;

    $$('#popSeg .seg', dialog).forEach((s) => s.addEventListener('click', () => { pickType = s.dataset.move; renderOutForm(); }));
    $$('.dest', dialog).forEach((d) => d.addEventListener('click', () => { pickDest = d.dataset.dest; renderOutForm(); }));
    $('#popConfirm', dialog).addEventListener('click', commitOut);
  }

  function commitOut() {
    const t = nowLabel();
    if (pickType === 'outing') { statusKey = 'outside'; movement = { type: 'Outing', dest: pickDest, outAt: t }; }
    else { statusKey = 'goingHome'; movement = { type: 'Going Home', dest: 'Johor Bahru', outAt: t, returnDate: pickReturn }; }
    closePopup(); paintStatus(); showRecorded('out');
  }

  function renderReturn() {
    const t = nowLabel();
    const late = isPastCurfew() && movement.type === 'Outing';
    const fromBadge = statusKey === 'outside'
      ? '<span class="badge badge-blue">OUTSIDE</span>' : '<span class="badge badge-amber">GOING HOME</span>';

    dialog.innerHTML =
      `${late ? `<div class="danger-bar"><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 3l10 18H2L12 3z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v5" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="18" r="1.2" fill="#fff"/></svg>Past ${D.curfew} curfew — this return is recorded as a LATE RETURN</div>` : ''}
       <div class="dhead">${SCAN_ICON}<span class="t">Welcome back</span>
         <span class="loc">${D.gate.site} · ${t}</span></div>
       <div class="who">
         <span class="av" style="background:var(--blue-tint);color:var(--blue)">${D.student.initials}</span>
         <div class="grow"><div class="nm">${D.student.name}</div><div class="sub">${D.student.id} · Room ${D.student.room}</div></div>
       </div>
       <div class="dtable">
         <div class="r"><span class="k">Returning from</span><span class="v" style="color:var(--ink)">${movement.dest}</span></div>
         <div class="r"><span class="k">Time out</span><span class="v" style="color:var(--ink)">${movement.outAt}</span></div>
         <div class="r"><span class="k">Time in (now)</span><span class="v" style="color:${late ? 'var(--red)' : 'var(--green)'}">${t} · ${late ? 'late' : 'on time'}</span></div>
       </div>
       <div class="transition">
         ${fromBadge}${ARROW}<span class="badge badge-green">INSIDE</span>
         ${late ? '<span class="badge badge-red">+ LATE RETURN record</span>' : ''}
       </div>
       <div class="dnote">${late ? 'You and your parent will receive a Late Return alert.' : 'Your parent will be notified of your return.'}</div>
       <div class="dactions">
         <button class="btn btn-outline" data-pop-close>Cancel</button>
         <button class="btn ${late ? 'btn-danger' : 'btn-primary'} wide" id="popConfirm">Confirm Return</button>
       </div>`;

    $('#popConfirm', dialog).addEventListener('click', () => {
      lastIn = t; statusKey = 'inside';
      closePopup(); paintStatus(); showRecorded('in', late, t);
    });
  }

  /* ---------- recorded confirmation ---------- */
  function showRecorded(kind, late, t) {
    let rows;
    if (kind === 'out') {
      $('#recTitle').textContent = 'Movement recorded';
      $('#recLead').innerHTML = 'Saved at the guardhouse.<br>Scan the gate QR again when you return.';
      rows = movement.type === 'Outing'
        ? [['Movement type', 'OUTING', 'blue'], ['Destination', movement.dest], ['Time out', movement.outAt], ['Return before', D.curfew, 'red']]
        : [['Movement type', 'GOING HOME', 'amber'], ['Destination', movement.dest], ['Time out', movement.outAt], ['Expected return', movement.returnDate]];
    } else {
      $('#recTitle').textContent = late ? 'Welcome back — Late Return' : 'Welcome back';
      $('#recLead').textContent = late
        ? 'Your return is recorded and marked as a Late Return.'
        : 'Your return is recorded. You are now Inside.';
      rows = [['Status', 'INSIDE', 'green'], ['Time in', t], ['Record', late ? 'LATE RETURN' : 'NORMAL', late ? 'red' : 'green']];
    }
    const c = { blue: 'var(--blue)', amber: 'var(--amber)', red: 'var(--red)', green: 'var(--green)' };
    $('#recTable').innerHTML = rows.map((r) =>
      `<div class="dr"><span class="dk">${r[0]}</span>
         <span class="dv" style="color:${r[2] ? c[r[2]] : 'var(--ink)'};font-weight:${r[2] ? 800 : 700}">${r[1]}</span></div>`).join('');
    go('recorded');
  }

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

  /* ---------- entry point ---------- */
  if (location.hash === '#register') go('register');
})();
