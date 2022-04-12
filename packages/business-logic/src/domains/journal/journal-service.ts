import { inject, singleton } from "tsyringe";
import { AuthUser } from "../../shared/auth-user";
import AbstractService from "../../shared/abstract-service";
import { GroupRepository, JournalRepository, UserRepository } from "../index";
import { TYPE_USER } from "../user";
import { Journal, TYPE, AccessList } from "./journal";
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

  private async getAccessList(values: AccessItemValue[]): Promise<AccessList> {
    const userIds = [];
    const groupIds = [];
    for (const v of values) {
      if (v.type === TYPE_USER) {
        userIds.push(v.id);
      } else {
        groupIds.push(v.id);
      }
    }
    const users = await this.userRepository.findByIds(userIds);
    const groups = await this.groupRepository.findByIds(groupIds);
    return [...users.values(), ...groups.values()];
  }

  async createJournal(
    authUser: AuthUser,
    {
      name,
      description,
      admins,
      members,
      startDate,
      endDate,
    }: JournalCommandCreate
  ): Promise<string> {
    const operator = this.checkScope(authUser);

    const adminList = await this.getAccessList(admins);
    adminList.push(operator);
    const memberList = await this.getAccessList(members);
    const result = new Journal({
      name,
      description,
      admins: adminList,
      members: memberList,
      startDate,
      endDate,
    });
    await this.repository.save(result);
    return result.id;
  }

  async updateJournal(
    authUser: AuthUser,
    {
      id,
      name,
      description,
      admins,
      members,
      startDate,
      endDate,
    }: JournalCommandUpdate
  ): Promise<string> {
    const entity = await this.getEntity(authUser, id);

    if (
      name == null &&
      description == null &&
      admins == null &&
      members == null &&
      startDate == null &&
      endDate == null
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
      entity.admins = await this.getAccessList(admins);
    }

    if (members != null) {
      entity.members = await this.getAccessList(members);
    }

    if (endDate?.type === "UNSET" && startDate?.type === "SET") {
      entity.updateDate("endDate", endDate);
      entity.updateDate("startDate", startDate);
    } else {
      if (startDate != null) {
        entity.updateDate("startDate", startDate);
      }

      if (endDate != null) {
        entity.updateDate("endDate", endDate);
      }
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
