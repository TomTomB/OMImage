import { createComposition, createSourceSet } from '.';
import { CompositionTask, SourceSetTask } from '../model';

export const compositionTask = (options: CompositionTask) => {
  return { ...options, function: createComposition };
};

export const sourceSetTask = (options: SourceSetTask) => {
  return { ...options, function: createSourceSet };
};
