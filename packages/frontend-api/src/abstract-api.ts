import { Command, FindPageInput, Page } from "@white-rabbit/types";

export default interface AbstractApi<T, M, C extends Command, Q> {
  findOne: (token: T, query?: object) => Promise<M | null>;
  findPage: (token: T, query: FindPageInput<Q>) => Promise<Page<M>>;

  handle: (token: T, command: C) => Promise<M | null>;
  handleAll: (token: T, commands: C[]) => Promise<Array<M | null>>;
}
