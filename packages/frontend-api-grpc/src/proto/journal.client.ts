/* eslint-disable */
// @generated by protobuf-ts 2.7.0 with parameter eslint_disable,ts_nocheck,optimize_code_size
// @generated from protobuf file "journal.proto" (package "whiterabbit.journal", syntax proto3)
// tslint:disable
// @ts-nocheck
import type { RpcTransport } from "@protobuf-ts/runtime-rpc";
import type { ServiceInfo } from "@protobuf-ts/runtime-rpc";
import { JournalService } from "./journal";
import type { Commands } from "./journal";
import type { Command } from "./journal";
import type { Journal } from "./journal";
import type { ServerStreamingCall } from "@protobuf-ts/runtime-rpc";
import type { JournalPage } from "./journal";
import type { FindPageRequest } from "./shared";
import { stackIntercept } from "@protobuf-ts/runtime-rpc";
import type { JournalResponse } from "./journal";
import type { StringValue } from "./google/protobuf/wrappers";
import type { UnaryCall } from "@protobuf-ts/runtime-rpc";
import type { RpcOptions } from "@protobuf-ts/runtime-rpc";
/**
 * @generated from protobuf service whiterabbit.journal.JournalService
 */
export interface IJournalServiceClient {
  /**
   * @generated from protobuf rpc: findOne(google.protobuf.StringValue) returns (whiterabbit.journal.JournalResponse);
   */
  findOne(
    input: StringValue,
    options?: RpcOptions
  ): UnaryCall<StringValue, JournalResponse>;
  /**
   * @generated from protobuf rpc: findPage(whiterabbit.shared.FindPageRequest) returns (whiterabbit.journal.JournalPage);
   */
  findPage(
    input: FindPageRequest,
    options?: RpcOptions
  ): UnaryCall<FindPageRequest, JournalPage>;
  /**
   * @generated from protobuf rpc: findAll(google.protobuf.StringValue) returns (stream whiterabbit.journal.Journal);
   */
  findAll(
    input: StringValue,
    options?: RpcOptions
  ): ServerStreamingCall<StringValue, Journal>;
  /**
   * @generated from protobuf rpc: handle(whiterabbit.journal.Command) returns (whiterabbit.journal.JournalResponse);
   */
  handle(
    input: Command,
    options?: RpcOptions
  ): UnaryCall<Command, JournalResponse>;
  /**
   * @generated from protobuf rpc: handleAll(whiterabbit.journal.Commands) returns (stream whiterabbit.journal.JournalResponse);
   */
  handleAll(
    input: Commands,
    options?: RpcOptions
  ): ServerStreamingCall<Commands, JournalResponse>;
}
/**
 * @generated from protobuf service whiterabbit.journal.JournalService
 */
export class JournalServiceClient
  implements IJournalServiceClient, ServiceInfo
{
  typeName = JournalService.typeName;
  methods = JournalService.methods;
  options = JournalService.options;
  constructor(private readonly _transport: RpcTransport) {}
  /**
   * @generated from protobuf rpc: findOne(google.protobuf.StringValue) returns (whiterabbit.journal.JournalResponse);
   */
  findOne(
    input: StringValue,
    options?: RpcOptions
  ): UnaryCall<StringValue, JournalResponse> {
    const method = this.methods[0],
      opt = this._transport.mergeOptions(options);
    return stackIntercept<StringValue, JournalResponse>(
      "unary",
      this._transport,
      method,
      opt,
      input
    );
  }
  /**
   * @generated from protobuf rpc: findPage(whiterabbit.shared.FindPageRequest) returns (whiterabbit.journal.JournalPage);
   */
  findPage(
    input: FindPageRequest,
    options?: RpcOptions
  ): UnaryCall<FindPageRequest, JournalPage> {
    const method = this.methods[1],
      opt = this._transport.mergeOptions(options);
    return stackIntercept<FindPageRequest, JournalPage>(
      "unary",
      this._transport,
      method,
      opt,
      input
    );
  }
  /**
   * @generated from protobuf rpc: findAll(google.protobuf.StringValue) returns (stream whiterabbit.journal.Journal);
   */
  findAll(
    input: StringValue,
    options?: RpcOptions
  ): ServerStreamingCall<StringValue, Journal> {
    const method = this.methods[2],
      opt = this._transport.mergeOptions(options);
    return stackIntercept<StringValue, Journal>(
      "serverStreaming",
      this._transport,
      method,
      opt,
      input
    );
  }
  /**
   * @generated from protobuf rpc: handle(whiterabbit.journal.Command) returns (whiterabbit.journal.JournalResponse);
   */
  handle(
    input: Command,
    options?: RpcOptions
  ): UnaryCall<Command, JournalResponse> {
    const method = this.methods[3],
      opt = this._transport.mergeOptions(options);
    return stackIntercept<Command, JournalResponse>(
      "unary",
      this._transport,
      method,
      opt,
      input
    );
  }
  /**
   * @generated from protobuf rpc: handleAll(whiterabbit.journal.Commands) returns (stream whiterabbit.journal.JournalResponse);
   */
  handleAll(
    input: Commands,
    options?: RpcOptions
  ): ServerStreamingCall<Commands, JournalResponse> {
    const method = this.methods[4],
      opt = this._transport.mergeOptions(options);
    return stackIntercept<Commands, JournalResponse>(
      "serverStreaming",
      this._transport,
      method,
      opt,
      input
    );
  }
}
