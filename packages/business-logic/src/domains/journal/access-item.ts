import { User } from "../user";
import { Group } from "../group";
import AbstractEntity from "../../shared/abstract-entity";
import { AccessList } from "./access-list";
import { AccessItemValue } from "./index";

export type AccessItemType = "USER" | "GROUP";

export abstract class AccessItem extends AbstractEntity<
  AccessItem,
  AccessItemValue,
  "AccessItem"
> {
  readonly type: AccessItemType;

  readonly parent: AccessList;

  protected constructor(parent: AccessList) {
    super();
    this.parent = parent;
  }

  override get entityType(): "AccessItem" {
    return "AccessItem";
  }

  abstract contains(user: User): boolean;

  abstract override toValue(): AccessItemValue;

  override isReadable(user: User): boolean {
    return this.parent.isReadable(user);
  }

  override isWritable(user: User): boolean {
    return this.parent.isWritable(user);
  }
}

export class AccessItemUser extends AccessItem {
  override readonly type = "USER";

  readonly user: User;

  constructor({ parent, user }: Omit<AccessItemUserCreateOptions, "type">) {
    super(parent);
    this.user = user;
  }

  override contains(user: User): boolean {
    return user.id === this.user.id;
  }

  override toValue(): AccessItemValue {
    return { type: "USER", userId: this.user.id };
  }
}

export class AccessItemGroup extends AccessItem {
  override readonly type = "GROUP";

  readonly group: Group;

  constructor({ parent, group }: Omit<AccessItemGroupCreateOptions, "type">) {
    super(parent);
    this.group = group;
  }

  contains(user: User): boolean {
    return this.group.contains(user);
  }

  override toValue(): AccessItemValue {
    return { type: "GROUP", groupId: this.group.id };
  }
}

export interface AccessItemUserCreateOptions {
  type: "USER";
  parent: AccessList;
  user: User;
}

export interface AccessItemGroupCreateOptions {
  type: "GROUP";
  parent: AccessList;
  group: Group;
}

export type AccessItemCreateOptions =
  | AccessItemUserCreateOptions
  | AccessItemGroupCreateOptions;
