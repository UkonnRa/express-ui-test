import { inject, singleton } from "tsyringe";
import AuthUser from "../../shared/auth-user";
import AbstractService from "../../shared/abstract-service";
import { GroupRepository, JournalRepository, UserRepository } from "../index";
import {
  AccessItemGroupCreateOptions,
  AccessItemUserCreateOptions,
} from "./access-item";
import { AccessList, AccessListCreateOptions } from "./access-list";
import { Journal, TYPE } from "./journal";
import {
  JournalCommand,
  JournalCommandCreate,
  JournalCommandDelete,
  JournalCommandUpdate,
} from "./journal-command";
import { JournalValue } from "./journal-value";
import { JournalQuery } from "./journal-query";
import { AccessItemValue } from "./index";

@singleton()
export default class JournalService extends AbstractService<
  Journal,
  JournalRepository,
  JournalValue,
  JournalQuery,
  JournalCommand
> {
  constructor(
    @inject("JournalRepository")
    protected override readonly repository: JournalRepository,
    @inject("UserRepository") private readonly userRepository: UserRepository,
    @inject("GroupRepository") private readonly groupRepository: GroupRepository
  ) {
    super(TYPE, "journals:read", "journals:write", repository);
  }

  private async getAccessList(
    values: AccessItemValue[]
  ): Promise<AccessListCreateOptions> {
    const userIds = [];
    const groupIds = [];
    for (const v of values) {
      if (v.type === "USER") {
        userIds.push(v.userId);
      } else {
        groupIds.push(v.groupId);
      }
    }
    const users = await this.userRepository.findByIds(userIds);
    const userValues = [...users].map<
      Omit<AccessItemUserCreateOptions, "parent">
    >((e) => ({
      type: "USER",
      user: e[1],
    }));
    const groups = await this.groupRepository.findByIds(groupIds);
    const groupValues = [...groups].map<
      Omit<AccessItemGroupCreateOptions, "parent">
    >((e) => ({
      type: "GROUP",
      group: e[1],
    }));
    return { type: "ITEMS", items: [...userValues, ...groupValues] };
  }

  async createJournal(
    authUser: AuthUser,
    { name, description, admins, members }: JournalCommandCreate
  ): Promise<string> {
    this.checkScope(authUser);

    const adminList = await this.getAccessList(admins);
    const memberList = await this.getAccessList(members);
    const result = new Journal({
      name,
      description,
      admins: adminList,
      members: memberList,
    });
    await this.repository.save(result);
    return result.id;
  }

  async updateJournal(
    authUser: AuthUser,
    { id, name, description, admins, members }: JournalCommandUpdate
  ): Promise<string> {
    const entity = await this.getEntity(authUser, id);

    if (
      name != null &&
      description != null &&
      admins == null &&
      members == null
    ) {
      return entity.id;
    }

    if (name != null) {
      entity.name = name;
    }

    if (description != null) {
      entity.description = description;
    }

    if (admins != null) {
      const temp = await this.getAccessList(admins);
      entity.admins = new AccessList(entity, temp);
    }

    if (members != null) {
      const temp = await this.getAccessList(members);
      entity.members = new AccessList(entity, temp);
    }

    await this.repository.save(entity);
    return entity.id;
  }

  async deleteJournal(
    authUser: AuthUser,
    { id }: JournalCommandDelete
  ): Promise<string> {
    const entity = await this.getEntity(authUser, id);

    entity.deleted = true;

    await this.repository.save(entity);
    return entity.id;
  }

  async handle(authUser: AuthUser, command: JournalCommand): Promise<string> {
    if (command.type === "JournalCommandCreate") {
      return this.createJournal(authUser, command);
    } else if (command.type === "JournalCommandUpdate") {
      return this.updateJournal(authUser, command);
    } else {
      return this.deleteJournal(authUser, command);
    }
  }
}
