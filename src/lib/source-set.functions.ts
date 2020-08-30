import { SourceSetOptions, OMFile } from '../model';
import { logTaskEnd, logTaskStart, TaskCycleType } from './core';
import { outputOMFilesAt } from './core/node';
import {
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

  if (!files.length) {
    logTaskEnd(TaskCycleType.SourceSet, taskName);
    return;
  }

  let outputFiles: OMFile[] = [];
  if (options.outputFormats) {
    for (const size of options.sizes) {
      if (options.outputFormats.webp) {
        const files = await webP(size, filesInner, options.outputFormats.webp);
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
      const [webPFiles, pngFiles, jpgFiles] = await Promise.all([
        webP(size, filesInner),
        png(size, filesInner),
        jpg(size, filesInner),
      ]);
      outputFiles.push(...webPFiles, ...pngFiles, ...jpgFiles);
    }
  }

  logTaskEnd(TaskCycleType.SourceSet, taskName);
  return Promise.all(outputOMFilesAt(outputFiles, workingDirectory));
};
