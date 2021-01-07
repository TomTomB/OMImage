import { JpegOptions, PngOptions, WebpOptions } from 'sharp';
import { Size } from './size.model';

export interface SourceSetTask {
  name: string;
  params: SourceSetOptions;
}

export interface SourceSetOptions {
  outputFormats?: {
    jpg?: JPGOptions;
    png?: PNGOptions;
    webp?: WebPOptions;
  };
  allowList?: string[];
  ignoreList?: string[];
  sizes: Partial<Size>[];
}

export interface JPGOptions extends JpegOptions {}

export interface PNGOptions extends PngOptions {}

export interface WebPOptions extends WebpOptions {}
