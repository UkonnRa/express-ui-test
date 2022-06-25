import CreateGroupCommand from "./create-group.command";
import UpdateGroupCommand from "./update-group.command";
import DeleteGroupCommand from "./delete-group.command";

type GroupCommand =
  | CreateGroupCommand
  | UpdateGroupCommand
  | DeleteGroupCommand;

export default GroupCommand;
