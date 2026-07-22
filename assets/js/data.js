/* ============================================================
   DormGate — Hardcoded data (single source of truth)
   Mirrors the design's data block. No backend.
   Exposed as window.DG_DATA
   ============================================================ */
(function () {
  const DATA = {
    curfew: '10:00 PM',
    site: 'Main Gate',
    date: 'Sunday, 19 July 2026',

    /* rotating gate QR shown by the guard — students scan THIS */
    gate: { site: 'Main Gate', ttlSeconds: 300 },

    student: {
      name: 'Nur Aisyah',
      fullName: 'Nur Aisyah Binti Rahman',
      id: '23DLS001',
      room: 'A-12',
      initials: 'NA',
      phone: '012-345 6789',
      email: 'aisyah@student.edu.my',
      parent: 'Rahman Bin Ismail',
      parentPhone: '013-987 6543',
    },

    staff: {
      guard: { name: 'Rosli Hamid', initials: 'RH' },
      warden: { name: 'Pn. Salmah', initials: 'PS', scope: 'Warden · Block A–D' },
    },

    /* counts shown on guard + warden dashboards */
    counts: { inside: 412, outside: 37, goingHome: 12, lateToday: 3, residents: 464 },

    /* registration form (screen 1b) */
    regFields: [
      { l: 'FULL NAME', v: 'Nur Aisyah Binti Rahman' },
      { l: 'STUDENT ID (MATRIX NUMBER)', v: '23DLS001' },
      { l: 'ROOM NUMBER', v: 'A-12' },
      { l: 'PHONE NUMBER', v: '012-345 6789' },
      { l: 'EMAIL', v: 'aisyah@student.edu.my' },
      { l: 'PARENT / GUARDIAN NAME', v: 'Rahman Bin Ismail' },
      { l: 'PARENT / GUARDIAN PHONE', v: '013-987 6543' },
      { l: 'PASSWORD', v: '••••••••' },
    ],

    /* outing destinations (screen 1d) */
    destinations: [
      { n: 'East Coast Mall', sel: true },
      { n: 'Kuantan Parade' },
      { n: 'Restaurant' },
      { n: 'Hospital' },
      { n: 'Others' },
    ],

    /* student movement history (1g / 1o / 1q) */
    histRows: [
      { d: '20', m: 'JUL', type: 'Going Home', dest: 'Johor Bahru', time: '8:30 AM → 22 Jul, 6:10 PM', ret: true },
      { d: '19', m: 'JUL', type: 'Outing', dest: 'Restaurant', time: '5:45 PM → 10:18 PM', late: true },
      { d: '18', m: 'JUL', type: 'Outing', dest: 'ECM Mall', time: '6:15 PM → 9:40 PM', ok: true },
      { d: '12', m: 'JUL', type: 'Outing', dest: 'Hospital', time: '2:10 PM → 4:25 PM', ok: true },
    ],

    /* guard recent scan activity + reports table (1i / 1p) */
    scans: [
      { t: '10:24 PM', n: 'Arjun Ramesh', id: '24DKA033', rm: 'D-15', type: 'Outing', dest: 'East Coast Mall', in: true, late: true },
      { t: '10:18 PM', n: 'Lim Wei Jian', id: '24DEC102', rm: 'C-21', type: 'Outing', dest: 'Restaurant', in: true, late: true },
      { t: '10:07 PM', n: 'M. Haziq', id: '24DEP051', rm: 'B-11', type: 'Outing', dest: 'Kuantan Parade', in: true, late: true },
      { t: '9:40 PM', n: 'Siti Maryam', id: '23DLS045', rm: 'A-03', type: 'Outing', dest: 'Restaurant', in: true, ok: true },
      { t: '9:21 PM', n: 'Nur Aisyah', id: '23DLS001', rm: 'A-12', type: 'Outing', dest: 'East Coast Mall', out: true, none: true },
      { t: '8:56 PM', n: 'Farah Nabila', id: '23DHF009', rm: 'A-18', type: 'Going Home', dest: 'Johor Bahru', out: true, none: true },
      { t: '8:40 PM', n: 'Ahmad Danish', id: '23DKM014', rm: 'B-07', type: 'Outing', dest: 'Hospital', in: true, ok: true },
    ],

    /* students currently OUTING — guard rail + warden "currently outing" list */
    outingNow: [
      { n: 'Nur Aisyah', id: '23DLS001', rm: 'A-12', dest: 'East Coast Mall', out: '9:21 PM', late: true },
      { n: 'Danial Iskandar', id: '24DEC118', rm: 'C-04', dest: 'Restaurant', out: '8:12 PM' },
      { n: 'Kavitha Rao', id: '23DKA027', rm: 'A-27', dest: 'Kuantan Parade', out: '7:58 PM' },
      { n: 'Wan Amirul', id: '24DEP072', rm: 'D-02', dest: 'Others — Futsal', out: '7:30 PM' },
    ],

    /* warden late-returns table (1n) */
    lateToday: [
      { n: 'Arjun Ramesh', id: '24DKA033', rm: 'D-15', dest: 'East Coast Mall', tin: '10:24 PM', late: '24 min' },
      { n: 'Lim Wei Jian', id: '24DEC102', rm: 'C-21', dest: 'Restaurant', tin: '10:18 PM', late: '18 min' },
      { n: 'M. Haziq', id: '24DEP051', rm: 'B-11', dest: 'Kuantan Parade', tin: '10:07 PM', late: '7 min' },
    ],

    /* weekly movement chart (1n) */
    week: [
      { day: 'Mon', v: 38 }, { day: 'Tue', v: 44 }, { day: 'Wed', v: 31 },
      { day: 'Thu', v: 52 }, { day: 'Fri', v: 87 }, { day: 'Sat', v: 104 }, { day: 'Sun', v: 61 },
    ],

    /* warden student search results (1o) */
    searchRows: [
      { n: 'Nur Aisyah Binti Rahman', id: '23DLS001', rm: 'A-12', sel: true, last: 'OUT · 9:21 PM', status: 'outside' },
      { n: 'Ahmad Danish', id: '23DKM014', rm: 'B-07', last: 'IN · 8:40 PM', status: 'inside' },
      { n: 'Farah Nabila', id: '23DHF009', rm: 'A-18', last: 'OUT · 8:56 PM', status: 'home' },
      { n: 'Lim Wei Jian', id: '24DEC102', rm: 'C-21', last: 'IN · 10:18 PM', status: 'inside' },
      { n: 'Siti Maryam', id: '23DLS045', rm: 'A-03', last: 'IN · 9:40 PM', status: 'inside' },
    ],

    /* student notifications (1h) */
    notifs: [
      { t: 'Late Return Alert', b: 'You have exceeded the dormitory curfew. Your movement has been recorded as a Late Return.', tm: '10:00 PM', tone: 'red' },
      { t: 'Curfew reminder', b: 'You have not returned to the dormitory. Please return before the 10:00 PM curfew.', tm: '9:30 PM', tone: 'amber' },
      { t: 'Outing recorded', b: 'East Coast Mall — recorded when you scanned the gate QR. Your parent has been notified.', tm: '6:12 PM', tone: 'blue' },
      { t: 'Checked in', b: 'Welcome back! Time in 9:40 PM at Main Gate. Your parent has been notified.', tm: 'Yesterday', tone: 'green' },
    ]
  };

  window.DG_DATA = DATA;
})();
