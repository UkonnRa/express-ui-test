import { FindOneInput, FindPageInput, Page } from "./shared";

export default interface AbstractApi<M> {
  findOne: (query: FindOneInput) => Promise<M | null>;
  findPage: (query: FindPageInput) => Promise<Page<M>>;
}
