import {
  any,
  array,
  boolean,
  literal,
  nil,
  nullable,
  number,
  object,
  string,
  unknown,
} from './validator';

export const j = {
  string: string,
  number: number,
  boolean: boolean,
  nil: nil,
  unknown: unknown,
  literal: literal,
  any: any,
  nullable: nullable,
  array: array,
  object: object,
};

export {Validator} from './validator';
