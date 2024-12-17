import { promisify } from "node:util";
import { exec as execSync } from "node:child_process";
const exec = promisify(execSync);

export class MediaProcessorService {
  constructor(private readonly ffmpegPath: string, private readonly tempFolder: string) {
    // TODO: verify binary
  }

  async generateThumbnail(path: string, fileName: string) {
    const destPath = `${this.tempFolder}/${fileName}.webp`;
    await exec(`${this.ffmpegPath} -i ${path} -map 0:v:0 -vframes 1 ${destPath}`)
    return destPath;
  }
}
