import { Entity, Enum, Property } from '@mikro-orm/core';
import AbstractEntity from './abstract-entity';

export enum Role {
  USER,
  ADMIN,
  OWNER,
}

@Entity()
export class User extends AbstractEntity<User> {
  @Property()
  readonly name: string;

  @Enum()
  readonly role: Role;

  constructor(name: string, role: Role) {
    super();
    this.name = name;
    this.role = role;
  }
}
