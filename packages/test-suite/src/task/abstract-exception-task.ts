import AbstractTask from "./abstract-task";

type ExpectedType<I> =
  | Record<string, unknown>
  | ((input: I) => Promise<Record<string, unknown>>);

export default interface AbstractExceptionTask<I, V>
  extends AbstractTask<I, V> {
  readonly expected: ExpectedType<I>;
}
