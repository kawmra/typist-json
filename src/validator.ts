export interface Validator<T> {
  validate(value: unknown): value is T;
}

export type JsonOf<T extends Validator<unknown>> = T extends Validator<infer U>
  ? U
  : never;

export const string: Validator<string> = {
  validate: (value: unknown): value is string => {
    return typeof value === 'string';
  },
};

export const number: Validator<number> = {
  validate: (value: unknown): value is number => {
    return typeof value === 'number';
  },
};

export const boolean: Validator<boolean> = {
  validate: (value: unknown): value is boolean => {
    return typeof value === 'boolean';
  },
};

export const nil: Validator<null> = {
  validate: (value: unknown): value is null => {
    return value === null;
  },
};

export const unknown: Validator<unknown> = {
  validate: (value: unknown): value is unknown => {
    return true;
  },
};

export function literal<T extends string>(str: T): Validator<T> {
  return {
    validate(value: unknown): value is T {
      return value === str;
    },
  };
}

export function any<T extends Validator<unknown>>(
  validators: T[]
): Validator<JsonOf<T>> {
  return {
    validate(value: unknown): value is JsonOf<T> {
      return validators.some(validator => validator.validate(value));
    },
  };
}

export function nullable<T>(validator: Validator<T>): Validator<T | null> {
  return {
    validate(value: unknown): value is T | null {
      return value === null || validator.validate(value);
    },
  };
}

export function array<T extends Validator<unknown>>(
  validator: T
): Validator<JsonOf<T>[]> {
  return {
    validate(value: unknown): value is JsonOf<T>[] {
      return Array.isArray(value) && value.every(it => validator.validate(it));
    },
  };
}

export function object<T extends {[key: string]: Validator<unknown>}>(
  properties: T
): Validator<ExpandRecursively<ObjectJsonOf<T>>> {
  return {
    validate(value: unknown): value is ExpandRecursively<ObjectJsonOf<T>> {
      if (typeof value !== 'object' || value === null) return false;
      return Object.keys(properties).every(key => {
        return has(value, key) && properties[key].validate(value[key]);
      });
    },
  };
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

type ObjectJsonOf<T extends {[k: string]: Validator<unknown>}> = {
  [K in keyof T as FilterRequiredPropertyName<K>]-?: JsonOf<T[K]>;
} &
  {[K in keyof T as FilterOptionalPropertyName<K>]+?: JsonOf<T[K]>};

type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? {[K in keyof O]: ExpandRecursively<O[K]>}
    : never
  : T;

// https://github.com/microsoft/TypeScript/issues/21732#issuecomment-663994772
function has<P extends PropertyKey>(
  target: object,
  property: P
): target is {[K in P]: unknown} {
  return property in target;
}
