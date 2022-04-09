import { AbstractEntity } from "@white-rabbit/business-logic";
import { ReadTaskPage } from "./read-page-task";
import { ReadTaskSingle } from "./read-single-task";

export { AbstractReadTask } from "./read-task";
export {
  ReadTaskPageSuccess,
  ReadTaskPageFailure,
  ReadTaskPage,
} from "./read-page-task";
export {
  ReadTaskSingleSuccess,
  ReadTaskSingleFailure,
  ReadTaskSingle,
} from "./read-single-task";
export { WriteTaskSuccess, WriteTaskFailure, WriteTask } from "./write-task";

export type ReadTask<T extends AbstractEntity<T, V, unknown>, Q, V> =
  | ReadTaskPage<T, Q, V>
  | ReadTaskSingle<V>;
