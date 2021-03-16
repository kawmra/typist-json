import {
  any,
  array,
  boolean,
  Checker,
  isOptionalProperty,
  literal,
  nil,
  nullable,
  number,
  object,
  string,
  unescapePropertyName,
  unknown,
} from '../src/checker';

export class TestChecker implements Checker<unknown> {
  isCalled = false;
  private readonly result: boolean;

  constructor(result: boolean) {
    this.result = result;
  }

  check(value: unknown): value is unknown {
    this.isCalled = true;
    return this.result;
  }
}

export class TestSequenceChecker implements Checker<unknown> {
  private callCount = 0;
  private readonly results: boolean[];

  constructor(results: boolean[]) {
    this.results = results;
  }

  check(value: unknown): value is unknown {
    return this.results[this.callCount++];
  }
}

describe('checker', () => {
  test('string', () => {
    expect(string.check('foo')).toBe(true);
    expect(string.check(123)).toBe(false);
    expect(string.check({})).toBe(false);
    expect(string.check(null)).toBe(false);
  });

  test('number', () => {
    expect(number.check(123)).toBe(true);
    expect(number.check(Number.POSITIVE_INFINITY)).toBe(true);
    expect(number.check(Number.NEGATIVE_INFINITY)).toBe(true);
    expect(number.check(Number.NaN)).toBe(true);
    expect(number.check('123')).toBe(false);
    expect(number.check({})).toBe(false);
    expect(number.check(null)).toBe(false);
  });

  test('boolean', () => {
    expect(boolean.check(true)).toBe(true);
    expect(boolean.check(false)).toBe(true);
    expect(boolean.check('true')).toBe(false);
    expect(boolean.check(1)).toBe(false);
    expect(boolean.check({})).toBe(false);
    expect(boolean.check([])).toBe(false);
    expect(boolean.check(null)).toBe(false);
  });

  test('nil', () => {
    expect(nil.check(null)).toBe(true);
    expect(nil.check('null')).toBe(false);
    expect(nil.check(Number.NaN)).toBe(false);
    expect(nil.check({})).toBe(false);
    expect(nil.check([])).toBe(false);
    expect(nil.check(undefined)).toBe(false);
  });

  test('unknown', () => {
    expect(unknown.check('foo')).toBe(true);
    expect(unknown.check(123)).toBe(true);
    expect(unknown.check({})).toBe(true);
    expect(unknown.check([])).toBe(true);
    expect(unknown.check(true)).toBe(true);
    expect(unknown.check(false)).toBe(true);
    expect(unknown.check(null)).toBe(true);
  });

  test('literal', () => {
    expect(literal('foo').check('foo')).toBe(true);
    expect(literal('foo').check('fooo')).toBe(false);
  });

  describe('any', () => {
    it('should return true if any of given checkers return true', () => {
      const checker1 = new TestChecker(true);
      const checker2 = new TestChecker(false);
      const checker3 = new TestChecker(false);
      expect(any([checker1, checker2]).check(null)).toBe(true);
      expect(any([checker1, checker3]).check(null)).toBe(true);
      expect(any([checker2, checker3]).check(null)).toBe(false);
    });
  });

  describe('nullable', () => {
    it('should return true if the value to be checked is null', () => {
      const checker = new TestChecker(false);
      expect(nullable(checker).check(null)).toBe(true);
    });

    it('should return true if the given checker returns true', () => {
      const checker = new TestChecker(true);
      expect(nullable(checker).check('any values')).toBe(true);
      expect(checker.isCalled).toBe(true);
    });
  });

  describe('array', () => {
    it('should return true if all elements are valid type', () => {
      const checker = new TestSequenceChecker([true, true, true, true, true]);
      expect(array(checker).check(Array(5).fill(null))).toBe(true);
    });

    it('should return false if even one element is wrong type', () => {
      const checker = new TestSequenceChecker([true, false, true]);
      expect(array(checker).check(Array(3).fill(null))).toBe(false);
    });
  });

  describe('object', () => {
    it('should return true if all properties are valid type', () => {
      expect(
        object({
          foo: new TestChecker(true),
          bar: new TestChecker(true),
        }).check({foo: null, bar: null})
      ).toBe(true);
    });

    it('should return false if even one property is wrong type', () => {
      expect(
        object({
          foo: new TestChecker(true),
          bar: new TestChecker(false),
        }).check({
          foo: null,
          bar: null,
        })
      ).toBe(false);
    });

    it('should return false if required property is missing', () => {
      expect(object({foo: new TestChecker(true)}).check({})).toBe(false);
      expect(object({'bar??': new TestChecker(true)}).check({})).toBe(false);
      expect(object({'foobar????????': new TestChecker(true)}).check({})).toBe(
        false
      );
    });

    it('should return true if optional property is missing', () => {
      expect(
        object({
          'foo?': new TestChecker(false),
          'bar???': new TestChecker(false),
          'foobar???????': new TestChecker(false),
        }).check({})
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
