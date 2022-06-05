import Order from "./order";

export default interface Sort {
  readonly field: string;
  readonly order: Order;
}
