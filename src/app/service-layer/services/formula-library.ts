// https://cargoclix.atlassian.net/wiki/spaces/WFM/pages/561840133/Hyperformula+functions+to+be+implemented

import { FormulaLookupTable } from '../models/formula';

export const DATE_FUNCTIONS: FormulaLookupTable = {
  DATE: {
    name: 'DATE',
    description: 'Converts a provided year, month, and day into a date',
    example: 'DATE(1969, 7, 20)',
    formula: 'DATE(year, month, day)',
    params: [
      {
        name: 'year',
        information: 'The year component of the date.'
      },
      {
        name: 'month',
        information: 'The month component of the date.'
      },
      {
        name: 'day',
        information: 'The day component of the date.'
      }
    ]
  },
  DATEDIF: {
    name: 'DATEDIF',
    description: 'Calculates the number of days, months, or years between two dates.',
    example: 'DATEDIF("7/16/1969", "7/24/1969", "Y")',
    formula: 'DATEDIF(start_date, end_date, unit)',
    params: [
      {
        name: 'start_date',
        information: 'The start date to consider in the calculation. Date or DateTime field values can be used'
      },
      {
        name: 'end_date',
        information: 'The end date to consider in the calculation. Date or DateTime field values can be used'
      },
      {
        name: 'unit',
        information: 'A string abbreviation for unit of time. For example, "M" for month. Accepted values are "Y","M","D","MD","YM","YD".'
      }
    ]
  },
  DATEVALUE: {
    name: 'DATEVALUE',
    description: 'Converts a provided date string in a known format to a date value.',
    example: 'DATEVALUE("1969-7-20")   DATEVALUE("7/20/1969")',
    formula: 'DATEVALUE(date_string)',
    params: [
      {
        name: 'date_string',
        information: 'The string representing the date.'
      }
    ]
  },
  HOUR: {
    name: 'HOUR',
    description: 'Returns the hour component of a specific time, in numeric format.',
    example: 'HOUR("11:40:59 AM")',
    formula: 'HOUR(time)',
    params: [
      {
        name: 'time',
        information: 'The time from which to calculate the hour component.'
      }
    ]
  },
  DAY: {
    name: 'DAY',
    description: 'Returns the day of the month that a specific date falls on, in numeric format',
    example: 'DAY("7/20/1969")',
    formula: 'DAY(date)',
    params: [
      {
        name: 'date',
        information: 'The date from which to extract the day.'
      }
    ]
  },
  MINUTE: {
    name: 'MINUTE',
    description: 'Returns the minute component of a specific time, in numeric format.',
    example: 'MINUTE("11:40:59 AM")',
    formula: 'MINUTE(time)',
    params: [
      {
        name: 'time',
        information: 'The time from which to calculate the minute component.'
      }
    ]
  },
  EDATE: {
    name: 'EDATE',
    description: 'Returns a date a specified number of months before or after another date.',
    example: 'EDATE("7/20/1969", 1)',
    formula: 'EDATE(start_date, [months])',
    params: [
      {
        name: 'start_date',
        information: 'The date from which to calculate the result.'
      },
      {
        name: 'months - [optional]',
        information: 'The number of months before (negative) or after (positive) start_date to calculate.'
      }
    ]
  },
  MONTH: {
    name: 'MONTH',
    description: 'Returns the month of the year a specific date falls in, in numeric format',
    example: 'MONTH("7/20/1969")',
    formula: 'MONTH(date)',
    params: [
      {
        name: 'date',
        information: 'The date from which to extract the month.'
      }
    ]
  },
  EOMONTH: {
    name: 'EOMONTH',
    description: 'Returns a date on the last day of a month that falls a specified number of months before or after another date.',
    example: 'EOMONTH("7/20/1969", 1)',
    formula: 'EOMONTH(start_date, months)',
    params: [
      {
        name: 'start_date',
        information: 'The date from which to calculate the result.'
      },
      {
        name: 'months',
        information: 'The number of months before (negative) or after (positive) start_date to consider.'
      }
    ]
  },
  NOW: {
    name: 'NOW',
    description: 'Returns the current date and time as a date value',
    example: 'NOW()',
    formula: 'NOW()'
  },
  NETWORKDAYS: {
    name: 'NETWORKDAYS',
    description: 'Returns the number of working days between two given dates.	',
    example: 'NETWORKDAYS("7/16/1969", "7/24/1969", A1:A10)',
    formula: 'NETWORKDAYS(start_date, end_date, [holidays])',
    params: [
      {
        name: 'start_date',
        information: 'The start date of the period from which to calculate the number of net working days.'
      },
      {
        name: 'end_date',
        information: 'The end date of the period from which to calculate the number of net working days.'
      },
      {
        name: 'holidays - [optional]',
        information:
          'A range or array constant containing the date values (as returned by DATE, DATEVALUE or TO_DATE) to consider holidays.'
      }
    ]
  },
  SECOND: {
    name: 'SECOND',
    description: 'Returns the second component of a specific time, in numeric format.',
    example: 'SECOND("11:40:59 AM")',
    formula: 'SECOND(time)',
    params: [
      {
        name: 'time',
        information: 'The time from which to calculate the second component'
      }
    ]
  },
  TIME: {
    name: 'TIME',
    description:
      'Converts a provided hour, minute, and second into a time (fraction of a 24-hour day ). Will be automatically converted to "HH:mm" format when used to populate Time field value.',
    example: 'TIME(11, 40, 59)',
    formula: 'TIME(hour, minute, second)',
    params: [
      {
        name: 'hour',
        information: 'The hour component of the time.'
      },
      {
        name: 'minute',
        information: 'The minute component of the time.'
      }
    ]
  },
  TODAY: {
    name: 'TODAY',
    description: 'Returns the current date as a date value.',
    example: 'TODAY()',
    formula: 'TODAY()'
  },
  TIMEVALUE: {
    name: 'TIMEVALUE',
    description:
      'Returns the fraction of a 24-hour day the time represents. Will be automatically converted to "HH:mm" format when used to populate Time field value.',
    example: 'TIMEVALUE("8:20:00 PM"); TIMEVALUE("2:15 PM"); TIMEVALUE("14:15:30")',
    formula: 'TIMEVALUE(time_string)',
    params: [
      {
        name: 'time_string',
        information: 'The string that holds the time representation.'
      }
    ]
  },
  WEEKDAY: {
    name: 'WEEKDAY',
    description: 'Returns a number representing the day of the week of the date provided.',
    example: 'WEEKDAY("7/20/1969", 1)',
    formula: 'WEEKDAY(date, [type])',
    params: [
      {
        name: 'date',
        information: 'The date for which to determine the day of the week. Must be a date, a function returning a date type, or a number.'
      },
      {
        name: 'type - [optional]',
        information:
          'A number indicating which numbering system to use to represent weekdays. By default, counts starting with Sunday = 1. \n If type is 1, days are counted from Sunday and the value of Sunday is 1, therefore the value of Saturday is 7. \n If type is 2, days are counted from Monday and the value of Monday is 1, therefore the value of Sunday is 7. \n If type is 3, days are counted from Monday and the value of Monday is 0, therefore the value of Sunday is 6.'
      }
    ]
  },
  WEEKNUM: {
    name: 'WEEKNUM',
    description: 'Returns a number representing the week of the year where the provided date falls.',
    example: 'WEEKNUM("7/20/1969", 1)',
    formula: 'WEEKNUM(date, [type])',
    params: [
      {
        name: 'date',
        information: 'The date for which to determine the week number. Must be a date, a function returning a date type, or a number.'
      },
      {
        name: 'type - [optional]',
        information:
          'Default is 1. A number representing the day that a week starts on as well as the system used for determining the first week of the year (1=Sunday, 2=Monday).'
      }
    ]
  },
  YEAR: {
    name: 'YEAR',
    description: 'Returns the year specified by a given date.',
    example: 'YEAR("7/20/1969")',
    formula: 'YEAR(date)',
    params: [
      {
        name: 'date',
        information: 'The date from which to extract the year.'
      }
    ]
  }
};

export const LOGICAL_FUNCTIONS: FormulaLookupTable = {
  AND: {
    name: 'AND',
    description:
      'Returns true if all of the provided arguments are logically true, and false if any of the provided arguments are logically false.',
    example: 'AND(A1=1, A2=2)',
    formula: 'AND(logical_expression1, [logical_expression2, …])',
    params: [
      {
        name: 'logical_expression1',
        information:
          'An expression or reference to a field or namedExpression containing an expression that represents some logical value, i.e. TRUE or FALSE, or an expression that can be coerced to a logical value.'
      },
      {
        name: 'logical_expression2… - [optional] repeatable',
        information: 'More expressions that represent logical values.'
      }
    ]
  },
  ISODD: {
    name: 'ISODD',
    description: 'Checks whether the provided value is odd.',
    example: 'ISODD(4)',
    formula: 'ISODD(value)',
    params: [
      {
        name: 'value',
        information: 'The value to be verified as odd.'
      }
    ]
  },
  FALSE: {
    name: 'FALSE',
    description: 'Returns the logical value FALSE.',
    example: 'FALSE()',
    formula: 'FALSE()'
  },
  IF: {
    name: 'IF',
    description: 'Returns one value if a logical expression is TRUE and another if it is FALSE.',
    example: 'IF(A2 = "foo", "A2 is foo", "A2 is not foo")',
    formula: 'IF(logical_expression, value_if_true, value_if_false)',
    params: [
      {
        name: 'logical_expression',
        information:
          'An expression or reference to a field or namedExpression containing an expression that represents some logical value, i.e. TRUE or FALSE.'
      },
      {
        name: 'value_if_true',
        information: 'The value the function returns if logical_expression is TRUE.'
      },
      {
        name: 'value_if_false',
        information: 'The value the function returns if logical_expression is FALSE.'
      }
    ]
  },
  OR: {
    name: 'OR',
    description:
      'Returns true if any of the provided arguments are logically true, and false if all of the provided arguments are logically false.',
    example: 'OR(A1=1, A2=2)',
    formula: 'OR(logical_expression1, [logical_expression2, …])',
    params: [
      {
        name: 'logical_expression1',
        information:
          'An expression or reference to a cell containing an expression that represents some logical value, i.e. TRUE or FALSE, or an expression that can be coerced to a logical value.'
      },
      {
        name: 'logical_expression2… - [optional] repeatable',
        information: 'More expressions that evaluate to logical values.'
      }
    ]
  },
  NOT: {
    name: 'NOT',
    description: 'Returns the opposite of a logical value - NOT(TRUE) returns FALSE; NOT(FALSE) returns TRUE.',
    example: 'NOT(TRUE)',
    formula: 'NOT(logical_expression)',
    params: [
      {
        name: 'logical_expression',
        information: 'An expression or reference to a field or namedExpression holding an expression that represents some logical value.'
      }
    ]
  },
  TRUE: {
    name: 'TRUE',
    description: 'Returns the logical value TRUE.',
    example: 'TRUE()',
    formula: 'TRUE()'
  }
};

export const STATISTICAL_FUNCTIONS: FormulaLookupTable = {
  AVERAGE: {
    name: 'AVERAGE',
    description: 'Returns the numerical average value in a dataset, ignoring text.',
    example: 'AVERAGE(A2:A100, B2:B100)',
    formula: 'AVERAGE(value1, [value2, …])',
    params: [
      {
        name: 'value1',
        information: 'The first value or range to consider when calculating the average value.'
      },
      {
        name: 'value2… - [optional] repeatable',
        information: 'Additional values or ranges to consider when calculating the average value.'
      }
    ]
  },
  MAX: {
    name: 'MAX',
    description: 'Returns the maximum value in a numeric dataset.',
    example: 'MAX(A2:A100, 42)',
    formula: 'MAX(value1, [value2, …])',
    params: [
      {
        name: 'value1',
        information: 'The first value or range to consider when calculating the maximum value.'
      },
      {
        name: 'value2… - [optional] repeatable',
        information: 'Additional values or ranges to consider when calculating the maximum value.'
      }
    ]
  },
  MIN: {
    name: 'MIN',
    description: 'Returns the minimum value in a numeric dataset.',
    example: 'MIN(A2:A100, 5)',
    formula: 'MIN(value1, [value2, …])',
    params: [
      {
        name: 'value1',
        information: 'The first value or range to consider when calculating the minimum value.'
      },
      {
        name: 'value2… - [optional] repeatable',
        information: 'Additional values or ranges to consider when calculating the minimum value.'
      }
    ]
  }
};

export const MATH_FUNCTIONS: FormulaLookupTable = {
  ABS: {
    name: 'ABS',
    description: 'Returns the absolute value of a number.',
    example: 'ABS(-2)',
    formula: 'ABS(value)',
    params: [
      {
        name: 'value',
        information: 'The number of which to return the absolute value.'
      }
    ]
  },
  RANDBETWEEN: {
    name: 'RANDBETWEEN',
    description: 'Returns a uniformly random integer between two values, inclusive.',
    example: 'RANDBETWEEN(1, 10)',
    formula: 'RANDBETWEEN(low, high)',
    params: [
      {
        name: 'low',
        information: 'The low end of the random range.'
      },
      {
        name: 'high',
        information: 'The high end of the random range.'
      }
    ]
  },
  ROUND: {
    name: 'ROUND',
    description: 'Rounds a number to a certain number of decimal places according to standard rules.',
    example: 'ROUND(99.44, 1)',
    formula: 'ROUND(value, [places])',
    params: [
      {
        name: 'value',
        information: 'The value to round to places number of places.'
      },
      {
        name: 'places - [optional]',
        information: 'The number of decimal places to which to round.'
      }
    ]
  },
  INT: {
    name: 'INT',
    description: 'Rounds a number down to the nearest integer that is less than or equal to it.',
    example: 'INT(99.44)',
    formula: 'INT(value)',
    params: [
      {
        name: 'value',
        information: 'The value to round down to the nearest integer.'
      }
    ]
  },
  SUM: {
    name: 'SUM',
    description: 'Returns the sum of a series of numbers and/or fields/namedExpression.',
    example: 'SUM(1,2,3,4,5)',
    formula: 'SUM(value1, [value2, …])',
    params: [
      {
        name: 'value1',
        information: 'The first number or range to add together.'
      },
      {
        name: 'value2… - [optional] repeatable',
        information: 'Additional numbers or ranges to add to value1.'
      }
    ]
  },
  SUMPRODUCT: {
    name: 'SUMPRODUCT',
    description: 'Calculates the sum of the products of corresponding entries in two equal-sized arrays or ranges.',
    example: 'SUMPRODUCT(A2:C5, D2:F5)',
    formula: 'SUMPRODUCT(array1, [array2, …])',
    params: [
      {
        name: 'array1',
        information:
          'The first array or range whose entries will be multiplied with corresponding entries in the second such array or range.'
      },
      {
        name: 'array2… - [optional] repeatable',
        information:
          'The second array or range whose entries will be multiplied with corresponding entries in the first such array or range.'
      }
    ]
  },
  ['CEILING.MATH']: {
    name: 'CEILING.MATH',
    description:
      'Rounds a number up to the nearest integer multiple of specified significance, with negative numbers rounding toward or away from 0 depending on the mode.',
    example: 'CEILING.MATH(-26.2, 10, 1)',
    formula: 'CEILING.MATH(number, [significance], [mode])',
    params: [
      {
        name: 'number',
        information: 'The value to round up to the nearest integer multiple of significance.'
      },
      {
        name: 'significance - [optional]',
        information: 'The number to whose multiples number will be rounded. The sign of significance will be ignored.'
      },
      {
        name: 'mode - [optional]',
        information:
          'If number is negative, specifies the rounding direction. If 0 or blank, it is rounded towards zero. Otherwise, it is rounded away from zero.'
      }
    ]
  },
  TRUNC: {
    name: 'TRUNC',
    description: 'Truncates a number to a certain number of significant digits by omitting less significant digits.',
    example: 'TRUNC(3.141592654, 2)',
    formula: 'TRUNC(value, [places])',
    params: [
      {
        name: 'value',
        information: 'The value to be truncated.'
      },
      {
        name: 'places - [optional]',
        information: 'The number of significant digits to the right of the decimal point to retain.'
      }
    ]
  }
};

export const TEXT_FUNCTIONS: FormulaLookupTable = {
  CONCATENATE: {
    name: 'CONCATENATE',
    description: 'Appends strings to one another.',
    example: 'CONCATENATE("hello", "goodbye")',
    formula: 'CONCATENATE(string1, [string2, …])',
    params: [
      {
        name: 'string1',
        information: 'The initial string'
      },
      {
        name: 'string2… - [optional] repeatable',
        information: 'More strings to append in sequence.'
      }
    ]
  },
  CLEAN: {
    name: 'CLEAN',
    description: 'Returns the text with the non-printable ASCII characters removed.',
    example: 'CLEAN("AF"&CHAR(31))',
    formula: 'CLEAN(text)',
    params: [
      {
        name: 'text',
        information: 'The text whose non-printable characters are to be removed.'
      }
    ]
  },
  FIND: {
    name: 'FIND',
    description:
      'Returns the position at which a string is first found within text where the capitalization of letters matters. Returns #VALUE! if the string is not found.',
    example: 'FIND("def", "abcdefg", 2)',
    formula: 'FIND(search_for, text_to_search, [starting_at])',
    params: [
      {
        name: 'search_for',
        information: 'The string to look for within text_to_search.'
      },
      {
        name: 'text_to_search',
        information: 'The text to search for the first occurrence of search_for.'
      },
      {
        name: 'starting_at - [optional]',
        information: 'The character within text_to_search at which to start the search.'
      }
    ]
  },
  CHAR: {
    name: 'CHAR',
    description: 'Convert a number into a character according to the current Unicode table.',
    example: 'CHAR(97)',
    formula: 'CHAR(table_number)',
    params: [
      {
        name: 'table_number',
        information: 'The number of the character to look up from the current Unicode table in decimal format.'
      }
    ]
  },
  MID: {
    name: 'MID',
    description: 'Returns a segment of a string.',
    example: 'MID("get this", 5, 4)',
    formula: 'MID(string, starting_at, extract_length)',
    params: [
      {
        name: 'string',
        information: 'The string to extract a segment from.'
      },
      {
        name: 'starting_at',
        information: 'The index from the left of string from which to begin extracting. The first character in string has the index 1.'
      },
      {
        name: 'extract_length',
        information: 'The length of the segment to extract.'
      }
    ]
  },
  LEFT: {
    name: 'LEFT',
    description: 'Returns a substring from the beginning of a specified string.',
    example: 'LEFT("Google Sheets", 2)',
    formula: 'LEFT(string, [number_of_characters])',
    params: [
      {
        name: 'string',
        information: 'The string from which the left portion will be returned.'
      },
      {
        name: 'number_of_characters - [optional]',
        information: 'The number of characters to return from the left side of string'
      }
    ]
  },
  SUBSTITUTE: {
    name: 'SUBSTITUTE',
    description: 'Replaces existing text with new text in a string.',
    example: 'SUBSTITUTE("abcdefg", "cde", "xyz", 1)',
    formula: 'SUBSTITUTE(text_to_search, search_for, replace_with, [occurrence_number])',
    params: [
      {
        name: 'search_for',
        information: 'The string to search for within text_to_search.'
      },
      {
        name: 'replace_with',
        information: 'The string that will replace search_for.'
      },
      {
        name: 'occurrence_number - [optional]',
        information:
          'The instance of search_for within text_to_search to replace with replace_with. By default, all occurrences of search_for are replaced; however, if occurrence_number is specified, only the indicated instance of search_for is replaced.'
      }
    ]
  },
  LEN: {
    name: 'LEN',
    description: 'Returns the length of a string.',
    example: 'LEN("hello")',
    formula: 'LEN(text)',
    params: [
      {
        name: 'text',
        information: 'The string whose length will be returned.'
      }
    ]
  },
  TRIM: {
    name: 'TRIM',
    description: 'Removes leading, trailing, and repeated spaces in text.',
    example: 'TRIM("   lorem   ipsum")',
    formula: 'TRIM(text)',
    params: [
      {
        name: 'text',
        information: 'The text or reference to a field or namedExpression containing text to be trimmed.'
      }
    ]
  },
  LOWER: {
    name: 'LOWER',
    description: 'Converts a specified string to lowercase.',
    example: 'LOWER("LOREM IPSUM")',
    formula: 'LOWER(text)',
    params: [
      {
        name: 'text',
        information: 'The string to convert to lowercase.'
      }
    ]
  },
  UPPER: {
    name: 'UPPER',
    description: 'Converts a specified string to uppercase.',
    example: 'UPPER("lorem ipsum")',
    formula: 'UPPER(text)',
    params: [
      {
        name: 'text',
        information: 'The string to convert to uppercase.'
      }
    ]
  },
  REPLACE: {
    name: 'REPLACE',
    description: 'Replaces part of a text string with a different text string.',
    example: 'REPLACE("abcdefg", 1, 6, "xyz")',
    formula: 'REPLACE(text, position, length, new_text)',
    params: [
      {
        name: 'text',
        information: 'The text, a part of which will be replaced.'
      },
      {
        name: 'position',
        information: 'The position where the replacement will begin (starting from 1).'
      },
      {
        name: 'length',
        information: 'The number of characters in the text to be replaced.'
      },
      {
        name: 'new_text',
        information: 'The text which will be inserted into the original text.'
      }
    ]
  },
  RIGHT: {
    name: 'RIGHT',
    description: 'Returns a substring from the end of a specified string.',
    example: 'RIGHT("Google Sheets", 2)',
    formula: 'RIGHT(string, [number_of_characters])',
    params: [
      {
        name: 'string',
        information: 'The string from which the right portion will be returned.'
      },
      {
        name: 'number_of_characters - [optional]',
        information: 'The number of characters to return from the right side of string.'
      }
    ]
  },
  SPLIT: {
    name: 'SPLIT',
    description: 'Splits provided string using space separator and returns chunk at zero-based position specified by second argument',
    example: 'SPLIT("a b c", 1)',
    formula: 'SPLIT(text, index)',
    params: [
      {
        name: 'text',
        information: 'The text to divide.'
      },
      {
        name: 'index',
        information: 'Which chunk to return (0 - first chunk, etc)'
      }
    ]
  },
  TEXT: {
    name: 'TEXT',
    description: 'Converts a number into text according to a specified format.',
    example: 'TEXT(1.23, "$0.00")',
    formula: 'TEXT(number, format)',
    params: [
      {
        name: 'number',
        information: 'The number, date, or time to format.'
      },
      {
        name: 'format',
        information: 'The pattern by which to format the number, enclosed in quotation marks.'
      }
    ]
  },
  SEARCH: {
    name: 'SEARCH',
    description:
      'Returns the position at which a string is first found within text and ignores capitalization of letters. Returns #VALUE! if the string is not found.',
    example: 'SEARCH("def", "abcdefg", 2)',
    formula: 'SEARCH(search_for, text_to_search, [starting_at])',
    params: [
      {
        name: 'search_for',
        information: 'The string to look for within text_to_search.'
      },
      {
        name: 'text_to_search',
        information: 'The text to search for the first occurrence of search_for.'
      },
      {
        name: 'starting_at - [optional]',
        information: 'The character within text_to_search at which to start the search.'
      }
    ]
  }
};
// name: '',
// description: '',
// example: '',
// formula: '',
// params: [
//   {
//     name: '',
//     information: ''
//   }
// ]
