import {
  RuleSetCustomCondition,
  RuleCustomOperatorEnum,
  PropertyPathTypeEnum,
  ProcessStepPath
} from './../../../service-layer/models/expressionModel';
import { DefaultValueTypeEnum, SystemEventTypes, SystemValueTypeEnum } from '@wfm/common/field/field-default-value/FieldDefaultValues';
import {
  AreaTypeEnum,
  CaseStatus,
  FieldRenderTypeEnum,
  FieldTypeIds,
  IRegExValidatorDto,
  Roles,
  ValidatorType,
  WorkflowRightsEnum
} from '@wfm/service-layer';
import {
  EventTypes,
  StepToCaseEventDto,
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
import { TopicKindEnum, TopicSendTypeEnum } from '@wfm/service-layer/services/notification-topic.service';
import { GDCNewRawDataTemplate, GDCCasesTemplate, invitationsTemplate } from '../notification-tests/notification-template-file';
import { PorscheNewRawDataTemplate } from '@wfm/notification-templates/porsche-raw-data-template-file';
import { PorscheCasesTemplate } from '@wfm/notification-templates/porsche-case-template-file';

// LISTS
export const listEntites: ScriptCreateListDto[] = [
  {
    title: 'Relation',
    key: 'relation',
    parentListName: '',
    listItems: [
      'China',
      'China CCC',
      'Sudkorea',
      'Australien',
      'Dubai',
      'Taiwan',
      'Japan',
      'Abu Dhabi',
      'Mexiko',
      'Sudafrika',
      'Kuwait',
      'Qatar',
      'Brasilien',
      'Oman',
      'Saudi Arabien',
      'Bahrain',
      'Indien',
      'Chile',
      'Libanon',
      'Panama',
      'Agypten',
      'Peru',
      'Paraguay',
      'Singapur',
      'Neuseeland'
    ]
  },
  {
    title: 'Terminal oder Yard',
    key: 'terminalOderYard',
    parentListName: '',
    listItems: ['Terminal', 'Yard']
  },
  {
    title: 'Type',
    key: 'type',
    parentListName: '',
    listItems: ['Direct', 'Tausch']
  },
  {
    title: 'Cont.',
    key: 'cont',
    parentListName: '',
    listItems: ['20ft', '40ft']
  },
  {
    title: 'Empfangshafen',
    key: 'empfangshafen',
    parentListName: '',
    listItems: [
      'Melbourne',
      'Shanghai',
      'Manzanillo',
      'Santos',
      'Abu Dhabi',
      'Keelung',
      'Shimizu',
      'Shuwaikh',
      'Jeddah',
      'Sohar',
      'Busan',
      'Jebel Ali / Dubai',
      'Durban'
    ]
  }
];

// FIELDS
export const tenantFields: ScriptField[] = [
  {
    fieldName: 'datumUndAnmeldungUhrzeit',
    displayName: 'Datum und Anmeldung Uhrzeit',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.DateTimeField
  },
  {
    fieldName: 'relation',
    displayName: 'Relation',
    areaType: [AreaTypeEnum.rawData],
    type: FieldTypeIds.ListField,
    configuration: {
      position: 0,
      listName: 'relation',
      renderType: FieldRenderTypeEnum.select
    }
  },
  {
    fieldName: 'kundenNummer',
    displayName: 'Kunden-nummer',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'containerNummer',
    displayName: 'Container-Nummer',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.StringField,
    configuration: {
      position: 0,
      validators: [
        {
          key: ValidatorType.RegEx,
          value: <IRegExValidatorDto>{
            regEx: '[A-Z]{4}[1-9]{7}'
          }
        }
      ]
    }
  },
  {
    fieldName: 'rampe',
    displayName: 'Rampe',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.IntField
  },
  {
    fieldName: 'taraGewicht',
    displayName: 'Tara-Gewicht',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'transportbeleg',
    displayName: 'Transportbeleg',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'siegelNo',
    displayName: 'Siegel-No',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'imo',
    displayName: 'IMO',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'cont',
    displayName: 'Cont.',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.ListField,
    configuration: {
      position: 0,
      listName: 'cont',
      renderType: FieldRenderTypeEnum.select
    }
  },
  {
    fieldName: 'type',
    displayName: 'Type',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.ListField,
    configuration: {
      position: 0,
      listName: 'type',
      renderType: FieldRenderTypeEnum.select
    }
  },
  {
    fieldName: 'niO',
    displayName: 'niO',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'abzugsterminIst',
    displayName: 'Abzugstermin Ist',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.DateTimeField
  },
  {
    fieldName: 'abzugsterminSoll',
    displayName: 'Abzugstermin Soll',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.DateTimeField
  },
  {
    fieldName: 'dlReferenz',
    displayName: 'DL Referenz',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'schiff',
    displayName: 'Schiff',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'ets',
    displayName: 'ETS',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.DateField
  },
  {
    fieldName: 'eta',
    displayName: 'ETA',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.DateField
  },
  {
    fieldName: 'empfangshafen',
    displayName: 'Empfangshafen',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.ListField,
    configuration: {
      position: 0,
      listName: 'empfangshafen',
      renderType: FieldRenderTypeEnum.select
    }
  },
  {
    fieldName: 'anlieferreferenzSeehafen',
    displayName: 'Anlieferreferenz Seehafen',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'anlieferterminalSeehafen',
    displayName: 'Anlieferterminal Seehafen',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'cargoClosingSeehafen',
    displayName: 'Cargo Closing Seehafen',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.DateField
  },
  {
    fieldName: 'bemerkungen',
    displayName: 'Bemerkungen',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.TextareaField
  },
  {
    fieldName: 'yardIn',
    displayName: 'Yard In',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.DateTimeField
  },
  {
    fieldName: 'yardOutAnRampe',
    displayName: 'Yard Out an Rampe',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.DateTimeField
  },
  {
    fieldName: 'yardInVonRampe',
    displayName: 'Yard In von Rampe',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.DateTimeField
  },
  {
    fieldName: 'outFinal',
    displayName: 'Out Final',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.DateTimeField
  },
  {
    fieldName: 'bemerkung',
    displayName: 'Bemerkung',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.TextareaField
  },
  {
    fieldName: 'abweichungInH',
    displayName: 'Abweichung in h',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
    type: FieldTypeIds.TimeField
  },
  // comment fields
  {
    fieldName: 'commentContent',
    displayName: 'Comment Content',
    areaType: [AreaTypeEnum.comment],
    type: FieldTypeIds.TextareaField
  },
  {
    fieldName: 'commentDate',
    displayName: 'Comment Date',
    areaType: [AreaTypeEnum.comment],
    type: FieldTypeIds.DateTimeField
  },
  {
    fieldName: 'commentAuthor',
    displayName: 'Sender',
    areaType: [AreaTypeEnum.comment],
    type: FieldTypeIds.StringField
  },
  // step fields
  {
    fieldName: 'terminalOderYard',
    displayName: 'Terminal oder Yard',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.ListField,
    configuration: {
      position: 0,
      listName: 'terminalOderYard',
      renderType: FieldRenderTypeEnum.select
    }
  }
];

// SCHEMAS
export const rawDataSchemas: ScriptSchema[] = [
  {
    name: 'Raw Data Schema - Porsche',
    areaType: AreaTypeEnum.rawData,
    functions: [],
    status: CaseStatus.Open,
    fields: [
      {
        name: 'datumUndAnmeldungUhrzeit',
        configuration: {
          position: 1
        }
      },
      {
        name: 'relation',
        configuration: {
          position: 2
        }
      },
      {
        name: 'kundenNummer',
        configuration: {
          position: 3
        }
      },
      {
        name: 'containerNummer',
        configuration: {
          position: 4
        }
      },
      {
        name: 'rampe',
        configuration: {
          position: 5
        }
      },
      {
        name: 'taraGewicht',
        configuration: {
          position: 6
        }
      },
      {
        name: 'transportbeleg',
        configuration: {
          position: 7
        }
      },
      {
        name: 'siegelNo',
        configuration: {
          position: 8
        }
      },
      {
        name: 'imo',
        configuration: {
          position: 9
        }
      },
      {
        name: 'cont',
        configuration: {
          position: 10
        }
      },
      {
        name: 'type',
        configuration: {
          position: 11
        }
      },
      {
        name: 'niO',
        configuration: {
          position: 12
        }
      },
      {
        name: 'abzugsterminIst',
        configuration: {
          position: 13
        }
      },
      {
        name: 'abzugsterminSoll',
        configuration: {
          position: 14
        }
      },
      {
        name: 'dlReferenz',
        configuration: {
          position: 15
        }
      },
      {
        name: 'schiff',
        configuration: {
          position: 16
        }
      },
      {
        name: 'ets',
        configuration: {
          position: 17
        }
      },
      {
        name: 'eta',
        configuration: {
          position: 18
        }
      },
      {
        name: 'empfangshafen',
        configuration: {
          position: 19
        }
      },
      {
        name: 'anlieferreferenzSeehafen',
        configuration: {
          position: 20
        }
      },
      {
        name: 'anlieferterminalSeehafen',
        configuration: {
          position: 21
        }
      },
      {
        name: 'cargoClosingSeehafen',
        configuration: {
          position: 22
        }
      },
      {
        name: 'bemerkungen',
        configuration: {
          position: 23
        }
      },
      {
        name: 'yardIn',
        configuration: {
          position: 24
        }
      },
      {
        name: 'yardOutAnRampe',
        configuration: {
          position: 25
        }
      },
      {
        name: 'yardInVonRampe',
        configuration: {
          position: 26
        }
      },
      {
        name: 'outFinal',
        configuration: {
          position: 27
        }
      },
      {
        name: 'bemerkung',
        configuration: {
          position: 28
        }
      },
      {
        name: 'abweichungInH',
        configuration: {
          position: 29
        }
      }
    ]
  }
];

export const commentSchemas: ScriptSchema[] = [
  {
    name: 'Comment Schema - Porsche',
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
];

export const caseSchemas: ScriptSchema[] = [
  {
    name: 'Case Schema - Porsche',
    areaType: AreaTypeEnum.case,
    functions: [],
    status: CaseStatus.Open,
    rawDataSchemaName: 'Raw Data Schema - Porsche',
    commentSchemaName: 'Comment Schema - Porsche',

    fields: [
      {
        name: 'datumUndAnmeldungUhrzeit',
        configuration: {
          position: 1
        }
      },
      {
        name: 'relation',
        configuration: {
          position: 2
        }
      },
      {
        name: 'kundenNummer',
        configuration: {
          position: 3
        }
      },
      {
        name: 'containerNummer',
        configuration: {
          position: 4
        }
      },
      {
        name: 'rampe',
        configuration: {
          position: 5
        }
      },
      {
        name: 'taraGewicht',
        configuration: {
          position: 6
        }
      },
      {
        name: 'transportbeleg',
        configuration: {
          position: 7
        }
      },
      {
        name: 'siegelNo',
        configuration: {
          position: 8
        }
      },
      {
        name: 'imo',
        configuration: {
          position: 9
        }
      },
      {
        name: 'cont',
        configuration: {
          position: 10
        }
      },
      {
        name: 'type',
        configuration: {
          position: 11
        }
      },
      {
        name: 'niO',
        configuration: {
          position: 12
        }
      },
      {
        name: 'abzugsterminIst',
        configuration: {
          position: 13
        }
      },
      {
        name: 'abzugsterminSoll',
        configuration: {
          position: 14
        }
      },
      {
        name: 'dlReferenz',
        configuration: {
          position: 15
        }
      },
      {
        name: 'schiff',
        configuration: {
          position: 16
        }
      },
      {
        name: 'ets',
        configuration: {
          position: 17
        }
      },
      {
        name: 'eta',
        configuration: {
          position: 18
        }
      },
      {
        name: 'empfangshafen',
        configuration: {
          position: 19
        }
      },
      {
        name: 'anlieferreferenzSeehafen',
        configuration: {
          position: 20
        }
      },
      {
        name: 'anlieferterminalSeehafen',
        configuration: {
          position: 21
        }
      },
      {
        name: 'cargoClosingSeehafen',
        configuration: {
          position: 22
        }
      },
      {
        name: 'bemerkungen',
        configuration: {
          position: 23
        }
      },
      {
        name: 'yardIn',
        configuration: {
          position: 24
        }
      },
      {
        name: 'yardOutAnRampe',
        configuration: {
          position: 25
        }
      },
      {
        name: 'yardInVonRampe',
        configuration: {
          position: 26
        }
      },
      {
        name: 'outFinal',
        configuration: {
          position: 27
        }
      },
      {
        name: 'bemerkung',
        configuration: {
          position: 28
        }
      },
      {
        name: 'abweichungInH',
        configuration: {
          position: 29
        }
      }
    ]
  }
];

export const stepSchemas: ScriptSchema[] = [
  {
    name: 'D-1 Porsche',
    areaType: AreaTypeEnum.stepForm,
    functions: [],
    status: CaseStatus.Open,
    fields: [
      {
        name: 'datumUndAnmeldungUhrzeit',
        configuration: {
          position: 1
        }
      },
      {
        name: 'relation',
        configuration: {
          position: 2
        }
      },
      {
        name: 'kundenNummer',
        configuration: {
          position: 3
        }
      },
      {
        name: 'imo',
        configuration: {
          position: 4
        }
      },
      {
        name: 'abzugsterminSoll',
        configuration: {
          position: 5
        }
      },
      {
        name: 'containerNummer',
        configuration: {
          position: 6
        }
      },
      {
        name: 'rampe',
        configuration: {
          position: 7
        }
      },
      {
        name: 'transportbeleg',
        configuration: {
          position: 8
        }
      },
      {
        name: 'siegelNo',
        configuration: {
          position: 9
        }
      }
    ]
  },
  // {
  //   name: 'D-2 Porsche',
  //   areaType: AreaTypeEnum.stepForm,
  //   functions: [],
  //   status: CaseStatus.Open,
  //   fields: [
  //     {
  //       name: 'abzugsterminSoll',
  //       configuration: {
  //         position: 1
  //       }
  //     }
  //   ]
  // },
  {
    name: 'D-2 Lieferant',
    areaType: AreaTypeEnum.stepForm,
    functions: [
      {
        name: 'outFinal',
        forMappingLists: true,
        ruleSet: {
          condition: RuleSetCustomCondition.And,
          rules: [{ operator: RuleCustomOperatorEnum.Equal, value: 'Terminal', propertyPath: { path: ['terminalOderYard'] } }]
        },
        forBackend: false,
        actionSettings: [
          {
            fieldPath: { path: ['outFinal'] },
            config: {
              name: 'outFinal',
              hidden: false,
              disabled: false,
              useDefaultValue: false,
              useHintMessage: false,
              visible: true,
              enabled: true
            }
          }
        ]
      }
    ],
    status: CaseStatus.Open,
    fields: [
      {
        name: 'dlReferenz',
        configuration: {
          position: 0
        }
      },
      {
        name: 'schiff',
        configuration: {
          position: 1
        }
      },
      {
        name: 'ets',
        configuration: {
          position: 2
        }
      },
      {
        name: 'eta',
        configuration: {
          position: 3
        }
      },
      {
        name: 'empfangshafen',
        configuration: {
          position: 4
        }
      },
      {
        name: 'anlieferreferenzSeehafen',
        configuration: {
          position: 6
        }
      },
      {
        name: 'anlieferterminalSeehafen',
        configuration: {
          position: 7
        }
      },
      {
        name: 'cargoClosingSeehafen',
        configuration: {
          position: 8
        }
      },
      {
        name: 'terminalOderYard',
        configuration: {
          position: 9
        }
      },
      {
        name: 'yardInVonRampe',
        configuration: {
          position: 10
        }
      },
      {
        name: 'outFinal',
        configuration: {
          position: 11
        }
      }
    ]
  }
  // {
  //   name: 'D-4 Porsche',
  //   areaType: AreaTypeEnum.stepForm,
  //   functions: [],
  //   status: CaseStatus.Open,
  //   fields: [
  //     {
  //       name: 'containerNummer',
  //       configuration: {
  //         position: 0
  //       }
  //     },
  //     {
  //       name: 'rampe',
  //       configuration: {
  //         position: 1
  //       }
  //     }
  //   ]
  // },
  // {
  //   name: 'D-5 Porsche',
  //   areaType: AreaTypeEnum.stepForm,
  //   functions: [],
  //   status: CaseStatus.Open,
  //   fields: [
  //     {
  //       name: 'transportbeleg',
  //       configuration: {
  //         position: 0
  //       }
  //     },
  //     {
  //       name: 'siegelNo',
  //       configuration: {
  //         position: 1
  //       }
  //     }
  //   ]
  // },
  // {
  //   name: 'D-6 Lieferant',
  //   areaType: AreaTypeEnum.stepForm,
  //   functions: [],
  //   status: CaseStatus.Open,
  //   fields: [
  //     {
  //       name: 'terminalOderYard',
  //       configuration: {
  //         position: 0
  //       }
  //     },
  //     {
  //       name: 'yardInVonRampe',
  //       configuration: {
  //         position: 1
  //       }
  //     },
  //     {
  //       name: 'outFinal',
  //       configuration: {
  //         position: 2
  //       }
  //     }
  //   ]
  // }
];

// process step entities
export const processSteps: StepConfig[] = [
  {
    name: 'D-1 Porsche',
    refName: 'd1Porsche',
    resolution: [{ name: 'OK' }],
    schema: 'D-1 Porsche',
    link: {
      defaultOverride: {
        numberOfInstances: 1
      },
      overrides: [
        {
          name: 'allStatusesLink',
          expression: {
            userRoles: [Roles.TenantAdmin, Roles.Tenant]
          },
          rights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanUnresolve,
            WorkflowRightsEnum.CanView
          ],
          numberOfInstances: 1
        },
        {
          name: 'openStatusLink',
          status: 'Open',
          expression: {
            userRoles: [Roles.TenantAdmin, Roles.Tenant]
          },
          rights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanUnresolve,
            WorkflowRightsEnum.CanView
          ],
          numberOfInstances: 1
        },
        {
          name: 'inProgressStatusLink',
          status: 'In Progress',
          expression: {
            userRoles: [Roles.TenantAdmin, Roles.Tenant]
          },
          rights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanUnresolve,
            WorkflowRightsEnum.CanView
          ],
          numberOfInstances: 1
        },
        {
          name: 'doneStatusLink',
          status: 'Done',
          expression: {
            userRoles: [Roles.TenantAdmin, Roles.Tenant]
          },
          rights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanUnresolve,
            WorkflowRightsEnum.CanView
          ],
          numberOfInstances: 1,
          actions: [
            <StepToCaseEventDto>{
              id: undefined,
              eventType: EventTypes.StepToCase,
              name: 'setD1InCase',
              sourceToDestination: [
                {
                  source: <ProcessStepPath>{
                    path: ['datumUndAnmeldungUhrzeit'],
                    pathType: PropertyPathTypeEnum.ProcessStepPath,
                    processStepRefName: 'd1Porsche'
                  },
                  destination: {
                    path: ['datumUndAnmeldungUhrzeit'],
                    pathType: PropertyPathTypeEnum.CasePath
                  }
                },
                {
                  source: <ProcessStepPath>{
                    path: ['relation'],
                    pathType: PropertyPathTypeEnum.ProcessStepPath,
                    processStepRefName: 'd1Porsche'
                  },
                  destination: {
                    path: ['relation'],
                    pathType: PropertyPathTypeEnum.CasePath
                  }
                },
                {
                  source: <ProcessStepPath>{
                    path: ['kundenNummer'],
                    pathType: PropertyPathTypeEnum.ProcessStepPath,
                    processStepRefName: 'd1Porsche'
                  },
                  destination: {
                    path: ['kundenNummer'],
                    pathType: PropertyPathTypeEnum.CasePath
                  }
                },
                {
                  source: <ProcessStepPath>{
                    path: ['imo'],
                    pathType: PropertyPathTypeEnum.ProcessStepPath,
                    processStepRefName: 'd1Porsche'
                  },
                  destination: {
                    path: ['imo'],
                    pathType: PropertyPathTypeEnum.CasePath
                  }
                },
                {
                  source: <ProcessStepPath>{
                    path: ['cont'],
                    pathType: PropertyPathTypeEnum.ProcessStepPath,
                    processStepRefName: 'd1Porsche'
                  },
                  destination: {
                    path: ['cont'],
                    pathType: PropertyPathTypeEnum.CasePath
                  }
                },
                {
                  source: <ProcessStepPath>{
                    path: ['abzugsterminSoll'],
                    pathType: PropertyPathTypeEnum.ProcessStepPath,
                    processStepRefName: 'd1Porsche'
                  },
                  destination: {
                    path: ['abzugsterminSoll'],
                    pathType: PropertyPathTypeEnum.CasePath
                  }
                },
                {
                  source: <ProcessStepPath>{
                    path: ['containerNummer'],
                    pathType: PropertyPathTypeEnum.ProcessStepPath,
                    processStepRefName: 'd1Porsche'
                  },
                  destination: {
                    path: ['containerNummer'],
                    pathType: PropertyPathTypeEnum.CasePath
                  }
                },
                {
                  source: <ProcessStepPath>{
                    path: ['rampe'],
                    pathType: PropertyPathTypeEnum.ProcessStepPath,
                    processStepRefName: 'd1Porsche'
                  },
                  destination: {
                    path: ['rampe'],
                    pathType: PropertyPathTypeEnum.CasePath
                  }
                },
                {
                  source: <ProcessStepPath>{
                    path: ['transportbeleg'],
                    pathType: PropertyPathTypeEnum.ProcessStepPath,
                    processStepRefName: 'd1Porsche'
                  },
                  destination: {
                    path: ['transportbeleg'],
                    pathType: PropertyPathTypeEnum.CasePath
                  }
                },
                {
                  source: <ProcessStepPath>{
                    path: ['siegelNo'],
                    pathType: PropertyPathTypeEnum.ProcessStepPath,
                    processStepRefName: 'd1Porsche'
                  },
                  destination: {
                    path: ['siegelNo'],
                    pathType: PropertyPathTypeEnum.CasePath
                  }
                }
              ]
            }
          ]
        },
        {
          name: 'reopenedStatusLink',
          status: 'Reopened',
          expression: {
            userRoles: [Roles.TenantAdmin, Roles.Tenant]
          },
          rights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanUnresolve,
            WorkflowRightsEnum.CanView
          ],
          numberOfInstances: 1
        }
      ]
    }

    // processStepLinks: [
    // {
    //   status: 'All',
    //   expressions: {},
    //   numberOfInstances: 1,
    //   actions: []
    // },
    // {
    //   status: 'All',
    //   expressions: {
    //     userRoles: [Roles.TenantAdmin, Roles.Tenant]
    //   },
    //   rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
    //   numberOfInstances: 1
    // },
    // {
    //   status: 'Open',
    //   expressions: {
    //     userRoles: [Roles.TenantAdmin, Roles.Tenant]
    //   },
    //   rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
    //   numberOfInstances: 1
    // },
    // {
    //   status: 'In Progress',
    //   expressions: {
    //     userRoles: [Roles.TenantAdmin, Roles.Tenant]
    //   },
    //   rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
    //   numberOfInstances: 1
    // },
    // {
    //   status: 'Done',
    //   expressions: {
    //     userRoles: [Roles.TenantAdmin, Roles.Tenant]
    //   },
    //   rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
    //   numberOfInstances: 1,
    //   actions: [
    //     <StepToCaseEventDto>{
    //       id: undefined,
    //       eventType: EventTypes.StepToCase,
    //       name: 'setD1InCase',
    //       sourceToDestination: [
    //         {
    //           source: 'datumUndAnmeldungUhrzeit',
    //           destination: 'datumUndAnmeldungUhrzeit'
    //         },
    //         {
    //           source: 'relation',
    //           destination: 'relation'
    //         },
    //         {
    //           source: 'kundenNummer',
    //           destination: 'kundenNummer'
    //         },
    //         {
    //           source: 'imo',
    //           destination: 'imo'
    //         },
    //         {
    //           source: 'cont',
    //           destination: 'cont'
    //         },
    //         {
    //           source: 'abzugsterminSoll',
    //           destination: 'abzugsterminSoll'
    //         },
    //         {
    //           source: 'containerNummer',
    //           destination: 'containerNummer'
    //         },
    //         {
    //           source: 'rampe',
    //           destination: 'rampe'
    //         },
    //         {
    //           source: 'transportbeleg',
    //           destination: 'transportbeleg'
    //         },
    //         {
    //           source: 'siegelNo',
    //           destination: 'siegelNo'
    //         }
    //       ]
    //     }
    //   ]
    // },
    // {
    //   status: 'Reopened',
    //   expressions: {
    //     userRoles: [Roles.TenantAdmin, Roles.Tenant]
    //   },
    //   rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
    //   numberOfInstances: 1
    // }
    // ]
  },
  // {
  //   name: 'D-2 Porsche',
  //   refName: 'd2Porsche',
  //   resolution: [{ name: 'OK' }],
  //   schema: 'D-2 Porsche',
  //   link: {
  //     defaultOverride: {
  //       numberOfInstances: 1,
  //     },
  //     overrides: [
  //       {
  //         expression: {
  //           userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //         },
  //         rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
  //         numberOfInstances: 1
  //       },
  //       {
  //         status: 'Open',
  //         expression: {
  //           userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //         },
  //         rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
  //         numberOfInstances: 1
  //       },
  //       {
  //         status: 'In Progress',
  //         expression: {
  //           userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //         },
  //         rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
  //         numberOfInstances: 1
  //       },
  //       {
  //         status: 'Done',
  //         expression: {
  //           userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //         },
  //         rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
  //         numberOfInstances: 1,
  //         actions: [
  //           <StepToCaseEventDto>{
  //             id: undefined,
  //             eventType: EventTypes.StepToCase,
  //             name: 'setD2InCase',
  //             sourceToDestination: [
  //               {
  //                 source: 'abzugsterminSoll',
  //                 destination: 'abzugsterminSoll'
  //               }
  //             ]
  //           }
  //         ]
  //       },
  //       {
  //         status: 'Reopened',
  //         expression: {
  //           userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //         },
  //         rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
  //         numberOfInstances: 1
  //       }
  //     ]
  //   },
  //   processStepLinks: [
  //     // {
  //     //   status: 'All',
  //     //   expressions: {},
  //     //   numberOfInstances: 1,
  //     //   actions: []
  //     // },
  //     // {
  //     //   status: 'All',
  //     //   expressions: {
  //     //     userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //     //   },
  //     //   rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
  //     //   numberOfInstances: 1
  //     // },
  //     // {
  //     //   status: 'Open',
  //     //   expressions: {
  //     //     userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //     //   },
  //     //   rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
  //     //   numberOfInstances: 1
  //     // },
  //     // {
  //     //   status: 'In Progress',
  //     //   expressions: {
  //     //     userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //     //   },
  //     //   rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
  //     //   numberOfInstances: 1
  //     // },
  //     // {
  //     //   status: 'Done',
  //     //   expressions: {
  //     //     userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //     //   },
  //     //   rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
  //     //   numberOfInstances: 1,
  //     //   actions: [
  //     //     <StepToCaseEventDto>{
  //     //       id: undefined,
  //     //       eventType: EventTypes.StepToCase,
  //     //       name: 'setD2InCase',
  //     //       sourceToDestination: [
  //     //         {
  //     //           source: 'abzugsterminSoll',
  //     //           destination: 'abzugsterminSoll'
  //     //         }
  //     //       ]
  //     //     }
  //     //   ]
  //     // },
  //     // {
  //     //   status: 'Reopened',
  //     //   expressions: {
  //     //     userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //     //   },
  //     //   rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
  //     //   numberOfInstances: 1
  //     // }
  //   ]
  // },
  {
    name: 'D-2 Lieferant',
    refName: 'd2Lieferant',
    resolution: [{ name: 'OK' }],
    schema: 'D-2 Lieferant',
    link: {
      defaultOverride: {
        numberOfInstances: 1
      },
      overrides: [
        {
          name: 'allStatusesLink',
          expression: {
            userRoles: [Roles.Supplier]
          },
          rights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanUnresolve,
            WorkflowRightsEnum.CanView
          ],
          numberOfInstances: 1
        },
        {
          name: 'openStatusLink',
          status: 'Open',
          expression: {
            userRoles: [Roles.Supplier]
          },
          rights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanUnresolve,
            WorkflowRightsEnum.CanView
          ],
          numberOfInstances: 1
        },
        {
          name: 'inProgressStatusLink',
          status: 'In Progress',
          expression: {
            userRoles: [Roles.Supplier]
          },
          rights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanUnresolve,
            WorkflowRightsEnum.CanView
          ],
          numberOfInstances: 1
        },
        {
          name: 'doneStatusLink',
          status: 'Done',
          expression: {
            userRoles: [Roles.Supplier]
          },
          rights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanUnresolve,
            WorkflowRightsEnum.CanView
          ],
          numberOfInstances: 1,
          actions: [
            <StepToCaseEventDto>{
              id: undefined,
              eventType: EventTypes.StepToCase,
              name: 'setD2InCase',
              sourceToDestination: [
                {
                  source: <ProcessStepPath>{
                    path: ['dlReferenz'],
                    pathType: PropertyPathTypeEnum.ProcessStepPath,
                    processStepRefName: 'd2Lieferant'
                  },
                  destination: {
                    path: ['dlReferenz'],
                    pathType: PropertyPathTypeEnum.CasePath
                  }
                },
                {
                  source: <ProcessStepPath>{
                    path: ['schiff'],
                    pathType: PropertyPathTypeEnum.ProcessStepPath,
                    processStepRefName: 'd2Lieferant'
                  },
                  destination: {
                    path: ['schiff'],
                    pathType: PropertyPathTypeEnum.CasePath
                  }
                },
                {
                  source: <ProcessStepPath>{
                    path: ['ets'],
                    pathType: PropertyPathTypeEnum.ProcessStepPath,
                    processStepRefName: 'd2Lieferant'
                  },
                  destination: {
                    path: ['ets'],
                    pathType: PropertyPathTypeEnum.CasePath
                  }
                },
                {
                  source: <ProcessStepPath>{
                    path: ['eta'],
                    pathType: PropertyPathTypeEnum.ProcessStepPath,
                    processStepRefName: 'd2Lieferant'
                  },
                  destination: {
                    path: ['eta'],
                    pathType: PropertyPathTypeEnum.CasePath
                  }
                },
                {
                  source: <ProcessStepPath>{
                    path: ['empfangshafen'],
                    pathType: PropertyPathTypeEnum.ProcessStepPath,
                    processStepRefName: 'd2Lieferant'
                  },
                  destination: {
                    path: ['empfangshafen'],
                    pathType: PropertyPathTypeEnum.CasePath
                  }
                },
                {
                  source: <ProcessStepPath>{
                    path: ['anlieferreferenzSeehafen'],
                    pathType: PropertyPathTypeEnum.ProcessStepPath,
                    processStepRefName: 'd2Lieferant'
                  },
                  destination: {
                    path: ['anlieferreferenzSeehafen'],
                    pathType: PropertyPathTypeEnum.CasePath
                  }
                },
                {
                  source: <ProcessStepPath>{
                    path: ['anlieferterminalSeehafen'],
                    pathType: PropertyPathTypeEnum.ProcessStepPath,
                    processStepRefName: 'd2Lieferant'
                  },
                  destination: {
                    path: ['anlieferterminalSeehafen'],
                    pathType: PropertyPathTypeEnum.CasePath
                  }
                },
                {
                  source: <ProcessStepPath>{
                    path: ['cargoClosingSeehafen'],
                    pathType: PropertyPathTypeEnum.ProcessStepPath,
                    processStepRefName: 'd2Lieferant'
                  },
                  destination: {
                    path: ['cargoClosingSeehafen'],
                    pathType: PropertyPathTypeEnum.CasePath
                  }
                },
                {
                  source: <ProcessStepPath>{
                    path: ['terminalOderYard'],
                    pathType: PropertyPathTypeEnum.ProcessStepPath,
                    processStepRefName: 'd2Lieferant'
                  },
                  destination: {
                    path: ['terminalOderYard'],
                    pathType: PropertyPathTypeEnum.CasePath
                  }
                },
                {
                  source: <ProcessStepPath>{
                    path: ['yardInVonRampe'],
                    pathType: PropertyPathTypeEnum.ProcessStepPath,
                    processStepRefName: 'd2Lieferant'
                  },
                  destination: {
                    path: ['yardInVonRampe'],
                    pathType: PropertyPathTypeEnum.CasePath
                  }
                },
                {
                  source: <ProcessStepPath>{
                    path: ['outFinal'],
                    pathType: PropertyPathTypeEnum.ProcessStepPath,
                    processStepRefName: 'd2Lieferant'
                  },
                  destination: {
                    path: ['outFinal'],
                    pathType: PropertyPathTypeEnum.CasePath
                  }
                }
              ]
            }
          ]
        },
        {
          name: 'reopenedStatusLink',
          status: 'Reopened',
          expression: {
            userRoles: [Roles.Supplier]
          },
          rights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanUnresolve,
            WorkflowRightsEnum.CanView
          ],
          numberOfInstances: 1
        }
      ]
    }
    // processStepLinks: [
    // {
    //   status: 'All',
    //   expressions: {},
    //   numberOfInstances: 1,
    //   actions: []
    // },
    // {
    //   status: 'All',
    //   expressions: {
    //     userRoles: [Roles.Supplier]
    //   },
    //   rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
    //   numberOfInstances: 1
    // },
    // {
    //   status: 'Open',
    //   expressions: {
    //     userRoles: [Roles.Supplier]
    //   },
    //   rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
    //   numberOfInstances: 1
    // },
    // {
    //   status: 'In Progress',
    //   expressions: {
    //     userRoles: [Roles.Supplier]
    //   },
    //   rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
    //   numberOfInstances: 1
    // },
    // {
    //   status: 'Done',
    //   expressions: {
    //     userRoles: [Roles.Supplier]
    //   },
    //   rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
    //   numberOfInstances: 1,
    //   actions: [
    //     <StepToCaseEventDto>{
    //       id: undefined,
    //       eventType: EventTypes.StepToCase,
    //       name: 'setD2InCase',
    //       sourceToDestination: [
    //         {
    //           source: 'dlReferenz',
    //           destination: 'dlReferenz'
    //         },
    //         {
    //           source: 'schiff',
    //           destination: 'schiff'
    //         },
    //         {
    //           source: 'ets',
    //           destination: 'ets'
    //         },
    //         {
    //           source: 'eta',
    //           destination: 'eta'
    //         },
    //         {
    //           source: 'empfangshafen',
    //           destination: 'empfangshafen'
    //         },
    //         {
    //           source: 'anlieferreferenzSeehafen',
    //           destination: 'anlieferreferenzSeehafen'
    //         },
    //         {
    //           source: 'anlieferterminalSeehafen',
    //           destination: 'anlieferterminalSeehafen'
    //         },
    //         {
    //           source: 'cargoClosingSeehafen',
    //           destination: 'cargoClosingSeehafen'
    //         },
    //         {
    //           source: 'terminalOderYard',
    //           destination: 'terminalOderYard'
    //         },
    //         {
    //           source: 'yardInVonRampe',
    //           destination: 'yardInVonRampe'
    //         },
    //         {
    //           source: 'outFinal',
    //           destination: 'outFinal'
    //         }
    //       ]
    //     }
    //   ]
    // },
    // {
    //   status: 'Reopened',
    //   expressions: {
    //     userRoles: [Roles.Supplier]
    //   },
    //   rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
    //   numberOfInstances: 1
    // }
    // ]
  }
  // {
  //   name: 'D-4 Porsche',
  //   refName: 'd4Porsche',
  //   resolution: [{ name: 'OK' }],
  //   schema: 'D-4 Porsche',
  //   link: {
  //     defaultOverride: {
  //       numberOfInstances: 1,

  //     },
  //     overrides:[
  //       {
  //         expression: {
  //           userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //         },
  //         rights: [
  //           WorkflowRightsEnum.CanAdd,
  //           WorkflowRightsEnum.CanEdit,
  //           WorkflowRightsEnum.CanDelete,
  //           WorkflowRightsEnum.CanUnresolve,
  //           WorkflowRightsEnum.CanUnresolve,
  //           WorkflowRightsEnum.CanUnresolve
  //         ],
  //         numberOfInstances: 1
  //       },
  //       {
  //         status: 'Open',
  //         expression: {
  //           userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //         },
  //         rights: [
  //           WorkflowRightsEnum.CanAdd,
  //           WorkflowRightsEnum.CanEdit,
  //           WorkflowRightsEnum.CanDelete,
  //           WorkflowRightsEnum.CanUnresolve,
  //           WorkflowRightsEnum.CanUnresolve,
  //           WorkflowRightsEnum.CanUnresolve
  //         ],
  //         numberOfInstances: 1
  //       },
  //       {
  //         status: 'In Progress',
  //         expression: {
  //           userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //         },
  //         rights: [
  //           WorkflowRightsEnum.CanAdd,
  //           WorkflowRightsEnum.CanEdit,
  //           WorkflowRightsEnum.CanDelete,
  //           WorkflowRightsEnum.CanUnresolve,
  //           WorkflowRightsEnum.CanUnresolve,
  //           WorkflowRightsEnum.CanUnresolve
  //         ],
  //         numberOfInstances: 1
  //       },
  //       {
  //         status: 'Done',
  //         expression: {
  //           userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //         },
  //         rights: [
  //           WorkflowRightsEnum.CanAdd,
  //           WorkflowRightsEnum.CanEdit,
  //           WorkflowRightsEnum.CanDelete,
  //           WorkflowRightsEnum.CanUnresolve,
  //           WorkflowRightsEnum.CanUnresolve,
  //           WorkflowRightsEnum.CanUnresolve
  //         ],
  //         numberOfInstances: 1,
  //         actions: [
  //           <StepToCaseEventDto>{
  //             id: undefined,
  //             eventType: EventTypes.StepToCase,
  //             name: 'setD4InCase',
  //             sourceToDestination: [
  //               {
  //                 source: 'containerNummer',
  //                 destination: 'containerNummer'
  //               },
  //               {
  //                 source: 'rampe',
  //                 destination: 'rampe'
  //               }
  //             ]
  //           }
  //         ]
  //       },
  //       {
  //         status: 'Reopened',
  //         expression: {
  //           userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //         },
  //         rights: [
  //           WorkflowRightsEnum.CanAdd,
  //           WorkflowRightsEnum.CanEdit,
  //           WorkflowRightsEnum.CanDelete,
  //           WorkflowRightsEnum.CanUnresolve,
  //           WorkflowRightsEnum.CanUnresolve,
  //           WorkflowRightsEnum.CanUnresolve
  //         ],
  //         numberOfInstances: 1
  //       }
  //     ]
  //   },
  //   processStepLinks: [
  //     // {
  //     //   status: 'All',
  //     //   expressions: {},
  //     //   numberOfInstances: 1,
  //     //   actions: []
  //     // },
  //     // {
  //     //   status: 'All',
  //     //   expressions: {
  //     //     userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //     //   },
  //     //   rights: [
  //     //     WorkflowRightsEnum.CanAdd,
  //     //     WorkflowRightsEnum.CanEdit,
  //     //     WorkflowRightsEnum.CanDelete,
  //     //     WorkflowRightsEnum.CanUnresolve,
  //     //     WorkflowRightsEnum.CanUnresolve,
  //     //     WorkflowRightsEnum.CanUnresolve
  //     //   ],
  //     //   numberOfInstances: 1
  //     // },
  //     // {
  //     //   status: 'Open',
  //     //   expressions: {
  //     //     userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //     //   },
  //     //   rights: [
  //     //     WorkflowRightsEnum.CanAdd,
  //     //     WorkflowRightsEnum.CanEdit,
  //     //     WorkflowRightsEnum.CanDelete,
  //     //     WorkflowRightsEnum.CanUnresolve,
  //     //     WorkflowRightsEnum.CanUnresolve,
  //     //     WorkflowRightsEnum.CanUnresolve
  //     //   ],
  //     //   numberOfInstances: 1
  //     // },
  //     // {
  //     //   status: 'In Progress',
  //     //   expressions: {
  //     //     userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //     //   },
  //     //   rights: [
  //     //     WorkflowRightsEnum.CanAdd,
  //     //     WorkflowRightsEnum.CanEdit,
  //     //     WorkflowRightsEnum.CanDelete,
  //     //     WorkflowRightsEnum.CanUnresolve,
  //     //     WorkflowRightsEnum.CanUnresolve,
  //     //     WorkflowRightsEnum.CanUnresolve
  //     //   ],
  //     //   numberOfInstances: 1
  //     // },
  //     // {
  //     //   status: 'Done',
  //     //   expressions: {
  //     //     userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //     //   },
  //     //   rights: [
  //     //     WorkflowRightsEnum.CanAdd,
  //     //     WorkflowRightsEnum.CanEdit,
  //     //     WorkflowRightsEnum.CanDelete,
  //     //     WorkflowRightsEnum.CanUnresolve,
  //     //     WorkflowRightsEnum.CanUnresolve,
  //     //     WorkflowRightsEnum.CanUnresolve
  //     //   ],
  //     //   numberOfInstances: 1,
  //     //   actions: [
  //     //     <StepToCaseEventDto>{
  //     //       id: undefined,
  //     //       eventType: EventTypes.StepToCase,
  //     //       name: 'setD4InCase',
  //     //       sourceToDestination: [
  //     //         {
  //     //           source: 'containerNummer',
  //     //           destination: 'containerNummer'
  //     //         },
  //     //         {
  //     //           source: 'rampe',
  //     //           destination: 'rampe'
  //     //         }
  //     //       ]
  //     //     }
  //     //   ]
  //     // },
  //     // {
  //     //   status: 'Reopened',
  //     //   expressions: {
  //     //     userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //     //   },
  //     //   rights: [
  //     //     WorkflowRightsEnum.CanAdd,
  //     //     WorkflowRightsEnum.CanEdit,
  //     //     WorkflowRightsEnum.CanDelete,
  //     //     WorkflowRightsEnum.CanUnresolve,
  //     //     WorkflowRightsEnum.CanUnresolve,
  //     //     WorkflowRightsEnum.CanUnresolve
  //     //   ],
  //     //   numberOfInstances: 1
  //     // }
  //   ]
  // },
  // {
  //   name: 'D-5 Porsche',
  //   refName: 'd5Porsche',
  //   resolution: [{ name: 'OK' }],
  //   schema: 'D-5 Porsche',
  //   link: {
  //     defaultOverride: {
  //       numberOfInstances: 1,

  //     },
  //     overrides:[
  //       {
  //         expression: {
  //           userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //         },
  //         rights: [
  //           WorkflowRightsEnum.CanAdd,
  //           WorkflowRightsEnum.CanEdit,
  //           WorkflowRightsEnum.CanDelete,
  //           WorkflowRightsEnum.CanUnresolve,
  //           WorkflowRightsEnum.CanUnresolve
  //         ],
  //         numberOfInstances: 1
  //       },
  //       {
  //         status: 'Open',
  //         expression: {
  //           userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //         },
  //         rights: [
  //           WorkflowRightsEnum.CanAdd,
  //           WorkflowRightsEnum.CanEdit,
  //           WorkflowRightsEnum.CanDelete,
  //           WorkflowRightsEnum.CanUnresolve,
  //           WorkflowRightsEnum.CanUnresolve
  //         ],
  //         numberOfInstances: 1
  //       },
  //       {
  //         status: 'In Progress',
  //         expression: {
  //           userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //         },
  //         rights: [
  //           WorkflowRightsEnum.CanAdd,
  //           WorkflowRightsEnum.CanEdit,
  //           WorkflowRightsEnum.CanDelete,
  //           WorkflowRightsEnum.CanUnresolve,
  //           WorkflowRightsEnum.CanUnresolve
  //         ],
  //         numberOfInstances: 1
  //       },
  //       {
  //         status: 'Done',
  //         expression: {
  //           userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //         },
  //         rights: [
  //           WorkflowRightsEnum.CanAdd,
  //           WorkflowRightsEnum.CanEdit,
  //           WorkflowRightsEnum.CanDelete,
  //           WorkflowRightsEnum.CanUnresolve,
  //           WorkflowRightsEnum.CanUnresolve
  //         ],
  //         numberOfInstances: 1,
  //         actions: [
  //           <StepToCaseEventDto>{
  //             id: undefined,
  //             eventType: EventTypes.StepToCase,
  //             name: 'setD5InCase',
  //             sourceToDestination: [
  //               {
  //                 source: 'transportbeleg',
  //                 destination: 'transportbeleg'
  //               },
  //               {
  //                 source: 'siegelNo',
  //                 destination: 'siegelNo'
  //               }
  //             ]
  //           }
  //         ]
  //       },
  //       {
  //         status: 'Reopened',
  //         expression: {
  //           userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //         },
  //         rights: [
  //           WorkflowRightsEnum.CanAdd,
  //           WorkflowRightsEnum.CanEdit,
  //           WorkflowRightsEnum.CanDelete,
  //           WorkflowRightsEnum.CanUnresolve,
  //           WorkflowRightsEnum.CanUnresolve
  //         ],
  //         numberOfInstances: 1
  //       }
  //     ]
  //   },
  //   processStepLinks: [
  //     // {
  //     //   status: 'All',
  //     //   expressions: {},
  //     //   numberOfInstances: 1,
  //     //   actions: []
  //     // },
  //     // {
  //     //   status: 'All',
  //     //   expressions: {
  //     //     userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //     //   },
  //     //   rights: [
  //     //     WorkflowRightsEnum.CanAdd,
  //     //     WorkflowRightsEnum.CanEdit,
  //     //     WorkflowRightsEnum.CanDelete,
  //     //     WorkflowRightsEnum.CanUnresolve,
  //     //     WorkflowRightsEnum.CanUnresolve
  //     //   ],
  //     //   numberOfInstances: 1
  //     // },
  //     // {
  //     //   status: 'Open',
  //     //   expressions: {
  //     //     userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //     //   },
  //     //   rights: [
  //     //     WorkflowRightsEnum.CanAdd,
  //     //     WorkflowRightsEnum.CanEdit,
  //     //     WorkflowRightsEnum.CanDelete,
  //     //     WorkflowRightsEnum.CanUnresolve,
  //     //     WorkflowRightsEnum.CanUnresolve
  //     //   ],
  //     //   numberOfInstances: 1
  //     // },
  //     // {
  //     //   status: 'In Progress',
  //     //   expressions: {
  //     //     userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //     //   },
  //     //   rights: [
  //     //     WorkflowRightsEnum.CanAdd,
  //     //     WorkflowRightsEnum.CanEdit,
  //     //     WorkflowRightsEnum.CanDelete,
  //     //     WorkflowRightsEnum.CanUnresolve,
  //     //     WorkflowRightsEnum.CanUnresolve
  //     //   ],
  //     //   numberOfInstances: 1
  //     // },
  //     // {
  //     //   status: 'Done',
  //     //   expressions: {
  //     //     userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //     //   },
  //     //   rights: [
  //     //     WorkflowRightsEnum.CanAdd,
  //     //     WorkflowRightsEnum.CanEdit,
  //     //     WorkflowRightsEnum.CanDelete,
  //     //     WorkflowRightsEnum.CanUnresolve,
  //     //     WorkflowRightsEnum.CanUnresolve
  //     //   ],
  //     //   numberOfInstances: 1,
  //     //   actions: [
  //     //     <StepToCaseEventDto>{
  //     //       id: undefined,
  //     //       eventType: EventTypes.StepToCase,
  //     //       name: 'setD5InCase',
  //     //       sourceToDestination: [
  //     //         {
  //     //           source: 'transportbeleg',
  //     //           destination: 'transportbeleg'
  //     //         },
  //     //         {
  //     //           source: 'siegelNo',
  //     //           destination: 'siegelNo'
  //     //         }
  //     //       ]
  //     //     }
  //     //   ]
  //     // },
  //     // {
  //     //   status: 'Reopened',
  //     //   expressions: {
  //     //     userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //     //   },
  //     //   rights: [
  //     //     WorkflowRightsEnum.CanAdd,
  //     //     WorkflowRightsEnum.CanEdit,
  //     //     WorkflowRightsEnum.CanDelete,
  //     //     WorkflowRightsEnum.CanUnresolve,
  //     //     WorkflowRightsEnum.CanUnresolve
  //     //   ],
  //     //   numberOfInstances: 1
  //     // }
  //   ]
  // },
  // {
  //   name: 'D-6 Lieferant',
  //   refName: 'd6Lieferant',
  //   resolution: [{ name: 'OK' }],
  //   schema: 'D-6 Lieferant',
  //   link: {
  //     defaultOverride: {
  //       numberOfInstances: 1,

  //     },
  //     overrides: [
  //       {
  //         expression: {
  //           userRoles: [Roles.Supplier]
  //         },
  //         rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
  //         numberOfInstances: 1
  //       },
  //       {
  //         status: 'Open',
  //         expression: {
  //           userRoles: [Roles.Supplier]
  //         },
  //         rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
  //         numberOfInstances: 1
  //       },
  //       {
  //         status: 'In Progress',
  //         expression: {
  //           userRoles: [Roles.Supplier]
  //         },
  //         rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
  //         numberOfInstances: 1
  //       },
  //       {
  //         status: 'Done',
  //         expression: {
  //           userRoles: [Roles.Supplier]
  //         },
  //         rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
  //         numberOfInstances: 1,
  //         actions: [
  //           <StepToCaseEventDto>{
  //             id: undefined,
  //             eventType: EventTypes.StepToCase,
  //             name: 'setD6InCase',
  //             sourceToDestination: [
  //               {
  //                 source: 'terminalOderYard',
  //                 destination: 'terminalOderYard'
  //               },
  //               {
  //                 source: 'yardInVonRampe',
  //                 destination: 'yardInVonRampe'
  //               },
  //               {
  //                 source: 'outFinal',
  //                 destination: 'outFinal'
  //               }
  //             ]
  //           }
  //         ]
  //       },
  //       {
  //         status: 'Reopened',
  //         expression: {
  //           userRoles: [Roles.Supplier]
  //         },
  //         rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
  //         numberOfInstances: 1
  //       }
  //     ]
  //   },
  //   processStepLinks: [
  //     // {
  //     //   status: 'All',
  //     //   expressions: {},
  //     //   numberOfInstances: 1,
  //     //   actions: []
  //     // },
  //     // {
  //     //   status: 'All',
  //     //   expressions: {
  //     //     userRoles: [Roles.Supplier]
  //     //   },
  //     //   rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
  //     //   numberOfInstances: 1
  //     // },
  //     // {
  //     //   status: 'Open',
  //     //   expressions: {
  //     //     userRoles: [Roles.Supplier]
  //     //   },
  //     //   rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
  //     //   numberOfInstances: 1
  //     // },
  //     // {
  //     //   status: 'In Progress',
  //     //   expressions: {
  //     //     userRoles: [Roles.Supplier]
  //     //   },
  //     //   rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
  //     //   numberOfInstances: 1
  //     // },
  //     // {
  //     //   status: 'Done',
  //     //   expressions: {
  //     //     userRoles: [Roles.Supplier]
  //     //   },
  //     //   rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
  //     //   numberOfInstances: 1,
  //     //   actions: [
  //     //     <StepToCaseEventDto>{
  //     //       id: undefined,
  //     //       eventType: EventTypes.StepToCase,
  //     //       name: 'setD6InCase',
  //     //       sourceToDestination: [
  //     //         {
  //     //           source: 'terminalOderYard',
  //     //           destination: 'terminalOderYard'
  //     //         },
  //     //         {
  //     //           source: 'yardInVonRampe',
  //     //           destination: 'yardInVonRampe'
  //     //         },
  //     //         {
  //     //           source: 'outFinal',
  //     //           destination: 'outFinal'
  //     //         }
  //     //       ]
  //     //     }
  //     //   ]
  //     // },
  //     // {
  //     //   status: 'Reopened',
  //     //   expressions: {
  //     //     userRoles: [Roles.Supplier]
  //     //   },
  //     //   rights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanUnresolve],
  //     //   numberOfInstances: 1
  //     // }
  //   ]
  // }
];

// workflow
export const workflow: ScriptWorkflow = {
  name: 'Direct',
  caseName: 'Case Schema - Porsche',
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
        label: 'Start Progress',
        color: 'green'
      }
    },
    {
      name: 'Done',
      position: 2,
      configuration: {
        label: 'Set as Done',
        color: 'green'
      }
    },
    {
      name: 'Reopened',
      position: 4,
      configuration: {
        label: 'Reopen The Case',
        color: 'red'
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
    },
    {
      fromStatus: 'Done',
      toStatus: 'Reopened',
      name: 'doneToReopenedExpression',
      expression: {
        userRoles: [Roles.TenantAdmin, Roles.Tenant]
      }
    },
    {
      fromStatus: 'Reopened',
      toStatus: 'Done',
      name: 'reopenedToDoneExpression',
      expression: {
        userRoles: [Roles.TenantAdmin, Roles.Tenant]
      }
    }
  ],
  onCreateEvents: [],
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
};

export const notificationTopics: ScriptNotificationTopic[] = [
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
      template: PorscheNewRawDataTemplate,
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
      template: PorscheNewRawDataTemplate,
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
      template: PorscheNewRawDataTemplate,
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
      template: PorscheNewRawDataTemplate,
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
      template: PorscheCasesTemplate,
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
      template: PorscheCasesTemplate,
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
      template: PorscheCasesTemplate,
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
