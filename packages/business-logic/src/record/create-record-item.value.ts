export default interface CreateRecordItemValue {
  readonly record?: string;
  readonly account: string;
  readonly amount: number;
  readonly price?: number;
}
