import { JournalCommand, JournalQuery } from "@white-rabbit/types";
import AbstractApi from "../abstract-api";
import JournalModel from "./journal.model";

export default interface JournalApi<T = unknown>
  extends AbstractApi<T, JournalModel, JournalCommand, JournalQuery> {}
