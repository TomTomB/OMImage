export interface Task {
  name: string;
  function: (param?: any) => Promise<any>;
  params?: object;
}
