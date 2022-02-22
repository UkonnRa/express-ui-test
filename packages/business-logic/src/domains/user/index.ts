import AbstractRepository from '../../shared/abstract-repository';
import { User } from './user';
import { UserValue } from './user-value';
import { UserQuery } from './user-query';

export { Role, User } from './user';
export { UserCommand } from './user-command';
export { UserQuery } from './user-query';
export { default as UserService } from './user-service';
export { UserValue } from './user-value';
export type UserRepository = AbstractRepository<User, UserValue, UserQuery>;
