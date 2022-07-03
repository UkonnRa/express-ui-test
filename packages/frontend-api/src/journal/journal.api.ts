import AbstractApi from "../abstract-api";
import JournalModel from "./journal.model";
import JournalCommand from "./journal.command";

export default interface JournalApi<T = unknown>
  extends AbstractApi<T, JournalModel, JournalCommand> {}
