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
 * Determine the image quality (0 - 100). Higher is better
 */
export const imageQuality = 85;

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
  enabled: true,
  baseImage: {
    width: 330,
    height: 200,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 0 },
  },
  outputName: 'preview-case',
  images: [
    {
      inputFileName: '04-preview-case-xbox_front.png',
      preprocess: { resize: { height: 200 } },
    },
    {
      inputFileName: '02-mockup-case-ps4_front.png',
      left: 175,
      preprocess: { resize: { height: 200 } },
    },
  ],
};
