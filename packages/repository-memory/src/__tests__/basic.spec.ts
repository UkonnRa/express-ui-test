import 'reflect-metadata';
import { Role, User } from '@white-rabbit/business-logic/src/domains/user';
import { Pagination, Sort } from '@white-rabbit/business-logic/src/shared/abstract-repository';
import { toBase64 } from 'js-base64';
import AuthUser from '@white-rabbit/business-logic/src/shared/auth-user';
import { TestEntity, TestEntityQuery, TestEntityRepository, TestEntityService } from './test-entity';

type Task = {
  sort: Sort;
  pagination: Pagination;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  result: number[];
  query?: TestEntityQuery;
  resultNotAdditionalFilters?: number[];
};

describe('Basic functionality for TestEntity & related components', () => {
  const repository = new TestEntityRepository();
  const service = new TestEntityService(repository);

  const admin = new User({ name: 'admin with long name', role: Role.ADMIN });
  const user = new User({ name: 'user with long name', role: Role.USER });

  const entities = [
    new TestEntity('1', 'test 1', 18, ['tag1', 'tag2'], admin.id),
    new TestEntity('2', 'test 2', 20, ['tag2', 'tag4'], user.id),
    new TestEntity('3', 'test 3', 18, ['tag1', 'tag3'], user.id),
    new TestEntity('4', 'test 2', 20, ['tag1', 'tag3'], user.id),
  ];

  Promise.all(entities.map((e) => repository.save(e)));

  const tasks: Task[] = [
    // { field: 'age', order: "ASC" }: 0, 2, 1, 3
    {
      sort: [{ field: 'age', order: 'ASC' }],
      pagination: {
        startFrom: 'LAST',
        size: 1,
      },
      hasNextPage: false,
      hasPreviousPage: true,
      result: [1],
      resultNotAdditionalFilters: [3],
      query: {
        type: 'TestEntityQueryFullText',
        keyword: 'tag2',
      },
    },
    {
      sort: [{ field: 'age', order: 'ASC' }],
      pagination: {
        startFrom: 'FIRST',
        size: 1,
      },
      hasNextPage: true,
      hasPreviousPage: false,
      result: [0],
      query: {
        type: 'TestEntityQueryFullText',
        keyword: 'tag2',
      },
    },
    {
      sort: [{ field: 'age', order: 'ASC' }],
      pagination: {
        startFrom: 'LAST',
        before: toBase64('fake id', true),
        size: 2,
      },
      hasNextPage: false,
      hasPreviousPage: true,
      result: [1, 3],
    },
    {
      sort: [{ field: 'age', order: 'ASC' }],
      pagination: {
        startFrom: 'LAST',
        before: toBase64('fake id', true),
        size: 5,
      },
      hasNextPage: false,
      hasPreviousPage: false,
      result: [0, 2, 1, 3],
    },
    {
      sort: [{ field: 'age', order: 'ASC' }],
      pagination: {
        startFrom: 'FIRST',
        size: 5,
      },
      hasNextPage: false,
      hasPreviousPage: false,
      result: [0, 2, 1, 3],
    },
    {
      sort: [{ field: 'age', order: 'ASC' }],
      pagination: {
        startFrom: 'FIRST',
        size: 2,
      },
      hasPreviousPage: false,
      hasNextPage: true,
      result: [0, 2],
    },
    {
      sort: [{ field: 'age', order: 'ASC' }],
      pagination: {
        startFrom: 'FIRST',
        after: entities[0]?.toCursor(),
        size: 2,
      },
      hasPreviousPage: true,
      hasNextPage: true,
      result: [2, 1],
    },
    {
      sort: [{ field: 'age', order: 'ASC' }],
      pagination: {
        startFrom: 'FIRST',
        after: entities[1]?.toCursor(),
        size: 2,
      },
      hasPreviousPage: true,
      hasNextPage: false,
      result: [3],
    },
    {
      sort: [{ field: 'age', order: 'ASC' }],
      pagination: {
        startFrom: 'FIRST',
        after: entities[2]?.toCursor(),
        size: 2,
      },
      hasPreviousPage: true,
      hasNextPage: false,
      result: [1, 3],
    },
    {
      sort: [{ field: 'age', order: 'ASC' }],
      pagination: {
        startFrom: 'FIRST',
        after: entities[3]?.toCursor(),
        size: 2,
      },
      hasPreviousPage: true,
      hasNextPage: false,
      result: [],
    },
    {
      sort: [{ field: 'age', order: 'ASC' }],
      pagination: {
        startFrom: 'FIRST',
        before: entities[0]?.toCursor(),
        size: 2,
      },
      hasPreviousPage: false,
      hasNextPage: true,
      result: [],
    },
    {
      sort: [{ field: 'age', order: 'ASC' }],
      pagination: {
        startFrom: 'FIRST',
        before: entities[1]?.toCursor(),
        size: 2,
      },
      hasPreviousPage: false,
      hasNextPage: true,
      result: [0, 2],
    },
    {
      sort: [{ field: 'age', order: 'ASC' }],
      pagination: {
        startFrom: 'FIRST',
        before: entities[2]?.toCursor(),
        size: 2,
      },
      hasPreviousPage: false,
      hasNextPage: true,
      result: [0],
    },
    {
      sort: [{ field: 'age', order: 'ASC' }],
      pagination: {
        startFrom: 'FIRST',
        before: entities[3]?.toCursor(),
        size: 2,
      },
      hasPreviousPage: false,
      hasNextPage: true,
      result: [0, 2],
    },
    {
      sort: [{ field: 'age', order: 'ASC' }],
      pagination: {
        startFrom: 'LAST',
        size: 2,
      },
      hasPreviousPage: true,
      hasNextPage: false,
      result: [1, 3],
    },
    {
      sort: [{ field: 'age', order: 'ASC' }],
      pagination: {
        startFrom: 'LAST',
        before: entities[0]?.toCursor(),
        size: 2,
      },
      hasPreviousPage: false,
      hasNextPage: true,
      result: [],
    },
    {
      sort: [{ field: 'age', order: 'ASC' }],
      pagination: {
        startFrom: 'LAST',
        before: entities[1]?.toCursor(),
        size: 2,
      },
      hasPreviousPage: false,
      hasNextPage: true,
      result: [0, 2],
    },
    {
      sort: [{ field: 'age', order: 'ASC' }],
      pagination: {
        startFrom: 'LAST',
        before: entities[2]?.toCursor(),
        size: 2,
      },
      hasPreviousPage: false,
      hasNextPage: true,
      result: [0],
    },
    {
      sort: [{ field: 'age', order: 'ASC' }],
      pagination: {
        startFrom: 'LAST',
        before: entities[3]?.toCursor(),
        size: 2,
      },
      hasPreviousPage: true,
      hasNextPage: true,
      result: [2, 1],
    },
    {
      sort: [{ field: 'age', order: 'ASC' }],
      pagination: {
        startFrom: 'LAST',
        after: entities[0]?.toCursor(),
        size: 2,
      },
      hasPreviousPage: true,
      hasNextPage: false,
      result: [1, 3],
    },
    {
      sort: [{ field: 'age', order: 'ASC' }],
      pagination: {
        startFrom: 'LAST',
        after: entities[1]?.toCursor(),
        size: 2,
      },
      hasPreviousPage: true,
      hasNextPage: false,
      result: [3],
    },
    {
      sort: [{ field: 'age', order: 'ASC' }],
      pagination: {
        startFrom: 'LAST',
        after: entities[2]?.toCursor(),
        size: 2,
      },
      hasPreviousPage: true,
      hasNextPage: false,
      result: [1, 3],
    },
    {
      sort: [{ field: 'age', order: 'ASC' }],
      pagination: {
        startFrom: 'LAST',
        after: entities[3]?.toCursor(),
        size: 2,
      },
      hasPreviousPage: true,
      hasNextPage: false,
      result: [],
    },
    //
    // { field: 'age', order: "DESC" }: 1, 3, 0, 2
    {
      sort: [{ field: 'age', order: 'DESC' }],
      pagination: {
        startFrom: 'FIRST',
        after: entities[0]?.toCursor(),
        size: 2,
      },
      hasPreviousPage: true,
      hasNextPage: false,
      result: [2],
    },
    {
      sort: [{ field: 'age', order: 'DESC' }],
      pagination: {
        startFrom: 'FIRST',
        after: entities[1]?.toCursor(),
        size: 2,
      },
      hasPreviousPage: true,
      hasNextPage: true,
      result: [3, 0],
    },
    {
      sort: [{ field: 'age', order: 'DESC' }],
      pagination: {
        startFrom: 'FIRST',
        after: entities[2]?.toCursor(),
        size: 2,
      },
      hasPreviousPage: true,
      hasNextPage: false,
      result: [],
    },
    {
      sort: [{ field: 'age', order: 'DESC' }],
      pagination: {
        startFrom: 'FIRST',
        after: entities[3]?.toCursor(),
        size: 2,
      },
      hasPreviousPage: true,
      hasNextPage: false,
      result: [0, 2],
    },
    {
      sort: [{ field: 'age', order: 'DESC' }],
      pagination: {
        startFrom: 'LAST',
        after: entities[0]?.toCursor(),
        size: 2,
      },
      hasPreviousPage: true,
      hasNextPage: false,
      result: [2],
    },
    {
      sort: [{ field: 'age', order: 'DESC' }],
      pagination: {
        startFrom: 'LAST',
        after: entities[1]?.toCursor(),
        size: 2,
      },
      hasPreviousPage: true,
      hasNextPage: false,
      result: [0, 2],
    },
    {
      sort: [{ field: 'age', order: 'DESC' }],
      pagination: {
        startFrom: 'LAST',
        after: entities[2]?.toCursor(),
        size: 2,
      },
      hasPreviousPage: true,
      hasNextPage: false,
      result: [],
    },
    {
      sort: [{ field: 'age', order: 'DESC' }],
      pagination: {
        startFrom: 'LAST',
        after: entities[3]?.toCursor(),
        size: 2,
      },
      hasPreviousPage: true,
      hasNextPage: false,
      result: [0, 2],
    },
  ];

  it('can find entities correctly', async () => {
    await Promise.all(
      tasks.map(async ({ sort, pagination, query, result, resultNotAdditionalFilters }) =>
        expect(await repository.doFindAll(sort, pagination, query)).toStrictEqual(
          (resultNotAdditionalFilters ?? result).map((i) => entities[i]),
        ),
      ),
    );
  });

  it('can get pagination correctly', async () => {
    await Promise.all(
      tasks.map(async ({ sort, pagination, query, result, hasNextPage, hasPreviousPage }) => {
        const data = result.map((i) => entities[i]);
        expect(
          await service.findAllValues(
            new AuthUser(
              {
                provider: 'NOOP',
                id: admin.id,
              },
              ['test:read'],
              admin,
            ),
            sort,
            pagination,
            query,
          ),
        ).toStrictEqual({
          pageInfo: {
            hasPreviousPage,
            hasNextPage,
            startCursor: data[0]?.toCursor(),
            endCursor: data[data.length - 1]?.toCursor(),
          },
          pageItems: data.map((e) => ({ cursor: e?.toCursor(), data: e?.toValue() })),
        });
      }),
    );
  });
});
