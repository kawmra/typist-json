export interface Checker<T> {
  check(value: unknown): value is T;
}

export type JsonTypeOf<T extends Checker<unknown>> = T extends Checker<infer U>
  ? U
  : never;
