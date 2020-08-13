import * as fsCallback from 'fs';
import { join, extname, parse } from 'path';
import sharp from 'sharp';

const fs: typeof fsCallback.promises = require('fs').promises;

const directoryPath = join(__dirname, '..', 'img');

const sizes = [
  { width: 360, height: 480 },
  { width: 1080, height: 720 },
  { width: 1920, height: 1080 },
];

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

const toWebp = (buffers: Buffer[], size: { width: number; height: number }) => {
  const promises: Promise<Buffer>[] = [];

  buffers.forEach((buffer) => {
    const webpPromise = sharp(buffer)
      .resize({ width: size.width, height: size.height, fit: 'cover' })
      .webp({ reductionEffort: 6, quality: 50 })
      .toBuffer();

    promises.push(webpPromise);
  });

  return promises;
};

const toJpg = (buffers: Buffer[], size: { width: number; height: number }) => {
  const promises: Promise<Buffer>[] = [];

  buffers.forEach((buffer) => {
    const jpgPromise = sharp(buffer)
      .resize({ width: size.width, height: size.height, fit: 'cover' })
      .jpeg({ quality: 50 })
      .toBuffer();

    promises.push(jpgPromise);
  });

  return promises;
};

const outputToPath = (
  buffers: Buffer[],
  names: string[],
  path: string,
  size: { width: number; height: number },
  outputFormat: string
) => {
  const promises: Promise<void>[] = [];

  buffers.forEach((buffer, index) => {
    const writePromise = fs.writeFile(
      join(
        path,
        `${parse(names[index]).name}_${size.width}x${
          size.height
        }${outputFormat}`
      ),
      buffer
    );
    promises.push(writePromise);
  });

  return promises;
};

const getDirPath = (path: string) => {
  const subPath = path.replace(join(directoryPath, '..', 'img'), '');

  return join(directoryPath, '..', 'out', subPath);
};

const ensureDirExists = async (path: string) => {
  const dirPath = getDirPath(path);
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath);
  }

  return dirPath;
};

(async () => {
  paths = await dirs(directoryPath);

  console.log(`Found ${paths.length} Paths!`);

  for (const path of paths) {
    await ensureDirExists(path);
  }

  paths.forEach(async (path) => {
    const files = await filesAtPath(path);
    const images = await filterImages(files);

    if (images.length) {
      console.log(`Found ${images.length} Image(s) [${path}]`);
    }

    const dirPath = getDirPath(path);

    const buffers = await Promise.all(readFiles(images, path));
    console.log(`Read ${images.length} Image(s) [${path}]`);

    sizes.forEach(async (size) => {
      const webpBuffers = await Promise.all(toWebp(buffers, size));

      await Promise.all(
        outputToPath(
          webpBuffers,
          images.map((i) => i.name),
          dirPath,
          size,
          '.webp'
        )
      );

      console.log(
        `Converted to webp [x${images.length}] [${dirPath}] [${size.width}x${size.height}]`
      );

      const jpgBuffers = await Promise.all(toJpg(buffers, size));

      await Promise.all(
        outputToPath(
          jpgBuffers,
          images.map((i) => i.name),
          dirPath,
          size,
          '.jpeg'
        )
      );

      console.log(
        `Converted to jpeg [x${images.length}] [${dirPath}] [${size.width}x${size.height}]`
      );
    });
  });
})();
