// Static site on Workers static assets. This handler runs first on every
// request (run_worker_first) purely to 301 the apex to www; everything else is
// handed straight to the asset binding.
const CANONICAL_HOST = 'www.eoes.co.uk';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'eoes.co.uk') {
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
