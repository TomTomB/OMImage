import { OMFile } from '../model/oh-my-image.model';
import { SourceSetOptions } from '../model/source-set.model';
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
  logTaskStart(TaskCycleType.Main, taskName);

  let filesInner = files;

  if (options.allowList) {
    filesInner = filterByAllowList(options.allowList, files);
  } else if (options.ignoreList) {
    filesInner = filterByIgnoreList(options.ignoreList, files);
  }

  if (!files.length) {
    logTaskEnd(TaskCycleType.Main, taskName);
    return;
  }

  let outputFiles: OMFile[] = [];
  if (options.outputFormats) {
    for (const size of options.sizes) {
      if (options.outputFormats.webp) {
        const files = await webP(
          size,
          filesInner,
          options.outputFormats.webp.quality
        );
        outputFiles.push(...files);
      }
      if (options.outputFormats.png) {
        const files = await png(
          size,
          filesInner,
          options.outputFormats.png.quality
        );
        outputFiles.push(...files);
      }
      if (options.outputFormats.jpg) {
        const files = await jpg(
          size,
          filesInner,
          options.outputFormats.jpg.quality
        );
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

  await Promise.all(outputOMFilesAt(outputFiles, workingDirectory));
  logTaskEnd(TaskCycleType.Main, taskName);
};
