import AbstractEntity from "../../shared/abstract-entity";
import { Account } from "../account";
import { User } from "../user";
import { FieldValidationZeroError } from "../../shared/errors";
import { FinRecord } from "./fin-record";
import { FinItemValue } from "./fin-record-value";

export interface FinItemCreateOptions {
  account: Account;
  amount: number;
  unit?: string;
  price?: number;
  note?: string;
}

const MIN_LENGTH_UNIT = 6;

const MAX_LENGTH_UNIT = 50;

const MAX_LENGTH_NOTE = 400;

export const TYPE = "FinItem" as const;

export class FinItem extends AbstractEntity<
  FinItem,
  FinItemValue,
  typeof TYPE
> {
  readonly account: Account;

  #amount: number;

  #unit?: string;

  #price?: number;

  #note?: string;

  constructor(
    readonly finRecord: FinRecord,
    { account, amount, unit, price, note }: FinItemCreateOptions
  ) {
    super();
    this.account = account;
    this.amount = amount;
    this.unit = unit;
    this.price = price;
    this.note = note;
  }

  get amount(): number {
    return this.#amount;
  }

  set amount(value: number) {
    if (value < 0) {
      throw new FieldValidationZeroError(this.entityType, "amount", true);
    }
    this.#amount = value;
  }

  get unit(): string | undefined {
    return this.#unit;
  }

  set unit(value: string | undefined) {
    const result = value?.trim();
    if (result !== undefined) {
      this.checkLength(result.length, "unit", {
        min: MIN_LENGTH_UNIT,
        max: MAX_LENGTH_UNIT,
      });
    }
    this.#unit = result;
  }

  get price(): number | undefined {
    return this.#price;
  }

  set price(value: number | undefined) {
    if (value !== undefined && value <= 0) {
      throw new FieldValidationZeroError(this.entityType, "price", true, false);
    }
    this.#price = value;
  }

  get note(): string | undefined {
    return this.#note;
  }

  set note(value: string | undefined) {
    const result = value?.trim();
    if (result !== undefined) {
      this.checkLength(result.length, "note", { max: MAX_LENGTH_NOTE });
    }
    this.#note = result;
  }

  isReadable(user: User): boolean {
    return this.finRecord.isReadable(user);
  }

  isWritable(user: User): boolean {
    return this.finRecord.isWritable(user);
  }

  toValue(): FinItemValue {
    return {
      account: this.account.id,
      amount: this.amount,
      unit: this.unit,
      price: this.price,
      note: this.note,
    };
  }

  get entityType(): typeof TYPE {
    return TYPE;
  }
}
