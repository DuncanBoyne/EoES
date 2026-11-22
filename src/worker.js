// Static site on Workers static assets. This handler runs first on every
// request (run_worker_first) to send http and the apex to https://www, and to
// add security headers; everything else is handed straight to the asset binding.
const CANONICAL_HOST = 'www.eoes.co.uk';

const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "frame-ancestors 'self'",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Only our own hosts: leaves localhost (wrangler dev) and workers.dev alone.
    const ours = url.hostname === 'eoes.co.uk' || url.hostname === CANONICAL_HOST;
    if (ours && (url.protocol === 'http:' || url.hostname !== CANONICAL_HOST)) {
      url.protocol = 'https:';
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }
    const res = await env.ASSETS.fetch(request);
    const out = new Response(res.body, res);
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) out.headers.set(k, v);
    const cache = res.status === 200 && cacheControl(url.pathname);
    if (cache) out.headers.set('Cache-Control', cache);
    return out;
  },
};

// Browser caching for static files; HTML keeps the asset binding's default.
// /_astro/ files are content-hashed, so they never change under the same name.
const STATIC_EXT = /\.(png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf)$/i;
function cacheControl(path) {
  if (path.startsWith('/_astro/')) return 'public, max-age=31536000, immutable';
  if (path.startsWith('/images/') || STATIC_EXT.test(path)) return 'public, max-age=604800';
  return null;
}
