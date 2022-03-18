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

export type ReadTask<Q, V> = ReadTaskPage<Q, V> | ReadTaskSingle<V>;
