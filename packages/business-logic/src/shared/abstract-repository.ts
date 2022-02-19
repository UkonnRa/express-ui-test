import AbstractEntity from './abstract-entity';

export default interface AbstractRepository<T extends AbstractEntity<T>> {
  findById(id: string): Promise<T | undefined>;
  findByIds(ids: string[]): Promise<T[]>;
  save(entity: T): Promise<void>;

  close(): void;
}
