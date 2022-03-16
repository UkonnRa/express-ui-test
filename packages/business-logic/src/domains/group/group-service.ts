import { inject, singleton } from "tsyringe";
import AbstractService from "../../shared/abstract-service";
import AuthUser from "../../shared/auth-user";
import { GroupRepository, UserRepository } from "../index";
import { GroupQuery } from "./group-query";
import {
  GroupCommandCreate,
  GroupCommandDelete,
  GroupCommandUpdate,
} from "./group-command";
import { GroupValue } from "./group-value";
import { TYPE } from "./group";
import { Group } from "./index";

@singleton()
export default class GroupService extends AbstractService<
  Group,
  GroupRepository,
  GroupValue,
  GroupQuery
> {
  constructor(
    @inject("GroupRepository")
    protected override readonly repository: GroupRepository,
    @inject("UserRepository") private readonly userRepository: UserRepository
  ) {
    super(TYPE, "groups:read", "groups:write", repository);
  }

  async createGroup(
    authUser: AuthUser,
    { name, description, admins, members }: GroupCommandCreate
  ): Promise<string> {
    this.checkScope(authUser);

    const adminEntities = await this.userRepository.findByIds(admins);
    const memberEntities = await this.userRepository.findByIds(members);
    const result = new Group({
      name,
      description,
      admins: [...adminEntities.values()],
      members: [...memberEntities.values()],
    });
    await this.repository.save(result);
    return result.id;
  }

  async updateGroup(
    authUser: AuthUser,
    { id, name, description, admins, members }: GroupCommandUpdate
  ): Promise<void> {
    const entity = await this.getEntity(authUser, id);

    if (
      name != null &&
      description != null &&
      admins == null &&
      members == null
    ) {
      return;
    }

    if (name != null) {
      entity.name = name;
    }

    if (description != null) {
      entity.description = description;
    }

    if (admins != null) {
      entity.admins = [
        ...(await this.userRepository.findByIds(admins)).values(),
      ];
    }

    if (members != null) {
      entity.members = [
        ...(await this.userRepository.findByIds(members)).values(),
      ];
    }

    await this.repository.save(entity);
  }

  async deleteGroup(
    authUser: AuthUser,
    { id }: GroupCommandDelete
  ): Promise<void> {
    const entity = await this.getEntity(authUser, id);
    entity.deleted = true;
    await this.repository.save(entity);
  }
}
