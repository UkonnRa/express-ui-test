import AbstractEntity from '@white-rabbit/business-logic/src/shared/abstract-entity';
import { Role, User } from '@white-rabbit/business-logic/src/domains/user';
import { InvalidSortFieldError } from '@white-rabbit/business-logic/src/shared/errors';
import { AdditionalFilter } from '@white-rabbit/business-logic/src/shared/abstract-repository';
import AbstractService from '@white-rabbit/business-logic/src/shared/abstract-service';
import MemoryRepository from '../memory-repository';

export interface TestEntityValue {
  readonly id: string;

  readonly name: string;

  readonly age: number;

  readonly tags: string[];
}

export class TestEntity extends AbstractEntity<TestEntity, TestEntityValue> {
  constructor(
    override readonly id: string,
    readonly name: string,
    readonly age: number,
    readonly tags: string[],
    readonly authorId: string,
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
}

export class TestEntityService extends AbstractService<
  TestEntity,
  TestEntityRepository,
  TestEntityValue,
  TestEntityQuery
> {
  constructor(repository: TestEntityRepository) {
    super('TestEntity', 'test:read', 'test:write', repository);
  }
}

export class TestEntityRepository extends MemoryRepository<TestEntity, TestEntityValue, TestEntityQuery> {
  doCompare(a: TestEntity, b: TestEntity, field: string): number {
    if (field === 'name') {
      if (a.name !== b.name) {
        return a.name.localeCompare(b.name);
      }
    } else if (field === 'age') {
      if (a.age !== b.age) {
        return a.age - b.age;
      }
    } else if (field === 'id') {
      return a.id.localeCompare(b.id);
    } else {
      throw new InvalidSortFieldError('TestEntity', field);
    }
    return 0;
  }

  doQuery(entity: TestEntity, query?: TestEntityQuery): boolean {
    if (query?.type === 'TestEntityQueryIncludeTag') {
      return entity.tags.includes(query.tag);
    }

    if (query?.type === 'TestEntityQueryAgeBetween') {
      return entity.age >= query.start && entity.age < query.end;
    }

    return true;
  }

  override doConvertAdditionalQuery(query?: TestEntityQuery): AdditionalFilter<TestEntity>[] {
    if (query?.type === 'TestEntityQueryFullText') {
      return [
        (es) =>
          Promise.resolve(
            es.filter((e) => e.name.includes(query.keyword) || e.tags.some((t) => t.includes(query.keyword))),
          ),
      ];
    }
    return [];
  }
}

export type TestEntityQueryIncludeTag = {
  type: 'TestEntityQueryIncludeTag';

  tag: string;
};

export type TestEntityQueryAgeBetween = {
  type: 'TestEntityQueryAgeBetween';
  start: number;
  end: number;
};

export type TestEntityQueryFullText = {
  type: 'TestEntityQueryFullText';
  keyword: string;
};

export type TestEntityQuery = TestEntityQueryIncludeTag | TestEntityQueryAgeBetween | TestEntityQueryFullText;
