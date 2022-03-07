import { v4 } from 'uuid';
import { Base64 } from 'js-base64';
import { User } from '../domains/user';
import { FieldValidationLengthError } from './errors';

export default abstract class AbstractEntity<T extends AbstractEntity<T, V, P>, V, P> {
  readonly id = v4();

  deleted = false;

  abstract isReadable(user: User): boolean;

  abstract isWritable(user: User): boolean;

  abstract toValue(): V;

  abstract get entityType(): P & string;

  toCursor(): string {
    return Base64.encodeURL(this.id);
  }

  checkLength(value: number, field: string, options: { min?: number; max?: number }) {
    const underflow = options.min === undefined ? false : value < options.min;
    const overflow = options.max === undefined ? false : value > options.max;
    if (underflow || overflow) {
      throw new FieldValidationLengthError(this.entityType, field.toString(), options.min, options.max);
    }
  }
}
