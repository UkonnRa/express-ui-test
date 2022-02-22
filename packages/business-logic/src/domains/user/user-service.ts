import AbstractService from '../../shared/abstract-service';
import { UserValue } from './user-value';
import { UserQuery } from './user-query';
import { User } from './user';
import { UserRepository } from './index';

export default class UserService extends AbstractService<User, UserRepository, UserValue, UserQuery> {}
