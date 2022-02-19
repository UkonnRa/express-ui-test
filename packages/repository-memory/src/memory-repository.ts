import AbstractRepository from '@white-rabbit/business-logic/src/shared/abstract-repository';
import AbstractEntity from '@white-rabbit/business-logic/src/shared/abstract-entity';

export default abstract class MemoryRepository<T extends AbstractEntity<T>> implements AbstractRepository<T> {
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
}
