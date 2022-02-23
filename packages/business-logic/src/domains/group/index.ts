import { Group } from './group';
import AbstractRepository from '../../shared/abstract-repository';
import { GroupValue } from './group-value';
import { GroupQuery } from './group-query';

export { GroupCreateOptions, Group } from './group';

export type GroupRepository = AbstractRepository<Group, GroupValue, GroupQuery>;
