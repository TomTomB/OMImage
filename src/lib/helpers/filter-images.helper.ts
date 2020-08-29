import * as fsCallback from 'fs';
import { extname } from 'path';
import { OMFile } from '../../model/oh-my-image.model';

export const filterByTypes = (types: string[], files: fsCallback.Dirent[]) => {
  return files.filter((f) => {
    const fileExt = extname(f.name);
    return types.indexOf(fileExt.replace('.', '')) !== -1;
  });
};

export const filterByAllowList = (names: string[], files: OMFile[]) => {
  return files.filter((file) =>
    names?.some((name) => file.name.includes(name))
  );
};

export const filterByIgnoreList = (names: string[], files: OMFile[]) => {
  return files.filter(
    (file) => !names?.some((name) => file.name.includes(name))
  );
};
