import AbstractRepository from '../../shared/abstract-repository';
import { User } from './user';

export { Role, User, UserCreateOptions } from './user';
export type UserRepository = AbstractRepository<User>;
