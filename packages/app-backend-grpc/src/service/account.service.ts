import { inject, singleton } from "tsyringe";
import {
  AccountService as CoreAccountService,
  AccountEntity,
} from "@white-rabbit/business-logic";
import { EntityDTO, MikroORM } from "@mikro-orm/core";

import {
  AccountCommand,
  AccountQuery,
  AccountStrategyValue,
  AccountTypeValue,
} from "@white-rabbit/types";
import { Command, Account, Type, Strategy } from "../proto/account";
import { IAccountService } from "../proto/account.server";
import { Timestamp } from "../proto/google/protobuf/timestamp";
import AbstractService from "./abstract-service";

function typeFromProto(type: Type): AccountTypeValue {
  switch (type) {
    case Type.ASSET:
      return AccountTypeValue.ASSET;
    case Type.EQUITY:
      return AccountTypeValue.EQUITY;
    case Type.EXPENSE:
      return AccountTypeValue.EXPENSE;
    case Type.INCOME:
      return AccountTypeValue.INCOME;
    case Type.LIABILITY:
      return AccountTypeValue.LIABILITY;
  }
}

function typeToProto(type: AccountTypeValue): Type {
  switch (type) {
    case AccountTypeValue.ASSET:
      return Type.ASSET;
    case AccountTypeValue.EQUITY:
      return Type.EQUITY;
    case AccountTypeValue.EXPENSE:
      return Type.EXPENSE;
    case AccountTypeValue.INCOME:
      return Type.INCOME;
    case AccountTypeValue.LIABILITY:
      return Type.LIABILITY;
  }
}

function strategyFromProto(type: Strategy): AccountStrategyValue {
  switch (type) {
    case Strategy.FIFO:
      return AccountStrategyValue.FIFO;
    case Strategy.AVERAGE:
      return AccountStrategyValue.AVERAGE;
  }
}

function strategyToProto(type: AccountStrategyValue): Strategy {
  switch (type) {
    case AccountStrategyValue.FIFO:
      return Strategy.FIFO;
    case AccountStrategyValue.AVERAGE:
      return Strategy.AVERAGE;
  }
}

@singleton()
export default class AccountService
  extends AbstractService<
    AccountEntity,
    AccountCommand,
    AccountQuery,
    CoreAccountService,
    Account,
    Command
  >
  implements IAccountService
{
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(
    @inject(MikroORM) orm: MikroORM,
    @inject(CoreAccountService)
    accountService: CoreAccountService
  ) {
    super(orm, accountService);
  }

  override getCommand({ command }: Command): AccountCommand {
    switch (command.oneofKind) {
      case "create":
        return {
          ...command.create,
          type: "CreateAccountCommand",
          accountType: typeFromProto(command.create.type),
          strategy: strategyFromProto(command.create.strategy),
        };
      case "update":
        return {
          ...command.update,
          type: "UpdateAccountCommand",
          accountType:
            command.update.type == null
              ? undefined
              : typeFromProto(command.update.type),
          strategy:
            command.update.strategy == null
              ? undefined
              : strategyFromProto(command.update.strategy),
        };
      case "delete":
        return {
          type: "DeleteAccountCommand",
          targetId: command.delete.targetId,
        };
      default:
        throw new Error(`No such command`);
    }
  }

  override async getModel(
    entity: EntityDTO<AccountEntity> | AccountEntity
  ): Promise<Account> {
    return {
      ...entity,
      createdAt: Timestamp.fromDate(entity.createdAt),
      updatedAt: Timestamp.fromDate(entity.updatedAt),
      journal: entity.journal.id,
      type: typeToProto(entity.type),
      strategy: strategyToProto(entity.strategy),
    };
  }
}
