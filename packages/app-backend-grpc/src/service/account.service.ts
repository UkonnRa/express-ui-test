import { inject, singleton } from "tsyringe";
import {
  UserService as CoreUserService,
  AccountService as CoreAccountService,
  AccountEntity,
  AccountCommand,
  Page,
  AccountTypeValue,
  AccountStrategyValue,
} from "@white-rabbit/business-logic";
import { EntityDTO, MikroORM } from "@mikro-orm/core";

import { BaseClient } from "openid-client";
import {
  Command,
  Account,
  AccountPage,
  AccountResponse,
  Type,
  Strategy,
} from "../proto/account";
import { IAccountService } from "../proto/account.server";
import AbstractService from "./abstract-service";

function getType(type: Type): AccountTypeValue {
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

function getStrategy(type: Strategy): AccountStrategyValue {
  switch (type) {
    case Strategy.FIFO:
      return AccountStrategyValue.FIFO;
    case Strategy.AVERAGE:
      return AccountStrategyValue.AVERAGE;
  }
}

@singleton()
export default class AccountService
  extends AbstractService<
    AccountEntity,
    AccountCommand,
    CoreAccountService,
    Command,
    AccountResponse,
    AccountPage
  >
  implements IAccountService
{
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(
    @inject(MikroORM) orm: MikroORM,
    @inject(BaseClient) oidcClient: BaseClient,
    @inject(CoreUserService)
    userService: CoreUserService,
    @inject(CoreAccountService) accountService: CoreAccountService
  ) {
    super(orm, oidcClient, userService, accountService);
  }

  override getCommand({ command }: Command): AccountCommand {
    switch (command.oneofKind) {
      case "create":
        return {
          type: "CreateAccountCommand",
          targetId: command.create.id,
          journal: command.create.journal,
          name: command.create.name,
          description: command.create.description,
          accountType: getType(command.create.type),
          strategy: getStrategy(command.create.strategy),
          unit: command.create.unit,
        };
      case "update":
        return {
          type: "UpdateAccountCommand",
          targetId: command.update.id,
          name: command.update.name,
          description: command.update.description,
          accountType:
            command.update.type == null
              ? undefined
              : getType(command.update.type),
          strategy:
            command.update.strategy == null
              ? undefined
              : getStrategy(command.update.strategy),
          unit: command.update.unit,
        };
      case "delete":
        return {
          type: "DeleteAccountCommand",
          targetId: command.delete.id,
        };
      default:
        throw new Error(`No such command`);
    }
  }

  getPageResponse(page: Page<AccountEntity>): AccountPage {
    return AccountPage.fromJsonString(JSON.stringify(page));
  }

  getResponse(
    entity: EntityDTO<AccountEntity> | AccountEntity | null
  ): AccountResponse {
    return {
      account:
        entity == null
          ? undefined
          : Account.fromJsonString(JSON.stringify(entity)),
    };
  }
}
