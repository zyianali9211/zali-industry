const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

const siteDataDir = path.join(__dirname, 'public', 'SiteData');

const videos = [
  'DTF Heat Transfer Process_opt.mp4',
  'DTF process Video_opt.mp4',
  'embroidery Proceess Video_opt.mp4',
  'Main page ground floor video_opt.mp4',
  'Screen Print Process Video_opt.mp4',
  'Sublimation Process Video_opt.mp4'
];

async function processVideo(videoName) {
  const inputPath = path.join(siteDataDir, videoName);
  const baseName = videoName.replace('_opt.mp4', '');
  const webmPath = path.join(siteDataDir, `${baseName}.webm`);
  const mp4Path = path.join(siteDataDir, `${baseName}_web.mp4`);
  const webpPath = path.join(siteDataDir, `${baseName}.webp`);

  console.log(`Processing ${videoName}...`);

  // 1. Generate Poster (WebP)
  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions(['-vframes 1', '-q:v 2'])
      .save(webpPath)
      .on('end', () => resolve())
      .on('error', reject);
  });
  console.log(` -> Created ${baseName}.webp`);

  // 2. Generate WebM
  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec('libvpx-vp9')
      .outputOptions([
        '-crf 30',
        '-b:v 0',
        '-an', // remove audio
        '-row-mt 1',
        '-threads 8'
      ])
      .save(webmPath)
      .on('end', () => resolve())
      .on('error', reject);
  });
  console.log(` -> Created ${baseName}.webm`);

  // 3. Generate Optimized MP4 fallback
  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec('libx264')
      .outputOptions([
        '-crf 26',
        '-preset fast',
        '-an', // remove audio
        '-movflags +faststart'
      ])
      .save(mp4Path)
      .on('end', () => resolve())
      .on('error', reject);
  });
  console.log(` -> Created ${baseName}_web.mp4`);
}

async function main() {
  for (const video of videos) {
    try {
      if (fs.existsSync(path.join(siteDataDir, video))) {
        await processVideo(video);
      } else {
        console.log(`File not found: ${video}`);
      }
    } catch (e) {
      console.error(`Error processing ${video}:`, e);
    }
  }
  console.log('All videos processed successfully.');
}

main();
