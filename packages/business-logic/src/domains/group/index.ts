import { Group } from './group';
import AbstractRepository from '../../shared/abstract-repository';

export { GroupCreateOptions, Group } from './group';

export type GroupRepository = AbstractRepository<Group, unknown, unknown>;
