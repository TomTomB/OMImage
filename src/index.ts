import { constants, mainTasks, postTasks, preTasks } from './config';
import { getObject, listDirectories, uploadObjects } from './lib/aws/lib';
import {
  logHeader,
  logTaskStart,
  TaskCycleType,
  logTaskFail,
  logTaskEnd,
  logVerbose,
  fs,
} from './lib/core';
import {
  getAllDirectories,
  sourceDirectory,
  filesAtPath,
  ensureOutDirectoriesExists,
  filesToBuffer,
  ensureImgDirectoriesExists,
} from './lib/core/node';
import { filterByTypes } from './lib/helpers';
import { OMFile } from './model';

const OMImage = async () => {
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
      logTaskFail(TaskCycleType.Main, `${e} || at ${directory}`);
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
};

(async () => {
  let allRemoteDirectories: string[] = [];

  if (constants.awsBucket && constants.awsPrefix) {
    logHeader('Running S3 Pre Tasks');

    const objects = await listDirectories();

    allRemoteDirectories.push(
      `${sourceDirectory}/uploads`,
      ...objects.CommonPrefixes!.map((p) => `${sourceDirectory}/${p.Prefix!}`),
      ...objects.CommonPrefixes!.map(
        (p) => `${sourceDirectory}/${p.Prefix!}share`
      ),
      ...objects.CommonPrefixes!.map(
        (p) => `${sourceDirectory}/${p.Prefix!}thumbnail`
      )
    );

    await ensureImgDirectoriesExists(allRemoteDirectories);

    for (const prefix of objects.CommonPrefixes!) {
      logTaskStart(TaskCycleType.Pre, `Download from S3: ${prefix.Prefix!}`);

      const clubName = prefix.Prefix!.replace('uploads/', '').replace('/', '');

      const filesToDownload: string[] = [
        `share/social_sharing@2x.png`,
        `share/social_sharing-club-2@2x.png`,
        `thumbnail/${clubName}-xbox-one-mit-rating.png`,
        `thumbnail/${clubName}-playstation-4-mit-rating.png`,
        `thumbnail/${clubName}-wallpaper-desktop-4k.png`,
        `thumbnail/${clubName}-wallpaper-ipad-air.png`,
        `thumbnail/${clubName}-wallpaper-ipad-pro.png`,
        `thumbnail/${clubName}-wallpaper-iphone-11-pro.png`,
        `thumbnail/${clubName}-wallpaper-iphone-11.png`,
        `thumbnail/${clubName}-wallpaper-iphone-pro-max.png`,
        `thumbnail/${clubName}-wallpaper-iphone-se.png`,
      ];

      const outputPromises = filesToDownload.map((path) =>
        getObject(`${prefix.Prefix}${path}`)
      );

      try {
        const dataArray = await Promise.all(outputPromises);
        const writePromises = [];
        for (const [i, data] of dataArray.entries()) {
          const imgFilePath = `${sourceDirectory}/${prefix.Prefix}${filesToDownload[i]}`;
          const writePromise = fs.writeFile(imgFilePath, data.Body as Buffer);
          writePromises.push(writePromise);
        }
        await Promise.all(writePromises);
        logTaskEnd(TaskCycleType.Pre, `Download from S3: ${prefix.Prefix!}`);
      } catch (error) {
        console.log(error);

        logTaskFail(
          TaskCycleType.Pre,
          `Download from S3: ${prefix.Prefix!} (${clubName})`
        );
        continue;
      }
    }
  }

  await OMImage();

  if (constants.awsBucket && constants.awsPrefix) {
    logHeader('Running S3 Post Tasks');

    for (const dir of allRemoteDirectories.map((srcDir) =>
      srcDir.replace('img', 'out')
    )) {
      const files = await filesAtPath(dir);

      if (!files.length) {
        logVerbose(`Skipping empty out directory (${dir})`);
        continue;
      }

      const s3Path = dir.slice(dir.indexOf('uploads'), dir.length);

      logTaskStart(TaskCycleType.Post, `Upload to S3: ${s3Path}/out`);
      try {
        const buffers = await Promise.all(filesToBuffer(files, dir));
        const filePaths = files.map((file) => `${s3Path}/out/${file.name}`);
        await Promise.all(uploadObjects(buffers, filePaths));
      } catch (error) {
        logTaskFail(TaskCycleType.Post, `Upload to S3: ${s3Path}/out`);
        continue;
      }

      logTaskEnd(TaskCycleType.Post, `Upload to S3: ${s3Path}/out`);
    }
  }

  logHeader('Done!');
})();
