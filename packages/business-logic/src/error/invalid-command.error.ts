import AbstractError from "./abstract-error";

export default class InvalidCommandError extends AbstractError {
  protected readonly type: string = "InvalidCommandError";

  constructor() {
    super(`Invalid command`);
  }
}
