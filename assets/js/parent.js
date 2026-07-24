/* ============================================================
   DSMS — Parent app logic (READ-ONLY)
   The parent follows their child's dormitory movement — current
   status, history, and alerts. No scanning, no recording; the
   only write is the first-login password change (localStorage).
   ============================================================ */
(function () {
  const D = window.DG_DATA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (h) => { const t = document.createElement('template'); t.innerHTML = h.trim(); return t.content.firstChild; };

  const child = D.student;
  const initials = (name) => {
    const p = name.trim().split(/\s+/);
    return ((p[0][0] || '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
  };

  /* ---------- router ---------- */
  function go(id) {
    $$('.s').forEach((s) => s.classList.toggle('active', s.id === id));
    const cur = $('#' + id);
    if (cur) { cur.classList.remove('screen'); void cur.offsetWidth; cur.classList.add('screen'); }
    const sc = cur && cur.querySelector('.scrollable, .dash-body');
    if (sc) sc.scrollTop = 0;
    window.scrollTo(0, 0);
  }
  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-nav]');
    if (nav) go(nav.getAttribute('data-nav'));
  });

  /* ---------- first-login: set password ---------- */
  const setpwErr = (msg) => { const e = $('#setpwErr'); e.textContent = msg; e.classList.add('show'); };
  $('#toggleNew').addEventListener('click', () => {
    const i = $('#newPw'); i.type = i.type === 'password' ? 'text' : 'password';
  });
  [$('#newPw'), $('#confirmPw')].forEach((i) =>
    i.addEventListener('input', () => $('#setpwErr').classList.remove('show')));
  $('#savePw').addEventListener('click', () => {
    const a = $('#newPw').value, b = $('#confirmPw').value;
    if (a.length < 4) return setpwErr('Choose a password with at least 4 characters.');
    if (a === child.parentPhone) return setpwErr('Please choose a password different from your phone number.');
    if (a !== b) return setpwErr('Passwords do not match — please re-enter.');
    localStorage.setItem('dg_parent_pw', a);
    $('#setpwErr').classList.remove('show');
    go('dashboard');
  });

  /* ---------- dashboard: parent identity + child chip ---------- */
  $('#parentAv').textContent = initials(child.parent);
  $('#parentName').textContent = child.parent;
  $('#childName').textContent = child.name;
  $('#childId').textContent = child.id;
  $('#childRoom').textContent = 'Room ' + child.room;

  /* ---------- child status (derived from outingNow / scans) ---------- */
  function paintStatus() {
    const out = D.outingNow.find((o) => o.id === child.id);
    let s;
    if (out && out.late) {
      s = { ring: 'amber', tone: 'amber', title: 'Outside · Past curfew',
            sub: `Outing · ${out.dest} · out ${out.out} · curfew was ${D.curfew}` };
    } else if (out) {
      s = { ring: 'blue', tone: 'blue', title: 'Outside',
            sub: `Outing · ${out.dest} · out ${out.out} · back before ${D.curfew}` };
    } else {
      s = { ring: 'green', tone: 'green', title: 'Inside',
            sub: `In the dormitory · ${D.gate.site}` };
    }
    $('#statusCard').innerHTML =
      `<span class="ring ring-${s.ring}"></span>
       <div class="grow"><div class="st-title">${s.title}</div><div class="st-sub">${s.sub}</div></div>
       <span class="tag badge-${s.tone}">CURRENT STATUS</span>`;

    const last = D.scans.find((sc) => sc.id === child.id);
    $('#lastScan').textContent = last
      ? `${last.out ? 'OUT' : 'IN'} · ${last.t} · ${D.gate.site}`
      : `— · ${D.gate.site}`;
  }
  paintStatus();

  /* ---------- history badge helper (shared shape) ---------- */
  const badgeFor = (r) => r.late ? ['LATE RETURN', 'red'] : r.ret ? ['RETURNED', 'blue'] : ['NORMAL', 'green'];

  /* ---------- dashboard: recent movement (top 2 of history) ---------- */
  $('#recentList').append(...D.histRows.slice(0, 2).map((r) => {
    const [txt, tone] = badgeFor(r);
    return el(
      `<div class="mini-row">
         <span class="rd dot-${tone}"></span>
         <div class="grow"><div class="rt">${r.type} · ${r.dest}</div><div class="rs">${r.d} ${r.m} · ${r.time}</div></div>
         <span class="badge badge-${tone}">${txt}</span>
       </div>`);
  }));

  /* ---------- history ---------- */
  $('#histList').append(...D.histRows.map((r) => {
    const [txt, tone] = badgeFor(r);
    return el(
      `<div class="hist">
         <div class="date"><span class="d">${r.d}</span><span class="m">${r.m}</span></div>
         <div class="grow"><div class="ht">${r.type} · ${r.dest}</div><div class="hs">${r.time}</div></div>
         <span class="badge badge-${tone}">${txt}</span>
       </div>`);
  }));

  /* ---------- alerts ---------- */
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

  /* ---------- child tab: details + guardian ---------- */
  $('#childAv').textContent = child.initials;
  $('#childFullName').textContent = child.fullName;
  $('#childSub').textContent = `${child.id} · Room ${child.room}`;
  const kv = (rows, target) => {
    $(target).innerHTML = rows.map((r) =>
      `<div class="dr"><span class="dk">${r[0]}</span><span class="dv">${r[1]}</span></div>`).join('');
  };
  kv([
    ['Student ID', child.id],
    ['Room', child.room],
    ['Phone', child.phone],
    ['Email', child.email],
  ], '#childTable');
  kv([
    ['Name', child.parent],
    ['Phone', child.parentPhone],
    ['Relationship', 'Parent / Guardian'],
  ], '#guardianTable');

  /* ---------- entry point ---------- */
  if (location.hash === '#setpw') go('setpw');
})();
