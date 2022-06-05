import { ObjectQuery } from "@mikro-orm/core";
import AbstractEntity from "./abstract-entity";
import AuthUser from "./auth-user";

export default interface FindOneInput<E extends AbstractEntity<E>> {
  readonly authUser?: AuthUser;
  readonly query?: ObjectQuery<E>;
}
