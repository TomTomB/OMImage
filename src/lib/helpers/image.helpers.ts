import sharp from 'sharp';
import { toFilename } from '.';
import { Size } from '../../model';
import { OMFile } from '../../model/oh-my-image.model';
import {
  JPGOptions,
  PNGOptions,
  WebPOptions,
} from '../../model/source-set.model';

const toWebPicture = (
  buffers: Buffer[],
  size: Partial<Size>,
  options?: WebPOptions
) => {
  const promises: Promise<Buffer>[] = [];

  buffers.forEach((buffer) => {
    const webpPromise = sharp(buffer)
      .resize({ width: size.width, height: size.height, fit: 'cover' })
      .webp(options)
      .toBuffer();

    promises.push(webpPromise);
  });

  return promises;
};

export const webP = async (
  size: Partial<Size>,
  files: OMFile[],
  options?: WebPOptions
) => {
  const webPictureBuffers = await Promise.all(
    toWebPicture(
      files.map((f) => f.buffer),
      size,
      options
    )
  );

  let outputFiles: OMFile[] = [];

  for (const [i, buffer] of webPictureBuffers.entries()) {
    outputFiles.push({
      buffer,
      name: toFilename(files[i].name, 'webp', size),
    });
  }

  return outputFiles;
};

const toPNG = (
  buffers: Buffer[],
  size: Partial<Size>,
  options?: PNGOptions
) => {
  const promises: Promise<Buffer>[] = [];

  buffers.forEach((buffer) => {
    const webpPromise = sharp(buffer)
      .resize({ width: size.width, height: size.height, fit: 'cover' })
      .png(options)
      .toBuffer();

    promises.push(webpPromise);
  });

  return promises;
};

export const png = async (
  size: Partial<Size>,
  files: OMFile[],
  options?: PNGOptions
) => {
  const pngBuffers = await Promise.all(
    toPNG(
      files.map((f) => f.buffer),
      size,
      options
    )
  );

  let outputFiles: OMFile[] = [];

  for (const [i, buffer] of pngBuffers.entries()) {
    outputFiles.push({
      buffer,
      name: toFilename(files[i].name, 'png', size),
    });
  }

  return outputFiles;
};

const toJPG = (
  buffers: Buffer[],
  size: Partial<Size>,
  options?: JPGOptions
) => {
  const promises: Promise<Buffer>[] = [];

  buffers.forEach((buffer) => {
    const webpPromise = sharp(buffer)
      .resize({ width: size.width, height: size.height, fit: 'cover' })
      .jpeg(options)
      .toBuffer();

    promises.push(webpPromise);
  });

  return promises;
};

export const jpg = async (
  size: Partial<Size>,
  files: OMFile[],
  options?: JPGOptions
) => {
  const jpgBuffers = await Promise.all(
    toJPG(
      files.map((f) => f.buffer),
      size,
      options
    )
  );

  let outputFiles: OMFile[] = [];

  for (const [i, buffer] of jpgBuffers.entries()) {
    outputFiles.push({
      buffer,
      name: toFilename(files[i].name, 'jpg', size),
    });
  }

  return outputFiles;
};
