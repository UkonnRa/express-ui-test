import AbstractEntity from '../../shared/abstract-entity';

export enum Role {
  USER,
  ADMIN,
  OWNER,
}

export type UserCreateOptions = {
  name: string;
  role: Role;
};

export class User extends AbstractEntity<User> {
  name: string;

  readonly role: Role;

  constructor({ name, role }: UserCreateOptions) {
    super();
    this.name = name;
    this.role = role;
  }
}
