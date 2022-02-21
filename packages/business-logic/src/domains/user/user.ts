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

  // eslint-disable-next-line class-methods-use-this
  isReadable(): boolean {
    return true;
  }

  isWritable(user: User): boolean {
    return user.id === this.id;
  }

  // eslint-disable-next-line class-methods-use-this
  toProjection(): never {
    throw new Error('Method not implemented.');
  }
}
