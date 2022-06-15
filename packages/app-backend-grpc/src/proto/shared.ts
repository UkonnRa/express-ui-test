/* eslint-disable */
import Long from "long";
import * as _m0 from "protobufjs/minimal";
import { StringValue } from "./google/protobuf/wrappers";

export const protobufPackage = "whiterabbit";

export enum Order {
  ASC = 0,
  DESC = 1,
  UNRECOGNIZED = -1,
}

export function orderFromJSON(object: any): Order {
  switch (object) {
    case 0:
    case "ASC":
      return Order.ASC;
    case 1:
    case "DESC":
      return Order.DESC;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Order.UNRECOGNIZED;
  }
}

export function orderToJSON(object: Order): string {
  switch (object) {
    case Order.ASC:
      return "ASC";
    case Order.DESC:
      return "DESC";
    case Order.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface PageInfo {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor: string | undefined;
  endCursor: string | undefined;
}

export interface Sort {
  field: string;
  order: Order;
}

export interface Pagination {
  after?: string | undefined;
  before?: string | undefined;
  size: number;
  offset?: number | undefined;
}

export interface FindAllRequest {
  query?: string | undefined;
  pagination: Pagination | undefined;
  sort: Sort[];
}

export interface RelationshipRequest {
  id: string;
  input: FindAllRequest | undefined;
}

function createBasePageInfo(): PageInfo {
  return {
    hasPreviousPage: false,
    hasNextPage: false,
    startCursor: undefined,
    endCursor: undefined,
  };
}

export const PageInfo = {
  encode(
    message: PageInfo,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.hasPreviousPage === true) {
      writer.uint32(8).bool(message.hasPreviousPage);
    }
    if (message.hasNextPage === true) {
      writer.uint32(16).bool(message.hasNextPage);
    }
    if (message.startCursor !== undefined) {
      StringValue.encode(
        { value: message.startCursor! },
        writer.uint32(26).fork()
      ).ldelim();
    }
    if (message.endCursor !== undefined) {
      StringValue.encode(
        { value: message.endCursor! },
        writer.uint32(34).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PageInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePageInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.hasPreviousPage = reader.bool();
          break;
        case 2:
          message.hasNextPage = reader.bool();
          break;
        case 3:
          message.startCursor = StringValue.decode(
            reader,
            reader.uint32()
          ).value;
          break;
        case 4:
          message.endCursor = StringValue.decode(reader, reader.uint32()).value;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): PageInfo {
    return {
      hasPreviousPage: isSet(object.hasPreviousPage)
        ? Boolean(object.hasPreviousPage)
        : false,
      hasNextPage: isSet(object.hasNextPage)
        ? Boolean(object.hasNextPage)
        : false,
      startCursor: isSet(object.startCursor)
        ? String(object.startCursor)
        : undefined,
      endCursor: isSet(object.endCursor) ? String(object.endCursor) : undefined,
    };
  },

  toJSON(message: PageInfo): unknown {
    const obj: any = {};
    message.hasPreviousPage !== undefined &&
      (obj.hasPreviousPage = message.hasPreviousPage);
    message.hasNextPage !== undefined &&
      (obj.hasNextPage = message.hasNextPage);
    message.startCursor !== undefined &&
      (obj.startCursor = message.startCursor);
    message.endCursor !== undefined && (obj.endCursor = message.endCursor);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<PageInfo>, I>>(object: I): PageInfo {
    const message = createBasePageInfo();
    message.hasPreviousPage = object.hasPreviousPage ?? false;
    message.hasNextPage = object.hasNextPage ?? false;
    message.startCursor = object.startCursor ?? undefined;
    message.endCursor = object.endCursor ?? undefined;
    return message;
  },
};

function createBaseSort(): Sort {
  return { field: "", order: 0 };
}

export const Sort = {
  encode(message: Sort, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.field !== "") {
      writer.uint32(10).string(message.field);
    }
    if (message.order !== 0) {
      writer.uint32(16).int32(message.order);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Sort {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSort();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.field = reader.string();
          break;
        case 2:
          message.order = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Sort {
    return {
      field: isSet(object.field) ? String(object.field) : "",
      order: isSet(object.order) ? orderFromJSON(object.order) : 0,
    };
  },

  toJSON(message: Sort): unknown {
    const obj: any = {};
    message.field !== undefined && (obj.field = message.field);
    message.order !== undefined && (obj.order = orderToJSON(message.order));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Sort>, I>>(object: I): Sort {
    const message = createBaseSort();
    message.field = object.field ?? "";
    message.order = object.order ?? 0;
    return message;
  },
};

function createBasePagination(): Pagination {
  return { after: undefined, before: undefined, size: 0, offset: undefined };
}

export const Pagination = {
  encode(
    message: Pagination,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.after !== undefined) {
      writer.uint32(10).string(message.after);
    }
    if (message.before !== undefined) {
      writer.uint32(18).string(message.before);
    }
    if (message.size !== 0) {
      writer.uint32(24).uint32(message.size);
    }
    if (message.offset !== undefined) {
      writer.uint32(32).uint32(message.offset);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Pagination {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePagination();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.after = reader.string();
          break;
        case 2:
          message.before = reader.string();
          break;
        case 3:
          message.size = reader.uint32();
          break;
        case 4:
          message.offset = reader.uint32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Pagination {
    return {
      after: isSet(object.after) ? String(object.after) : undefined,
      before: isSet(object.before) ? String(object.before) : undefined,
      size: isSet(object.size) ? Number(object.size) : 0,
      offset: isSet(object.offset) ? Number(object.offset) : undefined,
    };
  },

  toJSON(message: Pagination): unknown {
    const obj: any = {};
    message.after !== undefined && (obj.after = message.after);
    message.before !== undefined && (obj.before = message.before);
    message.size !== undefined && (obj.size = Math.round(message.size));
    message.offset !== undefined && (obj.offset = Math.round(message.offset));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Pagination>, I>>(
    object: I
  ): Pagination {
    const message = createBasePagination();
    message.after = object.after ?? undefined;
    message.before = object.before ?? undefined;
    message.size = object.size ?? 0;
    message.offset = object.offset ?? undefined;
    return message;
  },
};

function createBaseFindAllRequest(): FindAllRequest {
  return { query: undefined, pagination: undefined, sort: [] };
}

export const FindAllRequest = {
  encode(
    message: FindAllRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.query !== undefined) {
      writer.uint32(10).string(message.query);
    }
    if (message.pagination !== undefined) {
      Pagination.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.sort) {
      Sort.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FindAllRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFindAllRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.query = reader.string();
          break;
        case 2:
          message.pagination = Pagination.decode(reader, reader.uint32());
          break;
        case 3:
          message.sort.push(Sort.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): FindAllRequest {
    return {
      query: isSet(object.query) ? String(object.query) : undefined,
      pagination: isSet(object.pagination)
        ? Pagination.fromJSON(object.pagination)
        : undefined,
      sort: Array.isArray(object?.sort)
        ? object.sort.map((e: any) => Sort.fromJSON(e))
        : [],
    };
  },

  toJSON(message: FindAllRequest): unknown {
    const obj: any = {};
    message.query !== undefined && (obj.query = message.query);
    message.pagination !== undefined &&
      (obj.pagination = message.pagination
        ? Pagination.toJSON(message.pagination)
        : undefined);
    if (message.sort) {
      obj.sort = message.sort.map((e) => (e ? Sort.toJSON(e) : undefined));
    } else {
      obj.sort = [];
    }
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<FindAllRequest>, I>>(
    object: I
  ): FindAllRequest {
    const message = createBaseFindAllRequest();
    message.query = object.query ?? undefined;
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? Pagination.fromPartial(object.pagination)
        : undefined;
    message.sort = object.sort?.map((e) => Sort.fromPartial(e)) || [];
    return message;
  },
};

function createBaseRelationshipRequest(): RelationshipRequest {
  return { id: "", input: undefined };
}

export const RelationshipRequest = {
  encode(
    message: RelationshipRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.input !== undefined) {
      FindAllRequest.encode(message.input, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RelationshipRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRelationshipRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.input = FindAllRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): RelationshipRequest {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      input: isSet(object.input)
        ? FindAllRequest.fromJSON(object.input)
        : undefined,
    };
  },

  toJSON(message: RelationshipRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.input !== undefined &&
      (obj.input = message.input
        ? FindAllRequest.toJSON(message.input)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<RelationshipRequest>, I>>(
    object: I
  ): RelationshipRequest {
    const message = createBaseRelationshipRequest();
    message.id = object.id ?? "";
    message.input =
      object.input !== undefined && object.input !== null
        ? FindAllRequest.fromPartial(object.input)
        : undefined;
    return message;
  },
};

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

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
