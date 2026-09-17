#!/usr/bin/env node
// Resize/crop the approved AI-generated masters only. No generation or API calls.
// Usage: node scripts/blog-images/export-editorial.mjs [source-directory]
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer";
import covers from "../../src/data/blog-covers.json" with { type: "json" };

const root = path.resolve(import.meta.dirname, "../..");
const source = path.resolve(process.argv[2] || path.join(root, "output/imagegen/blog-v1"));
const formats = [
  {
    name: "hero",
    width: 1600,
    height: 900,
    mime: "image/webp",
    ext: "webp",
    quality: 0.82,
    budget: 160 * 1024,
  },
  {
    name: "card",
    width: 800,
    height: 600,
    mime: "image/webp",
    ext: "webp",
    quality: 0.82,
    budget: 160 * 1024,
  },
  {
    name: "og",
    width: 1200,
    height: 630,
    mime: "image/jpeg",
    ext: "jpg",
    quality: 0.84,
    budget: 160 * 1024,
  },
];

// Check all inputs before writing any export.
for (const slug of Object.keys(covers)) await access(path.join(source, `${slug}.png`));
const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
const previews = [];
try {
  const page = await browser.newPage();
  for (const [slug, cover] of Object.entries(covers)) {
    const input = `data:image/png;base64,${(await readFile(path.join(source, `${slug}.png`))).toString("base64")}`;
    const out = path.join(root, "public/assets/blog", cover.collection);
    await mkdir(out, { recursive: true });
    for (const format of formats) {
      const result = await page.evaluate(
        async ({ input, format }) => {
          const img = new Image();
          img.src = input;
          await img.decode();
          const canvas = document.createElement("canvas");
          canvas.width = format.width;
          canvas.height = format.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas context unavailable");
          ctx.imageSmoothingQuality = "high";
          const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
          ctx.drawImage(
            img,
            (canvas.width - img.width * scale) / 2,
            (canvas.height - img.height * scale) / 2,
            img.width * scale,
            img.height * scale,
          );
          let quality = format.quality;
          let url;
          do {
            url = canvas.toDataURL(format.mime, quality);
            if (atob(url.split(",")[1]).length <= format.budget) break;
            quality -= 0.02;
          } while (quality >= 0.68);
          return { url, quality };
        },
        { input, format },
      );
      const buffer = Buffer.from(result.url.split(",")[1], "base64");
      if (buffer.length > format.budget)
        throw new Error(`Review ${slug}/${format.name}: exceeds quality/size budget`);
      const file = `${slug}-${format.name}.${format.ext}`;
      await writeFile(path.join(out, file), buffer);
      console.log(
        `${file}: ${Math.round(buffer.length / 1024)} KiB, q=${result.quality.toFixed(2)}`,
      );
      if (format.name === "card")
        previews.push(`<figure><img src="${result.url}"><figcaption>${slug}</figcaption></figure>`);
    }
  }
  // Contact sheet for crop review; local only, not shipped to users.
  await page.setViewport({ width: 1440, height: 1700, deviceScaleFactor: 1 });
  await page.setContent(
    `<style>body{background:#101d31;color:#fff;font:14px sans-serif;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:16px}figure{margin:0}img{width:100%;aspect-ratio:4/3;object-fit:cover}figcaption{padding:8px;overflow-wrap:anywhere}</style>${previews.join("")}`,
  );
  await page.evaluate(async () => Promise.all([...document.images].map((img) => img.decode())));
  await page.screenshot({
    path: path.join(source, "contact-sheet.jpg"),
    type: "jpeg",
    quality: 88,
    fullPage: true,
  });
} finally {
  await browser.close();
}
