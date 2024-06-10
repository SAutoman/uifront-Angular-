export class TestResult {
  success: boolean;

  error?: string;

  constructor(obj: Partial<TestResult>) {
    Object.assign(this, obj);
  }

  public static success(): TestResult {
    return new TestResult({ success: true });
  }

  public static failure(err: string): TestResult {
    return new TestResult({ success: false, error: err });
  }
}

export interface Test {
  name: string;
  function: () => Promise<TestResult>;
}

export interface TestWrapper {
  name: string;
  tests: Test[];
}
