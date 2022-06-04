import { AbstractEntity, AuthUser } from "./index";
import { FilterQuery } from "@mikro-orm/core";

export default interface FindOneInput<E extends AbstractEntity<E>> {
  readonly authUser?: AuthUser;
  readonly query?: FilterQuery<E>;
}
