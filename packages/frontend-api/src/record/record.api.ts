import AbstractApi from "../abstract-api";
import RecordModel from "./record.model";
import RecordCommand from "./record.command";

export default interface RecordApi
  extends AbstractApi<RecordModel, RecordCommand> {}
