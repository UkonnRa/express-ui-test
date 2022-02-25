import AbstractRepository from '../../shared/abstract-repository';
import { FinRecord } from './fin-record';

export { FinRecordCreateOptions, FinRecord } from './fin-record';

export type FinRecordRepository = AbstractRepository<FinRecord, unknown, unknown>;
