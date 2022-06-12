import {
  AbstractEntity,
  FindAllInput,
  Page,
} from "@white-rabbit/business-logic";
import { Connection, Edge, FindAll } from "../model";
import { EitherFirstOrLastError } from "../error";

export function createFindAll<E extends AbstractEntity<E>>(
  model: FindAll
): Omit<FindAllInput<E>, "authUser"> {
  if (model.last != null && model.first != null) {
    throw new EitherFirstOrLastError();
  }
  if (model.last == null && model.first == null) {
    throw new EitherFirstOrLastError();
  }

  return {
    pagination: {
      after: model.after,
      before: model.before,
      size: model.first ?? model.last ?? 0,
    },
    sort: model.sort,
    query: model.query != null ? JSON.parse(model.query) : undefined,
  };
}

export function createConnection<E extends AbstractEntity<E>>(
  page: Page<E>
): Connection<E> {
  const connection: Connection<E> = {
    pageInfo: page.pageInfo,
    edges: page.items.map<Edge<E>>(({ cursor, data }) => ({
      cursor,
      node: data.toObject(),
    })),
  };
  return connection;
}
