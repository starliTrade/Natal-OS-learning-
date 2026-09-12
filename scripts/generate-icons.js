import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generate() {
  const svgPath = path.resolve(process.cwd(), 'public', 'icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.resolve(process.cwd(), 'public', 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.resolve(process.cwd(), 'public', 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // maskable 512x512 (with safe zone padding)
  await sharp(svgBuffer)
    .resize(410, 410)
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: '#090A0F',
    })
    .png()
    .toFile(path.resolve(process.cwd(), 'public', 'pwa-maskable-512x512.png'));
  console.log('Created pwa-maskable-512x512.png');

  // Apple touch icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.resolve(process.cwd(), 'public', 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // Favicon 64x64 png fallback
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.resolve(process.cwd(), 'public', 'favicon.png'));
  console.log('Created favicon.png');
}

generate().catch(console.error);
