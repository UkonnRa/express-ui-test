import { inject, injectable } from "tsyringe";
import { RpcInputStream, ServerCallContext } from "@protobuf-ts/runtime-rpc";
import { MikroORM } from "@mikro-orm/core";
import { AccessItemService as CoreAccessItemService } from "@white-rabbit/business-logic";
import { AccessItemTypeValue, AccessItemValue } from "@white-rabbit/types";
import { AccessItem, AccessItemType } from "../proto/access-item";
import { IAccessItemService } from "../proto/access-item.server";
import { FindAllRequest } from "../proto/shared";
import AbstractService from "./abstract-service";
import { sortFromProto } from "./utils";

function typeToProto(type: AccessItemTypeValue): AccessItemType {
  switch (type) {
    case AccessItemTypeValue.USER:
      return AccessItemType.USER;
    case AccessItemTypeValue.GROUP:
      return AccessItemType.GROUP;
  }
}

@injectable()
export default class AccessItemService
  extends AbstractService<AccessItemValue, AccessItem>
  implements IAccessItemService
{
  constructor(
    @inject(MikroORM) private readonly orm: MikroORM,
    @inject(CoreAccessItemService)
    private readonly service: CoreAccessItemService
  ) {
    super();
  }

  override async getModel(entity: AccessItemValue): Promise<AccessItem> {
    return {
      type: typeToProto(entity.type),
      id: entity.id,
      name: entity.name,
    };
  }

  async findAll(
    { query, sort, size }: FindAllRequest,
    responses: RpcInputStream<AccessItem>,
    context: ServerCallContext
  ): Promise<void> {
    const em = this.orm.em.fork();
    const authUser = await this.getAuthUser(context, em);

    const entities: AccessItemValue[] = await this.service.findAll(
      {
        authUser,
        query: query != null ? JSON.parse(query) : undefined,
        size,
        sort: sort != null ? sortFromProto(sort.sort) : undefined,
      },
      em
    );
    for (const entity of entities) {
      await responses.send(await this.getModel(entity));
    }
    await responses.complete();
  }
}
