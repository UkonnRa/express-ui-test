import { Command } from "@white-rabbit/types";

export default interface CommandsInput<C extends Command> {
  readonly commands: C[];
}
