import { TYPE_GROUP } from "../group";
import { TYPE_USER } from "../user";

export interface JournalValue {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly admins: AccessItemValue[];
  readonly members: AccessItemValue[];
}

export interface AccessItemValue {
  readonly type: typeof TYPE_USER | typeof TYPE_GROUP;
  readonly id: string;
}
