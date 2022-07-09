import { AbstractEntity } from "@white-rabbit/business-logic";
import AbstractTask from "./abstract-task";

type ExpectedType<I> =
  | Record<string, unknown>
  | ((input: I) => Promise<Record<string, unknown>>);

export default interface AbstractExceptionTask<
  E extends AbstractEntity<E>,
  I,
  R
> extends AbstractTask<E, I, R> {
  readonly expected: ExpectedType<I>;
}
