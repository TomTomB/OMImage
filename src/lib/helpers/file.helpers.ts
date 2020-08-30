import { Dirent } from 'fs';
import { parse, extname } from 'path';

import { Size, OMFile } from '../../model';

export const toFilename = (
  name: string,
  extension: string,
  size?: Partial<Size>
) => {
  const basename = parse(name).name;

  if (!size) {
    return `${basename}.${extension}`;
  }

  if (size.width && size.height) {
    return `${basename}_${size.width}x${size.height}.${extension}`;
  }

  if (size.width) {
    return `${basename}_${size.width}w.${extension}`;
  }

  if (size.height) {
    return `${basename}_${size.height}h.${extension}`;
  }

  return `${basename}.${extension}`;
};

export const filterByTypes = (types: string[], files: Dirent[]) => {
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
