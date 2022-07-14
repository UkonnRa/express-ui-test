import { inject, singleton } from "tsyringe";
import {
  JournalService as CoreJournalService,
  JournalEntity,
  AuthUser,
  AccessItemValue,
} from "@white-rabbit/business-logic";
import { EntityDTO, EntityManager, MikroORM } from "@mikro-orm/core";

import {
  AccessItemInput,
  AccessItemTypeValue,
  JournalCommand,
  JournalQuery,
} from "@white-rabbit/types";
import {
  Command,
  Journal,
  AccessItemInput as AccessItemInputProto,
} from "../proto/journal";
import { IJournalService } from "../proto/journal.server";
import { Timestamp } from "../proto/google/protobuf/timestamp";
import {
  AccessItem as AccessItemProto,
  AccessItemType,
} from "../proto/access-item";
import WriteService from "./write-service";

function accessItemTypeFromProto(type: AccessItemType): AccessItemTypeValue {
  switch (type) {
    case AccessItemType.GROUP:
      return AccessItemTypeValue.GROUP;
    case AccessItemType.USER:
      return AccessItemTypeValue.USER;
  }
}

function accessItemTypeToProto(type: AccessItemTypeValue): AccessItemType {
  switch (type) {
    case AccessItemTypeValue.GROUP:
      return AccessItemType.GROUP;
    case AccessItemTypeValue.USER:
      return AccessItemType.USER;
  }
}

function accessItemsFromProto(
  items: AccessItemInputProto[]
): AccessItemInput[] {
  return items.map(({ type, id }) => ({
    type: accessItemTypeFromProto(type),
    id,
  }));
}

function accessItemsToProto(items: AccessItemValue[]): AccessItemProto[] {
  return items.map((item) => ({
    type: accessItemTypeToProto(item.type),
    id: item.itemId,
    name: item.itemName,
  }));
}

@singleton()
export default class JournalService
  extends WriteService<
    JournalEntity,
    JournalCommand,
    JournalQuery,
    CoreJournalService,
    Journal,
    Command
  >
  implements IJournalService
{
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(
    @inject(MikroORM) orm: MikroORM,
    @inject(CoreJournalService)
    journalService: CoreJournalService
  ) {
    super(orm, journalService);
  }

  override getCommand({ command }: Command): JournalCommand {
    switch (command.oneofKind) {
      case "create":
        return {
          ...command.create,
          type: "CreateJournalCommand",
          admins: accessItemsFromProto(command.create.admins),
          members: accessItemsFromProto(command.create.members),
        };
      case "update":
        return {
          ...command.update,
          type: "UpdateJournalCommand",
          tags: command.update.tags?.items,
          admins:
            command.update.admins == null
              ? undefined
              : accessItemsFromProto(command.update.admins.values),
          members:
            command.update.members == null
              ? undefined
              : accessItemsFromProto(command.update.members.values),
        };
      case "delete":
        return {
          type: "DeleteJournalCommand",
          targetId: command.delete.targetId,
        };
      default:
        throw new Error(`No such command`);
    }
  }

  override async getModel(
    entity: EntityDTO<JournalEntity> | JournalEntity,
    em: EntityManager,
    authUser: AuthUser
  ): Promise<Journal> {
    const hydrated = await em.findOneOrFail(JournalEntity, { id: entity.id });

    let isAdmin = false;
    if (authUser.user != null) {
      isAdmin = await this.service.isAdmin(hydrated, authUser.user);
    }

    let isWriteable = false;
    try {
      await this.service.checkWriteable(hydrated, authUser);
      isWriteable = true;
    } catch (e) {
      console.log("error: ", e);
    }

    return {
      ...entity,
      createdAt: Timestamp.fromDate(entity.createdAt),
      updatedAt: Timestamp.fromDate(entity.updatedAt),
      tags: entity.tags,
      admins: accessItemsToProto(entity.admins),
      members: accessItemsToProto(entity.members),
      isAdmin,
      isWriteable,
    };
  }
}
