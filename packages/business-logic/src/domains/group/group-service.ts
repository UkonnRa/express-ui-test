import { inject, singleton } from 'tsyringe';
import AbstractService from '../../shared/abstract-service';
import { GroupValue } from './group-value';
import { Group, GroupRepository } from './index';
import { GroupQuery } from './group-query';
import AuthUser from '../../shared/auth-user';
import { GroupCommandCreate, GroupCommandDelete, GroupCommandUpdate } from './group-command';
import { NoExpectedScopeError, NotFoundError } from '../../shared/errors';
import { UserRepository } from '../user';

@singleton()
export default class GroupService extends AbstractService<Group, GroupRepository, GroupValue, GroupQuery> {
  constructor(
    @inject('GroupRepository') protected override readonly repository: GroupRepository,
    @inject('UserRepository') private readonly userRepository: UserRepository,
  ) {
    super('Group', 'groups:read', 'groups:write', repository);
  }

  async createGroup(
    { authIdValue, user, scopes }: AuthUser,
    { name, description, admins, members }: GroupCommandCreate,
  ): Promise<string> {
    if (!user) {
      throw new NotFoundError('User', authIdValue);
    }
    if (!scopes.includes(this.writeScope)) {
      throw new NoExpectedScopeError(user.id, this.writeScope);
    }

    const adminEntities = await this.userRepository.findByIds(admins);
    const memberEntities = await this.userRepository.findByIds(members);
    const result = new Group({ name, description, admins: adminEntities, members: memberEntities });
    await this.repository.save(result);
    return result.id;
  }

  async updateGroup(authUser: AuthUser, { id, name, description, admins, members }: GroupCommandUpdate): Promise<void> {
    const entity = await this.getEntity(authUser, id);

    if (!name && !description && !admins && !members) {
      return;
    }

    if (name) {
      entity.name = name;
    }

    if (description) {
      entity.description = description;
    }

    if (admins) {
      entity.admins = await this.userRepository.findByIds(admins);
    }

    if (members) {
      entity.members = await this.userRepository.findByIds(members);
    }

    await this.repository.save(entity);
  }

  async deleteGroup(authUser: AuthUser, { id }: GroupCommandDelete): Promise<void> {
    const entity = await this.getEntity(authUser, id);
    entity.deleted = true;
    await this.repository.save(entity);
  }
}
