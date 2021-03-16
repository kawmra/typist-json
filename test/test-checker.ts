import {Checker} from '../src';

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
