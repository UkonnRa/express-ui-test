import { v4 } from 'uuid';
import { Base64 } from 'js-base64';
import { User } from '../domains/user';

export default abstract class AbstractEntity<T extends AbstractEntity<T, P>, P> {
  readonly id = v4();

  deleted = false;

  abstract isReadable(user: User): boolean;

  abstract isWritable(user: User): boolean;

  abstract toProjection(): P;

  toCursor(): string {
    return Base64.encodeURL(this.id);
  }
}
