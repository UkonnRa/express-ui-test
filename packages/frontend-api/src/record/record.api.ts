import AbstractApi from "../abstract-api";
import RecordModel from "./record.model";
import RecordCommand from "./record.command";

export default interface RecordApi<T = unknown>
  extends AbstractApi<T, RecordModel, RecordCommand> {}
