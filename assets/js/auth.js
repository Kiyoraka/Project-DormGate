/* ============================================================
   DSMS — Unified login
   One card for all three roles. The ID decides the dashboard.
   Hardcoded demo credentials — no backend, no real auth.
   ============================================================ */
(function () {
  const USERS = {
    '23DLS001':      { pw: 'student123',   url: 'student.html', label: 'Student' },
    'G-1042':        { pw: 'guard123',     url: 'guard.html',   label: 'Security Guard' },
    'W-2207':        { pw: 'warden123',    url: 'warden.html',  label: 'Warden' },
    '013-987 6543':  { pw: '013-987 6543', url: 'parent.html',  label: 'Parent' },
  };
  const BY_ROLE = { student: '23DLS001', guard: 'G-1042', warden: 'W-2207', parent: '013-987 6543' };

  const $ = (s) => document.querySelector(s);
  const idEl = $('#userId');
  const pwEl = $('#password');
  const errEl = $('#authErr');

  const showErr = (msg) => { errEl.textContent = msg; errEl.classList.add('show'); };
  const clearErr = () => errEl.classList.remove('show');

  /* ---------- demo quick fill (2 x 2 grid) ---------- */
  document.querySelectorAll('.auth-quick button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = BY_ROLE[btn.dataset.role];
      idEl.value = id;
      pwEl.value = USERS[id].pw;
      clearErr();
    });
  });

  /* ---------- sign in: route by ID ---------- */
  function signIn() {
    const id = idEl.value.trim();
    if (!id) return showErr('Enter your Student ID or Staff ID — or tap a demo button below.');

    const user = USERS[id];
    if (!user) return showErr(`Unknown ID "${id}" — tap a demo button below to fill valid credentials.`);
    const pw = pwEl.value.trim();
    if (!pw) return showErr('Enter your password.');

    /* Parent is the only role with real password validation + a first-login change.
       The default password is the parent's phone number; on first login the parent
       sets a new one, stored per-browser in localStorage. Student/guard/warden keep
       their unvalidated demo behavior below. */
    if (id === BY_ROLE.parent) {
      const stored = localStorage.getItem('dg_parent_pw');
      if (stored) {
        if (pw !== stored) return showErr('Incorrect password. Enter the new password you set.');
        location.href = 'parent.html';
      } else {
        if (pw !== user.pw) return showErr('First login — your password is your phone number.');
        location.href = 'parent.html#setpw';
      }
      return;
    }

    location.href = user.url;
  }

  $('#signIn').addEventListener('click', signIn);
  [idEl, pwEl].forEach((el) => {
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter') signIn(); });
    el.addEventListener('input', clearErr);
  });

  /* ---------- password reveal ---------- */
  $('#togglePw').addEventListener('click', () => {
    pwEl.type = pwEl.type === 'password' ? 'text' : 'password';
  });

  idEl.focus();
})();
