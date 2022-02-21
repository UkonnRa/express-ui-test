import AbstractRepository, { Pagination, Sort } from '@white-rabbit/business-logic/src/shared/abstract-repository';
import AbstractEntity from '@white-rabbit/business-logic/src/shared/abstract-entity';

export default abstract class MemoryRepository<T extends AbstractEntity<T, P>, P, Q>
  implements AbstractRepository<T, Q>
{
  protected readonly data: Map<string, T> = new Map();

  close(): void {
    this.data.clear();
  }

  findById(id: string): Promise<T | undefined> {
    const result = this.data.get(id);
    return Promise.resolve(result?.deleted ? undefined : result);
  }

  findByIds(ids: string[]): Promise<T[]> {
    return Promise.resolve([...this.data.values()].filter((v) => !v.deleted && ids.includes(v.id)));
  }

  save(entity: T): Promise<void> {
    this.data.set(entity.id, entity);
    return Promise.resolve();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,class-methods-use-this
  findAll(_sort: Sort, _pagination: Pagination, _query?: Q): Promise<T[]> {
    return Promise.resolve([]);
  }
}
