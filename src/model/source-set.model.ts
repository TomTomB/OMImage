import { JpegOptions, PngOptions, WebpOptions, AvifOptions } from 'sharp';
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
    avif?: AVIFOptions;
  };
  allowList?: string[];
  ignoreList?: string[];
  sizes: Partial<Size>[];
}

export interface JPGOptions extends JpegOptions {}

export interface PNGOptions extends PngOptions {}

export interface WebPOptions extends WebpOptions {}

export interface AVIFOptions extends AvifOptions {}
