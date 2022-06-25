import { FindOneInput, FindPageInput, Page } from "./shared";

export default interface AbstractApi<M, C> {
  findOne: (query: FindOneInput) => Promise<M | null>;
  findPage: (query: FindPageInput) => Promise<Page<M>>;

  handle: (command: C) => Promise<M | null>;
  handleAll: (commands: C[]) => Promise<Array<M | null>>;
}
