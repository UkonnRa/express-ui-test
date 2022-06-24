import { inject, singleton } from "tsyringe";
import {
  UserService as CoreUserService,
  JournalService as CoreJournalService,
  JournalEntity,
  JournalCommand,
  Page,
  AccessItemTypeValue,
  AccessItemInput,
} from "@white-rabbit/business-logic";
import { EntityDTO, MikroORM } from "@mikro-orm/core";

import { BaseClient } from "openid-client";
import {
  AccessItem,
  AccessItemType,
  Command,
  Journal,
  JournalPage,
  JournalResponse,
} from "../proto/journal";
import { IJournalService } from "../proto/journal.server";
import AbstractService from "./abstract-service";

function getAccessItemType(type: AccessItemType): AccessItemTypeValue {
  switch (type) {
    case AccessItemType.GROUP:
      return AccessItemTypeValue.GROUP;
    case AccessItemType.USER:
      return AccessItemTypeValue.USER;
  }
}

function getAccessItem(items: AccessItem[]): AccessItemInput[] {
  return items.map(({ type, id }) => ({ type: getAccessItemType(type), id }));
}

@singleton()
export default class JournalService
  extends AbstractService<
    JournalEntity,
    JournalCommand,
    CoreJournalService,
    Command,
    JournalResponse,
    JournalPage
  >
  implements IJournalService
{
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(
    @inject(MikroORM) orm: MikroORM,
    @inject(BaseClient) oidcClient: BaseClient,
    @inject(CoreUserService)
    userService: CoreUserService,
    @inject(CoreJournalService) journalService: CoreJournalService
  ) {
    super(orm, oidcClient, userService, journalService);
  }

  override getCommand({ command }: Command): JournalCommand {
    switch (command.oneofKind) {
      case "create":
        return {
          type: "CreateJournalCommand",
          targetId: command.create.id,
          name: command.create.name,
          description: command.create.description,
          tags: command.create.tags,
          unit: command.create.unit,
          admins: getAccessItem(command.create.admins),
          members: getAccessItem(command.create.members),
        };
      case "update":
        return {
          type: "UpdateJournalCommand",
          targetId: command.update.id,
          name: command.update.name,
          description: command.update.description,
          tags: command.update.tags?.items,
          unit: command.update.unit,
          admins:
            command.update.admins == null
              ? undefined
              : getAccessItem(command.update.admins.values),
          members:
            command.update.members == null
              ? undefined
              : getAccessItem(command.update.members.values),
        };
      case "delete":
        return {
          type: "DeleteJournalCommand",
          targetId: command.delete.id,
        };
      default:
        throw new Error(`No such command`);
    }
  }

  getPageResponse(page: Page<JournalEntity>): JournalPage {
    return JournalPage.fromJsonString(JSON.stringify(page));
  }

  getResponse(
    entity: EntityDTO<JournalEntity> | JournalEntity | null
  ): JournalResponse {
    return {
      journal:
        entity == null
          ? undefined
          : Journal.fromJsonString(JSON.stringify(entity)),
    };
  }
}
