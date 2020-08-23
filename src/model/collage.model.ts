export interface CollageOptions {
  enabled: boolean;
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
  images: { inputFileName: string; top: number; left: number }[];
}
