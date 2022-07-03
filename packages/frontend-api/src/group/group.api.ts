import AbstractApi from "../abstract-api";
import GroupModel from "./group.model";
import GroupCommand from "./group.command";

export default interface GroupApi<T = unknown>
  extends AbstractApi<T, GroupModel, GroupCommand> {}
