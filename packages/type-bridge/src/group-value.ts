export const TYPE_GROUP = Symbol("Group");

export interface GroupValue {
  id: string;
  name: string;
  description: string;
  admins: string[];
  members: string[];
}
