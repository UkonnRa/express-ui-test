import { RpcInputStream, ServerCallContext } from "@protobuf-ts/runtime-rpc";
import { MikroORM } from "@mikro-orm/core";
import {
  AbstractEntity,
  WriteService as OriginalWriteService,
} from "@white-rabbit/business-logic";
import { Command as CoreCommand } from "@white-rabbit/types";
import { NullableEntity } from "./abstract-service";
import ReadService from "./read-service";

export default abstract class WriteService<
  E extends AbstractEntity<E>,
  C extends CoreCommand,
  Q,
  S extends OriginalWriteService<E, C, Q>,
  P,
  CP
> extends ReadService<E, Q, S, P> {
  protected constructor(
    protected readonly orm: MikroORM,
    protected readonly service: S
  ) {
    super(orm, service);
  }

  abstract getCommand(command: CP): C;

  async handle(
    request: CP,
    context: ServerCallContext
  ): Promise<NullableEntity<P>> {
    return this.orm.em.fork().transactional(async (em) => {
      const authUser = await this.getAuthUser(context, em);
      const entity = await this.service.handle(
        {
          command: this.getCommand(request),
          authUser,
        },
        em
      );
      return this.getResponse(entity, em, authUser);
    });
  }

  async handleAll(
    request: { commands: CP[] },
    responses: RpcInputStream<NullableEntity<P>>,
    context: ServerCallContext
  ): Promise<void> {
    return this.orm.em.fork().transactional(async (em) => {
      const authUser = await this.getAuthUser(context, em);
      const entities = await this.service.handleAll(
        {
          commands: request.commands.map((command) => this.getCommand(command)),
          authUser,
        },
        em
      );
      for (const entity of entities) {
        await responses.send(await this.getResponse(entity, em, authUser));
      }
      await responses.complete();
    });
  }
}
