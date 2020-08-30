import * as fsCallbackImport from 'fs';

export const fsCallback = fsCallbackImport;
export const fs: typeof fsCallback.promises = require('fs').promises;
