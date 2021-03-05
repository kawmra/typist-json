import {Validator} from '../src';

export class TestValidator implements Validator<unknown> {
  isCalled = false;
  private readonly result: boolean;

  constructor(result: boolean) {
    this.result = result;
  }

  validate(value: unknown): value is unknown {
    this.isCalled = true;
    return this.result;
  }
}

export class TestSequenceValidator implements Validator<unknown> {
  private callCount = 0;
  private readonly results: boolean[];

  constructor(results: boolean[]) {
    this.results = results;
  }

  validate(value: unknown): value is unknown {
    return this.results[this.callCount++];
  }
}
