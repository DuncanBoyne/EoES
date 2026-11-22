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
    return html.replace(/<script[\s\S]*?<\/script>/gi, '');
  } catch {
    return null;
  }
}
