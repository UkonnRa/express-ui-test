import CreateJournalCommand from "./create-journal.command";
import UpdateJournalCommand from "./update-journal.command";
import DeleteJournalCommand from "./delete-journal.command";

type JournalCommand =
  | CreateJournalCommand
  | UpdateJournalCommand
  | DeleteJournalCommand;

export default JournalCommand;
