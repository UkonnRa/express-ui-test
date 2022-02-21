import { TestEntity, TestEntityRepository } from './test-entity';
import { Role, User } from '../../domains/user';

describe('Basic functionality for TestEntity & related components', () => {
  const repository = new TestEntityRepository();

  const admin = new User({ name: 'admin', role: Role.ADMIN });
  const user = new User({ name: 'user', role: Role.USER });

  it('can compare entities correctly with pagination', async () => {
    const entities = [
      new TestEntity('1', 'test 1', 18, ['tag1', 'tag2'], admin.id),
      new TestEntity('2', 'test 2', 20, ['tag2', 'tag4'], user.id),
      new TestEntity('3', 'test 3', 18, ['tag1', 'tag3'], user.id),
      new TestEntity('4', 'test 2', 20, ['tag1', 'tag3'], user.id),
    ];

    for (const e of entities) {
      // eslint-disable-next-line no-await-in-loop
      await repository.save(e);
    }

    // { field: 'age', order: "ASC" }: 0, 2, 1, 3
    expect(await repository.findAll([{ field: 'age', order: 'ASC' }], { startFrom: 'FIRST', size: 5 })).toStrictEqual([
      entities[0],
      entities[2],
      entities[1],
      entities[3],
    ]);
    expect(await repository.findAll([{ field: 'age', order: 'ASC' }], { startFrom: 'FIRST', size: 2 })).toStrictEqual([
      entities[0],
      entities[2],
    ]);

    expect(
      await repository.findAll([{ field: 'age', order: 'ASC' }], {
        startFrom: 'FIRST',
        after: entities[0]!.toCursor(),
        size: 2,
      }),
    ).toStrictEqual([entities[2], entities[1]]);
    expect(
      await repository.findAll([{ field: 'age', order: 'ASC' }], {
        startFrom: 'FIRST',
        after: entities[1]!.toCursor(),
        size: 2,
      }),
    ).toStrictEqual([entities[3]]);
    expect(
      await repository.findAll([{ field: 'age', order: 'ASC' }], {
        startFrom: 'FIRST',
        after: entities[2]!.toCursor(),
        size: 2,
      }),
    ).toStrictEqual([entities[1], entities[3]]);
    expect(
      await repository.findAll([{ field: 'age', order: 'ASC' }], {
        startFrom: 'FIRST',
        after: entities[3]!.toCursor(),
        size: 2,
      }),
    ).toStrictEqual([]);

    expect(
      await repository.findAll([{ field: 'age', order: 'ASC' }], {
        startFrom: 'FIRST',
        before: entities[0]!.toCursor(),
        size: 2,
      }),
    ).toStrictEqual([]);
    expect(
      await repository.findAll([{ field: 'age', order: 'ASC' }], {
        startFrom: 'FIRST',
        before: entities[1]!.toCursor(),
        size: 2,
      }),
    ).toStrictEqual([entities[0], entities[2]]);
    expect(
      await repository.findAll([{ field: 'age', order: 'ASC' }], {
        startFrom: 'FIRST',
        before: entities[2]!.toCursor(),
        size: 2,
      }),
    ).toStrictEqual([entities[0]]);
    expect(
      await repository.findAll([{ field: 'age', order: 'ASC' }], {
        startFrom: 'FIRST',
        before: entities[3]!.toCursor(),
        size: 2,
      }),
    ).toStrictEqual([entities[0], entities[2]]);

    expect(
      await repository.findAll([{ field: 'age', order: 'ASC' }], {
        startFrom: 'LAST',
        before: entities[0]!.toCursor(),
        size: 2,
      }),
    ).toStrictEqual([]);
    expect(
      await repository.findAll([{ field: 'age', order: 'ASC' }], {
        startFrom: 'LAST',
        before: entities[1]!.toCursor(),
        size: 2,
      }),
    ).toStrictEqual([entities[0], entities[2]]);
    expect(
      await repository.findAll([{ field: 'age', order: 'ASC' }], {
        startFrom: 'LAST',
        before: entities[2]!.toCursor(),
        size: 2,
      }),
    ).toStrictEqual([entities[0]]);
    expect(
      await repository.findAll([{ field: 'age', order: 'ASC' }], {
        startFrom: 'LAST',
        before: entities[3]!.toCursor(),
        size: 2,
      }),
    ).toStrictEqual([entities[2], entities[1]]);

    expect(
      await repository.findAll([{ field: 'age', order: 'ASC' }], {
        startFrom: 'LAST',
        after: entities[0]!.toCursor(),
        size: 2,
      }),
    ).toStrictEqual([entities[1], entities[3]]);
    expect(
      await repository.findAll([{ field: 'age', order: 'ASC' }], {
        startFrom: 'LAST',
        after: entities[1]!.toCursor(),
        size: 2,
      }),
    ).toStrictEqual([entities[3]]);
    expect(
      await repository.findAll([{ field: 'age', order: 'ASC' }], {
        startFrom: 'LAST',
        after: entities[2]!.toCursor(),
        size: 2,
      }),
    ).toStrictEqual([entities[1], entities[3]]);
    expect(
      await repository.findAll([{ field: 'age', order: 'ASC' }], {
        startFrom: 'LAST',
        after: entities[3]!.toCursor(),
        size: 2,
      }),
    ).toStrictEqual([]);

    // { field: 'age', order: "DESC" }: 1, 3, 0, 2
    expect(
      await repository.findAll([{ field: 'age', order: 'DESC' }], {
        startFrom: 'FIRST',
        after: entities[0]!.toCursor(),
        size: 2,
      }),
    ).toStrictEqual([entities[2]]);
    expect(
      await repository.findAll([{ field: 'age', order: 'DESC' }], {
        startFrom: 'FIRST',
        after: entities[1]!.toCursor(),
        size: 2,
      }),
    ).toStrictEqual([entities[3], entities[0]]);
    expect(
      await repository.findAll([{ field: 'age', order: 'DESC' }], {
        startFrom: 'FIRST',
        after: entities[2]!.toCursor(),
        size: 2,
      }),
    ).toStrictEqual([]);
    expect(
      await repository.findAll([{ field: 'age', order: 'DESC' }], {
        startFrom: 'FIRST',
        after: entities[3]!.toCursor(),
        size: 2,
      }),
    ).toStrictEqual([entities[0], entities[2]]);

    expect(
      await repository.findAll([{ field: 'age', order: 'DESC' }], {
        startFrom: 'LAST',
        before: entities[0]!.toCursor(),
        size: 2,
      }),
    ).toStrictEqual([entities[1], entities[3]]);
    expect(
      await repository.findAll([{ field: 'age', order: 'DESC' }], {
        startFrom: 'LAST',
        before: entities[1]!.toCursor(),
        size: 2,
      }),
    ).toStrictEqual([]);
    expect(
      await repository.findAll([{ field: 'age', order: 'DESC' }], {
        startFrom: 'LAST',
        before: entities[2]!.toCursor(),
        size: 2,
      }),
    ).toStrictEqual([entities[3], entities[0]]);
    expect(
      await repository.findAll([{ field: 'age', order: 'DESC' }], {
        startFrom: 'LAST',
        before: entities[3]!.toCursor(),
        size: 2,
      }),
    ).toStrictEqual([entities[1]]);
  });
});
