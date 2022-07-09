import { inject, singleton } from "tsyringe";
import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { AccountApi, AccountModel } from "@white-rabbit/frontend-api";
import { User as OidcUser } from "oidc-client-ts";
import {
  AccountCommand,
  AccountQuery,
  AccountStrategyValue,
  AccountTypeValue,
} from "@white-rabbit/types";
import { Timestamp } from "../proto/google/protobuf/timestamp";
import { Account, Command, Strategy, Type } from "../proto/account";
import { AccountServiceClient } from "../proto/account.client";
import AbstractApi from "./abstract-api";

function typeFromProto(type: Type): AccountTypeValue {
  switch (type) {
    case Type.ASSET:
      return AccountTypeValue.ASSET;
    case Type.LIABILITY:
      return AccountTypeValue.LIABILITY;
    case Type.EXPENSE:
      return AccountTypeValue.EXPENSE;
    case Type.INCOME:
      return AccountTypeValue.INCOME;
    case Type.EQUITY:
      return AccountTypeValue.EQUITY;
  }
}

function typeToProto(type: AccountTypeValue): Type {
  switch (type) {
    case AccountTypeValue.ASSET:
      return Type.ASSET;
    case AccountTypeValue.LIABILITY:
      return Type.LIABILITY;
    case AccountTypeValue.EXPENSE:
      return Type.EXPENSE;
    case AccountTypeValue.INCOME:
      return Type.INCOME;
    case AccountTypeValue.EQUITY:
      return Type.EQUITY;
  }
}

function strategyFromProto(type: Strategy): AccountStrategyValue {
  switch (type) {
    case Strategy.AVERAGE:
      return AccountStrategyValue.AVERAGE;
    case Strategy.FIFO:
      return AccountStrategyValue.FIFO;
  }
}

function strategyToProto(type: AccountStrategyValue): Strategy {
  switch (type) {
    case AccountStrategyValue.AVERAGE:
      return Strategy.AVERAGE;
    case AccountStrategyValue.FIFO:
      return Strategy.FIFO;
  }
}

@singleton()
export default class GrpcAccountApi
  extends AbstractApi<
    AccountModel,
    AccountCommand,
    AccountQuery,
    Account,
    Command,
    AccountServiceClient
  >
  implements AccountApi<OidcUser>
{
  constructor(@inject(GrpcWebFetchTransport) transport: GrpcWebFetchTransport) {
    super(new AccountServiceClient(transport));
  }

  override modelFromProto(model: Account): AccountModel {
    return {
      ...model,
      createdAt:
        model.createdAt == null
          ? new Date(0)
          : Timestamp.toDate(model.createdAt),
      updatedAt:
        model.updatedAt == null
          ? new Date(0)
          : Timestamp.toDate(model.updatedAt),
      type: typeFromProto(model.type),
      strategy: strategyFromProto(model.strategy),
    };
  }

  override commandToProto(command: AccountCommand): Command {
    switch (command.type) {
      case "CreateAccountCommand":
        return {
          command: {
            oneofKind: "create",
            create: {
              ...command,
              type: typeToProto(command.accountType),
              strategy: strategyToProto(command.strategy),
            },
          },
        };
      case "UpdateAccountCommand":
        return {
          command: {
            oneofKind: "update",
            update: {
              ...command,
              type:
                command.accountType == null
                  ? undefined
                  : typeToProto(command.accountType),
              strategy:
                command.strategy == null
                  ? undefined
                  : strategyToProto(command.strategy),
            },
          },
        };
      case "DeleteAccountCommand":
        return {
          command: {
            oneofKind: "delete",
            delete: command,
          },
        };
    }
  }
}
