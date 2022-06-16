/* eslint-disable */
import Long from "long";
import * as _m0 from "protobufjs/minimal";
import { CallContext, CallOptions } from "nice-grpc-common";
import { Timestamp } from "./google/protobuf/timestamp";
import { PageInfo, FindPageRequest } from "./shared";
import { StringValue } from "./google/protobuf/wrappers";

export const protobufPackage = "whiterabbit";

export enum Role {
  USER = 0,
  ADMIN = 1,
  OWNER = 2,
  UNRECOGNIZED = -1,
}

export function roleFromJSON(object: any): Role {
  switch (object) {
    case 0:
    case "USER":
      return Role.USER;
    case 1:
    case "ADMIN":
      return Role.ADMIN;
    case 2:
    case "OWNER":
      return Role.OWNER;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Role.UNRECOGNIZED;
  }
}

export function roleToJSON(object: Role): string {
  switch (object) {
    case Role.USER:
      return "USER";
    case Role.ADMIN:
      return "ADMIN";
    case Role.OWNER:
      return "OWNER";
    case Role.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface User {
  id: string;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  deletedAt: Date | undefined;
  name: string;
  role: Role;
  authIds: AuthId[];
}

export interface AuthId {
  provider: string;
  value: string;
}

export interface UserPage {
  pageInfo: PageInfo | undefined;
  items: UserItem[];
}

export interface UserItem {
  cursor: string;
  data: User | undefined;
}

export interface UserResponse {
  user: User | undefined;
}

function createBaseUser(): User {
  return {
    id: "",
    createdAt: undefined,
    updatedAt: undefined,
    deletedAt: undefined,
    name: "",
    role: 0,
    authIds: [],
  };
}

export const User = {
  encode(message: User, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.createdAt !== undefined) {
      Timestamp.encode(
        toTimestamp(message.createdAt),
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (message.updatedAt !== undefined) {
      Timestamp.encode(
        toTimestamp(message.updatedAt),
        writer.uint32(26).fork()
      ).ldelim();
    }
    if (message.deletedAt !== undefined) {
      Timestamp.encode(
        toTimestamp(message.deletedAt),
        writer.uint32(34).fork()
      ).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(42).string(message.name);
    }
    if (message.role !== 0) {
      writer.uint32(48).int32(message.role);
    }
    for (const v of message.authIds) {
      AuthId.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): User {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUser();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.createdAt = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        case 3:
          message.updatedAt = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        case 4:
          message.deletedAt = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        case 5:
          message.name = reader.string();
          break;
        case 6:
          message.role = reader.int32() as any;
          break;
        case 7:
          message.authIds.push(AuthId.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): User {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      createdAt: isSet(object.createdAt)
        ? fromJsonTimestamp(object.createdAt)
        : undefined,
      updatedAt: isSet(object.updatedAt)
        ? fromJsonTimestamp(object.updatedAt)
        : undefined,
      deletedAt: isSet(object.deletedAt)
        ? fromJsonTimestamp(object.deletedAt)
        : undefined,
      name: isSet(object.name) ? String(object.name) : "",
      role: isSet(object.role) ? roleFromJSON(object.role) : 0,
      authIds: Array.isArray(object?.authIds)
        ? object.authIds.map((e: any) => AuthId.fromJSON(e))
        : [],
    };
  },

  toJSON(message: User): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.createdAt !== undefined &&
      (obj.createdAt = message.createdAt.toISOString());
    message.updatedAt !== undefined &&
      (obj.updatedAt = message.updatedAt.toISOString());
    message.deletedAt !== undefined &&
      (obj.deletedAt = message.deletedAt.toISOString());
    message.name !== undefined && (obj.name = message.name);
    message.role !== undefined && (obj.role = roleToJSON(message.role));
    if (message.authIds) {
      obj.authIds = message.authIds.map((e) =>
        e ? AuthId.toJSON(e) : undefined
      );
    } else {
      obj.authIds = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<User>, I>>(object: I): User {
    const message = createBaseUser();
    message.id = object.id ?? "";
    message.createdAt = object.createdAt ?? undefined;
    message.updatedAt = object.updatedAt ?? undefined;
    message.deletedAt = object.deletedAt ?? undefined;
    message.name = object.name ?? "";
    message.role = object.role ?? 0;
    message.authIds = object.authIds?.map((e) => AuthId.fromPartial(e)) || [];
    return message;
  },
};

function createBaseAuthId(): AuthId {
  return { provider: "", value: "" };
}

export const AuthId = {
  encode(
    message: AuthId,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.provider !== "") {
      writer.uint32(10).string(message.provider);
    }
    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AuthId {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAuthId();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.provider = reader.string();
          break;
        case 2:
          message.value = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): AuthId {
    return {
      provider: isSet(object.provider) ? String(object.provider) : "",
      value: isSet(object.value) ? String(object.value) : "",
    };
  },

  toJSON(message: AuthId): unknown {
    const obj: any = {};
    message.provider !== undefined && (obj.provider = message.provider);
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<AuthId>, I>>(object: I): AuthId {
    const message = createBaseAuthId();
    message.provider = object.provider ?? "";
    message.value = object.value ?? "";
    return message;
  },
};

function createBaseUserPage(): UserPage {
  return { pageInfo: undefined, items: [] };
}

export const UserPage = {
  encode(
    message: UserPage,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.pageInfo !== undefined) {
      PageInfo.encode(message.pageInfo, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.items) {
      UserItem.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserPage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserPage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pageInfo = PageInfo.decode(reader, reader.uint32());
          break;
        case 2:
          message.items.push(UserItem.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UserPage {
    return {
      pageInfo: isSet(object.pageInfo)
        ? PageInfo.fromJSON(object.pageInfo)
        : undefined,
      items: Array.isArray(object?.items)
        ? object.items.map((e: any) => UserItem.fromJSON(e))
        : [],
    };
  },

  toJSON(message: UserPage): unknown {
    const obj: any = {};
    message.pageInfo !== undefined &&
      (obj.pageInfo = message.pageInfo
        ? PageInfo.toJSON(message.pageInfo)
        : undefined);
    if (message.items) {
      obj.items = message.items.map((e) =>
        e ? UserItem.toJSON(e) : undefined
      );
    } else {
      obj.items = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<UserPage>, I>>(object: I): UserPage {
    const message = createBaseUserPage();
    message.pageInfo =
      object.pageInfo !== undefined && object.pageInfo !== null
        ? PageInfo.fromPartial(object.pageInfo)
        : undefined;
    message.items = object.items?.map((e) => UserItem.fromPartial(e)) || [];
    return message;
  },
};

function createBaseUserItem(): UserItem {
  return { cursor: "", data: undefined };
}

export const UserItem = {
  encode(
    message: UserItem,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.cursor !== "") {
      writer.uint32(10).string(message.cursor);
    }
    if (message.data !== undefined) {
      User.encode(message.data, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserItem {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserItem();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.cursor = reader.string();
          break;
        case 2:
          message.data = User.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UserItem {
    return {
      cursor: isSet(object.cursor) ? String(object.cursor) : "",
      data: isSet(object.data) ? User.fromJSON(object.data) : undefined,
    };
  },

  toJSON(message: UserItem): unknown {
    const obj: any = {};
    message.cursor !== undefined && (obj.cursor = message.cursor);
    message.data !== undefined &&
      (obj.data = message.data ? User.toJSON(message.data) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<UserItem>, I>>(object: I): UserItem {
    const message = createBaseUserItem();
    message.cursor = object.cursor ?? "";
    message.data =
      object.data !== undefined && object.data !== null
        ? User.fromPartial(object.data)
        : undefined;
    return message;
  },
};

function createBaseUserResponse(): UserResponse {
  return { user: undefined };
}

export const UserResponse = {
  encode(
    message: UserResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.user !== undefined) {
      User.encode(message.user, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.user = User.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): UserResponse {
    return {
      user: isSet(object.user) ? User.fromJSON(object.user) : undefined,
    };
  },

  toJSON(message: UserResponse): unknown {
    const obj: any = {};
    message.user !== undefined &&
      (obj.user = message.user ? User.toJSON(message.user) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<UserResponse>, I>>(
    object: I
  ): UserResponse {
    const message = createBaseUserResponse();
    message.user =
      object.user !== undefined && object.user !== null
        ? User.fromPartial(object.user)
        : undefined;
    return message;
  },
};

export type UserServiceDefinition = typeof UserServiceDefinition;
export const UserServiceDefinition = {
  name: "UserService",
  fullName: "whiterabbit.UserService",
  methods: {
    findOne: {
      name: "findOne",
      requestType: StringValue,
      requestStream: false,
      responseType: UserResponse,
      responseStream: false,
      options: {},
    },
    findPage: {
      name: "findPage",
      requestType: FindPageRequest,
      requestStream: false,
      responseType: UserPage,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface UserServiceServiceImplementation<CallContextExt = {}> {
  findOne(
    request: StringValue,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<UserResponse>>;
  findPage(
    request: FindPageRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<UserPage>>;
}

export interface UserServiceClient<CallOptionsExt = {}> {
  findOne(
    request: DeepPartial<StringValue>,
    options?: CallOptions & CallOptionsExt
  ): Promise<UserResponse>;
  findPage(
    request: DeepPartial<FindPageRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<UserPage>;
}

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & Record<
        Exclude<keyof I, KeysOfUnion<P>>,
        never
      >;

function toTimestamp(date: Date): Timestamp {
  const seconds = date.getTime() / 1_000;
  const nanos = (date.getTime() % 1_000) * 1_000_000;
  return { seconds, nanos };
}

function fromTimestamp(t: Timestamp): Date {
  let millis = t.seconds * 1_000;
  millis += t.nanos / 1_000_000;
  return new Date(millis);
}

function fromJsonTimestamp(o: any): Date {
  if (o instanceof Date) {
    return o;
  } else if (typeof o === "string") {
    return new Date(o);
  } else {
    return fromTimestamp(Timestamp.fromJSON(o));
  }
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
