import { inject, injectable } from "tsyringe";
import { RpcInputStream, ServerCallContext } from "@protobuf-ts/runtime-rpc";
import { MikroORM } from "@mikro-orm/core";
import { AccessItemService as CoreAccessItemService } from "@white-rabbit/business-logic";
import {
  AccessItemQuery,
  AccessItemTypeValue,
  AccessItemValue,
} from "@white-rabbit/types";
import { AccessItem, AccessItemType } from "../proto/access-item";
import { StringValue } from "../proto/google/protobuf/wrappers";
import { IAccessItemService } from "../proto/access-item.server";
import AbstractService from "./abstract-service";

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
    request: StringValue,
    responses: RpcInputStream<AccessItem>,
    context: ServerCallContext
  ): Promise<void> {
    const query: AccessItemQuery = JSON.parse(request.value);
    const em = this.orm.em.fork();
    const authUser = await this.getAuthUser(context, em);

    const entities: AccessItemValue[] = await this.service.findAll(
      { authUser, query },
      em
    );
    for (const entity of entities) {
      await responses.send(await this.getModel(entity));
    }
    await responses.complete();
  }
}
