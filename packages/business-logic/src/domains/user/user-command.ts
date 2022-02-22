import { Role } from './user';

export type UserCommandCreate = {
  type: 'UserCommandCreate';
  name: string;
  role: Role;
  authIds?: Map<string, string>;
};

export type UserCommandUpdate = {
  type: 'UserCommandUpdate';
  id: string;
  name?: string;
  role?: Role;
  authIds?: Map<string, string>;
};

export type UserCommandRebindAuthProvider = {
  type: 'UserCommandRebindAuthProvider';
  id: string;
};

export type UserCommandDelete = {
  type: 'UserCommandDelete';
  id: string;
};

export type UserCommand = UserCommandCreate | UserCommandUpdate | UserCommandRebindAuthProvider | UserCommandDelete;
