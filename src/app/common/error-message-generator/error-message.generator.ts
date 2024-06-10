import { ErrorMessageTypeEnum } from './error-message-type.enum';

/**
 * Error message generator.
 *
 * For form fields
 */
export class ErrorMessageGenerator {
  /**
   * Message templates.
   *
   * Variable substitution can be used in templates:
   *  - {1} - will be replaced with the value of the first variable passed to the template;
   *  - {2} - will be replaced with the value of the second variable passed to the template, and so on
   */
  private static messages = (() => {
    const messages = new Map<ErrorMessageTypeEnum, string>();

    messages.set(ErrorMessageTypeEnum.max, 'The value must be less than or equal {1}');
    messages.set(ErrorMessageTypeEnum.min, 'The value must be more than or equal {1}');
    messages.set(ErrorMessageTypeEnum.maxLength, 'The text must be shorter than or equal {1}');
    messages.set(ErrorMessageTypeEnum.minLength, 'The text length must be longer than or equal {1}');
    messages.set(ErrorMessageTypeEnum.maxDate, 'The {2} must be before or equal {1}');
    messages.set(ErrorMessageTypeEnum.minDate, 'The {2} must be after or equal {1}');
    messages.set(ErrorMessageTypeEnum.required, 'Required field');
    messages.set(ErrorMessageTypeEnum.uniqueName, 'Name is not unique');
    messages.set(ErrorMessageTypeEnum.integer, 'The number must be an integer');
    messages.set(ErrorMessageTypeEnum.decimal, 'The number must be a decimal');
    messages.set(ErrorMessageTypeEnum.pattern, 'The text is in wrong pattern: pattern is {1}');
    messages.set(ErrorMessageTypeEnum.email, 'Invalid email');
    messages.set(ErrorMessageTypeEnum.time, 'Invalid time');
    messages.set(ErrorMessageTypeEnum.date, 'Invalid date');
    messages.set(ErrorMessageTypeEnum.dateTime, 'Invalid date and time');
    messages.set(ErrorMessageTypeEnum.maxCount, 'Number of items must be less or equal to {1}');
    messages.set(ErrorMessageTypeEnum.minCount, 'Number of items must be more or equal to {1}');
    messages.set(ErrorMessageTypeEnum.invalidNumber, 'Please enter a valid number');
    messages.set(ErrorMessageTypeEnum.numberMaxLength, 'Max allowed length is {1}');
    messages.set(ErrorMessageTypeEnum.decimalLimitExceeded, 'Allowed up to 2 places of decimal');
    messages.set(ErrorMessageTypeEnum.whiteSpace, 'White spaces are not allowed');
    messages.set(ErrorMessageTypeEnum.invalidYoutubeUrl, 'Invalid YouTube video link');

    return messages;
  })();

  /**
   * Returns the text of the message by type
   *
   * @param errorType Error type
   * @param args Variables to display in the message
   *
   * @see messages
   *
   * @example ErrorMessageGenerator.get(ErrorMessageTypeEnum.max, 10 [, other variables])
   */
  static get(errorType: ErrorMessageTypeEnum, ...args: (string | number)[]): string {
    if (ErrorMessageGenerator.messages.has(errorType)) {
      let messageTemplate = ErrorMessageGenerator.messages.get(errorType);

      if (args.length) {
        args.forEach((value, valueIndex) => {
          const templatePosition = valueIndex + 1;

          messageTemplate = messageTemplate.replace(`{${templatePosition}}`, `${args[valueIndex]}`);
        });

        return messageTemplate;
      }

      return messageTemplate;
    }

    return '';
  }

  /**
   * Adds / changes message
   *
   * @param errorType Error type
   * @param template Message template
   *
   * @see messages
   */
  static add(errorType: ErrorMessageTypeEnum, template: string): void {
    ErrorMessageGenerator.messages.set(errorType, template);
  }
}
