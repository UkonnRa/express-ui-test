import CreateUserCommand from "./create-user.command";
import UpdateUserCommand from "./update-user.command";
import DeleteUserCommand from "./delete-user.command";

type UserCommand = CreateUserCommand | UpdateUserCommand | DeleteUserCommand;

export default UserCommand;
