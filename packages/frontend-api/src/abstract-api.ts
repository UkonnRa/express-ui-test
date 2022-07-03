import { FindPageInput, Page } from "./shared";

export default interface AbstractApi<T, M, C> {
  findOne: (token: T, query?: object) => Promise<M | null>;
  findPage: (token: T, query: FindPageInput) => Promise<Page<M>>;

  handle: (token: T, command: C) => Promise<M | null>;
  handleAll: (token: T, commands: C[]) => Promise<Array<M | null>>;
}
