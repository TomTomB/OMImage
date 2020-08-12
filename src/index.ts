import * as fsCallback from 'fs';
import { join, extname } from 'path';
import sharp from 'sharp';

const fs: typeof fsCallback.promises = require('fs').promises;

const directoryPath = join(__dirname, '..', 'img');

let paths: string[] = [];

const dirs = async (path: string): Promise<string[]> =>
  (await fs.stat(path)).isDirectory()
    ? Promise.all(
        (await fs.readdir(path)).map((p) => dirs(join(path, p)))
        // @ts-ignore
      ).then((results: string[]) => [].concat(path, ...results))
    : [];

const filesAtPath = async (path: string) => {
  const items = await fs.readdir(path, { withFileTypes: true });

  const files: fsCallback.Dirent[] = [];

  items.forEach((item) => {
    if (!item.isDirectory()) {
      files.push(item);
    }
  });

  return files;
};

const filterImages = async (files: fsCallback.Dirent[]) => {
  return files.filter((f) => extname(f.name) === ('.jpg' || '.jpeg'));
};

const readFiles = (files: fsCallback.Dirent[], path: string) => {
  const promises: Promise<Buffer>[] = [];

  files.forEach((file) => promises.push(fs.readFile(join(path, file.name))));

  return promises;
};

const toWebp = (buffers: Buffer[]) => {
  const promises: Promise<Buffer>[] = [];

  buffers.forEach((buffer) => {
    const webpPromise = sharp(buffer).webp().toBuffer();

    promises.push(webpPromise);
  });

  return promises;
};

const outputToPath = (
  buffers: Buffer[],
  names: string[],
  path: string,
  outputFormat: string
) => {
  const promises: Promise<void>[] = [];

  buffers.forEach((buffer, index) => {
    const writePromise = fs.writeFile(
      join(path, '../out', names[index] + outputFormat),
      buffer
    );

    promises.push(writePromise);
  });

  return promises;
};

(async () => {
  paths = await dirs(directoryPath);

  console.log(`Found ${paths.length} Paths!`);

  paths.forEach(async (path) => {
    const files = await filesAtPath(path);
    const images = await filterImages(files);

    if (images.length) {
      console.log(`Found ${images.length} Image(s) [${path}]`);
    }

    const buffers = await Promise.all(readFiles(images, path));

    const webpBuffers = await Promise.all(toWebp(buffers));

    await Promise.all(
      outputToPath(
        webpBuffers,
        images.map((i) => i.name),
        path,
        '.webp'
      )
    );

    console.log(`Converted to webp`);
  });
})();
