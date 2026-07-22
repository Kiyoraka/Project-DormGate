/* ============================================================
   DormGate — Guard console logic
   Renders scan table + still-outside, drives the scan-result
   modal (1j/1k/1l) and the mobile-scanner view (1m).
   ============================================================ */
(function () {
  const D = window.DG_DATA;
  const $ = (s, r = document) => r.querySelector(s);
  const el = (h) => { const t = document.createElement('template'); t.innerHTML = h.trim(); return t.content.firstChild; };

  /* identity + counts */
  $('#gAv').textContent = D.staff.guard.initials;
  $('#gName').textContent = D.staff.guard.name;
  $('#cf1').textContent = D.curfew; $('#cf2').textContent = D.curfew;
  $('#stInside').textContent = D.counts.inside;
  $('#stOutside').textContent = D.counts.outside;
  $('#stHome').textContent = D.counts.goingHome;
  $('#stLate').textContent = D.counts.lateToday;
  $('#soCount').textContent = D.counts.outside;

  /* ---------- recent scan table ---------- */
  function scanCell(s) {
    if (s.in) return '<span class="tag-c badge-green">IN</span>';
    if (s.out) return '<span class="tag-c badge-blue">OUT</span>';
    return '';
  }
  function recordCell(s) {
    if (s.late) return '<span class="tag-c badge-red">LATE RETURN</span>';
    if (s.ok) return '<span class="tag-c badge-green">NORMAL</span>';
    return '<span class="tag-c dash">—</span>';
  }
  function resultKeyFor(s) {
    if (s.late) return 'late';                    // returning after curfew
    if (s.type === 'Going Home') return 'home';   // leaving to go home
    return s.out ? 'outing' : 'return';           // leaving vs normal return
  }

  const body = $('#scanBody');
  D.scans.forEach((s) => {
    const row = el(
      `<div class="trow scan-cols" style="cursor:pointer">
         <span class="cell">${s.t}</span>
         <div style="min-width:0"><div class="nm">${s.n}</div><div class="id">${s.id}</div></div>
         <span class="cell">${s.rm}</span>
         <span class="cell ink col-move">${s.type}</span>
         <span class="dest col-dest">${s.dest}</span>
         <span class="col-scan">${scanCell(s)}</span>
         <span>${recordCell(s)}</span>
       </div>`);
    row.addEventListener('click', () => openScan(resultKeyFor(s)));
    body.append(row);
  });

  /* ---------- still outside ---------- */
  const so = $('#stilloutBody');
  D.outingNow.forEach((o) => so.append(el(
    `<div class="so-row">
       <span class="dot dot-blue"></span>
       <div class="grow"><div class="n">${o.n} · ${o.rm}</div><div class="d">${o.dest}</div></div>
       <span class="t">out ${o.out}</span>
     </div>`)));

  /* ---------- scan result modal (1j / 1k / 1l) ---------- */
  const overlay = $('#scanOverlay');
  const dialog = $('#scanDialog');
  const order = ['outing', 'home', 'return', 'late'];
  const toneColor = { blue: 'var(--blue)', amber: 'var(--amber)', red: 'var(--red)', green: 'var(--green)' };

  function render(key) {
    const r = D.scanResults[key];
    const rows = r.rows.map((row) => {
      const c = row[2] ? toneColor[row[2]] : 'var(--ink)';
      return `<div class="r"><span class="k">${row[0]}</span><span class="v" style="color:${c}">${row[1]}</span></div>`;
    }).join('');
    const dangerBar = r.headerTone === 'danger'
      ? `<div class="danger-bar"><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 3l10 18H2L12 3z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v5" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="18" r="1.2" fill="#fff"/></svg>Past ${D.curfew} curfew — this return will be recorded as a LATE RETURN</div>`
      : '';
    const statusBadge = r.statusNow === 'INSIDE'
      ? '<span class="badge badge-green badge-lg">🟢 INSIDE</span>'
      : '<span class="badge badge-blue badge-lg">🔵 OUTSIDE</span>';
    const extra = r.extra ? `<span class="badge badge-red">${r.extra}</span>` : '';
    dialog.innerHTML =
      `${dangerBar}
       <div class="dhead">
         <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 8V5a2 2 0 012-2h3M16 3h3a2 2 0 012 2v3M21 16v3a2 2 0 01-2 2h-3M8 21H5a2 2 0 01-2-2v-3M3 12h18" stroke="#1D5BF0" stroke-width="2.2" stroke-linecap="round"/></svg>
         <span class="t">Scan result</span>
         <span class="loc">Main Gate · ${r.time}</span>
       </div>
       <div class="who">
         <span class="av" style="background:${r.avatarBg};color:${r.avatarInk}">${r.initials}</span>
         <div class="grow"><div class="nm">${r.name}</div><div class="sub">${r.sub}</div></div>
         ${statusBadge}
       </div>
       <div class="dtable">${rows}</div>
       <div class="transition">
         <span class="badge badge-${r.from === 'INSIDE' ? 'green' : 'blue'}">${r.from}</span>
         <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 12h14m0 0l-4-4m4 4l-4 4" stroke="#8A9AB8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
         <span class="badge badge-${r.toTone}">${r.to}</span>
         ${extra}
       </div>
       <div class="dnote">${r.note}</div>
       <div class="dactions">
         <button class="btn btn-outline" data-close>Cancel</button>
         <button class="btn ${r.danger ? 'btn-danger' : 'btn-primary'} wide" data-close>${r.confirm}</button>
       </div>
       <div class="viewall" data-next>Next demo scan →</div>`;
  }

  let currentKey = 'outing';
  function openScan(key) {
    currentKey = key || 'outing';
    render(currentKey);
    overlay.classList.add('show');
    if (window.dgPaintQR) window.dgPaintQR();
  }
  function closeScan() { overlay.classList.remove('show'); }

  document.addEventListener('click', (e) => {
    const trig = e.target.closest('[data-scan]');
    if (trig) { openScan(trig.getAttribute('data-scan')); return; }
    if (e.target.closest('[data-close]')) { closeScan(); return; }
    if (e.target.closest('[data-next]')) {
      currentKey = order[(order.indexOf(currentKey) + 1) % order.length];
      render(currentKey); return;
    }
    if (e.target === overlay) closeScan();
  });

  /* ---------- student search (guard) ---------- */
  $('#gAv2').textContent = D.staff.guard.initials;
  $('#gName2').textContent = D.staff.guard.name;
  const sBadge = {
    outside: '<span class="badge badge-blue" style="display:block;text-align:center">🔵 OUTSIDE</span>',
    inside: '<span class="badge badge-green" style="display:block;text-align:center">🟢 INSIDE</span>',
    home: '<span class="badge badge-amber" style="display:block;text-align:center">🟡 GOING HOME</span>',
  };
  const gsb = $('#guardSearchBody');
  D.searchRows.forEach((r) => gsb.append(el(
    `<div class="srch-grid srch-row${r.sel ? ' sel' : ''}">
       <div><div class="nm">${r.n}</div><div class="id"${r.sel ? ' style="color:var(--muted)"' : ''}>${r.id}</div></div>
       <span class="c${r.sel ? ' ink' : ''}">${r.rm}</span>
       ${sBadge[r.status]}
       <span class="c" style="font-size:11.5px">${r.last}</span>
     </div>`)));

  const stu = D.student;
  const gHist = D.histRows.slice(0, 3).map((h) => {
    const b = h.late ? ['LATE', 'red'] : h.ret ? ['RETURNED', 'blue'] : ['NORMAL', 'green'];
    return `<div class="so-row" style="border-color:var(--line)">
        <span style="font:700 10.5px var(--sans);color:var(--muted-2);width:44px">${h.d} ${h.m}</span>
        <div class="grow" style="min-width:0"><div class="n" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${h.type} · ${h.dest}</div><div class="d">${h.time}</div></div>
        <span class="badge badge-${b[1]}">${b[0]}</span>
      </div>`;
  }).join('');
  $('#guardDetail').innerHTML =
    `<div class="sdetail-head">
       <span class="sdetail-av">${stu.initials}</span>
       <div class="grow"><div class="sdetail-nm">${stu.fullName}</div><div class="sdetail-sub">${stu.id} · Room ${stu.room}</div></div>
     </div>
     <div class="sdetail-status" style="background:var(--blue-tint);border:1px solid var(--blue-100)">
       <span style="font:700 11.5px var(--sans);color:var(--blue-600)">🔵 Outside · East Coast Mall</span>
       <span style="font:800 11px var(--sans);color:var(--red)">out 9:21 PM — past curfew</span>
     </div>
     <div class="sdetail-kv">
       <div><div class="k">PHONE</div><div class="v">${stu.phone}</div></div>
       <div><div class="k">LAST SCAN</div><div class="v">OUT · 9:21 PM</div></div>
       <div><div class="k">PARENT CONTACT</div><div class="v">${stu.parent} · ${stu.parentPhone}</div></div>
       <div><div class="k">CURRENT STATUS</div><div class="v">Outside</div></div>
     </div>
     <div class="sdetail-hist">
       <div class="t">Movement history</div>${gHist}
       <div style="display:flex;gap:10px;margin-top:14px">
         <button class="btn btn-ghost btn-sm" style="flex:1">Full history</button>
         <button class="btn btn-primary btn-sm" style="flex:1">Contact parent</button>
       </div>
     </div>`;

  /* ---------- view toggle (console / scanner / search) ----------
     Auth lives on index.html now — the console is the entry view. */
  function show(view) {
    ['console', 'scanner', 'search'].forEach((v) => {
      const n = document.getElementById(v);
      if (n) n.classList.toggle('active', v === view);
    });
    window.scrollTo(0, 0);
    if (window.dgPaintQR) window.dgPaintQR();
  }
  $('#toSearch').addEventListener('click', () => show('search'));
  $('#toConsole3').addEventListener('click', () => show('console'));
  $('#toScanner').addEventListener('click', () => show('scanner'));
  $('#toConsole').addEventListener('click', () => show('console'));
  $('#toConsole2').addEventListener('click', () => show('console'));
})();
