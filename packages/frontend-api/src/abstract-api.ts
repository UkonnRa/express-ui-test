import { User } from "oidc-client-ts";
import { FindOneInput, FindPageInput, Page } from "./shared";

export default interface AbstractApi<M, C> {
  findOne: (user: User, query: FindOneInput) => Promise<M | null>;
  findPage: (user: User, query: FindPageInput) => Promise<Page<M>>;

  handle: (user: User, command: C) => Promise<M | null>;
  handleAll: (user: User, commands: C[]) => Promise<Array<M | null>>;
}
