import {Checker, JsonTypeOf} from './types';

export const string: Checker<string> = {
  check: (value: unknown): value is string => {
    return typeof value === 'string';
  },
};

export const number: Checker<number> = {
  check: (value: unknown): value is number => {
    return typeof value === 'number';
  },
};

export const boolean: Checker<boolean> = {
  check: (value: unknown): value is boolean => {
    return typeof value === 'boolean';
  },
};

export const nil: Checker<null> = {
  check: (value: unknown): value is null => {
    return value === null;
  },
};

export const unknown: Checker<unknown> = {
  check: (value: unknown): value is unknown => {
    return true;
  },
};

export function literal<T extends string>(str: T): Checker<T> {
  return {
    check(value: unknown): value is T {
      return value === str;
    },
  };
}

export function any<T extends Checker<unknown>>(
  checkers: T[]
): Checker<JsonTypeOf<T>> {
  return {
    check(value: unknown): value is JsonTypeOf<T> {
      return checkers.some(checker => checker.check(value));
    },
  };
}

export function nullable<T>(checker: Checker<T>): Checker<T | null> {
  return {
    check(value: unknown): value is T | null {
      return value === null || checker.check(value);
    },
  };
}

export function array<T extends Checker<unknown>>(
  checker: T
): Checker<JsonTypeOf<T>[]> {
  return {
    check(value: unknown): value is JsonTypeOf<T>[] {
      return Array.isArray(value) && value.every(it => checker.check(it));
    },
  };
}

export function object<T extends {[key: string]: Checker<unknown> | Function}>(
  properties: T
): Checker<ExpandRecursively<ObjectJsonTypeOf<T>>> {
  return {
    check(value: unknown): value is ExpandRecursively<ObjectJsonTypeOf<T>> {
      if (typeof value !== 'object' || value === null) return false;
      return Object.keys(properties).every(key => {
        const unescapedKey = unescapePropertyName(key);
        if (has(value, unescapedKey)) {
          const checkerOrFunction = properties[key];
          if (isChecker(checkerOrFunction)) {
            return checkerOrFunction.check(value[unescapedKey]);
          }
          const lazyChecker: unknown = checkerOrFunction();
          if (isChecker(lazyChecker)) {
            return lazyChecker.check(value[unescapedKey]);
          } else {
            return false;
          }
        } else {
          return isOptionalProperty(key);
        }
      });
    },
  };
}

function isChecker(target: unknown): target is Checker<unknown> {
  return (
    typeof target === 'object' &&
    target !== null &&
    has(target, 'check') &&
    typeof target.check === 'function'
  );
}

type FilterOptionalPropertyName<T> = T extends `${infer U}??`
  ? `${FilterOptionalPropertyName<U>}?`
  : T extends `${infer U}?`
  ? U
  : never;

type FilterRequiredPropertyName<T> = T extends `${infer U}??`
  ? `${FilterRequiredPropertyName<U>}?`
  : T extends `${infer U}?`
  ? never
  : T;

type ObjectJsonTypeOf<T extends {[k: string]: Checker<unknown> | Function}> = {
  [K in keyof T as FilterRequiredPropertyName<K>]-?: T[K] extends Checker<unknown>
    ? JsonTypeOf<T[K]>
    : T[K] extends Function
    ? LazyChecker<T[K]>
    : never;
} &
  {
    [K in keyof T as FilterOptionalPropertyName<K>]+?: T[K] extends Checker<unknown>
      ? JsonTypeOf<T[K]>
      : T[K] extends Function
      ? LazyChecker<T[K]>
      : never;
  };

type LazyChecker<T extends Function> = T extends () => Checker<infer U>
  ? U
  : never;

type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? {[K in keyof O]: ExpandRecursively<O[K]>}
    : never
  : T;

export function isOptionalProperty(propertyName: string): boolean {
  return propertyName.match(/[^?]?(?:\?\?)*(\?)?$/)?.[1] === '?';
}

export function unescapePropertyName(propertyName: string): string {
  const match = propertyName.match(/^(.*?[^?]?)((?:\?\?)*)\??$/);
  if (match === null) {
    return propertyName;
  }
  const head = match[1] ?? '';
  const questionMarks = match[2].replace(/\?\?/g, '?') ?? '';
  return `${head}${questionMarks}`;
}

// https://github.com/microsoft/TypeScript/issues/21732#issuecomment-663994772
function has<P extends PropertyKey>(
  target: object,
  property: P
): target is {[K in P]: unknown} {
  return property in target;
}
