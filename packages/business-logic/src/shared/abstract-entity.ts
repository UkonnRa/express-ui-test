import { v4 } from 'uuid';
import { Base64 } from 'js-base64';
import { User } from '../domains/user';

export default abstract class AbstractEntity<T extends AbstractEntity<T, V>, V> {
  readonly id = v4();

  deleted = false;

  abstract isReadable(user: User): boolean;

  abstract isWritable(user: User): boolean;

  abstract toValue(): V;

  toCursor(): string {
    return Base64.encodeURL(this.id);
  }
}
