import { mainTasks, postTasks, preTasks } from './config';
import {
  logHeader,
  logTaskStart,
  TaskCycleType,
  logTaskFail,
  logTaskEnd,
  logVerbose,
} from './lib/core';
import {
  getAllDirectories,
  sourceDirectory,
  filesAtPath,
  ensureOutDirectoriesExists,
  filesToBuffer,
} from './lib/core/node';
import { filterByTypes } from './lib/helpers';
import { OMFile } from './model';

(async () => {
  logHeader('Starting Oh My Image');

  if (preTasks.length) {
    logHeader('Running Pre Tasks');

    for (const task of preTasks) {
      logTaskStart(TaskCycleType.Pre, task.name);
      try {
        await task.function(task.params);
      } catch (e) {
        logTaskFail(TaskCycleType.Pre, task.name);
        return;
      }
      logTaskEnd(TaskCycleType.Pre, task.name);
    }
  }

  let allDirectories: string[];

  try {
    logTaskStart(TaskCycleType.Pre, 'Copying directories');
    allDirectories = await getAllDirectories(sourceDirectory);
    await ensureOutDirectoriesExists(allDirectories);
    logTaskEnd(TaskCycleType.Pre, 'Copying directories');
  } catch (e) {
    logTaskFail(TaskCycleType.Pre, e);
    return;
  }

  logHeader('Running Main Tasks');

  for (const directory of allDirectories) {
    const sourceFiles = await filesAtPath(directory);
    const sourceImageFiles = filterByTypes(
      ['jpg', 'jpeg', 'png', 'webm'],
      sourceFiles
    );

    if (!sourceImageFiles.length) {
      logVerbose(`Skipping empty directory (${directory})`);
      continue;
    }

    const sourceImageBuffers = await Promise.all(
      filesToBuffer(sourceImageFiles, directory)
    );

    const taskFiles: OMFile[] = [];
    for (const [index, sourceImage] of sourceImageFiles.entries()) {
      taskFiles.push({
        name: sourceImage.name,
        buffer: sourceImageBuffers[index],
      });
    }

    logTaskStart(
      TaskCycleType.Main,
      `${mainTasks.length} Tasks (${directory})`
    );

    const tasks: Promise<any>[] = [];
    for (const task of mainTasks) {
      tasks.push(
        task.function({
          options: task.params,
          files: taskFiles,
          workingDirectory: directory,
          taskName: task.name,
        })
      );
    }

    try {
      await Promise.all(tasks);
    } catch (e) {
      logTaskFail(TaskCycleType.Main, e);
      return;
    }
    logTaskEnd(TaskCycleType.Main, `${tasks.length} Tasks (${directory})`);
  }

  if (postTasks.length) {
    logHeader('Running Post Tasks');

    for (const task of postTasks) {
      logTaskStart(TaskCycleType.Pre, task.name);
      try {
        await task.function(task.params);
      } catch (e) {
        logTaskFail(TaskCycleType.Pre, task.name);
        return;
      }
      logTaskEnd(TaskCycleType.Pre, task.name);
    }
  }

  logHeader('Done!');
})();
