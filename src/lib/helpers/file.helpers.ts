import { Size } from '../../model';

import { parse } from 'path';

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
