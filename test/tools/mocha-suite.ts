export type TestCase = {
  expect: string;
};

/**
 * Test suites are stored in a tree:
 *   Root -- suites[] -- suites[] ...
 *        |           +- tests[]
 *        +- tests[]
 */
export class Suite {
  tests: Array<TestCase> = [];
  nestSuites: Array<Suite> = [];

  constructor(public title: string) {};

  addSuite(suite: Suite): void {
    this.nestSuites.push(suite);
  }

  addTest(test: TestCase): void {
    this.tests.push(test);
  }

  getAll(): Array<Suite> {
    if (!this.tests.length) {
      return this.nestSuites;
    }

    return [this];
  }
}
