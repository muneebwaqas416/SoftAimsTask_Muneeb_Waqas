import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import { promisify } from 'util';
import { tmpdir } from 'os';
import { join } from 'path';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

export async function convertWebmToWav(webmData: Buffer): Promise<Buffer> {
  // Create temp files
  const tempWebmPath = join(tmpdir(), `temp_${Date.now()}.webm`);
  const tempWavPath = join(tmpdir(), `temp_${Date.now()}.wav`);

  try {
    // Write input file
    await writeFile(tempWebmPath, webmData);

    // Convert using ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(tempWebmPath)
        .audioFrequency(16000) // Set sample rate
        .audioChannels(1)     // Mono
        .format('wav')
        .on('end', resolve)
        .on('error', reject)
        .save(tempWavPath);
    });

    // Read output file
    const wavData = await fs.promises.readFile(tempWavPath);
    
    // Verify WAV header
    if (!wavData.slice(0, 4).equals(Buffer.from('RIFF'))) {
      throw new Error('Conversion failed - invalid WAV file produced');
    }

    return wavData;
  } finally {
    try { await unlink(tempWebmPath); } catch {}
    try { await unlink(tempWavPath); } catch {}
  }
}

