/* ============================================================
   DormGate — Warden portal logic
   Page switching + dashboard/search/reports rendering.
   ============================================================ */
(function () {
  const D = window.DG_DATA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (h) => { const t = document.createElement('template'); t.innerHTML = h.trim(); return t.content.firstChild; };

  /* staff login gate */
  $('#wardenSignIn').addEventListener('click', () => {
    $('#login').classList.add('hidden');
    $('#portal').classList.remove('hidden');
    window.scrollTo(0, 0);
  });

  /* identity + counts */
  $('#wAv').textContent = D.staff.warden.initials;
  $('#wName').textContent = D.staff.warden.name;
  $('#wScope').textContent = D.staff.warden.scope;
  $('#wInside').textContent = D.counts.inside;
  $('#wOutside').textContent = D.counts.outside;
  $('#wHome').textContent = D.counts.goingHome;
  $('#wLate').textContent = D.counts.lateToday;

  /* ---------- page switching ---------- */
  function show(page) {
    $$('.page').forEach((p) => p.classList.toggle('active', p.id === 'page-' + page));
    $$('#wnav .item').forEach((i) => i.classList.remove('on'));
    const active = $(`#wnav .item[data-page="${page}"]`);
    if (active) active.classList.add('on');
    window.scrollTo(0, 0);
  }
  $$('#wnav .item').forEach((i) => i.addEventListener('click', () => show(i.dataset.page)));

  /* ---------- dashboard: late returns ---------- */
  const lateBody = $('#lateBody');
  D.lateToday.forEach((l) => lateBody.append(el(
    `<div class="grid late-cols tr">
       <div style="min-width:0"><div class="nm">${l.n}</div><div class="id">${l.id}</div></div>
       <span class="c">${l.rm}</span>
       <span class="c">${l.dest}</span>
       <span class="c ink">${l.tin}</span>
       <span class="pill-c badge-red">${l.late}</span>
     </div>`)));

  /* ---------- dashboard: weekly chart ---------- */
  const chart = $('#weekChart');
  const max = Math.max(...D.week.map((w) => w.v));
  D.week.forEach((w) => {
    const h = Math.round((w.v / max) * 140);
    const cls = w.v === max ? 'top' : (w.v >= 60 ? 'mid' : '');
    chart.append(el(
      `<div class="bar">
         <span class="v${w.v === max ? ' hi' : ''}">${w.v}</span>
         <span class="col ${cls}" style="height:${h}px"></span>
         <span class="day${w.v === max ? ' on' : ''}">${w.day}</span>
       </div>`));
  });

  /* ---------- students: search results ---------- */
  const statusBadge = {
    outside: '<span class="pill-c" style="color:var(--blue);background:#fff">🔵 OUTSIDE</span>',
    inside: '<span class="pill-c badge-green">🟢 INSIDE</span>',
    home: '<span class="pill-c badge-amber">🟡 GOING HOME</span>',
  };
  const searchBody = $('#searchBody');
  D.searchRows.forEach((r) => {
    if (r.sel) {
      searchBody.append(el(
        `<div class="grid search-cols tr sel">
           <div style="min-width:0"><div class="nm">${r.n}</div><div class="id" style="color:var(--muted)">${r.id}</div></div>
           <span class="c ink">${r.rm}</span>
           ${statusBadge.outside}
           <span class="c ink" style="font-weight:700;font-size:11.5px">${r.last}</span>
         </div>`));
    } else {
      searchBody.append(el(
        `<div class="grid search-cols tr">
           <div style="min-width:0"><div class="nm">${r.n}</div><div class="id">${r.id}</div></div>
           <span class="c">${r.rm}</span>
           ${statusBadge[r.status]}
           <span class="c" style="font-size:11.5px">${r.last}</span>
         </div>`));
    }
  });

  /* ---------- students: detail panel ---------- */
  const st = D.student;
  const histMini = D.histRows.slice(0, 3).map((h) => {
    const badge = h.late ? ['LATE', 'red'] : h.ret ? ['RETURNED', 'blue'] : ['NORMAL', 'green'];
    return `<div class="dh-row">
        <span class="dt">${h.d} ${h.m}</span>
        <div class="grow"><div class="mv">${h.type} · ${h.dest}</div><div class="tm">${h.time}</div></div>
        <span class="badge badge-${badge[1]}">${badge[0]}</span>
      </div>`;
  }).join('');
  $('#detailPanel').innerHTML =
    `<div class="head">
       <span class="av">${st.initials}</span>
       <div class="grow"><div class="nm">${st.fullName}</div><div class="sub">${st.id} · Room ${st.room}</div></div>
     </div>
     <div class="status">
       <span class="l">🔵 Outside · East Coast Mall</span>
       <span class="r">out 9:21 PM — past curfew</span>
     </div>
     <div class="kv">
       <div><div class="k">PHONE</div><div class="v">${st.phone}</div></div>
       <div><div class="k">LAST SCAN</div><div class="v">OUT · 9:21 PM</div></div>
       <div><div class="k">PARENT / GUARDIAN</div><div class="v">${st.parent}</div></div>
       <div><div class="k">PARENT PHONE</div><div class="v">${st.parentPhone}</div></div>
     </div>
     <div class="hist-blk">
       <div class="t">Movement history</div>
       ${histMini}
       <div class="acts">
         <button class="btn btn-ghost btn-sm" style="flex:1">Full history</button>
         <button class="btn btn-primary btn-sm" style="flex:1">Contact parent</button>
       </div>
     </div>`;

  /* ---------- reports: scan table + type selection ---------- */
  function scanCell(s) {
    if (s.in) return '<span class="pill-c badge-green">IN</span>';
    if (s.out) return '<span class="pill-c badge-blue">OUT</span>';
    return '';
  }
  function recordCell(s) {
    if (s.late) return '<span class="pill-c badge-red">LATE RETURN</span>';
    if (s.ok) return '<span class="pill-c badge-green">NORMAL</span>';
    return '<span class="pill-c" style="color:#B6C3DB;font-weight:700;font-size:11px">—</span>';
  }
  const reportBody = $('#reportBody');
  D.scans.forEach((s) => reportBody.append(el(
    `<div class="grid report-cols tr" style="padding:9px 0">
       <span class="c">${s.t}</span>
       <div style="min-width:0"><div class="nm">${s.n}</div><div class="id">${s.id}</div></div>
       <span class="c">${s.rm}</span>
       <span class="c ink">${s.type}</span>
       <span class="c" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.dest}</span>
       ${scanCell(s)}
       ${recordCell(s)}
     </div>`)));

  const titles = { 0: 'Daily', 1: 'Weekly', 2: 'Monthly' };
  $$('#reportTypes .rtype').forEach((rt, i) => rt.addEventListener('click', () => {
    $$('#reportTypes .rtype').forEach((x) => x.classList.remove('on'));
    rt.classList.add('on');
    $('#reportTitle').textContent = `${titles[i]} Movement Report — Sunday, 19 July 2026`;
  }));
})();
