import { RecordCommand, RecordQuery } from "@white-rabbit/types";
import AbstractApi from "../abstract-api";
import RecordModel from "./record.model";

export default interface RecordApi<T = unknown>
  extends AbstractApi<T, RecordModel, RecordCommand, RecordQuery> {}
