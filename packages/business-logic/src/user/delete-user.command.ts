import UserCommand from "./user.command";

export default interface DeleteUserCommand extends UserCommand {
  readonly type: "DeleteUserCommand";
  readonly targetId: string;
}
