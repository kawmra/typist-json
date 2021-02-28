import {expectNotType, expectType} from 'tsd';
import {j, Validator} from '../lib';

// string
expectType<Validator<string>>(j.string);

// number
expectType<Validator<number>>(j.number);

// boolean
expectType<Validator<boolean>>(j.boolean);

// null
expectType<Validator<null>>(j.nil);

// unknown
expectType<Validator<unknown>>(j.unknown);

// literal
expectType<Validator<'literal'>>(j.literal('literal'));

// any
expectType<
  Validator<
    | string
    | number
    | boolean
    | null
    | 'literal'
    | (number | boolean)
    | string[]
    | {foo: string}
  >
>(
  j.any([
    j.string,
    j.number,
    j.boolean,
    j.nil,
    j.literal('literal'),
    j.any([j.number, j.boolean]),
    j.array(j.string),
    j.object({foo: j.string}),
  ])
);
expectType<Validator<unknown>>(j.any([j.string, j.unknown, j.number]));

// nullable
expectType<Validator<string | null>>(j.nullable(j.string));
expectType<Validator<string[] | null>>(j.nullable(j.array(j.string)));
expectType<Validator<{foo: string} | null>>(
  j.nullable(j.object({foo: j.string}))
);
expectType<Validator<unknown>>(j.nullable(j.unknown));

// array
expectType<Validator<string[]>>(j.array(j.string));
expectType<Validator<number[]>>(j.array(j.number));
expectType<Validator<boolean[]>>(j.array(j.boolean));
expectType<Validator<null[]>>(j.array(j.nil));
expectType<Validator<unknown[]>>(j.array(j.unknown));
expectType<Validator<'literal'[]>>(j.array(j.literal('literal')));
expectType<Validator<(string | number)[]>>(
  j.array(j.any([j.string, j.number]))
);
expectType<Validator<string[][]>>(j.array(j.array(j.string)));
expectType<Validator<{foo: string}[]>>(j.array(j.object({foo: j.string})));

// object
expectType<Validator<{}>>(j.object({}));
expectType<Validator<{optional?: string}>>(j.object({'optional?': j.string}));
expectNotType<Validator<{optional: string | undefined}>>(
  j.object({'optional?': j.string})
);
expectType<Validator<{'escaped?': string}>>(j.object({'escaped??': j.string}));
expectType<Validator<{'escaped_optional?'?: string}>>(
  j.object({'escaped_optional???': j.string})
);
expectNotType<Validator<{'escaped_optional?': string | undefined}>>(
  j.object({'escaped_optional???': j.string})
);
expectType<
  Validator<{
    string: string;
    number: number;
    boolean: boolean;
    nil: null;
    unknown: unknown;
    literal: 'literal';
    union: string | number;
    nullable: string | null;
    array: string[];
    nested: {
      string: string;
    };
    optional?: string;
    'escaped?': string;
    'escaped_optional?'?: string;
  }>
>(
  j.object({
    string: j.string,
    number: j.number,
    boolean: j.boolean,
    nil: j.nil,
    unknown: j.unknown,
    literal: j.literal('literal'),
    union: j.any([j.string, j.number]),
    nullable: j.nullable(j.string),
    array: j.array(j.string),
    nested: j.object({
      string: j.string,
    }),
    'optional?': j.string,
    'escaped??': j.string,
    'escaped_optional???': j.string,
  })
);
