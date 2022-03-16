import { Role } from "./user";

export interface UserCommandCreate {
  type: "UserCommandCreate";
  name: string;
  role: Role;
  authIds?: Map<string, string>;
}

export interface UserCommandUpdate {
  type: "UserCommandUpdate";
  id: string;
  name?: string;
  role?: Role;
  authIds?: Map<string, string>;
}

export interface UserCommandRebindAuthProvider {
  type: "UserCommandRebindAuthProvider";
  id: string;
}

export interface UserCommandDelete {
  type: "UserCommandDelete";
  id: string;
}

export type UserCommand =
  | UserCommandCreate
  | UserCommandUpdate
  | UserCommandRebindAuthProvider
  | UserCommandDelete;
