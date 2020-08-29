import * as fsCallback from 'fs';
import { join, extname, parse } from 'path';
import sharp from 'sharp';
import { imageQuality, collage, fileNames, sizes } from '../../config';
import { Size } from '../../model';

const fs: typeof fsCallback.promises = require('fs').promises;
const directoryPath = join(__dirname, '..', 'img');

const dirs = async (path: string): Promise<string[]> =>
  (await fs.stat(path)).isDirectory()
    ? Promise.all(
        (await fs.readdir(path)).map((p) => dirs(join(path, p)))
        // @ts-ignore
      ).then((results: string[]) => [].concat(path, ...results))
    : [];

const deleteOut = async () =>
  await fs.rmdir(join(__dirname, '..', 'out'), { recursive: true });

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
  return files.filter((f) => {
    const fileExt = extname(f.name);
    return fileExt === '.png' || fileExt === '.jpg' || fileExt === '.jpeg';
  });
};

const filterByName = async (files: fsCallback.Dirent[], names: string[]) => {
  return files.filter((f) => {
    for (const name of names) {
      if (f.name.includes(name)) {
        return true;
      }
    }
    return false;
  });
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
      .webp({ reductionEffort: 6, quality: imageQuality })
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
      .jpeg({ quality: imageQuality })
      .toBuffer();

    promises.push(jpgPromise);
  });

  return promises;
};

const toPng = (buffers: Buffer[], size: { width: number; height: number }) => {
  const promises: Promise<Buffer>[] = [];

  buffers.forEach((buffer) => {
    const pngPromise = sharp(buffer)
      .resize({ width: size.width, height: size.height, fit: 'cover' })
      .png({ quality: imageQuality })
      .toBuffer();

    promises.push(pngPromise);
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

export const createComposition = (
  imagesToComposite: sharp.OverlayOptions[],
  forceNoAlpha?: boolean
) => {
  const configOverwrite: Partial<sharp.Create> = {};

  if (forceNoAlpha) {
    configOverwrite.channels = 3;
    configOverwrite.background = {
      r: collage.baseImage.background.r,
      g: collage.baseImage.background.g,
      b: collage.baseImage.background.b,
    };
  }

  const emptyImage = sharp({
    create: { ...collage.baseImage, ...configOverwrite },
  });
  return emptyImage
    .composite(imagesToComposite)
    .webp({ lossless: true, quality: 100, reductionEffort: 0 })
    .toBuffer();
};

(async () => {
  console.log('Cleaning up...');

  try {
    await deleteOut();
  } catch (e) {
    console.error(
      'Cant delete out dir. Please remove it manually and try again!'
    );
    return;
  }

  if (collage.enabled) {
    const paths = await dirs(directoryPath);

    const collageSize: Size = {
      height: collage.baseImage.height,
      width: collage.baseImage.width,
    };

    console.log(`Found ${paths.length} Paths!`);

    for (const path of paths) {
      await ensureDirExists(path);
    }

    let ignorePath = false;

    paths.forEach(async (path) => {
      const srcImageBuffers: sharp.OverlayOptions[] = [];

      for (const collageSrcImage of collage.images) {
        const filePath = join(path, collageSrcImage.inputFileName);
        try {
          let srcImageBuffer = await fs.readFile(filePath);

          if (collageSrcImage.preprocess?.resize) {
            srcImageBuffer = await sharp(srcImageBuffer)
              .resize(
                collageSrcImage.preprocess.resize.width,
                collageSrcImage.preprocess.resize.height
              )
              .toBuffer();
          }

          srcImageBuffers.push({
            input: srcImageBuffer,
            left: collageSrcImage.left ?? 0,
            top: collageSrcImage.top ?? 0,
          });
        } catch (error) {
          console.log(
            `Could not find required image for collage! Ignoring! [${filePath}]`
          );

          ignorePath = true;
          break;
        }
      }

      if (ignorePath) {
        ignorePath = false;
      } else {
        const compositionBuffer = await createComposition(srcImageBuffers);

        const webpBuffers = await Promise.all(
          toWebp([compositionBuffer], collageSize)
        );

        const dirPath = getDirPath(path);

        await Promise.all(
          outputToPath(
            webpBuffers,
            [collage.outputName],
            dirPath,
            collageSize,
            '.webp'
          )
        );

        console.log(
          `Converted to webp [${dirPath}] [${collage.baseImage.width}x${collage.baseImage.height}]`
        );

        const compositionJpgBuffer = await createComposition(
          srcImageBuffers,
          true
        );

        const jpgBuffers = await Promise.all(
          toJpg([compositionJpgBuffer], collageSize)
        );

        await Promise.all(
          outputToPath(
            jpgBuffers,
            [collage.outputName],
            dirPath,
            collageSize,
            '.jpeg'
          )
        );

        console.log(
          `Converted to jpeg [${dirPath}] [${collage.baseImage.width}x${collage.baseImage.height}]`
        );

        const pngBuffers = await Promise.all(
          toPng([compositionBuffer], collageSize)
        );

        await Promise.all(
          outputToPath(
            pngBuffers,
            [collage.outputName],
            dirPath,
            collageSize,
            '.png'
          )
        );

        console.log(
          `Converted to png [${dirPath}] [${collage.baseImage.width}x${collage.baseImage.height}]`
        );
      }
    });
  } else {
    const paths = await dirs(directoryPath);

    console.log(`Found ${paths.length} Paths!`);

    for (const path of paths) {
      await ensureDirExists(path);
    }

    paths.forEach(async (path) => {
      const files = await filesAtPath(path);
      let images = await filterImages(files);

      if (images.length) {
        console.log(`Found ${images.length} Image(s) [${path}]`);
      }

      if (fileNames.length) {
        images = await filterByName(images, fileNames);
        console.log(
          `Found ${images.length} Image(s) based on filter [${path}]`
        );
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

        const pngBuffers = await Promise.all(toPng(buffers, size));

        await Promise.all(
          outputToPath(
            pngBuffers,
            images.map((i) => i.name),
            dirPath,
            size,
            '.png'
          )
        );

        console.log(
          `Converted to png [x${images.length}] [${dirPath}] [${size.width}x${size.height}]`
        );
      });
    });
  }
})();
