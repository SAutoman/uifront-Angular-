export enum DateTimeAdapterEnum {
  /**
   * wrap to native mat datepicker https://material.angular.io/components/datepicker/examples
   */
  datepicker = 'datepicker',

  /**
   * wrap to @see FormlyMatDatePickerComponent
   */
  appFormlyMatDatePicker = 'appFormlyMatDatePicker',
  /**
   * wrap to @see FormlyMatTimePickerComponent
   */
  appFormlyMatTimePicker = 'appFormlyMatTimePicker',
  /**
   * wrap to @see FormlyMatDateTimePickerComponent
   */
  appFormlyMatDateTimePicker = 'appFormlyMatDateTimePicker'
}
