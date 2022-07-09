import { Command } from "../shared";

export default interface DeleteAccountCommand extends Command {
  readonly type: "DeleteAccountCommand";

  readonly targetId: string;
}
