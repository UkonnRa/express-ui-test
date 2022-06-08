import FindAllTask from "./find-all.task";
import FindAllExceptionTask from "./find-all.exception.task";
import { AbstractEntity } from "@white-rabbit/business-logic";
import FindOneTask from "./find-one.task";
import FindOneExceptionTask from "./find-one.exception.task";

type Task<E extends AbstractEntity<E>, V = any> =
  | FindAllTask<E, V>
  | FindAllExceptionTask<E, V>
  | FindOneTask<E, V>
  | FindOneExceptionTask<E, V>;

export {
  Task,
  FindAllTask,
  FindAllExceptionTask,
  FindOneTask,
  FindOneExceptionTask,
};
