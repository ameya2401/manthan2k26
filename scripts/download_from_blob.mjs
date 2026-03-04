/**
 * Downloads video files from Vercel Blob so they can be re-uploaded to Backblaze B2.
 * Run: node scripts/download_from_blob.mjs
 */
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const videos = [
    {
        name: 'p2_hq.mp4',
        url: 'https://k6iphva0ugo1rocg.public.blob.vercel-storage.com/manthan/videos/p2_hq.mp4'
    },
    {
        name: 'extended.mp4',
        url: 'https://k6iphva0ugo1rocg.public.blob.vercel-storage.com/extended%20.mp4'
    }
];

async function downloadVideos() {
    for (const video of videos) {
        console.log(`⬇️  Downloading ${video.name}...`);
        try {
            const response = await fetch(video.url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const buffer = Buffer.from(await response.arrayBuffer());
            const outputPath = join(__dirname, '..', video.name);
            writeFileSync(outputPath, buffer);
            console.log(`✅ Saved to ${outputPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
        } catch (error) {
            console.error(`❌ Failed to download ${video.name}:`, error.message);
        }
    }
    console.log('\n--- Done! Upload these files to your Backblaze B2 bucket. ---');
}

downloadVideos();
