import { TYPE_GROUP, TYPE_USER } from "@white-rabbit/type-bridge";
import type {
  AccessItemQuery,
  AccessItemValue,
  PageResult,
  QueryType,
} from "@white-rabbit/type-bridge";
import type { AccessItemApi } from "@white-rabbit/components";

export default class AccessItemApiImpl implements AccessItemApi {
  async findAll(
    query: QueryType<AccessItemQuery>
  ): Promise<PageResult<AccessItemValue>> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    let items: AccessItemValue[] = [];
    if (query.query?.type === "AccessItemQuery") {
      const startIdx = query.pagination.after
        ? Number(query.pagination.after)
        : 0;
      items = Array.from({ length: query.pagination.size }, (_, idx) => {
        const id = idx + startIdx;
        const type = id % 2 === 0 ? TYPE_USER : TYPE_GROUP;
        return {
          type,
          id: id.toString(10),
          name: `Name of ${type.description} with ID ${id}`,
        };
      });
    }
    return {
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: query.pagination.after !== undefined,
        startCursor: items.at(0)?.id,
        endCursor: items.at(items.length - 1)?.id,
      },
      pageItems: items.map((v) => ({ cursor: v.id, data: v })),
    };
  }

  async findById(id: string): Promise<AccessItemValue | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const type = Number(id) % 2 === 0 ? TYPE_USER : TYPE_GROUP;
    return { type, id: id, name: `Name of ${type.description} with ID ${id}` };
  }
}
