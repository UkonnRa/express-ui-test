import { Collection, Entity, ManyToMany, Property } from '@mikro-orm/core';
import AbstractEntity from './abstract-entity';
import { User } from './user';

@Entity()
class Group extends AbstractEntity<Group> {
  @Property()
  readonly name: string;

  @ManyToMany(() => User)
  readonly admins: Collection<User>;

  @ManyToMany(() => User)
  readonly members: Collection<User>;

  constructor(name: string, admins: User[], members: User[]) {
    super();
    this.name = name;
    this.admins = new Collection<User>(this, admins);
    this.members = new Collection<User>(this, members);
  }
}

export default Group;
