import sharp from 'sharp';
import { CompositionOptions, OMFile, Size } from '../model';
import { logTaskEnd, logTaskStart, TaskCycleType } from './core';
import { outputOMFilesAt } from './core/node';
import { compositeImageBuffers, jpg, png, webP } from './helpers';

export const createComposition = async ({
  options,
  files,
  workingDirectory,
  taskName,
}: {
  options: CompositionOptions;
  files: OMFile[];
  workingDirectory: string;
  taskName: string;
}) => {
  logTaskStart(TaskCycleType.Composition, taskName);

  const collageSize: Size = {
    height: options.baseImage.height,
    width: options.baseImage.width,
  };

  const srcImageBuffers: sharp.OverlayOptions[] = [];

  for (const collageSrcImage of options.images) {
    const sourceFile = files.find(
      (file) => file.name === collageSrcImage.inputFileName
    );

    if (!sourceFile) {
      logTaskEnd(TaskCycleType.Composition, taskName);
      return;
    }

    let srcImageBuffer = sourceFile.buffer;

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
  }

  const compositionBuffer = await compositeImageBuffers(
    srcImageBuffers,
    options
  );
  const compositionImage: OMFile = {
    buffer: compositionBuffer,
    name: options.outputName,
  };

  const compositionJpgBuffer = await compositeImageBuffers(
    srcImageBuffers,
    options,
    true
  );
  const compositionJpgImage: OMFile = {
    buffer: compositionJpgBuffer,
    name: options.outputName,
  };

  const outputFiles: OMFile[] = [];

  const [webPFiles, pngFiles, jpgFiles] = await Promise.all([
    webP(collageSize, [compositionImage]),
    png(collageSize, [compositionImage]),
    jpg(collageSize, [compositionJpgImage]),
  ]);
  outputFiles.push(...webPFiles, ...pngFiles, ...jpgFiles);

  await Promise.all(outputOMFilesAt(outputFiles, workingDirectory));

  logTaskEnd(TaskCycleType.Composition, taskName);
};
