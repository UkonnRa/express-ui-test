import AbstractEntity from "../../shared/abstract-entity";
import { User } from "../user";
import { Journal } from "../journal";
import { AccountType } from "../account";
import { FinRecordNotZeroOutError } from "../../shared/errors";
import { FinItem, FinItemCreateOptions } from "./fin-item";
import { FinRecordValue } from "./fin-record-value";

export interface FinRecordCreateOptions {
  timestamp: Date;
  journal: Journal;
  name: string;
  description: string;
  items: FinItemCreateOptions[];
  tags: string[];
  isContingent: boolean;
}

export const TYPE = "FinRecord" as const;

const MIN_LENGTH_NAME = 6;

const MAX_LENGTH_NAME = 50;

const MAX_LENGTH_DESCRIPTION = 400;

const MIN_LENGTH_ITEMS = 2;

const MAX_LENGTH_ITEMS = 10;

const MIN_LENGTH_TAG = 6;

const MAX_LENGTH_TAG = 20;

const MAX_LENGTH_TAGS = 10;

export enum FinRecordState {
  NORMAL,
  NOT_ZERO_OUT,
  UNITS_NOT_MATCH,
}

export class FinRecord extends AbstractEntity<
  FinRecord,
  FinRecordValue,
  typeof TYPE
> {
  timestamp: Date;

  journal: Journal;

  #name: string;

  #description: string;

  #items: FinItem[];

  #tags: string[];

  isContingent: boolean;

  constructor({
    timestamp,
    journal,
    name,
    description,
    items,
    tags,
    isContingent,
  }: FinRecordCreateOptions) {
    super();
    this.timestamp = timestamp;
    this.journal = journal;
    this.name = name;
    this.description = description;
    this.setItemWithOptions(items);
    this.tags = tags;
    this.isContingent = isContingent;
  }

  get name(): string {
    return this.#name;
  }

  set name(value: string) {
    const result = value?.trim();
    if (result !== undefined) {
      this.checkLength(result.length, "name", {
        min: MIN_LENGTH_NAME,
        max: MAX_LENGTH_NAME,
      });
    }
    this.#name = result;
  }

  get description(): string {
    return this.#description;
  }

  set description(value: string) {
    const result = value?.trim();
    if (result !== undefined) {
      this.checkLength(result.length, "name", { max: MAX_LENGTH_DESCRIPTION });
    }
    this.#description = result;
  }

  get items(): FinItem[] {
    return this.#items;
  }

  set items(items: FinItem[]) {
    this.checkLength(items.length, "items", {
      min: MIN_LENGTH_ITEMS,
      max: MAX_LENGTH_ITEMS,
    });
    let leftSide = 0;
    let rightSide = 0;
    for (const item of items) {
      switch (item.account.accountType) {
        case AccountType.ASSET:
        case AccountType.EXPENSE:
          leftSide += item.amount;
          break;
        default:
          rightSide += item.amount;
          break;
      }
    }
    if (leftSide !== rightSide) {
      throw new FinRecordNotZeroOutError(this.name, leftSide, rightSide);
    }
    this.#items = items;
  }

  setItemWithOptions(options: FinItemCreateOptions[]): void {
    this.items = options.map((i) => new FinItem(this, i));
  }

  get tags(): string[] {
    return this.#tags;
  }

  set tags(value: string[]) {
    this.checkLength(value.length, "tags", { max: MAX_LENGTH_TAGS });
    this.#tags = [];
    for (const tag of value) {
      const v = tag.trim();
      this.checkLength(v.length, "tags.each", {
        min: MIN_LENGTH_TAG,
        max: MAX_LENGTH_TAG,
      });
      this.#tags.push(v);
    }
  }

  get state(): FinRecordState {
    let inSum = 0;
    let outSum = 0;
    let unit;
    for (const item of this.items) {
      const itemUnit = item.unit ?? item.account.unit;

      if (unit == null) {
        unit = itemUnit;
      } else if (unit !== itemUnit) {
        return FinRecordState.UNITS_NOT_MATCH;
      }

      switch (item.account.accountType) {
        case AccountType.ASSET:
        case AccountType.EXPENSE:
          inSum += item.price ?? item.amount;
          break;
        default:
          outSum += item.price ?? item.amount;
          break;
      }
    }
    if (inSum !== outSum) {
      return FinRecordState.NOT_ZERO_OUT;
    }
    return FinRecordState.NORMAL;
  }

  isReadable(user: User): boolean {
    return this.journal.isReadable(user);
  }

  isWritable(user: User): boolean {
    return this.journal.isWritable(user);
  }

  toValue(): FinRecordValue {
    return {
      id: this.id,
      timestamp: this.timestamp,
      journal: this.journal.id,
      name: this.name,
      description: this.description,
      items: this.items.map((i) => i.toValue()),
      tags: this.tags,
      isContingent: this.isContingent,
      state: this.state,
    };
  }

  get entityType(): typeof TYPE {
    return TYPE;
  }
}
