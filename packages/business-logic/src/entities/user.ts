import { Entity, Enum, Property } from '@mikro-orm/core';
import AbstractEntity from './abstract-entity';

export enum Role {
  USER,
  ADMIN,
  OWNER,
}

export type UserCreateOptions = {
  name: string;
  role: Role;
};

@Entity()
export class User extends AbstractEntity<User> {
  @Property()
  readonly name: string;

  @Enum()
  readonly role: Role;

  constructor({ name, role }: UserCreateOptions) {
    super();
    this.name = name;
    this.role = role;
  }
}
