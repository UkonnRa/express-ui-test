import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

export enum Role {
  NONE,
  USER,
  ADMIN,
  OWNER,
}

@Entity()
export class User {
  @PrimaryKey({ type: 'string' })
  id: string = v4();

  @Property()
  name!: string;

  @Enum(() => Role)
  role!: Role;

  constructor(name: string, role: Role) {
    this.name = `${name}`;
    this.role = role;
  }
}
