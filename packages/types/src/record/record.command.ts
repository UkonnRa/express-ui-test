import CreateRecordCommand from "./create-record.command";
import UpdateRecordCommand from "./update-record.command";
import DeleteRecordCommand from "./delete-record.command";

type RecordCommand =
  | CreateRecordCommand
  | UpdateRecordCommand
  | DeleteRecordCommand;

export default RecordCommand;
