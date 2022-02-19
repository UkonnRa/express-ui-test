import AbstractEntity from '../../shared/abstract-entity';
import { User } from '../user';

export type GroupCreateOptions = {
  name: string;
  description: string;
  admins: User[];
  members: User[];
};

export class Group extends AbstractEntity<Group> {
  readonly name: string;

  readonly description: string;

  readonly admins: User[];

  readonly members: User[];

  constructor({ name, description, admins, members }: GroupCreateOptions) {
    super();
    this.name = name;
    this.description = description;
    this.admins = admins;
    this.members = members;
  }

  public contains(user: User): boolean {
    return this.admins.some((u) => u.id === user.id) || this.members.some((u) => u.id === user.id);
  }
}
