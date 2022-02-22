import { Role } from './user';

export type UserValue = {
  readonly id: string;
  readonly name: string;
  readonly role: Role;
  readonly authIds: Map<string, string>;
};
