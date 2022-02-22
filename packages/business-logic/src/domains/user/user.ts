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

export class User extends AbstractEntity<User, undefined> {
  name: string;

  readonly role: Role;

  constructor({ name, role }: UserCreateOptions) {
    super();
    this.name = name;
    this.role = role;
  }

  isReadable(): boolean {
    return true;
  }

  isWritable(user: User): boolean {
    return user.id === this.id;
  }

  toValue(): never {
    throw new Error('Method not implemented.');
  }
}
