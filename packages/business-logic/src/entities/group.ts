import { Collection, Entity, ManyToMany, Property } from '@mikro-orm/core';
import AbstractEntity from './abstract-entity';
import { User } from './user';

export type GroupCreateOptions = {
  name: string;
  description: string;
  admins: User[];
  members: User[];
};

@Entity()
export class Group extends AbstractEntity<Group> {
  @Property()
  readonly name: string;

  @Property()
  readonly description: string;

  @ManyToMany(() => User)
  readonly admins: Collection<User>;

  @ManyToMany(() => User)
  readonly members: Collection<User>;

  constructor({ name, description, admins, members }: GroupCreateOptions) {
    super();
    this.name = name;
    this.description = description;
    this.admins = new Collection<User>(this, admins);
    this.members = new Collection<User>(this, members);
  }

  public contains(user: User): boolean {
    return this.admins.contains(user) || this.members.contains(user);
  }
}
