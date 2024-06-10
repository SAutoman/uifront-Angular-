export interface ConfirmActionData {
  title: string;
  message: string;
  showProceedBtn: boolean;
  hideCancelBtn?: boolean;
  /**
   *  text that shall not be translated ('message' is being processed through translate pipe)
   */
  dynamicText?: string;
}
