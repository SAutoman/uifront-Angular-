import { createSelector } from '@ngrx/store';
import { WebHookBuilderState } from './webhooks-builder-reducer';

export const selectWebhookBuilder: (p: any) => WebHookBuilderState = (state) => state.webHookBuilder;

export const webHooksLoadingSelector = createSelector(selectWebhookBuilder, (wH) => wH.loading);
export const webHooksDetailByIdSelector = createSelector(selectWebhookBuilder, (wH) => wH.webHookDetailById);
export const webHooksListSelector = createSelector(selectWebhookBuilder, (wH) => wH.webHooksList);
export const webHooksOperationMsgSelector = createSelector(selectWebhookBuilder, (wH) => wH.webHooksOperationMessage);
export const webHooksFieldsSelector = createSelector(selectWebhookBuilder, (wH) => wH.webHookFields);
