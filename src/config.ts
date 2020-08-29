import { clearOutDirectory } from './lib/core/node';
import { createSourceSet } from './lib/source-set.functions';
import { Size } from './model';
import { CollageOptions } from './model/collage.model';
import { SourceSetOptions } from './model/source-set.model';
import { Task } from './model/task.model';

/** The Sizes in which the source images will be outputted in pixels
 * @example
 * [{ width: 360, height: 480 }] // Files will be converted to a size of 360x480px
 * @deprecated
 */
export const sizes: Size[] = [
  { width: 360, height: 480 },
  { width: 1080, height: 720 },
  { width: 1920, height: 1080 },
];

/**
 * Determine the image quality (0 - 100). Higher is better
 * @deprecated
 */
export const imageQuality = 85;

/**
 * Determines which files will be converted.
 * If empty, all images inside the img dir will be converted
 * @example
 * ['cat'] // Only files with the word "cat" inside the filename will be converted
 * @deprecated
 */
export const fileNames: string[] = [];

/**
 * Create a collage based on multiple files
 * WARNING: The source files must not be bigger than the base image!
 * @deprecated
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

/**
 * These tasks are ran one after the other at startup
 */
export const preTasks: Task[] = [
  {
    name: 'Clear out directory',
    function: clearOutDirectory,
  },
];

/**
 * These tasks are ran in parallel
 */
export const mainTasks: Task[] = [
  {
    name: 'Create Source Set A',
    function: createSourceSet,
    params: {
      sizes: [{ width: 1920 }, { width: 1280 }, { width: 480 }],
      allowList: ['Hintergrund.jpg'],
    } as SourceSetOptions,
  },
  {
    name: 'Create Source Set B',
    function: createSourceSet,
    params: {
      sizes: [{ width: 1920 }, { width: 1280 }, { width: 480 }],
      allowList: ['origin_chars_echse_hl.png'],
      outputFormats: {
        png: { quality: 5 },
        webp: { quality: 5 },
      },
    } as SourceSetOptions,
  },
  // {
  //   name: 'Create Collage B',
  //   function: createCollage,
  // },
  // {
  //   name: 'Create Collage A',
  //   function: createCollage,
  //   params: collage,
  // },
];

/**
 * These tasks are ran one after the other at at the end
 */
export const postTasks: Task[] = [];
