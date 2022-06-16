/* eslint-disable */
import Long from "long";
import * as _m0 from "protobufjs/minimal";
import { CallContext, CallOptions } from "nice-grpc-common";
import { Timestamp } from "./google/protobuf/timestamp";
import { PageInfo, FindPageRequest, RelationshipRequest } from "./shared";
import { StringValue } from "./google/protobuf/wrappers";
import { UserPage } from "./user";

export const protobufPackage = "whiterabbit";

export interface Group {
  id: string;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  deletedAt: Date | undefined;
  name: string;
  description: string;
}

export interface GroupPage {
  pageInfo: PageInfo | undefined;
  items: GroupItem[];
}

export interface GroupItem {
  cursor: string;
  data: Group | undefined;
}

export interface GroupResponse {
  group: Group | undefined;
}

function createBaseGroup(): Group {
  return {
    id: "",
    createdAt: undefined,
    updatedAt: undefined,
    deletedAt: undefined,
    name: "",
    description: "",
  };
}

export const Group = {
  encode(message: Group, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
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
    if (message.description !== "") {
      writer.uint32(50).string(message.description);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Group {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGroup();
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
          message.description = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Group {
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
      description: isSet(object.description) ? String(object.description) : "",
    };
  },

  toJSON(message: Group): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.createdAt !== undefined &&
      (obj.createdAt = message.createdAt.toISOString());
    message.updatedAt !== undefined &&
      (obj.updatedAt = message.updatedAt.toISOString());
    message.deletedAt !== undefined &&
      (obj.deletedAt = message.deletedAt.toISOString());
    message.name !== undefined && (obj.name = message.name);
    message.description !== undefined &&
      (obj.description = message.description);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Group>, I>>(object: I): Group {
    const message = createBaseGroup();
    message.id = object.id ?? "";
    message.createdAt = object.createdAt ?? undefined;
    message.updatedAt = object.updatedAt ?? undefined;
    message.deletedAt = object.deletedAt ?? undefined;
    message.name = object.name ?? "";
    message.description = object.description ?? "";
    return message;
  },
};

function createBaseGroupPage(): GroupPage {
  return { pageInfo: undefined, items: [] };
}

export const GroupPage = {
  encode(
    message: GroupPage,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.pageInfo !== undefined) {
      PageInfo.encode(message.pageInfo, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.items) {
      GroupItem.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GroupPage {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGroupPage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pageInfo = PageInfo.decode(reader, reader.uint32());
          break;
        case 2:
          message.items.push(GroupItem.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GroupPage {
    return {
      pageInfo: isSet(object.pageInfo)
        ? PageInfo.fromJSON(object.pageInfo)
        : undefined,
      items: Array.isArray(object?.items)
        ? object.items.map((e: any) => GroupItem.fromJSON(e))
        : [],
    };
  },

  toJSON(message: GroupPage): unknown {
    const obj: any = {};
    message.pageInfo !== undefined &&
      (obj.pageInfo = message.pageInfo
        ? PageInfo.toJSON(message.pageInfo)
        : undefined);
    if (message.items) {
      obj.items = message.items.map((e) =>
        e ? GroupItem.toJSON(e) : undefined
      );
    } else {
      obj.items = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GroupPage>, I>>(
    object: I
  ): GroupPage {
    const message = createBaseGroupPage();
    message.pageInfo =
      object.pageInfo !== undefined && object.pageInfo !== null
        ? PageInfo.fromPartial(object.pageInfo)
        : undefined;
    message.items = object.items?.map((e) => GroupItem.fromPartial(e)) || [];
    return message;
  },
};

function createBaseGroupItem(): GroupItem {
  return { cursor: "", data: undefined };
}

export const GroupItem = {
  encode(
    message: GroupItem,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.cursor !== "") {
      writer.uint32(10).string(message.cursor);
    }
    if (message.data !== undefined) {
      Group.encode(message.data, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GroupItem {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGroupItem();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.cursor = reader.string();
          break;
        case 2:
          message.data = Group.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GroupItem {
    return {
      cursor: isSet(object.cursor) ? String(object.cursor) : "",
      data: isSet(object.data) ? Group.fromJSON(object.data) : undefined,
    };
  },

  toJSON(message: GroupItem): unknown {
    const obj: any = {};
    message.cursor !== undefined && (obj.cursor = message.cursor);
    message.data !== undefined &&
      (obj.data = message.data ? Group.toJSON(message.data) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GroupItem>, I>>(
    object: I
  ): GroupItem {
    const message = createBaseGroupItem();
    message.cursor = object.cursor ?? "";
    message.data =
      object.data !== undefined && object.data !== null
        ? Group.fromPartial(object.data)
        : undefined;
    return message;
  },
};

function createBaseGroupResponse(): GroupResponse {
  return { group: undefined };
}

export const GroupResponse = {
  encode(
    message: GroupResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.group !== undefined) {
      Group.encode(message.group, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GroupResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGroupResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.group = Group.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GroupResponse {
    return {
      group: isSet(object.group) ? Group.fromJSON(object.group) : undefined,
    };
  },

  toJSON(message: GroupResponse): unknown {
    const obj: any = {};
    message.group !== undefined &&
      (obj.group = message.group ? Group.toJSON(message.group) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GroupResponse>, I>>(
    object: I
  ): GroupResponse {
    const message = createBaseGroupResponse();
    message.group =
      object.group !== undefined && object.group !== null
        ? Group.fromPartial(object.group)
        : undefined;
    return message;
  },
};

export type GroupServiceDefinition = typeof GroupServiceDefinition;
export const GroupServiceDefinition = {
  name: "GroupService",
  fullName: "whiterabbit.GroupService",
  methods: {
    findOne: {
      name: "findOne",
      requestType: StringValue,
      requestStream: false,
      responseType: GroupResponse,
      responseStream: false,
      options: {},
    },
    findPage: {
      name: "findPage",
      requestType: FindPageRequest,
      requestStream: false,
      responseType: GroupPage,
      responseStream: false,
      options: {},
    },
    admins: {
      name: "admins",
      requestType: RelationshipRequest,
      requestStream: false,
      responseType: UserPage,
      responseStream: false,
      options: {},
    },
    members: {
      name: "members",
      requestType: RelationshipRequest,
      requestStream: false,
      responseType: UserPage,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface GroupServiceServiceImplementation<CallContextExt = {}> {
  findOne(
    request: StringValue,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<GroupResponse>>;
  findPage(
    request: FindPageRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<GroupPage>>;
  admins(
    request: RelationshipRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<UserPage>>;
  members(
    request: RelationshipRequest,
    context: CallContext & CallContextExt
  ): Promise<DeepPartial<UserPage>>;
}

export interface GroupServiceClient<CallOptionsExt = {}> {
  findOne(
    request: DeepPartial<StringValue>,
    options?: CallOptions & CallOptionsExt
  ): Promise<GroupResponse>;
  findPage(
    request: DeepPartial<FindPageRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<GroupPage>;
  admins(
    request: DeepPartial<RelationshipRequest>,
    options?: CallOptions & CallOptionsExt
  ): Promise<UserPage>;
  members(
    request: DeepPartial<RelationshipRequest>,
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
