// Build-time copy of a Sessionize embed view, so speaker names and session titles
// are in the delivered HTML instead of arriving later through document.write.
// `?under=True` returns the same markup the embed script would inject.
// Returns null when Sessionize is unreachable or the markup looks wrong; callers
// then fall back to the client-side embed, so the build never fails on this.
export async function sessionizeView(view: string, marker: string): Promise<string | null> {
  try {
    const res = await fetch(`https://sessionize.com/api/v2/9q20ek5l/view/${view}?under=True`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) return null;
    const html = await res.text();
    if (!html.includes(marker)) return null;
    // Drop Sessionize's inline config script: it expects their embed runtime, which
    // these pages no longer load. SessionizeModal.astro provides showModal instead.
    const clean = dropTestSpeakers(html.replace(/<script[\s\S]*?<\/script>/gi, ''));
    return await replaceDeadPhotos(clean);
  } catch {
    return null;
  }
}

const textOf = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

// Placeholder speakers left in the 2026 Sessionize data (e.g. "test 1").
// Each speaker is an <li data-speakerid> with no nested <li>, in both the
// session cards and the speaker wall, so the first </li> closes it.
export function dropTestSpeakers(html: string): string {
  return html.replace(/<li data-speakerid="[^"]*"[^>]*>[\s\S]*?<\/li>/g, (li) =>
    /^test\b/i.test(textOf(li)) ? '' : li,
  );
}

// Some Sessionize CDN photos 404 (Simon Owen's, Nov 2026), which shows the alt
// text instead of a face. Swap a dead photo for the speaker's initials.
// Only a definite 4xx counts as dead; a network error keeps the photo.
async function replaceDeadPhotos(html: string): Promise<string> {
  const imgs = [...new Set([...html.matchAll(/<img [^>]*src="(https:\/\/cdn\.sessionize\.com\/[^"]+)"[^>]*>/g)].map((m) => m[1]))];
  const dead = new Set<string>();
  await Promise.all(imgs.map(async (src) => {
    try {
      const r = await fetch(src, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
      if (r.status >= 400 && r.status < 500) dead.add(src);
    } catch { /* unknown: keep it */ }
  }));
  if (dead.size === 0) return html;
  return html.replace(/<img [^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/g, (img, src, alt) => {
    if (!dead.has(src)) return img;
    const initials = alt.split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 3).toUpperCase();
    return `<span class="sz-initials" role="img" aria-label="${alt}">${initials}</span>`;
  });
}
