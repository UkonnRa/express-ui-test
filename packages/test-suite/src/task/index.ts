import FindAllTask from "./find-all.task";
import FindAllExceptionTask from "./find-all.exception.task";
import { AbstractEntity } from "@white-rabbit/business-logic";

type Task<E extends AbstractEntity<E>> =
  | FindAllTask<E>
  | FindAllExceptionTask<E>;

export { Task, FindAllTask, FindAllExceptionTask };
