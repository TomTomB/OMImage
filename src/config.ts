import { Size } from './model';
import { CollageOptions } from './model/collage.model';

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

/**
 * Create a collage based on multiple files
 * WARNING: The source files must not be bigger than the base image!
 */
export const collage: CollageOptions = {
  enabled: false,
  baseImage: {
    width: 1000,
    height: 1000,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
  images: [
    { inputFileName: 'blue.jpg', top: 100, left: 100 },
    { inputFileName: 'red.jpg', top: 0, left: 200 },
  ],
};
