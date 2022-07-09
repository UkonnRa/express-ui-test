import { AbstractEntity } from "@white-rabbit/business-logic";
import { Command } from "@white-rabbit/types";
import FindPageTask from "./find-page.task";
import FindPageExceptionTask from "./find-page.exception.task";
import FindOneTask from "./find-one.task";
import FindOneExceptionTask from "./find-one.exception.task";
import HandleCommandTask from "./handle-command.task";
import HandleCommandExceptionTask from "./handle-command.exception.task";
import HandleCommandsTask from "./handle-commands.task";
import HandleCommandsExceptionTask from "./handle-commands.exception.task";

type Task<E extends AbstractEntity<E>, C extends Command, Q> =
  | FindPageTask<E, Q>
  | FindPageExceptionTask<E, Q>
  | FindOneTask<E, Q>
  | FindOneExceptionTask<E, Q>
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
