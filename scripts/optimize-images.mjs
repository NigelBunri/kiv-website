// One-off image optimization pass: generates WebP + resized fallback
// variants for every hero/story/logo image, so PageBlocks.tsx can serve
// responsive, modern-format images instead of shipping one full-resolution
// JPEG/PNG to every viewport. Run with: node scripts/optimize-images.mjs
import sharp from "sharp";
import { readdirSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, "..", "public", "images");

const VISUAL_WIDTHS = [480, 800, 1200];
const LOGO_WIDTHS = [256, 512];
const SMALL_LOGO_WIDTHS = [200];

async function convert(srcPath, destBase, widths, format, fallbackExt) {
  for (const width of widths) {
    const webpDest = `${destBase}-${width}.webp`;
    await sharp(srcPath).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(webpDest);

    const fallbackDest = `${destBase}-${width}.${fallbackExt}`;
    const pipeline = sharp(srcPath).resize({ width, withoutEnlargement: true });
    if (format === "jpeg") {
      await pipeline.jpeg({ quality: 78, mozjpeg: true }).toFile(fallbackDest);
    } else {
      await pipeline.png({ quality: 82, compressionLevel: 9 }).toFile(fallbackDest);
    }
  }
}

function sizeOf(file) {
  try {
    return statSync(file).size;
  } catch {
    return 0;
  }
}

async function main() {
  const files = readdirSync(imagesDir).filter((f) => /\.(jpg|jpeg|png)$/i.test(f));
  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const srcPath = path.join(imagesDir, file);
    const ext = path.extname(file).toLowerCase();
    const name = path.basename(file, ext);
    const destBase = path.join(imagesDir, name);
    const before = sizeOf(srcPath);
    totalBefore += before;

    if (file === "heaven-bg.jpg") {
      // CSS background-image, not an <img> - not part of this pass.
      continue;
    }

    const isLogo = /-logo$/.test(name);
    if (isLogo) {
      await convert(srcPath, destBase, LOGO_WIDTHS, "png", "png");
    } else {
      // -visual.jpg / -roadmap.jpg hero & story images
      await convert(srcPath, destBase, VISUAL_WIDTHS, "jpeg", "jpg");
    }

    for (const width of isLogo ? LOGO_WIDTHS : VISUAL_WIDTHS) {
      totalAfter += sizeOf(`${destBase}-${width}.webp`);
    }
    console.log(`processed ${file} (${(before / 1024).toFixed(0)}KB source)`);
  }

  // Small logo thumbnails (sm/) - already small, add WebP for consistency.
  const smDir = path.join(imagesDir, "sm");
  const smFiles = readdirSync(smDir).filter((f) => /\.png$/i.test(f));
  for (const file of smFiles) {
    const srcPath = path.join(smDir, file);
    const name = path.basename(file, ".png");
    const destBase = path.join(smDir, name);
    await convert(srcPath, destBase, SMALL_LOGO_WIDTHS, "png", "png");
    console.log(`processed sm/${file}`);
  }

  console.log(
    `\nDone. Original size: ${(totalBefore / 1024).toFixed(0)}KB. ` +
      `Largest WebP variant per image totals: ${(totalAfter / 1024).toFixed(0)}KB.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
