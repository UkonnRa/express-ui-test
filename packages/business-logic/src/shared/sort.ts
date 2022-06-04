import { Order } from "./index";

export default interface Sort {
  readonly field: string;
  readonly order: Order;
}
