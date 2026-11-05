// Gera os PNGs do app a partir de public/icons/icon.svg usando o Chromium do Playwright.
// Uso: node scripts/generate-icons.cjs
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const dir = path.join(__dirname, "..", "public", "icons");
const svg = fs.readFileSync(path.join(dir, "icon.svg"), "utf8");
const sizes = [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["icon-maskable-512.png", 512],
  ["apple-touch-icon.png", 180],
];

(async () => {
  const browser = await chromium.launch();
  for (const [name, size] of sizes) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.setContent(
      `<html><body style="margin:0">${svg.replace("<svg ", `<svg width="${size}" height="${size}" `)}</body></html>`,
    );
    await page.screenshot({ path: path.join(dir, name), omitBackground: false });
    await page.close();
  }
  await browser.close();
  console.log("Ícones gerados em public/icons");
})();
