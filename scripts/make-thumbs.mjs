// Generates 640px grid thumbnails for the 2026 gallery.
// Run `npm run thumbs` after adding photos to public/images/gallery/2026/.
// Existing thumbs are skipped, so it only processes new files.
import sharp from 'sharp';
import { readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, extname, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'public', 'images', 'gallery', '2026');
const out = join(src, 'thumbs');
mkdirSync(out, { recursive: true });

const exts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const files = readdirSync(src, { withFileTypes: true })
  .filter((e) => e.isFile() && exts.has(extname(e.name).toLowerCase()))
  .map((e) => e.name);

let ok = 0, skipped = 0, failed = [];
for (const f of files) {
  const dest = join(out, basename(f, extname(f)) + '.jpg');
  if (existsSync(dest)) { skipped++; continue; }
  try {
    await sharp(join(src, f))
      .rotate() // apply EXIF orientation
      .resize({ width: 640, withoutEnlargement: true })
      .jpeg({ quality: 72, mozjpeg: true })
      .toFile(dest);
    ok++;
  } catch (err) {
    failed.push(`${f}: ${err.message}`);
  }
}
console.log(`thumbs: ${ok} created, ${skipped} already existed, ${failed.length} failed`);
if (failed.length) {
  console.error(failed.join('\n'));
  process.exitCode = 1;
}
