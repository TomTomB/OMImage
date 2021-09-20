import { SourceSetOptions, OMFile } from '../model';
import { logTaskEnd, logTaskStart, logVerbose, TaskCycleType } from './core';
import { outputOMFilesAt } from './core/node';
import {
  avif,
  filterByAllowList,
  filterByIgnoreList,
  jpg,
  png,
  webP,
} from './helpers';

export const createSourceSet = async ({
  options,
  files,
  workingDirectory,
  taskName,
}: {
  options: SourceSetOptions;
  files: OMFile[];
  workingDirectory: string;
  taskName: string;
}) => {
  logTaskStart(TaskCycleType.SourceSet, taskName);

  let filesInner = files;

  if (options.allowList) {
    filesInner = filterByAllowList(options.allowList, files);
  } else if (options.ignoreList) {
    filesInner = filterByIgnoreList(options.ignoreList, files);
  }

  if (!filesInner.length && workingDirectory.includes('share')) {
    console.log(
      workingDirectory,
      options,
      files.map((f) => f.name),
      filesInner.map((f) => f.name)
    );

    logVerbose(
      `Source Set: Cound not find all source files at ${workingDirectory}`
    );
    return;
  } else if (!filesInner.length) {
    return;
  }

  const outputFiles: OMFile[] = [];
  if (options.outputFormats) {
    for (const size of options.sizes) {
      if (options.outputFormats.webp) {
        const files = await webP(size, filesInner, options.outputFormats.webp);
        outputFiles.push(...files);
      }
      if (options.outputFormats.avif) {
        const files = await avif(size, filesInner, options.outputFormats.avif);
        outputFiles.push(...files);
      }
      if (options.outputFormats.png) {
        const files = await png(size, filesInner, options.outputFormats.png);
        outputFiles.push(...files);
      }
      if (options.outputFormats.jpg) {
        const files = await jpg(size, filesInner, options.outputFormats.jpg);
        outputFiles.push(...files);
      }
    }
  } else {
    for (const size of options.sizes) {
      const [webPFiles, pngFiles, avifFiles, jpgFiles] = await Promise.all([
        webP(size, filesInner),
        png(size, filesInner),
        avif(size, filesInner),
        jpg(size, filesInner),
      ]);
      outputFiles.push(...webPFiles, ...pngFiles, ...avifFiles, ...jpgFiles);
    }
  }

  await Promise.all(outputOMFilesAt(outputFiles, workingDirectory));

  logTaskEnd(TaskCycleType.SourceSet, taskName);
};
