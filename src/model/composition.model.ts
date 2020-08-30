import { Size } from './size.model';

export interface CompositionOptions {
  baseImage: {
    width: number;
    height: number;
    channels: 3 | 4;
    background: {
      r: number;
      g: number;
      b: number;
      alpha?: number;
    };
  };
  outputName: string;
  images: {
    inputFileName: string;
    top?: number;
    left?: number;
    preprocess?: { resize?: Partial<Size> };
  }[];
}
