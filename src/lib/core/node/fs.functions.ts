import * as fsCallback from 'fs';
import { join, parse } from 'path';

import { fs } from '..';
import { OMFile } from '../../../model/oh-my-image.model';
import { outDirectory } from './path.functions';

export const clearOutDirectory = async () =>
  await fs.rmdir(outDirectory, { recursive: true });

export const getAllDirectories = async (path: string): Promise<string[]> =>
  (await fs.stat(path)).isDirectory()
    ? Promise.all(
        (await fs.readdir(path)).map((p) => getAllDirectories(join(path, p)))
        // @ts-ignore
      ).then((results: string[]) => [].concat(path, ...results))
    : [];

export const ensureDirectoryExists = async (path: string) => {
  try {
    await fs.access(path);
  } catch (error) {
    await fs.mkdir(path);
  }

  return path;
};

export const ensureDirectoriesExists = async (paths: string[]) => {
  for (const path of paths) {
    await ensureDirectoryExists(path);
  }
};

export const ensureOutDirectoriesExists = async (paths: string[]) => {
  for (const path of paths) {
    await ensureDirectoryExists(path.replace('img', 'out'));
  }
};

export const filesAtPath = async (path: string) => {
  const items = await fs.readdir(path, { withFileTypes: true });

  const files: fsCallback.Dirent[] = [];

  items.forEach((item) => {
    if (!item.isDirectory()) {
      files.push(item);
    }
  });

  return files;
};

export const filesToBuffer = (files: fsCallback.Dirent[], path: string) => {
  const promises: Promise<Buffer>[] = [];

  files.forEach((file) => promises.push(fs.readFile(join(path, file.name))));

  return promises;
};

export const outputOMFilesAt = (files: OMFile[], directory: string) => {
  const promises: Promise<void>[] = [];

  for (const file of files) {
    const writePromise = fs.writeFile(
      join(directory.replace('img', 'out'), file.name),
      file.buffer
    );
    promises.push(writePromise);
  }

  return promises;
};
