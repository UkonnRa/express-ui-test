import {
  RpcOptions,
  ServerStreamingCall,
  UnaryCall,
} from "@protobuf-ts/runtime-rpc";
import { StringValue } from "../proto/google/protobuf/wrappers";
import { FindPageRequest } from "../proto/shared";
import { Commands, NullableEntity, PageProto } from "./types";

export default interface AbstractClient<P extends object, CP extends object> {
  findOne: (
    input: StringValue,
    options?: RpcOptions
  ) => UnaryCall<StringValue, NullableEntity<P>>;

  findPage: (
    input: FindPageRequest,
    options?: RpcOptions
  ) => UnaryCall<FindPageRequest, PageProto<P>>;

  findAll: (
    input: StringValue,
    options?: RpcOptions
  ) => ServerStreamingCall<StringValue, P>;

  handle: (input: CP, options?: RpcOptions) => UnaryCall<CP, NullableEntity<P>>;

  handleAll: (
    input: Commands<CP>,
    options?: RpcOptions
  ) => ServerStreamingCall<Commands<CP>, NullableEntity<P>>;
}
