import { v4 } from 'uuid';

export default abstract class AbstractEntity<T extends AbstractEntity<T>> {
  readonly id = v4();

  deleted = false;
}
