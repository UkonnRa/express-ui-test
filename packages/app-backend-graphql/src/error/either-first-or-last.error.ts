import { AbstractError } from "@white-rabbit/business-logic";

export default class EitherFirstOrLastError extends AbstractError {
  protected readonly type: string = "EitherFirstOrLastError";

  constructor() {
    super(
      `Either Field[first] or Field[last] should be exist in Query, but not both`
    );
  }
}
