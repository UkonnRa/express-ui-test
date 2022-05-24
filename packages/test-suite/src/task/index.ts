import { AbstractEntity, AuthUser } from "@white-rabbit/business-logic";
import { QueryType } from "@white-rabbit/type-bridge";
import { UserMatcher } from "../suite";
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

export type ReadTask<T extends AbstractEntity<T, V>, Q, V> =
  | ReadTaskPage<T, Q, V>
  | ReadTaskSingle<V>;

interface TaskBase {
  readonly type: string;
  readonly name: string;
  readonly authUser: UserMatcher;
  readonly setup?: () => Promise<void>;
}

type ReadTaskInputFunc<T> = (params: {
  readonly authUser: AuthUser;
  readonly item: T;
}) => boolean;

type TaskFailureExpectedFunc<I> = (params: {
  readonly authUser: AuthUser;
  readonly input: I;
}) => void;

type WriteTaskInputFunc<CC> = (params: { readonly authUser: AuthUser }) => CC;

interface ReadTaskSingleSuccess<T, Q> extends TaskBase {
  readonly type: "ReadTaskSingleSuccess";
  readonly input: ReadTaskInputFunc<T> | Q;
}

interface ReadTaskSingleFailure<T, Q> extends TaskBase {
  readonly type: "ReadTaskSingleFailure";
  readonly input: ReadTaskInputFunc<T> | Q;
  readonly expected: TaskFailureExpectedFunc<string>;
}

interface ReadTaskPageSuccess<T, Q> extends TaskBase {
  readonly type: "ReadTaskPageSuccess";
  readonly input: ReadTaskInputFunc<T[]> | QueryType<Q>;
}

interface ReadTaskPageFailure<T, Q> extends TaskBase {
  readonly type: "ReadTaskPageFailure";
  readonly input: ReadTaskInputFunc<T[]> | QueryType<Q>;
  readonly expected: TaskFailureExpectedFunc<QueryType<Q>>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface WriteTaskSuccess<T, C, Q, CC extends C = any> extends TaskBase {
  readonly type: "WriteTaskSuccess";
  readonly query: ReadTaskInputFunc<T> | Q;
  readonly input: WriteTaskInputFunc<CC> | CC;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface WriteTaskFailure<T, C, Q, CC extends C = any> extends TaskBase {
  readonly type: "WriteTaskFailure";
  readonly query: ReadTaskInputFunc<T> | Q;
  readonly input: WriteTaskInputFunc<CC> | CC;
  readonly expected: TaskFailureExpectedFunc<CC>;
}

export type Task<T, C, Q> =
  | WriteTaskSuccess<T, C, Q>
  | WriteTaskFailure<T, C, Q>
  | ReadTaskSingleSuccess<T, Q>
  | ReadTaskSingleFailure<T, Q>
  | ReadTaskPageSuccess<T, Q>
  | ReadTaskPageFailure<T, Q>;
