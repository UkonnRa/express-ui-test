import AbstractApi from "../abstract-api";
import JournalModel from "./journal.model";
import JournalCommand from "./journal.command";

export default interface JournalApi
  extends AbstractApi<JournalModel, JournalCommand> {}
