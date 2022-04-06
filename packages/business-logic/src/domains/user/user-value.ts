import type { Role } from "./user";

export interface UserValue {
  readonly id: string;
  readonly name: string;
  readonly role: Role;
  readonly authIds: Map<string, string>;
}
