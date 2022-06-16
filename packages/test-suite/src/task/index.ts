import FindPageTask from "./find-page.task";
import FindPageExceptionTask from "./find-page.exception.task";
import { AbstractEntity, Command } from "@white-rabbit/business-logic";
import FindOneTask from "./find-one.task";
import FindOneExceptionTask from "./find-one.exception.task";
import HandleCommandTask from "./handle-command.task";
import HandleCommandExceptionTask from "./handle-command.exception.task";
import HandleCommandsTask from "./handle-commands.task";
import HandleCommandsExceptionTask from "./handle-commands.exception.task";

type Task<E extends AbstractEntity<E>, C extends Command> =
  | FindPageTask<E>
  | FindPageExceptionTask<E>
  | FindOneTask<E>
  | FindOneExceptionTask<E>
  | HandleCommandTask<E, C>
  | HandleCommandExceptionTask<E, C>
  | HandleCommandsTask<E, C>
  | HandleCommandsExceptionTask<E, C>;

export {
  Task,
  FindPageTask,
  FindPageExceptionTask,
  FindOneTask,
  FindOneExceptionTask,
  HandleCommandTask,
  HandleCommandExceptionTask,
  HandleCommandsTask,
  HandleCommandsExceptionTask,
};
