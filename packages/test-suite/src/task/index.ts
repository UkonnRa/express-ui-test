import FindAllTask from "./find-all.task";
import FindAllExceptionTask from "./find-all.exception.task";
import { AbstractEntity, Command } from "@white-rabbit/business-logic";
import FindOneTask from "./find-one.task";
import FindOneExceptionTask from "./find-one.exception.task";
import HandleCommandTask from "./handle-command.task";
import HandleCommandExceptionTask from "./handle-command.exception.task";
import HandleCommandsTask from "./handle-commands.task";
import HandleCommandsExceptionTask from "./handle-commands.exception.task";

type Task<E extends AbstractEntity<E>, C extends Command> =
  | FindAllTask<E>
  | FindAllExceptionTask<E>
  | FindOneTask<E>
  | FindOneExceptionTask<E>
  | HandleCommandTask<E, C>
  | HandleCommandExceptionTask<E, C>
  | HandleCommandsTask<E, C>
  | HandleCommandsExceptionTask<E, C>;

export {
  Task,
  FindAllTask,
  FindAllExceptionTask,
  FindOneTask,
  FindOneExceptionTask,
  HandleCommandTask,
  HandleCommandExceptionTask,
  HandleCommandsTask,
  HandleCommandsExceptionTask,
};
