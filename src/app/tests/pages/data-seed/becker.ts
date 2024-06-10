import {
  DefaultValueTypeEnum,
  DynamicValueTypeEnum,
  SystemEventTypes,
  SystemValueTypeEnum
} from '@wfm/common/field/field-default-value/FieldDefaultValues';
import {
  AreaTypeEnum,
  CaseStatus,
  FieldTypeIds,
  Roles,
  FieldRenderTypeEnum,
  ValidatorType,
  IMinMaxValidatorDto,
  UiAreasEnum
} from '@wfm/service-layer';
import {
  AutomaticAddStepsEventDto,
  DifferenceCalculationEventDto,
  EventTypes,
  MathExpressionCalculationEvent,
  RawDataToCaseEventDto,
  SourceToDestinationWithPath,
  StepToCaseEventDto,
  StepToRawDataEventDto,
  UpdateCaseStatusBasedOnStepResolutionEventDto,
  UpdateRawDataBasedOnCaseEventDto,
  UpdateStatusBasedOnStepAddedEvent
} from '@wfm/service-layer/models/actionDto';
import {
  ScriptCreateListDto,
  ScriptField,
  ScriptNotificationTemplate,
  ScriptNotificationTopic,
  ScriptSchema,
  ScriptWorkflow,
  StepConfig
} from './script-types';

import { WorkflowRightsEnum } from '@wfm/service-layer';
import { enKeys } from './yard-keys-en';
import { deKeys } from './yard-keys-de';
import { ProcessStepPath, PropertyPath, PropertyPathTypeEnum } from '@wfm/service-layer/models/expressionModel';
import { TopicKindEnum, TopicSendTypeEnum } from '@wfm/service-layer/services/notification-topic.service';
import { GDCNewRawDataTemplate, GDCCasesTemplate, invitationsTemplate } from '../notification-tests/notification-template-file';
import { BeckerCasesTemplate } from '@wfm/notification-templates/becker-case-template-file';
import { BeckerNewRawDataTemplate } from '@wfm/notification-templates/becker-raw-data-template-file';

export function getYardConfig(languageKey: string) {
  let namekeys;
  if (languageKey == 'en') {
    namekeys = enKeys;
  } else {
    namekeys = deKeys;
  }

  const caseFieldsMap = {};
  caseFieldsMap['differenceWeighing_fieldKey'] = <PropertyPath>{ path: ['differenceWeighing'] };
  caseFieldsMap['grossWeight_fieldKey'] = <PropertyPath>{ path: ['grossWeight'] };

  let mathExpressionActionDto: MathExpressionCalculationEvent = {
    id: undefined,
    expression: {},
    eventType: EventTypes.MathExpressionCalculation,
    name: 'calculateDifferenceDeviation',
    formula: '((differenceWeighing_fieldKey -grossWeight_fieldKey)/grossWeight_fieldKey)*100',
    caseFields: caseFieldsMap,
    caseResultField: <PropertyPath>{ path: ['differenceDeviation'] }
  };

  let config = {
    listEntites: <ScriptCreateListDto[]>[
      {
        title: namekeys.packetCount,
        key: 'packetCount',
        parentListName: '',
        listItems: ['1', '2', '3', '4', '5']
      }
    ],
    tenantFields: <ScriptField[]>[
      {
        fieldName: 'bookId',
        displayName: namekeys.bookId,
        areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
        type: FieldTypeIds.StringField
      },
      {
        fieldName: 'bookDate',
        displayName: namekeys.bookDate,
        areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
        type: FieldTypeIds.DateField
      },
      {
        fieldName: 'bookTime',
        displayName: namekeys.bookTime,
        areaType: [AreaTypeEnum.rawData, AreaTypeEnum.case],
        type: FieldTypeIds.TimeField
      },
      {
        fieldName: 'companyName',
        displayName: namekeys.companyName,
        areaType: [AreaTypeEnum.rawData],
        type: FieldTypeIds.StringField
      },
      {
        fieldName: 'carrierName',
        displayName: namekeys.carrierName,
        areaType: [AreaTypeEnum.rawData],
        type: FieldTypeIds.StringField
      },
      {
        fieldName: 'mobilePhone',
        displayName: namekeys.mobilePhone,
        areaType: [AreaTypeEnum.rawData],
        type: FieldTypeIds.StringField
      },
      {
        fieldName: 'truckPlate',
        displayName: namekeys.truckPlate,
        areaType: [AreaTypeEnum.rawData, AreaTypeEnum.case],
        type: FieldTypeIds.StringField
      },
      {
        fieldName: 'transportOrderNumber',
        displayName: namekeys.transportOrderNumber,
        areaType: [AreaTypeEnum.rawData],
        type: FieldTypeIds.StringField
      },
      {
        fieldName: 'packetCount',
        displayName: namekeys.packetCount,
        areaType: [AreaTypeEnum.case],
        type: FieldTypeIds.IntField,
        configuration: {
          position: 0
        }
      },
      {
        fieldName: 'chargennummer',
        displayName: namekeys.chargennummer,
        areaType: [AreaTypeEnum.rawData],
        type: FieldTypeIds.StringField
      },
      {
        fieldName: 'abmessungen',
        displayName: namekeys.abmessungen,
        areaType: [AreaTypeEnum.rawData],
        type: FieldTypeIds.StringField
      },
      {
        fieldName: 'weightTon',
        displayName: namekeys.weightTon,
        areaType: [AreaTypeEnum.rawData],
        type: FieldTypeIds.DecimalField
      },
      {
        fieldName: 'supplier',
        displayName: namekeys.supplier,
        areaType: [AreaTypeEnum.rawData],
        type: FieldTypeIds.StringField
      },
      // case specific fields
      {
        fieldName: 'checkedIn',
        displayName: namekeys.checkedIn,
        areaType: [AreaTypeEnum.case],
        type: FieldTypeIds.DateTimeField
      },
      // {
      //   fieldName: 'xNumber',
      //   displayName: namekeys.xNumber,
      //   areaType: [AreaTypeEnum.case],
      //   type: FieldTypeIds.StringField
      // },
      {
        fieldName: 'firstWeighing',
        displayName: namekeys.firstWeighing,
        areaType: [AreaTypeEnum.case],
        type: FieldTypeIds.DecimalField
      },
      {
        fieldName: 'secondWeighing',
        displayName: namekeys.secondWeighing,
        areaType: [AreaTypeEnum.case],
        type: FieldTypeIds.DecimalField
      },
      {
        fieldName: 'differenceWeighing',
        displayName: namekeys.differenceWeighing,
        areaType: [AreaTypeEnum.case],
        type: FieldTypeIds.DecimalField
      },
      {
        fieldName: 'differenceDeviation',
        displayName: namekeys.differenceDeviation,
        areaType: [AreaTypeEnum.case],
        type: FieldTypeIds.DecimalField
      },
      {
        fieldName: 'unloadingBegin',
        displayName: namekeys.unloadingBegin,
        areaType: [AreaTypeEnum.case],
        type: FieldTypeIds.DateTimeField
      },
      {
        fieldName: 'unloadingBeginDriver',
        displayName: namekeys.unloadingBeginDriver,
        areaType: [AreaTypeEnum.case],
        type: FieldTypeIds.DateTimeField
      },
      {
        fieldName: 'unloadingEnd',
        displayName: namekeys.unloadingEnd,
        areaType: [AreaTypeEnum.case],
        type: FieldTypeIds.DateTimeField
      },
      {
        fieldName: 'unloadingEndDriver',
        displayName: namekeys.unloadingEndDriver,
        areaType: [AreaTypeEnum.case],
        type: FieldTypeIds.DateTimeField
      },
      {
        fieldName: 'checkedOut',
        displayName: namekeys.checkedOut,
        areaType: [AreaTypeEnum.case],
        type: FieldTypeIds.DateTimeField
      },
      {
        fieldName: 'grossWeight',
        displayName: namekeys.grossWeight,
        areaType: [AreaTypeEnum.case],
        type: FieldTypeIds.DecimalField
      },
      {
        fieldName: 'weightInTon',
        displayName: namekeys.weightInTon,
        areaType: [AreaTypeEnum.stepForm],
        type: FieldTypeIds.DecimalField
      },
      {
        fieldName: 'packingListOk',
        displayName: namekeys.packingListOk,
        areaType: [AreaTypeEnum.stepForm],
        type: FieldTypeIds.BoolField,
        configuration: {
          position: 0,
          renderType: FieldRenderTypeEnum.radio
        }
      },
      {
        fieldName: 'xNumber',
        displayName: namekeys.xNumber,
        areaType: [AreaTypeEnum.case, AreaTypeEnum.stepForm, AreaTypeEnum.rawData],
        type: FieldTypeIds.StringField
      },
      {
        fieldName: 'materialOk',
        displayName: namekeys.materialOk,
        areaType: [AreaTypeEnum.stepForm],
        type: FieldTypeIds.BoolField,
        configuration: {
          position: 0,
          renderType: FieldRenderTypeEnum.radio
        }
      },
      {
        fieldName: 'comment',
        displayName: namekeys.comment,
        areaType: [AreaTypeEnum.stepForm],
        type: FieldTypeIds.StringField
      },
      {
        fieldName: 'uploadPic',
        displayName: namekeys.uploadPic,
        areaType: [AreaTypeEnum.stepForm],
        type: FieldTypeIds.FileField
      },
      {
        fieldName: 'timeStamp',
        displayName: namekeys.timeStamp,
        areaType: [AreaTypeEnum.stepForm],
        type: FieldTypeIds.DateTimeField
      },
      // comment fields
      {
        fieldName: 'commentContent',
        displayName: namekeys.commentContent,
        areaType: [AreaTypeEnum.comment],
        type: FieldTypeIds.TextareaField
      },
      {
        fieldName: 'commentDate',
        displayName: namekeys.commentDate,
        areaType: [AreaTypeEnum.comment],
        type: FieldTypeIds.DateTimeField
      },
      {
        fieldName: 'commentAuthor',
        displayName: namekeys.commentAuthor,
        areaType: [AreaTypeEnum.comment],
        type: FieldTypeIds.StringField
      }
    ],
    rawDataSchemas: <ScriptSchema[]>[
      {
        name: 'Raw Data Schema - Yard',
        areaType: AreaTypeEnum.rawData,
        functions: [],
        status: CaseStatus.Open,
        fields: [
          {
            name: 'bookId',
            configuration: {
              position: 0
            }
          },
          {
            name: 'bookDate',
            configuration: {
              position: 1
            }
          },
          {
            name: 'bookTime',
            configuration: {
              position: 2
            }
          },
          {
            name: 'truckPlate',
            configuration: {
              position: 3
            }
          },
          {
            name: 'companyName',
            configuration: {
              position: 4
            }
          },
          {
            name: 'carrierName',
            configuration: {
              position: 5
            }
          },
          {
            name: 'mobilePhone',
            configuration: {
              position: 6
            }
          },
          {
            name: 'transportOrderNumber',
            configuration: {
              position: 7
            }
          },
          {
            name: 'chargennummer',
            configuration: {
              position: 8
            }
          },
          {
            name: 'abmessungen',
            configuration: {
              position: 9
            }
          },
          {
            name: 'weightTon',
            configuration: {
              position: 10,
              numberFormatting: {
                minFractionDigits: 0,
                maxFractionDigits: 2,
                minIntegerDigits: 1
              }
            }
          },
          {
            name: 'supplier',
            configuration: {
              position: 11
            }
          },
          {
            name: 'xNumber',
            configuration: {
              position: 12
            }
          }
        ]
      }
    ],
    commentSchemas: <ScriptSchema[]>[
      {
        name: 'Comment Schema - Yard',
        areaType: AreaTypeEnum.comment,
        functions: [],
        status: CaseStatus.Open,
        fields: [
          {
            name: 'commentContent',
            configuration: {
              position: 0,
              validators: [
                {
                  key: ValidatorType.Required,
                  value: {
                    required: true,
                    validatorType: ValidatorType.Required
                  }
                }
              ]
            }
          },
          {
            name: 'commentDate',
            configuration: {
              position: 1,
              readonly: true,
              defaultValueType: DefaultValueTypeEnum.system,
              isSystemDefault: true,
              systemDefaultType: SystemValueTypeEnum.currentDateTime,
              systemDefaultEvent: SystemEventTypes.Create
            }
          },
          {
            name: 'commentAuthor',
            configuration: {
              position: 2,
              readonly: true,
              defaultValueType: DefaultValueTypeEnum.system,
              isSystemDefault: true,
              systemDefaultType: SystemValueTypeEnum.currentUser,
              systemDefaultEvent: SystemEventTypes.Create
            }
          }
        ]
      }
    ],
    caseSchemas: <ScriptSchema[]>[
      {
        name: 'Case Schema - Yard',
        areaType: AreaTypeEnum.case,
        functions: [],
        status: CaseStatus.Open,
        rawDataSchemaName: 'Raw Data Schema - Yard',
        commentSchemaName: 'Comment Schema - Yard',

        fields: [
          {
            name: 'bookId',
            configuration: {
              position: 0
            }
          },
          {
            name: 'bookDate',
            configuration: {
              position: 1
            }
          },
          {
            name: 'bookTime',
            configuration: {
              position: 2
            }
          },
          {
            name: 'truckPlate',
            configuration: {
              position: 3
            }
          },
          {
            name: 'checkedIn',
            configuration: {
              position: 4,
              isSystemDefault: false,
              defaultValueType: DefaultValueTypeEnum.dynamic,
              dynamicValue: DynamicValueTypeEnum.currentDateTime
            }
          },
          {
            name: 'xNumber',
            configuration: {
              position: 5
            }
          },
          {
            name: 'firstWeighing',
            configuration: {
              position: 6,
              numberFormatting: {
                minFractionDigits: 0,
                maxFractionDigits: 2,
                minIntegerDigits: 1
              }
            }
          },
          {
            name: 'secondWeighing',
            configuration: {
              position: 7,
              numberFormatting: {
                minFractionDigits: 0,
                maxFractionDigits: 2,
                minIntegerDigits: 1
              }
            }
          },
          {
            name: 'differenceWeighing',
            configuration: {
              position: 8,
              numberFormatting: {
                minFractionDigits: 0,
                maxFractionDigits: 2,
                minIntegerDigits: 1
              }
            }
          },
          {
            name: 'unloadingBegin',
            configuration: {
              position: 9
            }
          },
          {
            name: 'unloadingBeginDriver',
            configuration: {
              position: 10
            }
          },
          {
            name: 'unloadingEnd',
            configuration: {
              position: 11
            }
          },
          {
            name: 'unloadingEndDriver',
            configuration: {
              position: 12
            }
          },
          {
            name: 'checkedOut',
            configuration: {
              position: 13
            }
          },
          {
            name: 'grossWeight',
            configuration: {
              position: 14,
              numberFormatting: {
                minFractionDigits: 0,
                maxFractionDigits: 2,
                minIntegerDigits: 1
              }
            }
          },
          {
            name: 'differenceDeviation',
            configuration: {
              position: 15,
              numberFormatting: {
                minFractionDigits: 0,
                maxFractionDigits: 2,
                minIntegerDigits: 1
              }
            }
          },
          {
            name: 'packetCount',
            configuration: {
              position: 16
            }
          }
        ]
      }
    ],
    stepSchemas: <ScriptSchema[]>[
      {
        name: 'Weighing Schema',
        areaType: AreaTypeEnum.stepForm,
        functions: [],
        status: CaseStatus.Open,
        fields: [
          {
            name: 'weightInTon',
            configuration: {
              position: 0,
              validators: [
                {
                  key: ValidatorType.MinMax,
                  value: <IMinMaxValidatorDto<number>>{
                    min: 15,
                    max: 50,
                    validatorType: ValidatorType.MinMax,
                    fieldType: FieldTypeIds.DecimalField
                  }
                }
              ],
              numberFormatting: {
                minFractionDigits: 0,
                maxFractionDigits: 2,
                minIntegerDigits: 1
              }
            }
          }
        ]
      },
      {
        name: 'Packing List Check Schema',
        areaType: AreaTypeEnum.stepForm,
        functions: [
          {
            name: 'Make X-Number Optional When "Packing List OK" Is True',
            ruleSet: {
              condition: 0,
              rules: [
                {
                  propertyPath: {
                    path: ['packingListOk']
                  },
                  operator: 0,
                  value: true
                }
              ]
            },
            forBackend: false,
            actionSettings: [
              {
                config: {
                  name: 'xNumber',
                  hidden: false,
                  visible: false,
                  enabled: false,
                  disabled: false,
                  useDefaultValue: false,
                  useHintMessage: false,
                  makeOptional: true
                },
                fieldPath: {
                  path: ['xNumber']
                }
              }
            ]
          }
        ],
        status: CaseStatus.Open,
        fields: [
          {
            name: 'packingListOk',
            configuration: {
              position: 0
            }
          },
          {
            name: 'xNumber',
            configuration: {
              position: 1,
              validators: [
                {
                  key: ValidatorType.Required,
                  value: {
                    required: true,
                    validatorType: ValidatorType.Required
                  }
                }
              ]
            }
          }
        ]
      },
      {
        name: 'Material Check Schema',
        areaType: AreaTypeEnum.stepForm,
        functions: [
          {
            name: 'Show Comment if Material OK is false',
            ruleSet: {
              condition: 0,
              rules: [
                {
                  propertyPath: {
                    path: ['materialOk']
                  },
                  operator: 0,
                  value: false
                }
              ]
            },
            forBackend: false,
            actionSettings: [
              {
                config: {
                  name: 'comment',
                  hidden: false,
                  visible: true,
                  enabled: false,
                  disabled: false,
                  useDefaultValue: false,
                  useHintMessage: false
                },
                fieldPath: {
                  path: ['comment']
                }
              }
            ]
          },
          {
            name: 'Show Upload Pic if Material OK is false',
            ruleSet: {
              condition: 0,
              rules: [
                {
                  propertyPath: {
                    path: ['materialOk']
                  },
                  operator: 0,
                  value: false
                }
              ]
            },
            forBackend: false,
            actionSettings: [
              {
                config: {
                  name: 'uploadPic',
                  hidden: false,
                  visible: true,
                  enabled: false,
                  disabled: false,
                  useDefaultValue: false,
                  useHintMessage: false
                },
                fieldPath: {
                  path: ['uploadPic']
                }
              }
            ]
          }
        ],
        status: CaseStatus.Open,
        fields: [
          {
            name: 'materialOk',
            configuration: {
              position: 0
            }
          },
          {
            name: 'comment',
            configuration: {
              position: 1,
              validators: [
                {
                  key: ValidatorType.Required,
                  value: {
                    required: true,
                    validatorType: ValidatorType.Required
                  }
                }
              ]
            }
          },
          {
            name: 'uploadPic',
            configuration: {
              position: 2
            }
          }
        ]
      },
      {
        name: 'TimeStamp Schema',
        areaType: AreaTypeEnum.stepForm,
        functions: [],
        status: CaseStatus.Open,
        fields: [
          {
            name: 'timeStamp',
            configuration: {
              position: 0
            }
          }
        ]
      },
      {
        name: 'Second Weighing Schema',
        areaType: AreaTypeEnum.stepForm,
        functions: [],
        status: CaseStatus.Open,
        fields: [
          {
            name: 'weightInTon',
            configuration: {
              position: 0,
              validators: [
                {
                  key: ValidatorType.MinMax,
                  value: <IMinMaxValidatorDto<number>>{
                    min: 12,
                    max: 30,
                    validatorType: ValidatorType.MinMax,
                    fieldType: FieldTypeIds.DecimalField
                  }
                }
              ],
              numberFormatting: {
                minFractionDigits: 0,
                maxFractionDigits: 2,
                minIntegerDigits: 1
              }
            }
          },
          {
            // system field, to be populated on step updating
            name: 'timeStamp',
            configuration: {
              position: 1,
              defaultValueType: DefaultValueTypeEnum.system,
              isSystemDefault: true,
              systemDefaultEvent: SystemEventTypes.Update,
              systemDefaultType: SystemValueTypeEnum.currentDateTime
            }
          }
        ]
      }
    ],
    processSteps: <StepConfig[]>[
      {
        name: namekeys.processStepFirstWeighing,
        refName: 'firstWeighingStep',
        resolution: [{ name: 'OK' }],
        schema: 'Weighing Schema',
        link: {
          defaultOverride: {
            numberOfInstances: 1,
            actions: [
              <AutomaticAddStepsEventDto>{
                name: 'addStepsOnResolved',
                eventType: EventTypes.AutomaticAddSteps,
                steps: ['packingListCheck']
              },
              <StepToCaseEventDto>{
                id: undefined,
                eventType: EventTypes.StepToCase,
                name: 'setFirstWeighingInCase',
                sourceToDestination: [
                  {
                    source: <ProcessStepPath>{
                      path: ['weightInTon'],
                      pathType: PropertyPathTypeEnum.ProcessStepPath,
                      processStepRefName: 'firstWeighingStep'
                    },
                    destination: {
                      path: ['firstWeighing'],
                      pathType: PropertyPathTypeEnum.CasePath
                    }
                  }
                ]
              }
            ]
          },
          overrides: [
            {
              name: 'Link for all statuses',
              numberOfInstances: 1,
              expression: {
                userRoles: [Roles.TenantAdmin, Roles.Tenant]
              },
              rights: [
                WorkflowRightsEnum.CanAdd,
                WorkflowRightsEnum.CanEdit,
                WorkflowRightsEnum.CanDelete,
                WorkflowRightsEnum.CanResolve,
                WorkflowRightsEnum.CanUnresolve,
                WorkflowRightsEnum.CanView
              ]
            },
            {
              name: 'Link for Done status',
              numberOfInstances: 1,
              status: 'Done',
              rights: [WorkflowRightsEnum.CanView],
              disallowedRights: [
                WorkflowRightsEnum.CanAdd,
                WorkflowRightsEnum.CanEdit,
                WorkflowRightsEnum.CanDelete,
                WorkflowRightsEnum.CanResolve,
                WorkflowRightsEnum.CanUnresolve
              ]
            }
          ]
        }
      },
      {
        name: namekeys.processStepPackingListCheck,
        refName: 'packingListCheck',
        schema: 'Packing List Check Schema',
        resolution: [{ name: 'OK' }],
        link: {
          processStepLinkRepeatableSettings: {
            resolveAtOnce: true,
            isRepeatable: true
            // linkedRawDataFieldNames: ['bookId']
          },
          defaultOverride: {
            numberOfInstances: 1,
            actions: [
              <AutomaticAddStepsEventDto>{
                name: 'addStepsOnResolved',
                eventType: EventTypes.AutomaticAddSteps,
                steps: ['unloadingBegin', 'unloadingBeginDriver'] // refName of the step that will be autoAdded
              },
              <StepToCaseEventDto>{
                id: undefined,
                eventType: EventTypes.StepToCase,
                name: 'setXNumberInCase',
                sourceToDestination: [
                  {
                    source: <ProcessStepPath>{
                      path: ['xNumber'],
                      pathType: PropertyPathTypeEnum.ProcessStepPath,
                      processStepRefName: 'packingListCheck'
                    },
                    destination: {
                      path: ['xNumber'],
                      pathType: PropertyPathTypeEnum.CasePath
                    }
                  }
                ]
              },
              <StepToRawDataEventDto>{
                id: undefined,
                eventType: EventTypes.StepToRawData,
                name: 'setXNumberInRawData',
                sourceToDestination: [
                  {
                    source: <ProcessStepPath>{
                      path: ['xNumber'],
                      pathType: PropertyPathTypeEnum.ProcessStepPath,
                      processStepRefName: 'packingListCheck'
                    },
                    destination: {
                      path: ['xNumber'],
                      pathType: PropertyPathTypeEnum.RawDataPath
                    }
                  }
                ]
              }
            ]
          },
          overrides: [
            {
              name: 'Link for all statuses',
              numberOfInstances: 1,
              expression: {
                userRoles: [Roles.TenantAdmin, Roles.Tenant]
              },
              rights: [
                WorkflowRightsEnum.CanEdit,
                WorkflowRightsEnum.CanDelete,
                WorkflowRightsEnum.CanResolve,
                WorkflowRightsEnum.CanUnresolve,
                WorkflowRightsEnum.CanView
              ]
            },
            {
              name: 'Link for all statuses2',

              numberOfInstances: 1,

              disallowedRights: [WorkflowRightsEnum.CanAdd]
            },
            {
              name: 'Link for Done Status',

              numberOfInstances: 1,

              status: 'Done',
              rights: [WorkflowRightsEnum.CanView],
              disallowedRights: [
                WorkflowRightsEnum.CanAdd,
                WorkflowRightsEnum.CanEdit,
                WorkflowRightsEnum.CanDelete,
                WorkflowRightsEnum.CanResolve,
                WorkflowRightsEnum.CanUnresolve
              ]
            }
          ]
        }
      },
      {
        name: namekeys.processStepUnloadingBegin,
        refName: 'unloadingBegin',
        schema: 'TimeStamp Schema',
        resolution: [{ name: 'OK' }],
        link: {
          defaultOverride: {
            numberOfInstances: 1,
            actions: [
              <AutomaticAddStepsEventDto>{
                id: undefined,
                name: 'addStepsOnResolved',
                eventType: EventTypes.AutomaticAddSteps,
                steps: ['materialCheck'] // refName of the step that will be autoAdded
              },
              <StepToCaseEventDto>{
                id: undefined,
                eventType: EventTypes.StepToCase,
                name: 'setUnloadingBeginInCase',
                sourceToDestination: [
                  {
                    source: <ProcessStepPath>{
                      path: ['timeStamp'],
                      pathType: PropertyPathTypeEnum.ProcessStepPath,
                      processStepRefName: 'unloadingBegin'
                    },
                    destination: {
                      path: ['unloadingBegin'],
                      pathType: PropertyPathTypeEnum.CasePath
                    }
                  }
                ]
              }
            ]
          },
          overrides: [
            {
              name: 'Link for all statuses',
              numberOfInstances: 1,
              expression: {
                userRoles: [Roles.TenantAdmin, Roles.Tenant]
              },
              rights: [
                WorkflowRightsEnum.CanEdit,
                WorkflowRightsEnum.CanDelete,
                WorkflowRightsEnum.CanResolve,
                WorkflowRightsEnum.CanUnresolve,
                WorkflowRightsEnum.CanView
              ]
            },
            {
              name: 'Link for all statuses2',
              numberOfInstances: 1,
              disallowedRights: [WorkflowRightsEnum.CanAdd]
            },
            {
              name: 'Link for Done status',
              numberOfInstances: 1,
              status: 'Done',
              rights: [WorkflowRightsEnum.CanView],
              disallowedRights: [
                WorkflowRightsEnum.CanAdd,
                WorkflowRightsEnum.CanEdit,
                WorkflowRightsEnum.CanDelete,
                WorkflowRightsEnum.CanResolve,
                WorkflowRightsEnum.CanUnresolve
              ]
            }
          ]
        }
      },
      {
        name: namekeys.processStepMaterialCheck,
        refName: 'materialCheck',
        schema: 'Material Check Schema',
        resolution: [{ name: 'OK' }],
        link: {
          processStepLinkRepeatableSettings: {
            resolveAtOnce: true,
            isRepeatable: true
            // linkedRawDataFieldNames: ['xNumber']
          },
          defaultOverride: {
            numberOfInstances: 1,
            actions: [
              <AutomaticAddStepsEventDto>{
                id: undefined,
                name: 'addStepsOnResolved',
                eventType: EventTypes.AutomaticAddSteps,
                steps: ['unloadingEnd'] // refName of the step that will be autoAdded
              }
            ]
          },
          overrides: [
            {
              name: 'Link for all statuses',
              numberOfInstances: 1,
              expression: {
                userRoles: [Roles.TenantAdmin, Roles.Tenant]
              },
              rights: [
                WorkflowRightsEnum.CanEdit,
                WorkflowRightsEnum.CanDelete,
                WorkflowRightsEnum.CanResolve,
                WorkflowRightsEnum.CanUnresolve,
                WorkflowRightsEnum.CanView
              ]
            },
            {
              name: 'Link for all statuses2',
              numberOfInstances: 1,
              disallowedRights: [WorkflowRightsEnum.CanAdd]
            },
            {
              name: 'Link for Done status',
              numberOfInstances: 1,
              status: 'Done',
              rights: [WorkflowRightsEnum.CanView],
              disallowedRights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete]
            }
          ]
        }
      },
      {
        name: namekeys.processStepUnloadingBeginDriver,
        refName: 'unloadingBeginDriver',
        schema: 'TimeStamp Schema',
        resolution: [{ name: 'OK' }],
        link: {
          defaultOverride: {
            numberOfInstances: 1,
            actions: [
              <AutomaticAddStepsEventDto>{
                id: undefined,
                name: 'addStepsOnResolved',
                eventType: EventTypes.AutomaticAddSteps,
                steps: ['unloadingEndDriver']
              },
              <StepToCaseEventDto>{
                id: undefined,
                eventType: EventTypes.StepToCase,
                name: 'setUnloadingBeginDriverInCase',
                sourceToDestination: [
                  {
                    source: <ProcessStepPath>{
                      path: ['timeStamp'],
                      pathType: PropertyPathTypeEnum.ProcessStepPath,
                      processStepRefName: 'unloadingBeginDriver'
                    },
                    destination: {
                      path: ['unloadingBeginDriver'],
                      pathType: PropertyPathTypeEnum.CasePath
                    }
                  }
                ]
              }
            ]
          },
          overrides: [
            {
              name: 'Link for all statuses',
              expression: {
                userRoles: [Roles.Supplier]
              },
              rights: [
                WorkflowRightsEnum.CanEdit,
                WorkflowRightsEnum.CanResolve,
                WorkflowRightsEnum.CanUnresolve,
                WorkflowRightsEnum.CanView
              ],
              numberOfInstances: 1
            },
            {
              name: 'Link for all statuses2',
              rights: [WorkflowRightsEnum.CanView],
              disallowedRights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanDelete],
              numberOfInstances: 1
            },
            {
              name: 'Link for Done status',

              status: 'Done',
              rights: [WorkflowRightsEnum.CanView],
              disallowedRights: [
                WorkflowRightsEnum.CanAdd,
                WorkflowRightsEnum.CanEdit,
                WorkflowRightsEnum.CanDelete,
                WorkflowRightsEnum.CanResolve,
                WorkflowRightsEnum.CanUnresolve
              ],
              numberOfInstances: 1
            }
          ]
        }
      },
      {
        name: namekeys.processStepUnloadingEnd,
        refName: 'unloadingEnd',
        schema: 'TimeStamp Schema',
        resolution: [{ name: 'OK' }],
        link: {
          defaultOverride: {
            numberOfInstances: 1,
            actions: [
              <AutomaticAddStepsEventDto>{
                id: undefined,
                name: 'addStepsOnResolved',
                eventType: EventTypes.AutomaticAddSteps,
                steps: ['secondWeighingStep']
              },
              <StepToCaseEventDto>{
                id: undefined,
                eventType: EventTypes.StepToCase,
                name: 'setUnloadingEndInCase',
                sourceToDestination: [
                  {
                    source: <ProcessStepPath>{
                      path: ['timeStamp'],
                      pathType: PropertyPathTypeEnum.ProcessStepPath,
                      processStepRefName: 'unloadingEnd'
                    },
                    destination: {
                      path: ['unloadingEnd'],
                      pathType: PropertyPathTypeEnum.CasePath
                    }
                  }
                ]
              }
            ]
          },
          overrides: [
            {
              name: 'Link for all statuses',

              expression: {
                userRoles: [Roles.TenantAdmin, Roles.Tenant]
              },
              rights: [
                WorkflowRightsEnum.CanEdit,
                WorkflowRightsEnum.CanDelete,
                WorkflowRightsEnum.CanResolve,
                WorkflowRightsEnum.CanUnresolve,
                WorkflowRightsEnum.CanView
              ],
              numberOfInstances: 1
            },
            {
              name: 'Link for all statuses2',
              disallowedRights: [WorkflowRightsEnum.CanAdd],
              numberOfInstances: 1
            },
            {
              name: 'Link for Done status',
              status: 'Done',
              rights: [WorkflowRightsEnum.CanView],
              disallowedRights: [
                WorkflowRightsEnum.CanAdd,
                WorkflowRightsEnum.CanEdit,
                WorkflowRightsEnum.CanDelete,
                WorkflowRightsEnum.CanResolve,
                WorkflowRightsEnum.CanUnresolve
              ],
              numberOfInstances: 1
            }
          ]
        }
      },
      {
        name: namekeys.processStepUnloadingEndDriver,
        refName: 'unloadingEndDriver',
        schema: 'TimeStamp Schema',
        resolution: [{ name: 'OK' }],
        link: {
          defaultOverride: {
            numberOfInstances: 1,
            actions: [
              <StepToCaseEventDto>{
                id: undefined,
                eventType: EventTypes.StepToCase,
                name: 'setUnloadingEndDriverInCase',
                sourceToDestination: [
                  {
                    source: <ProcessStepPath>{
                      path: ['timeStamp'],
                      pathType: PropertyPathTypeEnum.ProcessStepPath,
                      processStepRefName: 'unloadingEndDriver'
                    },
                    destination: {
                      path: ['unloadingEndDriver'],
                      pathType: PropertyPathTypeEnum.CasePath
                    }
                  }
                ]
              }
            ]
          },
          overrides: [
            {
              name: 'Link for all statuses',

              expression: {
                userRoles: [Roles.Supplier]
              },
              rights: [
                WorkflowRightsEnum.CanEdit,
                WorkflowRightsEnum.CanResolve,
                WorkflowRightsEnum.CanUnresolve,
                WorkflowRightsEnum.CanView
              ],
              numberOfInstances: 1
            },
            {
              name: 'Link for all statuses2',
              rights: [WorkflowRightsEnum.CanView],
              disallowedRights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanDelete],
              numberOfInstances: 1
            },
            {
              name: 'Link for Done status',

              status: 'Done',
              rights: [WorkflowRightsEnum.CanView],
              disallowedRights: [
                WorkflowRightsEnum.CanAdd,
                WorkflowRightsEnum.CanEdit,
                WorkflowRightsEnum.CanDelete,
                WorkflowRightsEnum.CanResolve,
                WorkflowRightsEnum.CanUnresolve
              ],
              numberOfInstances: 1
            }
          ]
        }
      },
      {
        name: namekeys.processStepSecondWeighing,
        refName: 'secondWeighingStep',
        schema: 'Second Weighing Schema',
        resolution: [{ name: 'OK' }],
        link: {
          defaultOverride: {
            numberOfInstances: 1,
            actions: [
              <StepToCaseEventDto>{
                id: undefined,
                eventType: EventTypes.StepToCase,
                name: 'setSecondWeighingInCase',
                sourceToDestination: [
                  {
                    source: <ProcessStepPath>{
                      path: ['weightInTon'],
                      pathType: PropertyPathTypeEnum.ProcessStepPath,
                      processStepRefName: 'secondWeighingStep'
                    },
                    destination: {
                      path: ['secondWeighing'],
                      pathType: PropertyPathTypeEnum.CasePath
                    }
                  },
                  {
                    source: <ProcessStepPath>{
                      path: ['timeStamp'],
                      pathType: PropertyPathTypeEnum.ProcessStepPath,
                      processStepRefName: 'secondWeighingStep'
                    },
                    destination: {
                      path: ['checkedOut'],
                      pathType: PropertyPathTypeEnum.CasePath
                    }
                  }
                ]
              },
              <DifferenceCalculationEventDto>{
                eventType: EventTypes.DifferenceCalculation,
                name: 'setDiffenceWeighingField',
                secondStep: {
                  path: ['firstWeighingStep', 'weightInTon']
                },
                firstStep: {
                  path: ['secondWeighingStep', 'weightInTon']
                },
                caseResultField: 'differenceWeighing'
              },
              mathExpressionActionDto,
              <UpdateCaseStatusBasedOnStepResolutionEventDto>{
                eventType: EventTypes.UpdateCaseStatusBasedOnStepResolution,
                name: 'setToDoneWhenResolved',
                refName: 'secondWeighingStep',
                resolutions: ['OK'],
                schemaId: 'Second Weighing Schema',
                statusId: 'Done'
              }
            ]
          },
          overrides: [
            {
              name: 'Link for all statuses',
              expression: {
                userRoles: [Roles.TenantAdmin, Roles.Tenant]
              },
              rights: [
                WorkflowRightsEnum.CanEdit,
                WorkflowRightsEnum.CanDelete,
                WorkflowRightsEnum.CanResolve,
                WorkflowRightsEnum.CanUnresolve,
                WorkflowRightsEnum.CanView
              ],
              numberOfInstances: 1
            },
            {
              name: 'Link for all statuses2',
              disallowedRights: [WorkflowRightsEnum.CanAdd],
              numberOfInstances: 1
            },
            {
              name: 'Link for Done status',
              status: 'Done',
              rights: [WorkflowRightsEnum.CanView],
              disallowedRights: [
                WorkflowRightsEnum.CanAdd,
                WorkflowRightsEnum.CanEdit,
                WorkflowRightsEnum.CanDelete,
                WorkflowRightsEnum.CanResolve,
                WorkflowRightsEnum.CanUnresolve
              ],
              numberOfInstances: 1
            }
          ]
        }
      }
    ],
    workflow: <ScriptWorkflow>{
      name: namekeys.workflowName,
      caseName: 'Case Schema - Yard',
      statuses: [
        {
          name: 'Open',
          position: 0,
          configuration: {
            label: 'Open Case',
            color: 'blue'
          }
        },
        {
          name: 'In Progress',
          position: 1,
          configuration: {
            label: 'Set as In Progress',
            color: 'green'
          }
        },
        {
          name: 'Done',
          position: 2,
          configuration: {
            label: 'Mark As Done',
            color: 'green'
          }
        }
      ],
      transitions: [
        {
          fromStatus: 'Open',
          toStatus: 'In Progress',
          name: 'opentToInProgresExpression',
          expression: {
            userRoles: [Roles.TenantAdmin, Roles.Tenant]
          }
        },
        {
          fromStatus: 'In Progress',
          toStatus: 'Done',
          name: 'inProgressToDoneExpression',
          expression: {
            userRoles: [Roles.TenantAdmin, Roles.Tenant]
          }
        }
      ],
      onCreateEvents: [
        <RawDataToCaseEventDto>{
          id: undefined,
          eventType: EventTypes.RawDataToCase,
          name: 'autoFillCaseFieldsFromRawData',
          sourceToDestination: [
            <SourceToDestinationWithPath>{
              destination: {
                path: ['bookDate'],
                pathType: PropertyPathTypeEnum.CasePath
              },
              source: {
                path: ['bookDate'],
                pathType: PropertyPathTypeEnum.RawDataPath
              }
            },
            <SourceToDestinationWithPath>{
              destination: {
                path: ['bookTime'],
                pathType: PropertyPathTypeEnum.CasePath
              },
              source: {
                path: ['bookTime'],
                pathType: PropertyPathTypeEnum.RawDataPath
              }
            },
            <SourceToDestinationWithPath>{
              destination: {
                path: ['truckPlate'],
                pathType: PropertyPathTypeEnum.CasePath
              },
              source: {
                path: ['truckPlate'],
                pathType: PropertyPathTypeEnum.RawDataPath
              }
            }
          ]
        }
      ],
      onDeleteEvents: [],
      onUpdateCase: [],
      onStepAddedEvents: [
        <UpdateStatusBasedOnStepAddedEvent>{
          name: 'setInProgressAction',
          eventType: EventTypes.UpdateStatusBasedOnStepAdded,
          statusId: 'In Progress'
        }
      ],
      statusEvents: [
        <UpdateRawDataBasedOnCaseEventDto>{
          id: undefined,
          eventType: EventTypes.OnRawDataAddedToCase,
          name: 'updateRawDataStatusAction'
        }
      ]
    },
    titleSettings: [
      {
        area: AreaTypeEnum.case,
        schemaName: 'Case Schema - Yard',
        schemaTitles: [
          {
            area: UiAreasEnum.caseKanbanTitle,
            keyValueSeparator: '-',
            fieldSeparator: '',
            fields: ['bookId']
          },
          {
            area: UiAreasEnum.caseQuickInfo,
            keyValueSeparator: '-',
            fieldSeparator: '',
            fields: ['bookId']
          },
          {
            area: UiAreasEnum.caseDetailTitle,
            keyValueSeparator: '-',
            fieldSeparator: '',
            fields: ['bookId']
          }
        ]
      }
    ],
    notificationTopics: notificationTopics
  };

  return config;
}

const notificationTopics: ScriptNotificationTopic[] = [
  {
    topicName: 'New EUTR articles online: Documentation required by Gries Deco Company',
    subject: 'New EUTR articles online: Documentation required by Gries Deco Company',
    description: 'New EUTR articles online: Documentation required by Gries Deco Company',
    topicKind: TopicKindEnum.NewRawData,
    topicSendType: TopicSendTypeEnum.Email,
    days: 0,
    template: <ScriptNotificationTemplate>{
      name: 'New Articles',
      template: GDCNewRawDataTemplate,
      logoId: ''
    }
  },
  {
    topicName: 'Reminder for EUTR documentation: Not processed articles in 7 days require documentation',
    subject: 'Reminder for EUTR documentation: Not processed articles in 7 days require documentation',
    description: 'Reminder for EUTR documentation: Not processed articles in 7 days require documentation',
    topicKind: TopicKindEnum.RawDataNotProcessed,
    topicSendType: TopicSendTypeEnum.Email,
    days: 7,
    template: <ScriptNotificationTemplate>{
      name: 'Not processed articles 7',
      template: BeckerNewRawDataTemplate,
      logoId: ''
    }
  },
  {
    topicName: 'Reminder for EUTR documentation: Not processed articles in 14 days require documentation',
    subject: 'Reminder for EUTR documentation: Not processed articles in 14 days require documentation',
    description: 'Reminder for EUTR documentation: Not processed articles in 14 days require documentation',
    topicKind: TopicKindEnum.RawDataNotProcessed,
    topicSendType: TopicSendTypeEnum.Email,
    days: 14,
    template: <ScriptNotificationTemplate>{
      name: 'Not processed articles 14',
      template: BeckerNewRawDataTemplate,
      logoId: ''
    }
  },
  {
    topicName: 'Kind reminder for EUTR documentation: Not processed articles in 21 days require documentation',
    subject: 'Kind reminder for EUTR documentation: Not processed articles in 21 days require documentation',
    description: 'Kind reminder for EUTR documentation: Not processed articles in 21 days require documentation',
    topicKind: TopicKindEnum.RawDataNotProcessed,
    topicSendType: TopicSendTypeEnum.Email,
    days: 21,
    template: <ScriptNotificationTemplate>{
      name: 'Not processed articles 21',
      template: BeckerNewRawDataTemplate,
      logoId: ''
    }
  },
  {
    topicName: 'URGENT reminder for EUTR documentation: Not processed articles in 28 days require documentation',
    subject: 'URGENT reminder for EUTR documentation: Not processed articles in 28 days require documentation',
    description: 'URGENT reminder for EUTR documentation: Not processed articles in 28 days require documentation',
    topicKind: TopicKindEnum.RawDataNotProcessed,
    topicSendType: TopicSendTypeEnum.Email,
    days: 28,
    template: <ScriptNotificationTemplate>{
      name: 'Not processed articles 28',
      template: BeckerNewRawDataTemplate,
      logoId: ''
    }
  },
  {
    topicName: 'New cases',
    subject: 'New cases dev',
    description: 'New cases',
    topicKind: TopicKindEnum.Cases,
    topicSendType: TopicSendTypeEnum.Email,
    days: 0,
    template: <ScriptNotificationTemplate>{
      name: 'New cases',
      template: GDCCasesTemplate,
      logoId: ''
    }
  },
  {
    topicName: 'Reminder for EUTR documentation: Not processed cases in 14 days require documentation',
    subject: 'Reminder for EUTR documentation: Not processed cases in 14 days require documentation',
    description: 'Reminder for EUTR documentation: Not processed cases in 14 days require documentation',
    topicKind: TopicKindEnum.CasesNotProcessed,
    topicSendType: TopicSendTypeEnum.Email,
    days: 14,
    template: <ScriptNotificationTemplate>{
      name: 'Not processed cases 14',
      template: BeckerCasesTemplate,
      logoId: ''
    }
  },
  {
    topicName: 'Reminder for EUTR documentation: Not processed cases in 21 days require documentation',
    subject: 'Reminder for EUTR documentation: Not processed cases in 21 days require documentation',
    description: 'Reminder for EUTR documentation: Not processed cases in 21 days require documentation',
    topicKind: TopicKindEnum.CasesNotProcessed,
    topicSendType: TopicSendTypeEnum.Email,
    days: 21,
    template: <ScriptNotificationTemplate>{
      name: 'Not processed cases 21',
      template: BeckerCasesTemplate,
      logoId: ''
    }
  },
  {
    topicName: 'Invitation to the EUTR online system of Gries Deco Company',
    subject: 'Invitation to the EUTR online system of Gries Deco Company',
    description: 'Invitation to the EUTR online system of Gries Deco Company',
    topicKind: TopicKindEnum.Invitations,
    topicSendType: TopicSendTypeEnum.Email,
    days: 0,
    template: <ScriptNotificationTemplate>{
      name: 'Invitation',
      template: invitationsTemplate,
      logoId: ''
    }
  }
];
