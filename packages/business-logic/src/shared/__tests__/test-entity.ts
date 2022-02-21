import AbstractEntity from '../abstract-entity';
import { User } from '../../domains/user';
import AbstractRepository, { Pagination, Sort } from '../abstract-repository';
import { InvalidSortFieldError } from '../errors';
import { cursorToId } from '../../utils';

export interface TestEntityProjection {
  readonly name: string;

  readonly age: number;

  readonly tags: string[];
}

export class TestEntity extends AbstractEntity<TestEntity, TestEntityProjection> {
  constructor(
    override readonly id: string,
    readonly name: string,
    readonly age: number,
    readonly tags: string[],
    readonly authorId: string,
  ) {
    super();
  }

  // eslint-disable-next-line class-methods-use-this
  isReadable(): boolean {
    return true;
  }

  isWritable(user: User): boolean {
    return this.authorId === user.id;
  }

  toProjection(): TestEntityProjection {
    return { name: this.name, age: this.age, tags: this.tags };
  }
}

export class TestEntityRepository implements AbstractRepository<TestEntity, TestEntityQuery> {
  private data: Map<string, TestEntity> = new Map();

  close(): void {
    this.data.clear();
  }

  // eslint-disable-next-line class-methods-use-this,sonarjs/cognitive-complexity
  private static compareFunc(a: TestEntity, b: TestEntity, sort: Sort, startFrom: 'FIRST' | 'LAST'): number {
    for (const { field, order } of [...sort, { field: 'id', order: 'ASC' }]) {
      let result = 0;
      if (field === 'name') {
        if (a.name !== b.name) {
          result = a.name.localeCompare(b.name);
        }
      } else if (field === 'age') {
        if (a.age !== b.age) {
          result = a.age - b.age;
        }
      } else if (field === 'id') {
        result = a.id.localeCompare(b.id);
      } else {
        throw new InvalidSortFieldError('TestEntity', field);
      }

      if (result !== 0) {
        if ((order === 'ASC' && startFrom === 'FIRST') || (order === 'DESC' && startFrom === 'LAST')) {
          return result;
        }
        return result * -1;
      }
    }

    return 0;
  }

  filterFunc = (a: TestEntity, sort: Sort, pagination: Pagination): boolean => {
    let result = true;

    if (pagination.after) {
      const after = this.data.get(cursorToId(pagination.after));
      if (after) {
        const compareTo = TestEntityRepository.compareFunc(a, after, sort, pagination.startFrom);
        result = result && pagination.startFrom === 'FIRST' ? compareTo > 0 : compareTo < 0;
      }
    }

    if (pagination.before) {
      const before = this.data.get(cursorToId(pagination.before));
      if (before) {
        const compareTo = TestEntityRepository.compareFunc(a, before, sort, pagination.startFrom);
        result = result && pagination.startFrom === 'LAST' ? compareTo > 0 : compareTo < 0;
      }
    }

    return result;
  };

  findAll(sort: Sort, pagination: Pagination): Promise<TestEntity[]> {
    const result = [...this.data.values()]
      .sort((a, b) => TestEntityRepository.compareFunc(a, b, sort, pagination.startFrom))
      .filter((a) => this.filterFunc(a, sort, pagination))
      .slice(0, pagination.size);

    if (pagination.startFrom === 'LAST') {
      result.reverse();
    }

    return Promise.resolve(result);
  }

  findById(id: string): Promise<TestEntity | undefined> {
    return Promise.resolve(this.data.get(id));
  }

  findByIds(ids: string[]): Promise<TestEntity[]> {
    const result: TestEntity[] = [];
    this.data.forEach((v, k) => {
      if (ids.includes(k)) {
        result.push(v);
      }
    });
    return Promise.resolve(result);
  }

  save(entity: TestEntity): Promise<void> {
    this.data.set(entity.id, entity);
    return Promise.resolve();
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

export type TestEntityQuery = TestEntityQueryIncludeTag | TestEntityQueryAgeBetween;
