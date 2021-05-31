import {expectNotType, expectType} from 'tsd';
import {Checker, j} from '../lib';

// string
expectType<Checker<string>>(j.string);

// number
expectType<Checker<number>>(j.number);

// boolean
expectType<Checker<boolean>>(j.boolean);

// null
expectType<Checker<null>>(j.nil);

// unknown
expectType<Checker<unknown>>(j.unknown);

// literal
expectType<Checker<'literal'>>(j.literal('literal'));

// any
expectType<
  Checker<
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
expectType<Checker<unknown>>(j.any([j.string, j.unknown, j.number]));

// nullable
expectType<Checker<string | null>>(j.nullable(j.string));
expectType<Checker<string[] | null>>(j.nullable(j.array(j.string)));
expectType<Checker<{foo: string} | null>>(
  j.nullable(j.object({foo: j.string}))
);
expectType<Checker<unknown>>(j.nullable(j.unknown));

// array
expectType<Checker<string[]>>(j.array(j.string));
expectType<Checker<number[]>>(j.array(j.number));
expectType<Checker<boolean[]>>(j.array(j.boolean));
expectType<Checker<null[]>>(j.array(j.nil));
expectType<Checker<unknown[]>>(j.array(j.unknown));
expectType<Checker<'literal'[]>>(j.array(j.literal('literal')));
expectType<Checker<(string | number)[]>>(j.array(j.any([j.string, j.number])));
expectType<Checker<string[][]>>(j.array(j.array(j.string)));
expectType<Checker<{foo: string}[]>>(j.array(j.object({foo: j.string})));

// object
expectType<Checker<{}>>(j.object({}));
expectType<Checker<{foo: string}>>(j.object({foo: () => j.string}));
expectType<Checker<{foo: never}>>(j.object({foo: () => 'foo'}));
expectType<Checker<{optional?: string}>>(j.object({'optional?': j.string}));
expectNotType<Checker<{optional: string | undefined}>>(
  j.object({'optional?': j.string})
);
expectType<Checker<{'escaped?': string}>>(j.object({'escaped??': j.string}));
expectType<Checker<{'escaped_optional?'?: string}>>(
  j.object({'escaped_optional???': j.string})
);
expectNotType<Checker<{'escaped_optional?': string | undefined}>>(
  j.object({'escaped_optional???': j.string})
);
expectType<
  Checker<{
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
    lazy: number | string;
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
    lazy: () => j.any([j.number, j.string]),
  })
);
