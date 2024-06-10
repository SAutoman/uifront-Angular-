/**
 * A set of functions that check and convert values as strings to values of the desired type
 */
export namespace Value {
  /* TYPE CONVERSION FUNCTIONS */

  /**
   * Converts an input value as a string to an appropriate type.
   *
   * If the type of the input value could not be recognized, it is considered a string and
   * returned as a string
   *
   * Examples of:
   * ```
   * Value.parse('true'): // true
   * Value.parse('null'): // null
   * Value.parse('1.25'): // 1.25
   * Value.parse('"Hello"'): // 'Hello'
   * Value.parse('Hello'): // 'Hello'
   * ```
   *
   * @param value Input value
   */
  export function parse(value: string | any): any {
    if (typeof value !== 'string') {
      return value;
    }
    if (isBoolean(value)) {
      return parseBoolean(value);
    }

    if (isNull(value)) {
      return parseNull(value);
    }

    if (isNumber(value)) {
      return parseNumber(value);
    }

    return parseString(value);
  }

  function parseBoolean(value: string): boolean {
    if (isBoolean(value)) {
      return value.toLowerCase() !== 'false';
    }

    throw new Error(`Unable to convert value "${value}" to type Boolean`);
  }

  function parseNull(value: string): any {
    if (isNull(value)) {
      return null;
    }

    throw new Error(`Unable to convert value "${value}" to type Null`);
  }

  function parseNumber(value: string): number {
    if (isNumber(value)) {
      return Number(value);
    }

    throw new Error(`Unable to convert value "${value}" to type Number`);
  }

  function parseString(value: string): string {
    return `${value}`.replace(/(^"|"$)/g, '');
  }

  /* type fn */

  function isBoolean(value: string): boolean {
    const testValue = `${value}`.toLowerCase();

    return testValue === 'true' || testValue === 'false';
  }

  function isNull(value: string): boolean {
    const testValue = `${value}`.toLowerCase();

    return testValue === 'null';
  }

  function isNumber(value: string): boolean {
    if (isNaN(Number(value))) {
      return false;
    }

    const num = parseFloat(`${value}`);

    return !isNaN(num) && isFinite(num);
  }
}
