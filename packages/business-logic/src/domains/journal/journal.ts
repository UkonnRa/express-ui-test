import dayjs from "dayjs";
import {
  AccessItemValue,
  JournalValue,
  Role,
  TYPE_JOURNAL,
  UpdateNullableValue,
} from "@white-rabbit/type-bridge";
import AbstractEntity from "../../shared/abstract-entity";
import { User } from "../user";
import { Group } from "../group";
import { FieldStartEndDateMismatchError } from "../../shared/errors";

export type AccessList = Array<User | Group>;

export interface JournalCreateOptions {
  readonly name: string;
  readonly description: string;
  readonly admins: AccessList;
  readonly members: AccessList;
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly archived?: boolean;
}

const MIN_LENGTH_NAME = 6;

const MAX_LENGTH_NAME = 50;

const MAX_LENGTH_DESCRIPTION = 400;

const MAX_LENGTH_LIST = 16;

export class Journal extends AbstractEntity<Journal, JournalValue> {
  #name: string;

  #description: string;

  #startDate?: Date;

  #endDate?: Date;

  #admins: AccessList = [];

  #members: AccessList = [];

  archived: boolean;

  override get entityType(): symbol {
    return TYPE_JOURNAL;
  }

  constructor({
    name,
    description,
    admins,
    members,
    startDate,
    endDate,
    archived,
  }: JournalCreateOptions) {
    super();
    this.name = name;
    this.description = description;
    this.admins = admins;
    this.members = members;
    this.startDate = startDate;
    this.endDate = endDate;
    this.archived = archived === undefined ? false : archived;
  }

  get name(): string {
    return this.#name;
  }

  set name(value: string) {
    const result = value.trim();
    this.checkLength(result.length, "name", {
      min: MIN_LENGTH_NAME,
      max: MAX_LENGTH_NAME,
    });
    this.#name = result;
  }

  get description(): string {
    return this.#description;
  }

  set description(value: string) {
    const result = value.trim();
    this.checkLength(value.length, "description", {
      max: MAX_LENGTH_DESCRIPTION,
    });
    this.#description = result;
  }

  private static getAccessItemId(item: User | Group): string {
    return `${String(item.entityType.description)}${item.id}`;
  }

  private static accessListContains(
    accessList: AccessList,
    user: User
  ): boolean {
    for (const item of accessList) {
      if (
        (item instanceof User && item.id === user.id) ||
        (item instanceof Group && item.contains(user.id))
      ) {
        return true;
      }
    }
    return false;
  }

  get admins(): AccessList {
    return this.#admins;
  }

  set admins(value: AccessList) {
    const result = new Map(value.map((v) => [Journal.getAccessItemId(v), v]));
    this.checkLength(result.size, "admins", { max: MAX_LENGTH_LIST });
    this.#admins = [...result.values()];
    this.members = this.#members;
  }

  get members(): AccessList {
    return this.#members;
  }

  set members(value: AccessList) {
    const result = new Map(
      value
        .filter(
          (member) =>
            !this.admins.some(
              (admin) =>
                Journal.getAccessItemId(admin) ===
                Journal.getAccessItemId(member)
            )
        )
        .map((v) => [Journal.getAccessItemId(v), v])
    );
    this.checkLength(result.size, "members", { max: MAX_LENGTH_LIST });
    this.#members = [...result.values()];
  }

  private static checkStrictlyBefore(start?: Date, end?: Date): void {
    if (start != null && end != null && !dayjs(start).isBefore(end)) {
      throw new FieldStartEndDateMismatchError(
        TYPE_JOURNAL,
        "startDate",
        "endDate",
        start,
        end
      );
    }
  }

  get startDate(): Date | undefined {
    return this.#startDate;
  }

  set startDate(value: Date | undefined) {
    Journal.checkStrictlyBefore(value, this.endDate);
    this.#startDate = value;
  }

  get endDate(): Date | undefined {
    return this.#endDate;
  }

  set endDate(value: Date | undefined) {
    Journal.checkStrictlyBefore(this.startDate, value);
    this.#endDate = value;
  }

  updateDate(
    field: "startDate" | "endDate",
    value: UpdateNullableValue<Date>
  ): void {
    const date = value.type === "UNSET" ? undefined : value.value;
    if (field === "startDate") {
      this.startDate = date;
    } else {
      this.endDate = date;
    }
  }

  isReadable(user: User): boolean {
    return (
      this.isWritable(user) || Journal.accessListContains(this.members, user)
    );
  }

  isWritable(user: User): boolean {
    return (
      user.role !== Role.USER || Journal.accessListContains(this.admins, user)
    );
  }

  static toAccessListValue(accessList: AccessList): AccessItemValue[] {
    return accessList.map((v) => ({
      type: v.entityType,
      id: v.id,
      name: v.name,
    }));
  }

  toValue(): JournalValue {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      startDate: this.startDate,
      endDate: this.endDate,
      admins: Journal.toAccessListValue(this.admins),
      members: Journal.toAccessListValue(this.members),
      archived: this.archived,
    };
  }
}
