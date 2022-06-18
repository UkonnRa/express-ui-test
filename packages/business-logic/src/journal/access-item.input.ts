import { AccessItemType } from "./journal.entity";

export default interface AccessItemInput {
  type: AccessItemType;
  id: string;
}
