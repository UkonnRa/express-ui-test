import { inject, injectable } from 'tsyringe';
import AbstractService from '../../shared/abstract-service';
import { GroupValue } from './group-value';
import { Group, GroupRepository } from './index';
import { GroupQuery } from './group-query';
import AuthUser from '../../shared/auth-user';
import { GroupCommandCreate } from './group-command';
import { NoExpectedScopeError, NotFoundError } from '../../shared/errors';
import { UserRepository } from '../user';

@injectable()
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
}
