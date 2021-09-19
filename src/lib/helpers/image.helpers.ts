import sharp from 'sharp';
import { toFilename } from '.';
import {
  JPGOptions,
  PNGOptions,
  WebPOptions,
  OMFile,
  Size,
  CompositionOptions,
  AVIFOptions,
} from '../../model';

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

const toAVIF = (
  buffers: Buffer[],
  size: Partial<Size>,
  options?: AVIFOptions
) => {
  const promises: Promise<Buffer>[] = [];

  buffers.forEach((buffer) => {
    const webpPromise = sharp(buffer)
      .resize({ width: size.width, height: size.height, fit: 'cover' })
      .avif(options)
      .toBuffer();

    promises.push(webpPromise);
  });

  return promises;
};

export const avif = async (
  size: Partial<Size>,
  files: OMFile[],
  options?: AVIFOptions
) => {
  const webPictureBuffers = await Promise.all(
    toAVIF(
      files.map((f) => f.buffer),
      size,
      options
    )
  );

  let outputFiles: OMFile[] = [];

  for (const [i, buffer] of webPictureBuffers.entries()) {
    outputFiles.push({
      buffer,
      name: toFilename(files[i].name, 'avif', size),
    });
  }

  return outputFiles;
};

export const compositeImageBuffers = (
  imagesToComposite: sharp.OverlayOptions[],
  compositionOptions: CompositionOptions,
  forceNoAlpha?: boolean
) => {
  const configOverwrite: Partial<sharp.Create> = {};

  if (forceNoAlpha) {
    configOverwrite.channels = 3;
    configOverwrite.background = {
      r: compositionOptions.baseImage.background.r,
      g: compositionOptions.baseImage.background.g,
      b: compositionOptions.baseImage.background.b,
    };
  }

  const emptyImage = sharp({
    create: { ...compositionOptions.baseImage, ...configOverwrite },
  });
  return emptyImage
    .composite(imagesToComposite)
    .webp({ lossless: true, quality: 100, reductionEffort: 0 })
    .toBuffer();
};
