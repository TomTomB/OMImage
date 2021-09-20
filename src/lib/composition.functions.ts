import sharp from 'sharp';
import { CompositionOptions, OMFile, Size } from '../model';
import { logTaskEnd, logTaskStart, logVerbose, TaskCycleType } from './core';
import { outputOMFilesAt } from './core/node';
import { avif, compositeImageBuffers, jpg, png, webP } from './helpers';

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

  const compositionSize: Size = {
    height: options.baseImage.height,
    width: options.baseImage.width,
  };

  const srcImageBuffers: sharp.OverlayOptions[] = [];

  for (const compositionSrcImage of options.images) {
    const sourceFile = files.find(
      (file) => file.name.indexOf(compositionSrcImage.inputFileName) !== -1
    );

    if (!sourceFile && workingDirectory.includes('thumbnail')) {
      console.log(
        workingDirectory,
        options,
        files.map((f) => f.name)
      );

      logVerbose(
        `Composition: Cound not find all source files at ${workingDirectory}`
      );
      logTaskEnd(TaskCycleType.Composition, taskName);
      return;
    } else if (!sourceFile) {
      return;
    }

    let srcImageBuffer = sourceFile.buffer;

    if (compositionSrcImage.preprocess?.resize) {
      srcImageBuffer = await sharp(srcImageBuffer)
        .resize(
          compositionSrcImage.preprocess.resize.width,
          compositionSrcImage.preprocess.resize.height
        )
        .toBuffer();
    }

    srcImageBuffers.push({
      input: srcImageBuffer,
      left: compositionSrcImage.left ?? 0,
      top: compositionSrcImage.top ?? 0,
    });
  }

  let compositionBuffer: Buffer | null = null;

  try {
    compositionBuffer = await compositeImageBuffers(srcImageBuffers, options);
  } catch (error) {
    logVerbose(
      `Composition: Cound not composite files!, ${workingDirectory}, ${error}`
    );
    return;
  }

  if (!compositionBuffer) {
    return;
  }

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
    webP(compositionSize, [compositionImage]),
    avif(compositionSize, [compositionImage]),
    png(compositionSize, [compositionImage]),
    jpg(compositionSize, [compositionJpgImage]),
  ]);
  outputFiles.push(...webPFiles, ...pngFiles, ...jpgFiles);

  await Promise.all(outputOMFilesAt(outputFiles, workingDirectory));

  logTaskEnd(TaskCycleType.Composition, taskName);
};
