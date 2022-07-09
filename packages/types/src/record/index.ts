export { default as RecordTypeValue } from "./record-type.value";
export type { default as RecordItemValue } from "./record-item.value";

export type { default as RecordQuery } from "./record.query";
export type { default as RecordCommand } from "./record.command";
export type { default as CreateRecordCommand } from "./create-record.command";
export type { default as UpdateRecordCommand } from "./update-record.command";
export type { default as DeleteRecordCommand } from "./delete-record.command";

export const RECORD_READ_SCOPE = "white-rabbit_records:read";
export const RECORD_WRITE_SCOPE = "white-rabbit_records:write";
