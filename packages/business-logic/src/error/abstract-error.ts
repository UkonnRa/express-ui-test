export abstract class AbstractError extends Error {
  protected abstract readonly type: string;

  protected constructor(message: string) {
    super(message);
  }
}
