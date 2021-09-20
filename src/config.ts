import { compositionTask, sourceSetTask } from './lib';
import { clearOutDirectory } from './lib/core/node';
import { Task } from './model';

export const constants = {
  awsBucket: null,
  awsPrefix: 'uploads/',
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
  sourceSetTask({
    name: 'Create a source set',
    params: {
      sizes: [{ width: 1920 }, { width: 1280 }, { width: 480 }],
      allowList: ['react.png'],
    },
  }),

  compositionTask({
    name: 'Create a composition',
    params: {
      baseImage: {
        width: 300,
        height: 150,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      },
      outputName: 'some-composition',
      images: [
        {
          inputFileName: 'react.png',
          left: 25,
          top: 25,
          preprocess: { resize: { height: 100 } },
        },
        {
          inputFileName: 'webpack.png',
          left: 150,
          preprocess: { resize: { height: 150 } },
        },
      ],
    },
  }),
];

/**
 * These tasks are ran one after the other at at the end
 */
export const postTasks: Task[] = [];
