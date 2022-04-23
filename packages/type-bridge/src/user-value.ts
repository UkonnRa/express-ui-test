export const TYPE_USER = Symbol("User");

export enum Role {
  USER,
  ADMIN,
  OWNER,
}

export interface UserValue {
  readonly id: string;
  readonly name: string;
  readonly role: Role;
  readonly authIds: Map<string, string>;
}
