import {
  any,
  array,
  boolean,
  isOptionalProperty,
  literal,
  nil,
  nullable,
  number,
  object,
  string,
  unescapePropertyName,
  unknown,
} from '../src/validator';
import {TestSequenceValidator, TestValidator} from './test-validators';

describe('validator', () => {
  test('string', () => {
    expect(string.validate('foo')).toBe(true);
    expect(string.validate(123)).toBe(false);
    expect(string.validate({})).toBe(false);
    expect(string.validate(null)).toBe(false);
  });

  test('number', () => {
    expect(number.validate(123)).toBe(true);
    expect(number.validate(Number.POSITIVE_INFINITY)).toBe(true);
    expect(number.validate(Number.NEGATIVE_INFINITY)).toBe(true);
    expect(number.validate(Number.NaN)).toBe(true);
    expect(number.validate('123')).toBe(false);
    expect(number.validate({})).toBe(false);
    expect(number.validate(null)).toBe(false);
  });

  test('boolean', () => {
    expect(boolean.validate(true)).toBe(true);
    expect(boolean.validate(false)).toBe(true);
    expect(boolean.validate('true')).toBe(false);
    expect(boolean.validate(1)).toBe(false);
    expect(boolean.validate({})).toBe(false);
    expect(boolean.validate([])).toBe(false);
    expect(boolean.validate(null)).toBe(false);
  });

  test('nil', () => {
    expect(nil.validate(null)).toBe(true);
    expect(nil.validate('null')).toBe(false);
    expect(nil.validate(Number.NaN)).toBe(false);
    expect(nil.validate({})).toBe(false);
    expect(nil.validate([])).toBe(false);
    expect(nil.validate(undefined)).toBe(false);
  });

  test('unknown', () => {
    expect(unknown.validate('foo')).toBe(true);
    expect(unknown.validate(123)).toBe(true);
    expect(unknown.validate({})).toBe(true);
    expect(unknown.validate([])).toBe(true);
    expect(unknown.validate(true)).toBe(true);
    expect(unknown.validate(false)).toBe(true);
    expect(unknown.validate(null)).toBe(true);
  });

  test('literal', () => {
    expect(literal('foo').validate('foo')).toBe(true);
    expect(literal('foo').validate('fooo')).toBe(false);
  });

  describe('any', () => {
    it('should return true if any of given validators return true', () => {
      const validator1 = new TestValidator(true);
      const validator2 = new TestValidator(false);
      const validator3 = new TestValidator(false);
      expect(any([validator1, validator2]).validate(null)).toBe(true);
      expect(any([validator1, validator3]).validate(null)).toBe(true);
      expect(any([validator2, validator3]).validate(null)).toBe(false);
    });
  });

  describe('nullable', () => {
    it('should return true if the value to be validated is null', () => {
      const validator = new TestValidator(false);
      expect(nullable(validator).validate(null)).toBe(true);
    });

    it('should return true if the given validator returns true', () => {
      const validator = new TestValidator(true);
      expect(nullable(validator).validate('any values')).toBe(true);
      expect(validator.isCalled).toBe(true);
    });
  });

  describe('array', () => {
    it('should return true if all elements are valid', () => {
      const validator = new TestSequenceValidator([
        true,
        true,
        true,
        true,
        true,
      ]);
      expect(array(validator).validate(Array(5).fill(null))).toBe(true);
    });

    it('should return false if even one element is invalid', () => {
      const validator = new TestSequenceValidator([true, false, true]);
      expect(array(validator).validate(Array(3).fill(null))).toBe(false);
    });
  });

  describe('object', () => {
    it('should return true if all properties are valid', () => {
      expect(
        object({
          foo: new TestValidator(true),
          bar: new TestValidator(true),
        }).validate({foo: null, bar: null})
      ).toBe(true);
    });

    it('should return false if even one property is invalid', () => {
      expect(
        object({
          foo: new TestValidator(true),
          bar: new TestValidator(false),
        }).validate({
          foo: null,
          bar: null,
        })
      ).toBe(false);
    });

    it('should return false if required property is missing', () => {
      expect(object({foo: new TestValidator(true)}).validate({})).toBe(false);
      expect(object({'bar??': new TestValidator(true)}).validate({})).toBe(
        false
      );
      expect(
        object({'foobar????????': new TestValidator(true)}).validate({})
      ).toBe(false);
    });

    it('should return true if optional property is missing', () => {
      expect(
        object({
          'foo?': new TestValidator(false),
          'bar???': new TestValidator(false),
          'foobar???????': new TestValidator(false),
        }).validate({})
      ).toBe(true);
    });
  });
});

describe('isOptionalProperty', () => {
  test('empty', () => {
    expect(isOptionalProperty('')).toBe(false);
    expect(isOptionalProperty('?')).toBe(true);
    expect(isOptionalProperty('??')).toBe(false);
    expect(isOptionalProperty('???')).toBe(true);
    expect(isOptionalProperty('????')).toBe(false);
    expect(isOptionalProperty('?????')).toBe(true);
  });

  test('name', () => {
    expect(isOptionalProperty('foo')).toBe(false);
    expect(isOptionalProperty('foo?')).toBe(true);
    expect(isOptionalProperty('foo??')).toBe(false);
    expect(isOptionalProperty('foo???')).toBe(true);
    expect(isOptionalProperty('foo????')).toBe(false);
    expect(isOptionalProperty('foo?????')).toBe(true);
  });

  test('name with question mark', () => {
    expect(isOptionalProperty('foo?bar')).toBe(false);
    expect(isOptionalProperty('foo?bar?')).toBe(true);
    expect(isOptionalProperty('foo?bar??')).toBe(false);
    expect(isOptionalProperty('foo?bar???')).toBe(true);
    expect(isOptionalProperty('foo?bar????')).toBe(false);
    expect(isOptionalProperty('foo?bar?????')).toBe(true);
  });
});

describe('unescapePropertyName', () => {
  test('empty', () => {
    expect(unescapePropertyName('')).toBe('');
    expect(unescapePropertyName('?')).toBe('');
    expect(unescapePropertyName('??')).toBe('?');
    expect(unescapePropertyName('???')).toBe('?');
    expect(unescapePropertyName('????')).toBe('??');
    expect(unescapePropertyName('?????')).toBe('??');
  });

  test('name', () => {
    expect(unescapePropertyName('foo')).toBe('foo');
    expect(unescapePropertyName('foo?')).toBe('foo');
    expect(unescapePropertyName('foo??')).toBe('foo?');
    expect(unescapePropertyName('foo???')).toBe('foo?');
    expect(unescapePropertyName('foo????')).toBe('foo??');
    expect(unescapePropertyName('foo?????')).toBe('foo??');
  });

  test('name with question mark', () => {
    expect(unescapePropertyName('foo?bar')).toBe('foo?bar');
    expect(unescapePropertyName('foo?bar?')).toBe('foo?bar');
    expect(unescapePropertyName('foo?bar??')).toBe('foo?bar?');
    expect(unescapePropertyName('foo?bar???')).toBe('foo?bar?');
    expect(unescapePropertyName('foo?bar????')).toBe('foo?bar??');
    expect(unescapePropertyName('foo?bar?????')).toBe('foo?bar??');
  });
});
