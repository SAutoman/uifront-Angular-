import { createSelector } from '@ngrx/store';
import { NotificationBuilderState } from './notification-builder-reducer';

export const selectNfBuilder: (p: any) => NotificationBuilderState = (state) => state.nfBuilder;

export const nfBuilderLoadingSelector = createSelector(selectNfBuilder, (nf) => nf.loading);
export const nfDetailsSelector = createSelector(selectNfBuilder, (nf) => nf.notificationDetailById);
export const nfTemplatesSelector = createSelector(selectNfBuilder, (nf) => nf.notificationTemplates);
export const nfTopicsSelector = createSelector(selectNfBuilder, (nf) => nf.notificationTopics);
export const nfTopicMessageSelector = createSelector(selectNfBuilder, (nf) => nf.notificationTopicOperationMessage);
export const nfTemplateMessageSelector = createSelector(selectNfBuilder, (nf) => nf.templateOperationMessage);
export const nfTemplateDetailById = createSelector(selectNfBuilder, (nf) => nf.templateDetailsById);
export const nfNewlyAddedEntity = createSelector(selectNfBuilder, (nf) => nf.newlyAddedEntityId);
