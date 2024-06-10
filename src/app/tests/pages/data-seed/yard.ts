// // DEPRECATED, USE becker.ts

// import { DefaultValueTypeEnum, DynamicValueTypeEnum, SystemValueTypeEnum } from '@wfm/common/field/field-default-value/FieldDefaultValues';
// import { AreaTypeEnum, CaseStatus, FieldTypeIds, Roles, CreateListDto, FieldRenderTypeEnum, ValidatorType } from '@wfm/service-layer';
// import {
//   AutomaticAddStepsEventDto,
//   DifferenceCalculationEventDto,
//   EventTypes,
//   RawDataToCaseEventDto,
//   SourceToDestination,
//   StepToCaseEventDto,
//   UpdateCaseStatusBasedOnStepResolutionEventDto,
//   UpdateRawDataBasedOnCaseEventDto,
//   UpdateStatusBasedOnStepAddedEvent
// } from '@wfm/service-layer/models/actionDto';
// import { ScriptCreateListDto, ScriptField, ScriptSchema, ScriptWorkflow, StepConfig } from './script-types';

// import { WorkflowRightsEnum } from '@wfm/service-layer';

// // LISTS
// export const listEntites: ScriptCreateListDto[] = [
//   {
//     title: 'Packet Count',
//     key: 'packetCount',
//     parentListName: '',
//     listItems: ['1', '2', '3', '4', '5']
//   }
// ];

// // FIELDS
// export const tenantFields: ScriptField[] = [
//   {
//     fieldName: 'bookId',
//     displayName: 'Book Id',
//     areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
//     type: FieldTypeIds.StringField
//   },
//   {
//     fieldName: 'bookDate',
//     displayName: 'Book Date',
//     areaType: [AreaTypeEnum.case, AreaTypeEnum.rawData],
//     type: FieldTypeIds.DateField
//   },
//   {
//     fieldName: 'bookTime',
//     displayName: 'Book Time',
//     areaType: [AreaTypeEnum.rawData, AreaTypeEnum.case],
//     type: FieldTypeIds.TimeField
//   },
//   {
//     fieldName: 'companyName',
//     displayName: 'Company Name',
//     areaType: [AreaTypeEnum.rawData],
//     type: FieldTypeIds.StringField
//   },
//   {
//     fieldName: 'carrierName',
//     displayName: 'Carrier Name',
//     areaType: [AreaTypeEnum.rawData],
//     type: FieldTypeIds.StringField
//   },
//   {
//     fieldName: 'mobilePhone',
//     displayName: 'Mobile Phone',
//     areaType: [AreaTypeEnum.rawData],
//     type: FieldTypeIds.StringField
//   },
//   {
//     fieldName: 'truckPlate',
//     displayName: 'Truck Plate',
//     areaType: [AreaTypeEnum.rawData, AreaTypeEnum.case],
//     type: FieldTypeIds.StringField
//   },
//   {
//     fieldName: 'transportOrderNumber',
//     displayName: 'Transport Order Number',
//     areaType: [AreaTypeEnum.rawData],
//     type: FieldTypeIds.StringField
//   },
//   // {
//   //   fieldName: 'packetCount',
//   //   displayName: 'Packet Count',
//   //   areaType: [AreaTypeEnum.rawData],
//   //   type: FieldTypeIds.ListField,
//   //   configuration: {
//   //     position: 0,
//   //     listName: 'packetCount',
//   //     renderType: FieldRenderTypeEnum.select
//   //   }
//   // },
//   {
//     fieldName: 'packetCount',
//     displayName: 'Packet Count',
//     areaType: [AreaTypeEnum.rawData],
//     type: FieldTypeIds.IntField,
//     configuration: {
//       position: 0
//     }
//   },
//   {
//     fieldName: 'chargennummer',
//     displayName: 'Chargennummer',
//     areaType: [AreaTypeEnum.rawData],
//     type: FieldTypeIds.StringField
//   },
//   {
//     fieldName: 'abmessungen',
//     displayName: 'Abmessungen',
//     areaType: [AreaTypeEnum.rawData],
//     type: FieldTypeIds.StringField
//   },
//   {
//     fieldName: 'weightTon',
//     displayName: 'Weight Ton',
//     areaType: [AreaTypeEnum.rawData],
//     type: FieldTypeIds.DecimalField
//   },
//   {
//     fieldName: 'supplier',
//     displayName: 'Supplier',
//     areaType: [AreaTypeEnum.rawData],
//     type: FieldTypeIds.StringField
//   },
//   // case specific fields
//   {
//     fieldName: 'checkedIn',
//     displayName: 'Checked In',
//     areaType: [AreaTypeEnum.case],
//     type: FieldTypeIds.DateTimeField
//   },
//   {
//     fieldName: 'xNumber',
//     displayName: 'X-Number',
//     areaType: [AreaTypeEnum.case],
//     type: FieldTypeIds.StringField
//   },
//   {
//     fieldName: 'firstWeighing',
//     displayName: 'First Weighing',
//     areaType: [AreaTypeEnum.case],
//     type: FieldTypeIds.DecimalField
//   },
//   {
//     fieldName: 'secondWeighing',
//     displayName: 'Second Weighing',
//     areaType: [AreaTypeEnum.case],
//     type: FieldTypeIds.DecimalField
//   },
//   {
//     fieldName: 'differenceWeighing',
//     displayName: 'Difference Weighing',
//     areaType: [AreaTypeEnum.case],
//     type: FieldTypeIds.DecimalField
//   },
//   {
//     fieldName: 'unloadingBegin',
//     displayName: 'Unloading Begin',
//     areaType: [AreaTypeEnum.case],
//     type: FieldTypeIds.DateTimeField
//   },
//   {
//     fieldName: 'unloadingBeginDriver',
//     displayName: 'Unloading Begin - Driver',
//     areaType: [AreaTypeEnum.case],
//     type: FieldTypeIds.DateTimeField
//   },
//   {
//     fieldName: 'unloadingEnd',
//     displayName: 'Unloading End',
//     areaType: [AreaTypeEnum.case],
//     type: FieldTypeIds.DateTimeField
//   },
//   {
//     fieldName: 'unloadingEndDriver',
//     displayName: 'Unloading End - Driver',
//     areaType: [AreaTypeEnum.case],
//     type: FieldTypeIds.DateTimeField
//   },
//   {
//     fieldName: 'checkedOut',
//     displayName: 'Checked out',
//     areaType: [AreaTypeEnum.case],
//     type: FieldTypeIds.DateTimeField
//   },
//   // step specific
//   // {
//   //   fieldName: 'weightInKg',
//   //   displayName: 'Weight in kg',
//   //   areaType: [AreaTypeEnum.stepForm],
//   //   type: FieldTypeIds.IntField
//   // },
//   {
//     fieldName: 'weightInTon',
//     displayName: 'Weight in ton',
//     areaType: [AreaTypeEnum.stepForm],
//     type: FieldTypeIds.DecimalField
//   },
//   {
//     fieldName: 'packingListOk',
//     displayName: 'Packing List OK',
//     areaType: [AreaTypeEnum.stepForm],
//     type: FieldTypeIds.BoolField,
//     configuration: {
//       position: 0,
//       renderType: FieldRenderTypeEnum.radio
//     }
//   },
//   {
//     fieldName: 'xNumber',
//     displayName: 'X-Number',
//     areaType: [AreaTypeEnum.case, AreaTypeEnum.stepForm],
//     type: FieldTypeIds.StringField
//   },
//   {
//     fieldName: 'materialOk',
//     displayName: 'Material OK',
//     areaType: [AreaTypeEnum.stepForm],
//     type: FieldTypeIds.BoolField,
//     configuration: {
//       position: 0,
//       renderType: FieldRenderTypeEnum.radio
//     }
//   },
//   {
//     fieldName: 'comment',
//     displayName: 'Comment',
//     areaType: [AreaTypeEnum.stepForm],
//     type: FieldTypeIds.StringField
//   },
//   {
//     fieldName: 'uploadPic',
//     displayName: 'Upload pic',
//     areaType: [AreaTypeEnum.stepForm],
//     type: FieldTypeIds.FileField
//   },
//   {
//     fieldName: 'timeStamp',
//     displayName: 'Timestamp',
//     areaType: [AreaTypeEnum.stepForm],
//     type: FieldTypeIds.DateTimeField
//   },
//   // comment fields
//   {
//     fieldName: 'commentContent',
//     displayName: 'Comment Content',
//     areaType: [AreaTypeEnum.comment],
//     type: FieldTypeIds.TextareaField
//   },
//   {
//     fieldName: 'commentDate',
//     displayName: 'Comment Date',
//     areaType: [AreaTypeEnum.comment],
//     type: FieldTypeIds.DateTimeField
//   },
//   {
//     fieldName: 'commentAuthor',
//     displayName: 'Sender',
//     areaType: [AreaTypeEnum.comment],
//     type: FieldTypeIds.StringField
//   }
// ];

// // SCHEMAS
// export const rawDataSchemas: ScriptSchema[] = [
//   {
//     name: 'Raw Data Schema - Yard',
//     areaType: AreaTypeEnum.rawData,
//     functions: [],
//     status: CaseStatus.Open,
//     fields: [
//       {
//         name: 'bookId',
//         configuration: {
//           position: 0
//         }
//       },
//       {
//         name: 'bookDate',
//         configuration: {
//           position: 1
//         }
//       },
//       {
//         name: 'bookTime',
//         configuration: {
//           position: 2
//         }
//       },
//       {
//         name: 'truckPlate',
//         configuration: {
//           position: 3
//         }
//       },
//       {
//         name: 'companyName',
//         configuration: {
//           position: 4
//         }
//       },
//       {
//         name: 'carrierName',
//         configuration: {
//           position: 5
//         }
//       },
//       {
//         name: 'mobilePhone',
//         configuration: {
//           position: 6
//         }
//       },
//       {
//         name: 'transportOrderNumber',
//         configuration: {
//           position: 7
//         }
//       },
//       {
//         name: 'packetCount',
//         configuration: {
//           position: 8
//         }
//       },
//       {
//         name: 'chargennummer',
//         configuration: {
//           position: 9
//         }
//       },
//       {
//         name: 'abmessungen',
//         configuration: {
//           position: 10
//         }
//       },
//       {
//         name: 'weightTon',
//         configuration: {
//           position: 11
//         }
//       },
//       {
//         name: 'supplier',
//         configuration: {
//           position: 12
//         }
//       }
//     ]
//   }
// ];

// export const commentSchemas: ScriptSchema[] = [
//   {
//     name: 'Comment Schema - Yard',
//     areaType: AreaTypeEnum.comment,
//     functions: [],
//     status: CaseStatus.Open,
//     fields: [
//       {
//         name: 'commentContent',
//         configuration: {
//           position: 0,
//           validators: [
//             {
//               key: ValidatorType.Required,
//               value: {
//                 required: true,
//                 validatorType: ValidatorType.Required
//               }
//             }
//           ]
//         }
//       },
//       {
//         name: 'commentDate',
//         configuration: {
//           position: 1,
//           isSystemDefault: true,
//           systemDefaultType: SystemValueTypeEnum.currentDateTime,
//           systemDefaultEvent: SystemEventTypes.Create
//         }
//       },
//       {
//         name: 'commentAuthor',
//         configuration: {
//           position: 2,
//           isSystemDefault: true,
//           systemDefaultType: SystemValueTypeEnum.currentUser,
//           systemDefaultEvent: SystemEventTypes.Create
//         }
//       }
//     ]
//   }
// ];

// export const caseSchemas: ScriptSchema[] = [
//   {
//     name: 'Case Schema - Yard',
//     areaType: AreaTypeEnum.case,
//     functions: [],
//     status: CaseStatus.Open,
//     rawDataSchemaName: 'Raw Data Schema - Yard',
//     commentSchemaName: 'Comment Schema - Yard',

//     fields: [
//       {
//         name: 'bookId',
//         configuration: {
//           position: 0
//         }
//       },
//       {
//         name: 'bookDate',
//         configuration: {
//           position: 1
//         }
//       },
//       {
//         name: 'bookTime',
//         configuration: {
//           position: 2
//         }
//       },
//       {
//         name: 'truckPlate',
//         configuration: {
//           position: 3
//         }
//       },
//       {
//         name: 'checkedIn',
//         configuration: {
//           position: 4,
//           isSystemDefault: false,
//           defaultValueType: DefaultValueTypeEnum.dynamic,
//           dynamicValue: DynamicValueTypeEnum.currentDateTime
//         }
//       },
//       {
//         name: 'xNumber',
//         configuration: {
//           position: 5
//         }
//       },
//       {
//         name: 'firstWeighing',
//         configuration: {
//           position: 6
//         }
//       },
//       {
//         name: 'secondWeighing',
//         configuration: {
//           position: 7
//         }
//       },
//       {
//         name: 'differenceWeighing',
//         configuration: {
//           position: 8
//         }
//       },
//       {
//         name: 'unloadingBegin',
//         configuration: {
//           position: 9
//         }
//       },
//       {
//         name: 'unloadingBeginDriver',
//         configuration: {
//           position: 10
//         }
//       },
//       {
//         name: 'unloadingEnd',
//         configuration: {
//           position: 11
//         }
//       },
//       {
//         name: 'unloadingEndDriver',
//         configuration: {
//           position: 12
//         }
//       },
//       {
//         name: 'checkedOut',
//         configuration: {
//           position: 13
//         }
//       }
//     ]
//   }
// ];

// export const stepSchemas: ScriptSchema[] = [
//   {
//     name: 'Weighing Schema',
//     areaType: AreaTypeEnum.stepForm,
//     functions: [],
//     status: CaseStatus.Open,
//     fields: [
//       {
//         name: 'weightInTon',
//         configuration: {
//           position: 0
//         }
//       }
//     ]
//   },
//   {
//     name: 'Packing List Check Schema',
//     areaType: AreaTypeEnum.stepForm,
//     functions: [
//       // {
//       //   name: 'X-Number visible if Packing list OK is true',
//       //   ruleSet: {
//       //     condition: 0,
//       //     rules: [
//       //       {
//       //         propertyPath: {
//       //           path: ['packingListOk']
//       //         },
//       //         operator: 0,
//       //         value: false
//       //       }
//       //     ]
//       //   },
//       //   forBackend: false,
//       //   actionSettings: {
//       //     config: {
//       //       name: 'xNumber',
//       //       hidden: false,
//       //       visible: true,
//       //       enabled: false,
//       //       disabled: false,
//       //       useDefaultValue: false,
//       //       useHintMessage: false
//       //     },
//       //     fieldPath: {
//       //       path: ['xNumber']
//       //     }
//       //   }
//       // }
//     ],
//     status: CaseStatus.Open,
//     fields: [
//       {
//         name: 'packingListOk',
//         configuration: {
//           position: 0
//         }
//       },
//       {
//         name: 'xNumber',
//         configuration: {
//           position: 1,
//           validators: [
//             {
//               key: ValidatorType.Required,
//               value: {
//                 required: true,
//                 validatorType: ValidatorType.Required
//               }
//             }
//           ]
//         }
//       }
//     ]
//   },
//   {
//     name: 'Material Check Schema',
//     areaType: AreaTypeEnum.stepForm,
//     functions: [
//       {
//         name: 'Show Comment if Material OK is false',
//         ruleSet: {
//           condition: 0,
//           rules: [
//             {
//               propertyPath: {
//                 path: ['materialOk']
//               },
//               operator: 0,
//               value: false
//             }
//           ]
//         },
//         forBackend: false,
//         actionSettings: {
//           config: {
//             name: 'comment',
//             hidden: false,
//             visible: true,
//             enabled: false,
//             disabled: false,
//             useDefaultValue: false,
//             useHintMessage: false
//           },
//           fieldPath: {
//             path: ['comment']
//           }
//         }
//       },
//       {
//         name: 'Show Upload Pic if Material OK is false',
//         ruleSet: {
//           condition: 0,
//           rules: [
//             {
//               propertyPath: {
//                 path: ['materialOk']
//               },
//               operator: 0,
//               value: false
//             }
//           ]
//         },
//         forBackend: false,
//         actionSettings: {
//           config: {
//             name: 'uploadPic',
//             hidden: false,
//             visible: true,
//             enabled: false,
//             disabled: false,
//             useDefaultValue: false,
//             useHintMessage: false
//           },
//           fieldPath: {
//             path: ['uploadPic']
//           }
//         }
//       }
//     ],
//     status: CaseStatus.Open,
//     fields: [
//       {
//         name: 'materialOk',
//         configuration: {
//           position: 0
//         }
//       },
//       {
//         name: 'comment',
//         configuration: {
//           position: 1,
//           validators: [
//             {
//               key: ValidatorType.Required,
//               value: {
//                 required: true,
//                 validatorType: ValidatorType.Required
//               }
//             }
//           ]
//         }
//       },
//       {
//         name: 'uploadPic',
//         configuration: {
//           position: 2
//         }
//       }
//     ]
//   },
//   {
//     name: 'TimeStamp Schema',
//     areaType: AreaTypeEnum.stepForm,
//     functions: [],
//     status: CaseStatus.Open,
//     fields: [
//       {
//         name: 'timeStamp',
//         configuration: {
//           position: 0
//         }
//       }
//     ]
//   },
//   {
//     name: 'Second Weighing Schema',
//     areaType: AreaTypeEnum.stepForm,
//     functions: [],
//     status: CaseStatus.Open,
//     fields: [
//       {
//         name: 'weightInTon',
//         configuration: {
//           position: 0
//         }
//       },
//       {
//         // system field, to be populated on step updating
//         name: 'timeStamp',
//         configuration: {
//           position: 1,
//           defaultValueType: 3,
//           isSystemDefault: true,
//           systemDefaultEvent: SystemEventTypes.Update,
//           systemDefaultType: 4
//         }
//       }
//     ]
//   }
// ];

// // process step entities
// export const processSteps: StepConfig[] = [
//   {
//     name: 'First Weighing',
//     refName: 'firstWeighing',
//     resolution: [{ name: 'OK' }],
//     schema: 'Weighing Schema',
//     processStepLinks: [
//       {
//         status: 'All',
//         expressions: {},
//         numberOfInstances: 1,
//         actions: []
//       },
//       {
//         status: 'All',
//         expressions: {
//           userRoles: [Roles.TenantAdmin, Roles.Tenant]
//         },
//         rights: [
//           WorkflowRightsEnum.CanAdd,
//           WorkflowRightsEnum.CanEdit,
//           WorkflowRightsEnum.CanDelete,
//           WorkflowRightsEnum.CanResolve,
//           WorkflowRightsEnum.CanUnresolve
//         ],
//         numberOfInstances: 1,
//         actions: [
//           <StepToCaseEventDto>{
//             id: undefined,
//             eventType: EventTypes.StepToCase,
//             name: 'setFirstWeighingInCase',
//             sourceToDestination: [
//               {
//                 source: 'weightInTon',
//                 destination: 'firstWeighing'
//               }
//             ]
//           },
//           <AutomaticAddStepsEventDto>{
//             id: undefined,
//             name: 'addStepsOnResolved',
//             eventType: EventTypes.AutomaticAddSteps,
//             steps: ['packingListCheck'] // refName of the step that will be autoAdded
//           }
//         ]
//       },
//       {
//         status: 'Done',
//         expressions: {},
//         disallowedRights: [
//           WorkflowRightsEnum.CanAdd,
//           WorkflowRightsEnum.CanEdit,
//           WorkflowRightsEnum.CanDelete,
//           WorkflowRightsEnum.CanResolve,
//           WorkflowRightsEnum.CanUnresolve
//         ],
//         numberOfInstances: 1
//       }
//     ]
//   },
//   {
//     name: 'Packing List Check',
//     refName: 'packingListCheck',
//     schema: 'Packing List Check Schema',
//     resolution: [{ name: 'OK' }],
//     processStepLinks: [
//       {
//         status: 'All',
//         expressions: {},
//         numberOfInstances: 1,
//         actions: []
//       },
//       {
//         status: 'All',
//         expressions: {
//           userRoles: [Roles.TenantAdmin, Roles.Tenant]
//         },
//         rights: [WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanUnresolve],
//         // parentStepName: 'firstWeighing',
//         numberOfInstances: 1,
//         actions: [
//           <AutomaticAddStepsEventDto>{
//             id: undefined,
//             name: 'addStepsOnResolved',
//             eventType: EventTypes.AutomaticAddSteps,
//             steps: ['unloadingBegin', 'unloadingBeginDriver'] // refName of the step that will be autoAdded
//           },
//           <StepToCaseEventDto>{
//             id: undefined,
//             eventType: EventTypes.StepToCase,
//             name: 'setXNumberInCase',
//             sourceToDestination: [
//               {
//                 source: 'xNumber',
//                 destination: 'xNumber'
//               }
//             ]
//           }
//         ]
//       },
//       {
//         status: 'All',
//         expressions: {},
//         disallowedRights: [WorkflowRightsEnum.CanAdd],
//         numberOfInstances: 1,
//         actions: [
//           <AutomaticAddStepsEventDto>{
//             id: undefined,
//             name: 'addStepsOnResolved',
//             eventType: EventTypes.AutomaticAddSteps,
//             steps: ['unloadingBegin', 'unloadingBeginDriver'] // refName of the step that will be autoAdded
//           },
//           <StepToCaseEventDto>{
//             id: undefined,
//             eventType: EventTypes.StepToCase,
//             name: 'setXNumberInCase',
//             sourceToDestination: [
//               {
//                 source: 'xNumber',
//                 destination: 'xNumber'
//               }
//             ]
//           }
//         ]
//       },
//       {
//         status: 'Done',
//         expressions: {},
//         disallowedRights: [
//           WorkflowRightsEnum.CanAdd,
//           WorkflowRightsEnum.CanEdit,
//           WorkflowRightsEnum.CanDelete,
//           WorkflowRightsEnum.CanResolve,
//           WorkflowRightsEnum.CanUnresolve
//         ],
//         numberOfInstances: 1
//       }
//     ]
//   },
//   {
//     name: 'Unloading Begin',
//     refName: 'unloadingBegin',
//     schema: 'TimeStamp Schema',
//     resolution: [{ name: 'OK' }],
//     processStepLinks: [
//       {
//         status: 'All',
//         expressions: {},
//         numberOfInstances: 1,
//         actions: []
//       },
//       {
//         status: 'All',
//         expressions: {
//           userRoles: [Roles.TenantAdmin, Roles.Tenant]
//         },
//         rights: [WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanUnresolve],
//         // parentStepName: 'packingListCheck',

//         numberOfInstances: 1,
//         actions: [
//           <AutomaticAddStepsEventDto>{
//             id: undefined,
//             name: 'addStepsOnResolved',
//             eventType: EventTypes.AutomaticAddSteps,
//             steps: ['materialCheck'] // refName of the step that will be autoAdded
//           },
//           <StepToCaseEventDto>{
//             id: undefined,
//             eventType: EventTypes.StepToCase,
//             name: 'setUnloadingBeginInCase',
//             sourceToDestination: [
//               {
//                 source: 'timeStamp',
//                 destination: 'unloadingBegin'
//               }
//             ]
//           }
//         ]
//       },
//       {
//         status: 'All',
//         expressions: {},
//         disallowedRights: [WorkflowRightsEnum.CanAdd],
//         // parentStepName: 'packingListCheck',

//         numberOfInstances: 1,
//         actions: [
//           <AutomaticAddStepsEventDto>{
//             id: undefined,
//             name: 'addStepsOnResolved',
//             eventType: EventTypes.AutomaticAddSteps,
//             steps: ['materialCheck'] // refName of the step that will be autoAdded
//           },
//           <StepToCaseEventDto>{
//             id: undefined,
//             eventType: EventTypes.StepToCase,
//             name: 'setUnloadingBeginInCase',
//             sourceToDestination: [
//               {
//                 source: 'timeStamp',
//                 destination: 'unloadingBegin'
//               }
//             ]
//           }
//         ]
//       },
//       {
//         status: 'Done',
//         expressions: {},
//         disallowedRights: [
//           WorkflowRightsEnum.CanAdd,
//           WorkflowRightsEnum.CanEdit,
//           WorkflowRightsEnum.CanDelete,
//           WorkflowRightsEnum.CanResolve,
//           WorkflowRightsEnum.CanUnresolve
//         ],
//         numberOfInstances: 1
//       }
//     ]
//   },
//   {
//     name: 'Material check',
//     refName: 'materialCheck',
//     schema: 'Material Check Schema',
//     resolution: [{ name: 'OK' }],
//     processStepLinks: [
//       {
//         status: 'All',
//         expressions: {},
//         numberOfInstances: 1,
//         actions: []
//       },
//       {
//         status: 'All',
//         expressions: {
//           userRoles: [Roles.TenantAdmin, Roles.Tenant]
//         },
//         rights: [WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanUnresolve],
//         // parentStepName: 'unloadingBegin',
//         numberOfInstances: 1,
//         actions: [
//           <AutomaticAddStepsEventDto>{
//             id: undefined,
//             name: 'addStepsOnResolved',
//             eventType: EventTypes.AutomaticAddSteps,
//             steps: ['unloadingEnd'] // refName of the step that will be autoAdded
//           }
//         ]
//       },
//       {
//         status: 'All',
//         expressions: {},
//         disallowedRights: [WorkflowRightsEnum.CanAdd],
//         // parentStepName: 'unloadingBegin',
//         numberOfInstances: 1,
//         actions: [
//           <AutomaticAddStepsEventDto>{
//             id: undefined,
//             name: 'addStepsOnResolved',
//             eventType: EventTypes.AutomaticAddSteps,
//             steps: ['unloadingEnd'] // refName of the step that will be autoAdded
//           }
//         ]
//       },
//       {
//         status: 'Done',
//         expressions: {},
//         disallowedRights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete],
//         numberOfInstances: 1
//       }
//     ]
//   },
//   {
//     name: 'Unloading Begin Driver',
//     refName: 'unloadingBeginDriver',
//     schema: 'TimeStamp Schema',
//     resolution: [{ name: 'OK' }],
//     processStepLinks: [
//       {
//         status: 'All',
//         expressions: {},
//         numberOfInstances: 1,
//         actions: []
//       },
//       {
//         status: 'All',
//         expressions: {
//           userRoles: [Roles.Supplier]
//         },
//         rights: [WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanUnresolve],
//         // parentStepName: 'packingListCheck',
//         numberOfInstances: 1,
//         actions: [
//           <AutomaticAddStepsEventDto>{
//             id: undefined,
//             name: 'addStepsOnResolved',
//             eventType: EventTypes.AutomaticAddSteps,
//             steps: ['unloadingEndDriver']
//           },
//           <StepToCaseEventDto>{
//             id: undefined,
//             eventType: EventTypes.StepToCase,
//             name: 'setUnloadingBeginDriverInCase',
//             sourceToDestination: [
//               {
//                 source: 'timeStamp',
//                 destination: 'unloadingBeginDriver'
//               }
//             ]
//           }
//         ]
//       },
//       {
//         status: 'All',
//         expressions: {},
//         disallowedRights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanDelete],
//         // parentStepName: 'packingListCheck',
//         numberOfInstances: 1,
//         actions: [
//           <AutomaticAddStepsEventDto>{
//             id: undefined,
//             name: 'addStepsOnResolved',
//             eventType: EventTypes.AutomaticAddSteps,
//             steps: ['unloadingEndDriver']
//           },
//           <StepToCaseEventDto>{
//             id: undefined,
//             eventType: EventTypes.StepToCase,
//             name: 'setUnloadingBeginDriverInCase',
//             sourceToDestination: [
//               {
//                 source: 'timeStamp',
//                 destination: 'unloadingBeginDriver'
//               }
//             ]
//           }
//         ]
//       },
//       {
//         status: 'Done',
//         expressions: {},
//         disallowedRights: [
//           WorkflowRightsEnum.CanAdd,
//           WorkflowRightsEnum.CanEdit,
//           WorkflowRightsEnum.CanDelete,
//           WorkflowRightsEnum.CanResolve,
//           WorkflowRightsEnum.CanUnresolve
//         ],
//         numberOfInstances: 1
//       }
//     ]
//   },
//   {
//     name: 'Unloading End',
//     refName: 'unloadingEnd',
//     schema: 'TimeStamp Schema',
//     resolution: [{ name: 'OK' }],
//     processStepLinks: [
//       {
//         status: 'All',
//         expressions: {},
//         numberOfInstances: 1,
//         actions: []
//       },
//       {
//         status: 'All',
//         expressions: {
//           userRoles: [Roles.TenantAdmin, Roles.Tenant]
//         },
//         rights: [WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanUnresolve],
//         // parentStepName: 'materialCheck',
//         numberOfInstances: 1,
//         actions: [
//           <AutomaticAddStepsEventDto>{
//             id: undefined,
//             name: 'addStepsOnResolved',
//             eventType: EventTypes.AutomaticAddSteps,
//             steps: ['secondWeighing']
//           },
//           <StepToCaseEventDto>{
//             id: undefined,
//             eventType: EventTypes.StepToCase,
//             name: 'setUnloadingEndInCase',
//             sourceToDestination: [
//               {
//                 source: 'timeStamp',
//                 destination: 'unloadingEnd'
//               }
//             ]
//           }
//         ]
//       },
//       {
//         status: 'All',
//         expressions: {},
//         disallowedRights: [WorkflowRightsEnum.CanAdd],
//         // parentStepName: 'materialCheck',
//         numberOfInstances: 1,
//         actions: [
//           <AutomaticAddStepsEventDto>{
//             id: undefined,
//             name: 'addStepsOnResolved',
//             eventType: EventTypes.AutomaticAddSteps,
//             steps: ['secondWeighing']
//           },
//           <StepToCaseEventDto>{
//             id: undefined,
//             eventType: EventTypes.StepToCase,
//             name: 'setUnloadingEndInCase',
//             sourceToDestination: [
//               {
//                 source: 'timeStamp',
//                 destination: 'unloadingEnd'
//               }
//             ]
//           }
//         ]
//       },
//       {
//         status: 'Done',
//         expressions: {},
//         disallowedRights: [
//           WorkflowRightsEnum.CanAdd,
//           WorkflowRightsEnum.CanEdit,
//           WorkflowRightsEnum.CanDelete,
//           WorkflowRightsEnum.CanResolve,
//           WorkflowRightsEnum.CanUnresolve
//         ],
//         numberOfInstances: 1
//       }
//     ]
//   },
//   {
//     name: 'Unloading end driver',
//     refName: 'unloadingEndDriver',
//     schema: 'TimeStamp Schema',
//     resolution: [{ name: 'OK' }],
//     processStepLinks: [
//       {
//         status: 'All',
//         expressions: {},
//         numberOfInstances: 1,
//         actions: []
//       },
//       {
//         status: 'All',
//         expressions: {
//           userRoles: [Roles.Supplier]
//         },
//         rights: [WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanUnresolve],
//         // parentStepName: 'unloadingBeginDriver',
//         numberOfInstances: 1,
//         actions: [
//           <StepToCaseEventDto>{
//             id: undefined,
//             eventType: EventTypes.StepToCase,
//             name: 'setUnloadingEndDriverInCase',
//             sourceToDestination: [
//               {
//                 source: 'timeStamp',
//                 destination: 'unloadingEndDriver'
//               }
//             ]
//           }
//         ]
//       },
//       {
//         status: 'All',
//         expressions: {},
//         disallowedRights: [WorkflowRightsEnum.CanAdd, WorkflowRightsEnum.CanDelete],
//         // parentStepName: 'unloadingBeginDriver',
//         numberOfInstances: 1,
//         actions: [
//           <StepToCaseEventDto>{
//             id: undefined,
//             eventType: EventTypes.StepToCase,
//             name: 'setUnloadingEndDriverInCase',
//             sourceToDestination: [
//               {
//                 source: 'timeStamp',
//                 destination: 'unloadingEndDriver'
//               }
//             ]
//           }
//         ]
//       },
//       {
//         status: 'Done',
//         expressions: {},
//         disallowedRights: [
//           WorkflowRightsEnum.CanAdd,
//           WorkflowRightsEnum.CanEdit,
//           WorkflowRightsEnum.CanDelete,
//           WorkflowRightsEnum.CanResolve,
//           WorkflowRightsEnum.CanUnresolve
//         ],
//         numberOfInstances: 1
//       }
//     ]
//   },
//   {
//     name: 'Second Weighing',
//     refName: 'secondWeighing',
//     schema: 'Second Weighing Schema',
//     resolution: [{ name: 'OK' }],
//     processStepLinks: [
//       {
//         status: 'All',
//         expressions: {},
//         numberOfInstances: 1,
//         actions: []
//       },
//       {
//         status: 'All',
//         expressions: {
//           userRoles: [Roles.TenantAdmin, Roles.Tenant]
//         },
//         rights: [WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanUnresolve],
//         // parentStepName: 'unloadingEnd',
//         numberOfInstances: 1,
//         actions: [
//           <StepToCaseEventDto>{
//             id: undefined,
//             eventType: EventTypes.StepToCase,
//             name: 'setSecondWeighingInCase',
//             sourceToDestination: [
//               {
//                 source: 'weightInTon',
//                 destination: 'secondWeighing'
//               },
//               {
//                 source: 'timeStamp',
//                 destination: 'checkedOut'
//               }
//             ]
//           },
//           // post action  for Difference Weighing (secondWeighing-firstWeighing)
//           <DifferenceCalculationEventDto>{
//             eventType: EventTypes.DifferenceCalculation,
//             name: 'setDiffenceWeighingField',
//             firstStep: {
//               path: ['firstWeighing', 'weightInTon']
//             },
//             secondStep: {
//               path: ['secondWeighing', 'weightInTon']
//             },
//             resultField: 'differenceWeighing'
//           },
//           <UpdateCaseStatusBasedOnStepResolutionEventDto>{
//             eventType: EventTypes.UpdateCaseStatusBasedOnStepResolution,
//             name: 'setToDoneWhenResolved',
//             refName: 'secondWeighing',
//             resolutions: ['OK'],
//             schemaId: 'Second Weighing Schema',
//             statusId: 'Done'
//           }
//           // <AutomaticAddStepsEventDto>{
//           //   id: undefined,
//           //   name: 'addStepsOnResolved',
//           //   eventType: EventTypes.AutomaticAddSteps,
//           //   steps: ['exit']
//           // }
//         ]
//       },
//       {
//         status: 'All',
//         expressions: {},
//         disallowedRights: [WorkflowRightsEnum.CanAdd],
//         // parentStepName: 'unloadingEnd',
//         numberOfInstances: 1,
//         actions: [
//           <StepToCaseEventDto>{
//             id: undefined,
//             eventType: EventTypes.StepToCase,
//             name: 'setSecondWeighingInCase',
//             sourceToDestination: [
//               {
//                 source: 'weightInTon',
//                 destination: 'secondWeighing'
//               },
//               {
//                 source: 'timeStamp',
//                 destination: 'checkedOut'
//               }
//             ]
//           },
//           // post action  for Difference Weighing (secondWeighing-firstWeighing)
//           <DifferenceCalculationEventDto>{
//             eventType: EventTypes.DifferenceCalculation,
//             name: 'setDiffenceWeighingField',
//             firstStep: {
//               path: ['firstWeighing', 'weightInTon']
//             },
//             secondStep: {
//               path: ['secondWeighing', 'weightInTon']
//             },
//             resultField: 'differenceWeighing'
//           },
//           <UpdateCaseStatusBasedOnStepResolutionEventDto>{
//             eventType: EventTypes.UpdateCaseStatusBasedOnStepResolution,
//             name: 'setToDoneWhenResolved',
//             refName: 'secondWeighing',
//             resolutions: ['OK'],
//             schemaId: 'Second Weighing Schema',
//             statusId: 'Done'
//           }
//           // <AutomaticAddStepsEventDto>{
//           //   id: undefined,
//           //   name: 'addStepsOnResolved',
//           //   eventType: EventTypes.AutomaticAddSteps,
//           //   steps: ['exit']
//           // }
//         ]
//       },
//       {
//         status: 'Done',
//         expressions: {},
//         disallowedRights: [
//           WorkflowRightsEnum.CanAdd,
//           WorkflowRightsEnum.CanEdit,
//           WorkflowRightsEnum.CanDelete,
//           WorkflowRightsEnum.CanResolve,
//           WorkflowRightsEnum.CanUnresolve
//         ],
//         numberOfInstances: 1,
//         actions: []
//       }
//     ]
//   }
//   // {
//   //   name: 'Exit',
//   //   refName: 'exit',
//   //   schema: 'TimeStamp Schema',
//   //   resolution: [{ name: 'OK' }],
//   //   processStepLinks: [
//   //     {
//   //       status: 'All',
//   //       expressions: {},
//   //       numberOfInstances: 1,
//   //       actions: []
//   //     },
//   //     {
//   //       status: 'All',
//   //       expressions: {
//   //         userRoles: [Roles.TenantAdmin, Roles.Tenant]
//   //       },
//   //       rights: [WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanUnresolve],
//   //       // parentStepName: 'secondWeighing',
//   //       numberOfInstances: 1,
//   //       actions: [
//   //         <UpdateCaseStatusBasedOnStepResolutionEventDto>{
//   //           eventType: EventTypes.UpdateCaseStatusBasedOnStepResolution,
//   //           name: 'setToDoneWhenResolved',
//   //           refName: 'exit',
//   //           resolutions: ['OK'],
//   //           schemaId: 'TimeStamp Schema',
//   //           statusId: 'Done'
//   //         },
//   //         <StepToCaseEventDto>{
//   //           id: undefined,
//   //           eventType: EventTypes.StepToCase,
//   //           name: 'setCheckedOutFieldInCase',
//   //           sourceToDestination: [
//   //             {
//   //               source: 'timeStamp',
//   //               destination: 'checkedOut'
//   //             }
//   //           ]
//   //         }
//   //       ]
//   //     },
//   //     {
//   //       status: 'All',
//   //       expressions: {},
//   //       disallowedRights: [WorkflowRightsEnum.CanAdd],
//   //       // parentStepName: 'secondWeighing',
//   //       numberOfInstances: 1,
//   //       actions: [
//   //         <UpdateCaseStatusBasedOnStepResolutionEventDto>{
//   //           eventType: EventTypes.UpdateCaseStatusBasedOnStepResolution,
//   //           name: 'setToDoneWhenResolved',
//   //           refName: 'exit',
//   //           resolutions: ['OK'],
//   //           schemaId: 'TimeStamp Schema',
//   //           statusId: 'Done'
//   //         },
//   //         <StepToCaseEventDto>{
//   //           id: undefined,
//   //           eventType: EventTypes.StepToCase,
//   //           name: 'setCheckedOutFieldInCase',
//   //           sourceToDestination: [
//   //             {
//   //               source: 'timeStamp',
//   //               destination: 'checkedOut'
//   //             }
//   //           ]
//   //         }
//   //       ]
//   //     },
//   //     {
//   //       status: 'Done',
//   //       expressions: {},
//   //       disallowedRights: [
//   //         WorkflowRightsEnum.CanAdd,
//   //         WorkflowRightsEnum.CanEdit,
//   //         WorkflowRightsEnum.CanDelete,
//   //         WorkflowRightsEnum.CanResolve,
//   //         WorkflowRightsEnum.CanUnresolve
//   //       ],
//   //       numberOfInstances: 1
//   //     }
//   //   ]
//   // }
// ];

// // WORKFLOW
// export const workflow: ScriptWorkflow = {
//   name: 'Yard',
//   caseName: 'Case Schema - Yard',
//   statuses: [
//     {
//       name: 'Open',
//       position: 0,
//       configuration: {
//         label: 'Open Case',
//         color: 'blue'
//       }
//     },
//     {
//       name: 'In Progress',
//       position: 1,
//       configuration: {
//         label: 'Set as In Progress',
//         color: 'green'
//       }
//     },
//     {
//       name: 'Done',
//       position: 2,
//       configuration: {
//         label: 'Mark As Done',
//         color: 'green'
//       }
//     }
//   ],
//   transitions: [
//     {
//       fromStatus: 'Open',
//       toStatus: 'In Progress',
//       name: 'opentToInProgresExpression',
//       expression: {
//         userRoles: [Roles.TenantAdmin, Roles.Tenant]
//       }
//     },
//     {
//       fromStatus: 'In Progress',
//       toStatus: 'Done',
//       name: 'inProgressToDoneExpression',
//       expression: {
//         userRoles: [Roles.TenantAdmin, Roles.Tenant]
//       }
//     }
//   ],
//   onCreateEvents: [
//     <RawDataToCaseEventDto>{
//       id: undefined,
//       eventType: EventTypes.RawDataToCase,
//       name: 'autoFillCaseFieldsFromRawData',
//       sourceToDestination: [
//         // disabled by N. Marinov's request
//         // <SourceToDestination>{
//         //   destination: 'bookId',
//         //   source: 'bookId'
//         // },
//         <SourceToDestination>{
//           destination: 'bookDate',
//           source: 'bookDate'
//         },
//         <SourceToDestination>{
//           destination: 'bookTime',
//           source: 'bookTime'
//         },
//         <SourceToDestination>{
//           destination: 'truckPlate',
//           source: 'truckPlate'
//         }
//       ]
//     }
//   ],
//   onDeleteEvents: [],
//   onUpdateCase: [],
//   onStepAddedEvents: [
//     <UpdateStatusBasedOnStepAddedEvent>{
//       name: 'setInProgressAction',
//       eventType: EventTypes.UpdateStatusBasedOnStepAdded,
//       statusId: 'In Progress'
//     }
//   ],
//   statusEvents: [
//     <UpdateRawDataBasedOnCaseEventDto>{
//       id: undefined,
//       eventType: EventTypes.OnRawDataAddedToCase,
//       name: 'updateRawDataStatusAction'
//     }
//   ]
// };
