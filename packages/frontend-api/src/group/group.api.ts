import { GroupCommand, GroupQuery } from "@white-rabbit/types";
import AbstractApi from "../abstract-api";
import GroupModel from "./group.model";

export default interface GroupApi<T = unknown>
  extends AbstractApi<T, GroupModel, GroupCommand, GroupQuery> {}
