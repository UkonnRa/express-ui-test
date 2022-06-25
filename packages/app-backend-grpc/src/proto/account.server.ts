/* eslint-disable */
// @generated by protobuf-ts 2.7.0 with parameter eslint_disable,ts_nocheck,server_generic,client_none,optimize_code_size
// @generated from protobuf file "account.proto" (package "whiterabbit.account", syntax proto3)
// tslint:disable
// @ts-nocheck
import { Commands } from "./account";
import { Command } from "./account";
import { RpcInputStream } from "@protobuf-ts/runtime-rpc";
import { Account } from "./account";
import { AccountPage } from "./account";
import { FindPageRequest } from "./shared";
import { AccountResponse } from "./account";
import { StringValue } from "./google/protobuf/wrappers";
import { ServerCallContext } from "@protobuf-ts/runtime-rpc";
/**
 * @generated from protobuf service whiterabbit.account.AccountService
 */
export interface IAccountService<T = ServerCallContext> {
  /**
   * @generated from protobuf rpc: findOne(google.protobuf.StringValue) returns (whiterabbit.account.AccountResponse);
   */
  findOne(request: StringValue, context: T): Promise<AccountResponse>;
  /**
   * @generated from protobuf rpc: findPage(whiterabbit.shared.FindPageRequest) returns (whiterabbit.account.AccountPage);
   */
  findPage(request: FindPageRequest, context: T): Promise<AccountPage>;
  /**
   * @generated from protobuf rpc: findAll(google.protobuf.StringValue) returns (stream whiterabbit.account.Account);
   */
  findAll(
    request: StringValue,
    responses: RpcInputStream<Account>,
    context: T
  ): Promise<void>;
  /**
   * @generated from protobuf rpc: handle(whiterabbit.account.Command) returns (whiterabbit.account.AccountResponse);
   */
  handle(request: Command, context: T): Promise<AccountResponse>;
  /**
   * @generated from protobuf rpc: handleAll(whiterabbit.account.Commands) returns (stream whiterabbit.account.AccountResponse);
   */
  handleAll(
    request: Commands,
    responses: RpcInputStream<AccountResponse>,
    context: T
  ): Promise<void>;
}
