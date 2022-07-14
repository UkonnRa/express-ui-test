import { AccessItemValue } from "@white-rabbit/types";
import { AbstractModel } from "../shared";

export default interface JournalModel extends AbstractModel {
  readonly name: string;
  readonly description: string;
  readonly tags: string[];
  readonly unit: string;
  readonly archived: boolean;
  readonly admins: AccessItemValue[];
  readonly members: AccessItemValue[];
  readonly isAdmin: boolean;
  readonly isWriteable: boolean;
}
