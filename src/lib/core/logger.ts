export enum TaskCycleType {
  Pre = 'PRE',
  Main = 'MAIN',
  Post = 'POST',
}

export const logHeader = (message: string) => {
  const logMessage = `\n##### ${message} #####\n`;
  console.log(logMessage);
};

export const logVerbose = (message: string) => {
  const logMessage = `[LOGGER::INFO] ${message}`;
  console.log(logMessage);
};

export const logTaskStart = (type: TaskCycleType, message: string) => {
  const logMessage = `[${type}::START] ${message}`;
  console.time(message);
  console.log(logMessage);
};

export const logTaskFail = (type: TaskCycleType, message: string) => {
  const logMessage = `[${type}::FAIL] ${message}`;
  console.timeEnd(message);
  console.log(logMessage);
};

export const logTaskEnd = (type: TaskCycleType, message: string) => {
  const logMessage = `[${type}::END] ${message}`;
  console.timeEnd(message);
  console.log(logMessage);
};
