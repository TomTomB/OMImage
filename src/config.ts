import { Size } from './model';

/** The Sizes in which the source images will be outputted in pixels
 * @example
 * [{ width: 360, height: 480 }] // Files will be converted to a size of 360x480px
 */
export const sizes: Size[] = [
  { width: 360, height: 480 },
  { width: 1080, height: 720 },
  { width: 1920, height: 1080 },
];

/**
 * Determines which files will be converted.
 * If empty, all images inside the img dir will be converted
 * @example
 * ['cat'] // Only files with the word "cat" inside the filename will be converted
 */
export const fileNames: string[] = [];
