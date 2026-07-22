/* ============================================================
   DormGate — Deterministic QR-style code generator
   Renders a fake-but-stable QR as an inline SVG data URI.
   Ported from the design's qrSrc(). Exposed as window.dgQR().
   The permanent QR never changes (same seed → same pattern).
   ============================================================ */
(function () {
  let cached = null;

  function dgQR() {
    if (cached) return cached;
    let s = 1234567;
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

    cached = 'data:image/svg+xml,' + encodeURIComponent(svg);
    return cached;
  }

  /* Auto-fill any <img data-qr> on the page */
  function paint() {
    document.querySelectorAll('img[data-qr]').forEach((img) => { img.src = dgQR(); });
  }

  window.dgQR = dgQR;
  window.dgPaintQR = paint;
  if (document.readyState !== 'loading') paint();
  else document.addEventListener('DOMContentLoaded', paint);
})();
