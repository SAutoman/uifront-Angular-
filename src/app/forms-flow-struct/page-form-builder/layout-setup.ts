import { BuilderToolbarFeature, IBuilderUiLayoutSettings, IToolBarActions } from '../interface';

class DefaultLayoutSetup implements IBuilderUiLayoutSettings {
  newFormTitle = 'Build New Form';
  updateFormTitle = 'Update form';
  formPreviewTitle = 'Form Preview';
  schemaNameFieldLabel = 'Form Name';
  toolBarActions: IToolBarActions = {
    show: true,
    features: [
      BuilderToolbarFeature.setFormName,
      BuilderToolbarFeature.addField,
      BuilderToolbarFeature.manageFunctions,
      BuilderToolbarFeature.addImage,
      BuilderToolbarFeature.saveForm,
      BuilderToolbarFeature.updateForm
    ]
  };
}

export class LayoutSetup {
  private setup: IBuilderUiLayoutSettings;
  private featureMap: Map<BuilderToolbarFeature, boolean>;
  constructor(settings?: IBuilderUiLayoutSettings) {
    if (!settings) {
      this.setup = new DefaultLayoutSetup();
    } else {
      this.setup = Object.assign(new DefaultLayoutSetup(), settings);
    }

    if (!this.setup.toolBarActions) {
      this.setup.toolBarActions = {
        show: false
      };
    }
    if (!this.setup.toolBarActions.features) {
      this.setup.toolBarActions.features = [];
    }
    const featureMap = new Map<BuilderToolbarFeature, boolean>();

    this.setup.toolBarActions.features.forEach((x) => featureMap.set(x, true));
    this.featureMap = featureMap;
  }
  getFormTitle(isUpdate: boolean): string {
    if (isUpdate) {
      return this.getUpdateFormTitle();
    }
    return this.getNewFormTitle();
  }
  getNewFormTitle(): string {
    return this.setup.newFormTitle;
  }
  getUpdateFormTitle(): string {
    return this.setup.updateFormTitle;
  }
  getFormPreviewTitle(): string {
    return this.setup.formPreviewTitle;
  }

  getSchemaNameFieldLabel(): string {
    return this.setup.schemaNameFieldLabel;
  }

  useToolBar(): boolean {
    return this.setup.toolBarActions.show;
  }

  isSupportedFeature(value: BuilderToolbarFeature): boolean {
    return this.featureMap.has(value);
  }
}
