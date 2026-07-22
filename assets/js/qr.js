/* ============================================================
   DSMS — Deterministic QR-style code generator
   Renders a fake-but-stable QR as an inline SVG data URI.
   Seedable: the same token always draws the same pattern, and a
   new token (each 5-minute gate cycle) draws a visibly different one.
   Exposed as window.dgQR(token) and window.dgGateToken(cycle).
   ============================================================ */
(function () {
  const cache = {};

  /* stable string -> positive 31-bit seed */
  function seedFrom(str) {
    let h = 1234567;
    for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    return (Math.abs(h) % 2147483646) + 1;
  }

  function dgQR(token) {
    const key = token || 'DORMGATE';
    if (cache[key]) return cache[key];

    let s = seedFrom(key);
    const rnd = () => (s = Math.imul(48271, s) % 2147483647, (s & 0xffff) / 0xffff);
    const n = 25, u = 8, q = 2, sz = (n + 2 * q) * u;
    const inFinder = (x, y) =>
      (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);

    let cells = '';
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (inFinder(x, y)) continue;
        if (rnd() < 0.45) {
          cells += `<rect x="${(x + q) * u}" y="${(y + q) * u}" width="${u}" height="${u}"/>`;
        }
      }
    }

    const finder = (px, py) => {
      const X = (px + q) * u, Y = (py + q) * u;
      return `<rect x="${X}" y="${Y}" width="${7 * u}" height="${7 * u}"/>` +
             `<rect fill="#fff" x="${X + u}" y="${Y + u}" width="${5 * u}" height="${5 * u}"/>` +
             `<rect x="${X + 2 * u}" y="${Y + 2 * u}" width="${3 * u}" height="${3 * u}"/>`;
    };

    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sz} ${sz}">` +
      `<rect width="${sz}" height="${sz}" fill="#fff"/>` +
      `<g fill="#0A1E42">${cells}${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}</g></svg>`;

    cache[key] = 'data:image/svg+xml,' + encodeURIComponent(svg);
    return cache[key];
  }

  /* token for a gate cycle — a new cycle means a new QR pattern */
  function dgGateToken(cycle) {
    return 'MAINGATE-' + String(cycle).padStart(4, '0');
  }

  /* Auto-fill any <img data-qr> (optionally with a data-qr token value) */
  function paint() {
    document.querySelectorAll('img[data-qr]').forEach((img) => {
      img.src = dgQR(img.getAttribute('data-qr') || undefined);
    });
  }

  window.dgQR = dgQR;
  window.dgGateToken = dgGateToken;
  window.dgPaintQR = paint;
  if (document.readyState !== 'loading') paint();
  else document.addEventListener('DOMContentLoaded', paint);
})();
