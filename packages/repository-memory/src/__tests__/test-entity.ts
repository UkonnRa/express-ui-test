import {
  AbstractEntity,
  Role,
  User,
  InvalidSortFieldError,
  AdditionalFilter,
  AbstractService,
  AuthUser,
} from "@white-rabbit/business-logic";
import { singleton } from "tsyringe";
import MemoryRepository from "../memory-repository";

export interface TestEntityValue {
  readonly id: string;

  readonly name: string;

  readonly age: number;

  readonly tags: string[];
}

export const TYPE = "TestEntity";

export class TestEntity extends AbstractEntity<
  TestEntity,
  TestEntityValue,
  typeof TYPE
> {
  constructor(
    override readonly id: string,
    readonly name: string,
    readonly age: number,
    readonly tags: string[],
    readonly authorId: string
  ) {
    super();
  }

  isReadable(): boolean {
    return true;
  }

  isWritable(user: User): boolean {
    return user.role !== Role.USER || this.authorId === user.id;
  }

  toValue(): TestEntityValue {
    return { id: this.id, name: this.name, age: this.age, tags: this.tags };
  }

  get entityType(): typeof TYPE {
    return TYPE;
  }
}

@singleton()
export class TestEntityRepository extends MemoryRepository<
  TestEntity,
  TestEntityValue,
  TestEntityQuery
> {
  doCompare(a: TestEntity, b: TestEntity, field: string): number {
    if (field === "name") {
      if (a.name !== b.name) {
        return a.name.localeCompare(b.name);
      }
    } else if (field === "age") {
      if (a.age !== b.age) {
        return a.age - b.age;
      }
    } else if (field === "id") {
      return a.id.localeCompare(b.id);
    } else {
      throw new InvalidSortFieldError("TestEntity", field);
    }
    return 0;
  }

  doQuery(entity: TestEntity, query?: TestEntityQuery): boolean {
    if (query?.type === "TestEntityQueryIncludeTag") {
      return entity.tags.includes(query.tag);
    }

    if (query?.type === "TestEntityQueryAgeBetween") {
      return entity.age >= query.start && entity.age < query.end;
    }

    return true;
  }

  override doConvertAdditionalQuery(
    query?: TestEntityQuery
  ): Array<AdditionalFilter<TestEntity>> {
    if (query?.type === "TestEntityQueryFullText") {
      return [
        async (es) =>
          Promise.resolve(
            es.filter(
              (e) =>
                e.name.includes(query.keyword) ||
                e.tags.some((t) => t.includes(query.keyword))
            )
          ),
      ];
    }
    return [];
  }
}

@singleton()
export class TestEntityService extends AbstractService<
  TestEntity,
  TestEntityRepository,
  TestEntityValue,
  TestEntityQuery,
  unknown
> {
  constructor(protected override readonly repository: TestEntityRepository) {
    super("TestEntity", "test:read", "test:write", repository);
  }

  async handle(_authUser: AuthUser, _command: unknown): Promise<string> {
    throw new Error("Unimplemented");
  }
}

export interface TestEntityQueryIncludeTag {
  type: "TestEntityQueryIncludeTag";

  tag: string;
}

export interface TestEntityQueryAgeBetween {
  type: "TestEntityQueryAgeBetween";
  start: number;
  end: number;
}

export interface TestEntityQueryFullText {
  type: "TestEntityQueryFullText";
  keyword: string;
}

export type TestEntityQuery =
  | TestEntityQueryIncludeTag
  | TestEntityQueryAgeBetween
  | TestEntityQueryFullText;
