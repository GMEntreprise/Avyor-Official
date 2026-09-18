import { mkdir, mkdtemp, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

// Run explicitly after choosing the source art; FFmpeg is not a deployment dependency.
// One smooth, periodic camera movement over each still, like the homepage background.
const slugs = process.argv.slice(2);
const selected = slugs.length ? slugs : ['creators', 'brands', 'features'];
const output = 'src/assets/heroes';
const temporary = await mkdtemp(join(tmpdir(), 'avyor-page-heroes-'));
const report = [];
await mkdir(output, { recursive: true });
try {
  for (const slug of selected) {
    if (!['creators', 'brands', 'features'].includes(slug))
      throw new Error(`Unknown Hero: ${slug}`);
    const source = `brand/sources/page-heroes/${slug}.png`;
    const metadata = await sharp(source).metadata();
    for (const format of ['desktop', 'mobile']) {
      const mobile = format === 'mobile';
      const width = mobile ? 480 : 1600;
      const height = mobile ? 854 : 900;
      const baseWidth = mobile ? 528 : 1672;
      const baseHeight = 940;
      if (metadata.width < baseWidth || metadata.height < baseHeight) {
        throw new Error(`${source} is too small; do not upscale source art.`);
      }
      let sourceImage = sharp(source);
      if (mobile) {
        const cropWidth = Math.floor((metadata.height * baseWidth) / baseHeight);
        const left = Math.round((metadata.width - cropWidth) * 0.76);
        sourceImage = sourceImage.extract({
          left,
          top: 0,
          width: cropWidth,
          height: metadata.height,
        });
      }
      const base = await sourceImage
        .resize(baseWidth, baseHeight, { fit: 'cover' })
        .png()
        .toBuffer();
      const baseFile = join(temporary, `${slug}-${format}.png`);
      await writeFile(baseFile, base);
      const x = (baseWidth - width) / 2;
      const y = (baseHeight - height) / 2;
      const poster = `${output}/${slug}-${format}.webp`;
      await sharp(base)
        .extract({ left: x, top: y, width, height })
        .webp({ quality: 84 })
        .toFile(poster);
      const video = `${output}/${slug}-${format}.mp4`;
      execFileSync(
        'ffmpeg',
        [
          '-hide_banner',
          '-loglevel',
          'error',
          '-y',
          '-loop',
          '1',
          '-framerate',
          '24',
          '-i',
          baseFile,
          '-vf',
          `crop=${width}:${height}:x='${x}+${mobile ? 10 : 14}*sin(t*2*PI/10)':y='${y}+${mobile ? 8 : 6}*sin(t*2*PI/10)',format=yuv420p`,
          '-t',
          '10',
          '-r',
          '24',
          '-an',
          '-c:v',
          'libx264',
          '-preset',
          'slow',
          '-crf',
          '23',
          '-movflags',
          '+faststart',
          video,
        ],
        { stdio: 'inherit' },
      );
      const entry = {
        slug,
        format,
        width,
        height,
        duration: 10,
        fps: 24,
        posterBytes: (await stat(poster)).size,
        videoBytes: (await stat(video)).size,
      };
      report.push(entry);
      console.log(JSON.stringify(entry));
    }
  }
  await mkdir('docs/audits', { recursive: true });
  await writeFile(
    'docs/audits/avyor-page-hero-exports.json',
    JSON.stringify(report, null, 2) + '\n',
  );
} finally {
  await rm(temporary, { recursive: true, force: true });
}
