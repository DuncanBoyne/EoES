# GitHub Pages → Cloudflare Workers

DONE 28 Sep 2026. www.eoes.co.uk is served by Cloudflare Worker `eoes`; the
apex 301s to www; mail forwarding (MX fwd0-2.hosts.co.uk) is untouched. The
cutover steps below are kept as a record and for the rollback note.

Still outstanding: add the `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`
repo secrets to turn on CI deploys, and remove the custom domain in
GitHub repo Settings -> Pages.

## How it's deployed

- `wrangler.jsonc` — Workers static assets serving `./dist`, plus `src/worker.js`
  which only 301s `eoes.co.uk` → `www.eoes.co.uk`.
- `npm run deploy` — builds and deploys from a machine that has run `wrangler login`.
- `.github/workflows/deploy.yml` — deploys on push to `main` **once** the repo has
  the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets (account ID is
  `d95e0deb9b60f7481db9310b5f9f8151`). Until then the deploy step is skipped.

## Cutover (done 28 Sep 2026 — kept as a record)

1. **Cloudflare dashboard → Add a domain → `eoes.co.uk`** (Free plan). Let it
   scan the existing records. Check the three MX records survived:
   `fwd0.hosts.co.uk`, `fwd1.hosts.co.uk`, `fwd2.hosts.co.uk` (priority 30) —
   that's the Names.co.uk mail forwarding and it must not be lost.
   Delete the scanned A/AAAA/CNAME records for `eoes.co.uk` and
   `www.eoes.co.uk` (they point at GitHub) — the Worker custom domain creates
   its own.
2. **Names.co.uk → eoes.co.uk → Nameservers** — replace `ns0/ns1/ns2.phase8.net`
   with the two nameservers Cloudflare shows. Propagation is usually under an
   hour; Cloudflare emails when the zone goes active.
3. **Attach the domains** — from this folder: `npm run deploy`. The `routes` in
   `wrangler.jsonc` create the `www.eoes.co.uk` and `eoes.co.uk` custom domains
   (DNS records + certificate) automatically. This fails with
   `Hostname 'www.eoes.co.uk' already has externally managed DNS records`
   (code 100117) until step 1's A/AAAA deletions are actually done.
4. **Check**: `curl -sI https://www.eoes.co.uk` should say `server: cloudflare`;
   `curl -sI https://eoes.co.uk` should 301 to www.
5. **GitHub → repo Settings → Pages** → remove the custom domain and unpublish.

## Rollback

Change the nameservers back to `ns0/ns1/ns2.phase8.net` at Names.co.uk. GitHub
Pages keeps serving the last deployed build until it is unpublished.
