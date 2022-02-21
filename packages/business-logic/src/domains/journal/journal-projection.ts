import { AccessItemValue } from './index';

export interface JournalProjection {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly admins: AccessListProjection;
  readonly members: AccessListProjection;
}

export interface AccessListProjection {
  readonly items: AccessItemValue[];
}
