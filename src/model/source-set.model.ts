import { ImageType } from './image.model';
import { Size } from './size.model';

export interface SourceSetOptions {
  outputFormats?: {
    [key in ImageType]: {
      quality: number;
    };
  };
  allowList?: string[];
  ignoreList?: string[];
  sizes: Partial<Size>[];
}
