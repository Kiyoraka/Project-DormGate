/* ============================================================
   DormGate — Guard console logic
   The guard no longer scans. They DISPLAY a rotating gate QR
   (5-minute expiry) that students scan, and watch the live log.
   ============================================================ */
(function () {
  const D = window.DG_DATA;
  const $ = (s, r = document) => r.querySelector(s);
  const el = (h) => { const t = document.createElement('template'); t.innerHTML = h.trim(); return t.content.firstChild; };

  /* ---------- identity + counts ---------- */
  $('#gAv').textContent = D.staff.guard.initials;
  $('#gName').textContent = D.staff.guard.name;
  $('#gAv2').textContent = D.staff.guard.initials;
  $('#gName2').textContent = D.staff.guard.name;
  $('#cf1').textContent = D.curfew; $('#cf2').textContent = D.curfew;
  $('#gateSite').textContent = D.gate.site;
  $('#stInside').textContent = D.counts.inside;
  $('#stOutside').textContent = D.counts.outside;
  $('#stHome').textContent = D.counts.goingHome;
  $('#stLate').textContent = D.counts.lateToday;
  $('#soCount').textContent = D.counts.outside;

  /* ---------- recent scan activity (live gate feed) ---------- */
  const scanCell = (s) => s.in ? '<span class="tag-c badge-green">IN</span>'
    : s.out ? '<span class="tag-c badge-blue">OUT</span>' : '';
  const recordCell = (s) => s.late ? '<span class="tag-c badge-red">LATE RETURN</span>'
    : s.ok ? '<span class="tag-c badge-green">NORMAL</span>'
    : '<span class="tag-c dash">—</span>';

  const body = $('#scanBody');
  D.scans.forEach((s) => body.append(el(
    `<div class="trow scan-cols">
       <span class="cell">${s.t}</span>
       <div style="min-width:0"><div class="nm">${s.n}</div><div class="id">${s.id}</div></div>
       <span class="cell">${s.rm}</span>
       <span class="cell ink col-move">${s.type}</span>
       <span class="dest col-dest">${s.dest}</span>
       <span class="col-scan">${scanCell(s)}</span>
       <span>${recordCell(s)}</span>
     </div>`)));

  /* ---------- still outside ---------- */
  const so = $('#stilloutBody');
  D.outingNow.forEach((o) => so.append(el(
    `<div class="so-row">
       <span class="dot dot-blue"></span>
       <div class="grow"><div class="n">${o.n} · ${o.rm}</div><div class="d">${o.dest}</div></div>
       <span class="t">out ${o.out}</span>
     </div>`)));

  /* ---------- student search ---------- */
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

  /* ---------- gate QR: 5-minute rotating code ---------- */
  const TTL = D.gate.ttlSeconds;
  let cycle = 1, left = TTL, tick = null;

  function paintCountdown() {
    const m = Math.floor(left / 60), s = left % 60;
    $('#gateTime').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    $('#gateTime').style.color = left <= 30 ? 'var(--red)' : '';
    $('#gateBar').style.width = Math.max(0, (left / TTL) * 100) + '%';
  }
  function renderGate() {
    const token = window.dgGateToken(cycle);
    $('#gateImg').src = window.dgQR(token);
    $('#gateToken').textContent = token;
    paintCountdown();
  }
  function startGate() {
    stopGate();
    tick = setInterval(() => {
      left -= 1;
      if (left <= 0) { cycle += 1; left = TTL; renderGate(); }   // auto-regenerate
      else paintCountdown();
    }, 1000);
  }
  function stopGate() { if (tick) { clearInterval(tick); tick = null; } }

  $('#gateRefresh').addEventListener('click', () => { cycle += 1; left = TTL; renderGate(); });

  /* ---------- view toggle (console / search / gate) ---------- */
  function show(view) {
    ['console', 'search', 'gate'].forEach((v) => {
      const n = document.getElementById(v);
      if (n) n.classList.toggle('active', v === view);
    });
    window.scrollTo(0, 0);
    if (view === 'gate') { renderGate(); startGate(); } else stopGate();
  }
  $('#toGate').addEventListener('click', () => show('gate'));
  $('#toSearch').addEventListener('click', () => show('search'));
  $('#toConsole').addEventListener('click', () => show('console'));
  $('#toConsole3').addEventListener('click', () => show('console'));
})();
