import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resDir = path.resolve(__dirname, '../android/app/src/main/res');

// High-resolution SVG for full icon (Square with subtle rounded corner or circle)
function getFullIconSvg(isCircle = false) {
  const clip = isCircle
    ? `<clipPath id="circleClip"><circle cx="256" cy="256" r="256" /></clipPath>`
    : `<clipPath id="roundClip"><rect x="0" y="0" width="512" height="512" rx="110" ry="110" /></clipPath>`;

  const clipRef = isCircle ? `clip-path="url(#circleClip)"` : `clip-path="url(#roundClip)"`;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#5a855a" />
        <stop offset="50%" stop-color="#456b45" />
        <stop offset="100%" stop-color="#2d4a33" />
      </linearGradient>
      ${clip}
    </defs>
    
    <g ${clipRef}>
      <!-- Background Gradient -->
      <rect width="512" height="512" fill="url(#brandGrad)" />
      
      <!-- Subtle luxury border sheen -->
      <rect width="512" height="512" fill="none" stroke="#FFFFFF" stroke-opacity="0.15" stroke-width="8" />

      <!-- Top-Left Mini Sparkle -->
      <path d="M165 130 L165 190 M135 160 L195 160" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" />

      <!-- Bottom-Right Mini Sparkle -->
      <path d="M347 322 L347 382 M317 352 L377 352" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" />

      <!-- Main Center Sparkle Star -->
      <path d="M256 130 Q256 256 382 256 Q256 256 256 382 Q256 256 130 256 Q256 256 256 130 Z" 
            fill="none" 
            stroke="#FFFFFF" 
            stroke-width="19" 
            stroke-linecap="round" 
            stroke-linejoin="round" />

      <!-- Inner Star Soft Glow -->
      <path d="M256 195 Q256 256 317 256 Q256 256 256 317 Q256 256 195 256 Q256 256 256 195 Z" 
            fill="#FFFFFF" 
            fill-opacity="0.25" />
    </g>
  </svg>`;
}

// Foreground SVG for adaptive icons (Transparent background)
function getForegroundSvg() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="432" height="432" viewBox="0 0 432 432">
    <!-- Top-Left Mini Sparkle -->
    <path d="M140 110 L140 160 M115 135 L165 135" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" />

    <!-- Bottom-Right Mini Sparkle -->
    <path d="M292 272 L292 322 M267 297 L317 297" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" />

    <!-- Main Center Sparkle Star -->
    <path d="M216 110 Q216 216 322 216 Q216 216 216 322 Q216 216 110 216 Q216 216 216 110 Z" 
          fill="none" 
          stroke="#FFFFFF" 
          stroke-width="16" 
          stroke-linecap="round" 
          stroke-linejoin="round" />

    <!-- Inner Star Soft Glow -->
    <path d="M216 165 Q216 216 267 216 Q216 216 216 267 Q216 216 165 216 Q216 216 216 165 Z" 
          fill="#FFFFFF" 
          fill-opacity="0.25" />
  </svg>`;
}

const densities = [
  { folder: 'mipmap-mdpi', iconSize: 48, fgSize: 108 },
  { folder: 'mipmap-hdpi', iconSize: 72, fgSize: 162 },
  { folder: 'mipmap-xhdpi', iconSize: 96, fgSize: 216 },
  { folder: 'mipmap-xxhdpi', iconSize: 144, fgSize: 324 },
  { folder: 'mipmap-xxxhdpi', iconSize: 192, fgSize: 432 },
];

async function generateIcons() {
  console.log('Generating Festivo App Icons...');

  for (const d of densities) {
    const targetFolder = path.join(resDir, d.folder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    // 1. Standard square/rounded icon
    const squareSvg = Buffer.from(getFullIconSvg(false));
    await sharp(squareSvg)
      .resize(d.iconSize, d.iconSize)
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher.png'));

    // 2. Round icon
    const roundSvg = Buffer.from(getFullIconSvg(true));
    await sharp(roundSvg)
      .resize(d.iconSize, d.iconSize)
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher_round.png'));

    // 3. Foreground icon for adaptive layers
    const fgSvg = Buffer.from(getForegroundSvg());
    await sharp(fgSvg)
      .resize(d.fgSize, d.fgSize)
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher_foreground.png'));

    console.log(`✓ Generated icons for ${d.folder}`);
  }

  console.log('All Festivo app icons generated successfully!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
