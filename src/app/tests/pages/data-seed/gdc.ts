import {
  DefaultValueTypeEnum,
  DynamicValueTypeEnum,
  SystemEventTypes,
  SystemValueTypeEnum
} from '@wfm/common/field/field-default-value/FieldDefaultValues';
import { GDCCasesTemplate } from '@wfm/notification-templates/gdc-case-template-file';
import { GDCInvitationsTemplate } from '@wfm/notification-templates/gdc-invitation-template-file';
import { GDCNewRawDataTemplate } from '@wfm/notification-templates/gdc-raw-data-template-file';
import {
  AreaTypeEnum,
  CaseStatus,
  FieldRenderTypeEnum,
  FieldTypeIds,
  IEmailValidatorDto,
  IMinMaxValidatorDto,
  IRequiredValidatorDto,
  Roles,
  UiAreasEnum,
  ValidatorType,
  WorkflowRightsEnum
} from '@wfm/service-layer';
import { EventTypes, UpdateRawDataBasedOnCaseEventDto, UpdateStatusBasedOnStepAddedEvent } from '@wfm/service-layer/models/actionDto';
import { RuleCustomOperatorEnum, RuleSetCustomCondition } from '@wfm/service-layer/models/expressionModel';
import { TopicKindEnum, TopicSendTypeEnum } from '@wfm/service-layer/services/notification-topic.service';

import {
  ScriptCreateListDto,
  ScriptField,
  ScriptNotificationTemplate,
  ScriptNotificationTopic,
  ScriptSchema,
  ScriptWorkflow,
  StepConfig
} from './script-types';

// LISTS
export const listEntites: ScriptCreateListDto[] = [
  {
    title: 'Shipping Mode',
    key: 'shippingMode',
    parentListName: '',
    listItems: ['Air', 'Sea', 'Truck']
  },
  {
    title: 'Supplier Type',
    key: 'supplierType',
    parentListName: '',
    listItems: [
      'Only Trader',
      'Only Importer',
      'Manufacturer',
      'Paper Producer',
      'Pulp Producer',
      'Sawmill',
      'Harvester',
      'Forest Manager',
      'Other'
    ]
  },
  {
    title: 'Supply Chain',
    key: 'supplyChain',
    parentListName: '',
    listItems: ['Chain A', 'Chain B', 'Chain C']
  },
  {
    title: 'Supply Chain (component 1)',
    key: 'supplyChainComponentOne',
    parentListName: '',
    listItems: ['Chain 1', 'Chain 2', 'Chain 3', 'Chain 4', 'Chain 1 and Chain 2']
  },
  {
    title: 'Comment Type',
    key: 'commentType',
    parentListName: '',
    listItems: ['Information required', 'Document required', 'Other']
  }
];

// Tenant FIELDS
export const tenantFields: ScriptField[] = [
  // ---------------------raw data fields
  {
    fieldName: 'externalKey',
    displayName: 'External Key',
    areaType: [AreaTypeEnum.rawData],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'orderNumber',
    displayName: 'Order Number',
    areaType: [AreaTypeEnum.rawData],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'etd',
    displayName: 'ETD',
    areaType: [AreaTypeEnum.rawData],
    type: FieldTypeIds.DateField
  },
  {
    fieldName: 'port',
    displayName: 'Port',
    areaType: [AreaTypeEnum.rawData],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'articleNumber',
    displayName: 'Article Number',
    areaType: [AreaTypeEnum.rawData],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'articleName',
    displayName: 'Article Name',
    areaType: [AreaTypeEnum.rawData],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'quantity',
    displayName: 'Quantity',
    areaType: [AreaTypeEnum.rawData],
    type: FieldTypeIds.IntField
  },
  {
    fieldName: 'positionNumber',
    displayName: 'Position Number',
    areaType: [AreaTypeEnum.rawData],
    type: FieldTypeIds.IntField
  },
  {
    fieldName: 'customsStorage',
    displayName: 'Customs Storage',
    areaType: [AreaTypeEnum.rawData],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'placeOfUnloading',
    displayName: 'Place of Unloading',
    areaType: [AreaTypeEnum.rawData],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'bulkItem',
    displayName: 'Bulk Item',
    areaType: [AreaTypeEnum.rawData],
    type: FieldTypeIds.DecimalField
  },
  {
    fieldName: 'plant',
    displayName: 'Plant',
    areaType: [AreaTypeEnum.rawData],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'location',
    displayName: 'Location',
    areaType: [AreaTypeEnum.rawData, AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'shippingMode',
    displayName: 'Shipping Mode',
    areaType: [AreaTypeEnum.rawData],
    type: FieldTypeIds.ListField,
    configuration: {
      position: 0,
      listName: 'shippingMode',
      renderType: FieldRenderTypeEnum.select
    }
  },
  {
    fieldName: 'shippingPoint',
    displayName: 'Shipping Point',
    areaType: [AreaTypeEnum.rawData],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'buyer',
    displayName: 'Buyer',
    areaType: [AreaTypeEnum.rawData],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'eta',
    displayName: 'ETA',
    areaType: [AreaTypeEnum.rawData],
    type: FieldTypeIds.DateField
  },
  {
    fieldName: 'supplierEmail',
    displayName: 'Supplier Email',
    areaType: [AreaTypeEnum.rawData],
    type: FieldTypeIds.StringField,
    configuration: {
      position: 0,
      validators: [
        {
          key: ValidatorType.Email,
          value: <IEmailValidatorDto>{
            enabled: true,
            validatorType: ValidatorType.Required
          }
        }
      ]
    }
  },
  {
    fieldName: 'buyerEmail',
    displayName: 'Buyer Email',
    areaType: [AreaTypeEnum.rawData],
    type: FieldTypeIds.StringField,
    configuration: {
      position: 0,
      validators: [
        {
          key: ValidatorType.Email,
          value: <IEmailValidatorDto>{
            enabled: true,
            validatorType: ValidatorType.Required
          }
        }
      ]
    }
  },
  {
    fieldName: 'supplierNumber',
    displayName: 'Supplier Number',
    areaType: [AreaTypeEnum.rawData],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'supplierName',
    displayName: 'Supplier Name',
    areaType: [AreaTypeEnum.rawData, AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'quantityUnit',
    displayName: 'Quantity Unit',
    areaType: [AreaTypeEnum.rawData],
    type: FieldTypeIds.StringField
  },
  // ------------case fields
  {
    fieldName: 'name',
    displayName: 'Name',
    areaType: [AreaTypeEnum.case, AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },

  // ---------------step fields
  {
    fieldName: 'documentAvailable',
    displayName: 'Document Available',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'isCompanyNameCorrect',
    displayName: 'Is the company name correct on the certificate ?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'isProductTypeCorrect',
    displayName: 'Is the product type correct for the business ?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'isTheCertificateValid',
    displayName: 'Is the certificate valid ?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'pleaseUploadTheBusinessLicense',
    displayName: 'Please upload the business license',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.FileField
  },
  {
    fieldName: 'isTheUniqueSocialCreditCodeTheSameAsShownOnTheInvoice',
    displayName: 'Is the unique social credit code the same as shown on the invoice (if available)?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'fscCertificate',
    displayName: 'FSC certificate',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.FileField
  },
  {
    fieldName: 'fscCertificateCode',
    displayName: 'FSC certificate code',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.TextareaField
  },
  {
    fieldName: 'pefcCertificate',
    displayName: 'PEFC certificate',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.FileField
  },
  {
    fieldName: 'pefcCertificateNumber',
    displayName: 'PEFC certificate number',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.TextareaField
  },
  {
    fieldName: 'supplierType',
    displayName: 'Supplier Type',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.ListField,
    configuration: {
      position: 0,
      listName: 'supplierType',
      renderType: FieldRenderTypeEnum.select
    }
  },
  {
    fieldName: 'address',
    displayName: 'Address',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'contactPerson',
    displayName: 'Contact Person',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'email',
    displayName: 'Email',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField,
    configuration: {
      position: 0,
      validators: [
        {
          key: ValidatorType.Email,
          value: <IEmailValidatorDto>{
            enabled: true,
            validatorType: ValidatorType.Required
          }
        }
      ]
    }
  },
  {
    fieldName: 'phoneNumber',
    displayName: 'Phone Number',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'suppliedGoodsMaterialService',
    displayName: 'Supplied Goods / Material / Service',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'furtherDocumentAvailable',
    displayName: 'Further document available',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'nameOfTheDocument',
    displayName: 'Name of the document',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'content',
    displayName: 'Content',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'uploadDocument',
    displayName: 'Please upload the document',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.FileField
  },
  {
    fieldName: 'supplyChainComponentOne',
    displayName: 'Supply Chain (Component 1)',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.ListField,
    configuration: {
      position: 0,
      listName: 'supplyChainComponentOne',
      renderType: FieldRenderTypeEnum.select
    }
  },
  {
    fieldName: 'transporterName',
    displayName: 'Transporter Name',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'ownerOfTheProduct',
    displayName: 'Owner Of The Product',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'originOfProduct',
    displayName: 'Origin of product',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'validityOfCertificate',
    displayName: 'Validity of certificate',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.DateField
  },
  {
    fieldName: 'species',
    displayName: 'Species',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'product',
    displayName: 'Product',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'isCorrectDate',
    displayName: 'Is it the correct date on the document?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'isHolderSame',
    displayName: 'Is the holder the same as that given in the harvesting permit? ',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'isVolumeEqual',
    displayName: 'Is the volume equal to or lower than the harvesting permit volume?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'isLaterThanHarvesting',
    displayName: 'Is the time later than the harvesting time?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'isSpeciesTheSame',
    displayName: 'Is the species the same as described on the harvesting permit?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'isStartingLocationInSameRegion',
    displayName: 'Is the starting location for transport in the same region as the harvesting location?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'isEndpointTheSame',
    displayName: 'Is the end point the same as the buyer claimed?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'woodSpeciesNameOnTransportationPermit',
    displayName: 'What wood species is named on the Transportation permit? ',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'hasSignatureBeenProvidedByAuthority',
    displayName: 'Has the signature been provided by the applicable authority?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'uploadTransportPermit',
    displayName: 'Please upload the transport permit',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.FileField
  },

  {
    fieldName: 'documentType',
    displayName: 'Specify the type of document (Invoice, delivery note, purchase order)',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'issuingTime',
    displayName: 'Issuing Time',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.DateField
  },
  {
    fieldName: 'nameBuyer',
    displayName: 'Name (buyer)',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'addressBuyer',
    displayName: 'Address (buyer)',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'nameOfProduct',
    displayName: 'Name Of Product',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'unit',
    displayName: 'Unit',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'nameSeller',
    displayName: 'Name (seller)',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'addressSeller',
    displayName: 'Address (seller)',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'isProductTypeCorrectForBusiness',
    displayName: 'Is the product type correct for the business?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'isDocumentPlausibleWithCertificate',
    displayName: 'Is the document plausible with the business registration certificates of buyer and seller?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'speciesOrProductsOnVatInvoice',
    displayName: 'What wood species or product is named on the VAT invoice? ',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'hasCorrectDate',
    displayName: 'Does the document have the correct date?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'doesVolumeOrQuantityMatchPermit',
    displayName: 'Does the volume or quantity match the transportation permit (if available)?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'doesProductDescriptionMatchPermit',
    displayName: 'Does the product description match the harvesting permit?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'isDateOfDocumentAfterTimberHarvest',
    displayName: 'Is the date of the document after the date of timber harvest?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'areNamesOfBuyerOrSellerSameOnPermit',
    displayName:
      'Are the names of the buyer or seller the same as on the transportation permit and business contract (if applicable and available)?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'whatWoodSpeciesIsNamedOnDocument',
    displayName: 'What wood species is named on the document?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField,
    configuration: {
      position: 0
    }
  },
  {
    fieldName: 'uploadOriginalDocumentMayCoverPrice',
    displayName: 'Please upload the original document (you may cover price information)',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.FileField
  },
  {
    fieldName: 'volume',
    displayName: 'Volume',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.IntField
  },
  {
    fieldName: 'holderOfPermit',
    displayName: 'Holder of permit',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'harvestingVolume',
    displayName: 'Harvesting Volume',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.DecimalField
  },
  {
    fieldName: 'timeOfHarvestingFrom',
    displayName: 'Time of harvesting – from',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.DateField
  },
  {
    fieldName: 'timeOfHarvestingUntil',
    displayName: 'Time of harvesting – until',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.DateField
  },
  {
    fieldName: 'isDateOnDocumentPriorDateOfTransport',
    displayName: 'Is the date on the document prior to the date of transport (if available)?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'areaAndForestTypeIncludedInPermit',
    displayName: 'What area and forest type (natural/ plantation) is included in the harvesting permit?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'isNameOfHolderTheSame',
    displayName: 'Is the name of the holder the same as the seller’s name in the VAT invoice?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'isNameOfHolderTheSameAsSellersName',
    displayName: 'Is the name of the holder the same as the seller ’s name in the VAT invoice?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'isHarvestinVolumeEqualOrGreaterThanInInvoice',
    displayName:
      'Is the harvesting volume equal to or greater than that in the invoice, transportation permit and phytosanitary certificate (if available)?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'isSpeciesTheSameAsInInvoice',
    displayName: 'Is the species the same as that in the invoice, transportation permit and quarantine certificate?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'isDateOfHarvestingEarlierThanTransportationDate',
    displayName: 'Is the date of harvesting earlier than the transportation date?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'isHarvestingLocationSameOrNearToTransportingPlace',
    displayName: 'Is the harvesting location the same as or near to the starting place for transporting?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'woodSpeciesOnHarvestLicence',
    displayName: 'What wood species is named on the harvest licence?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'uploadOriginalDocument',
    displayName: 'Please upload the original document',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'validPeriod',
    displayName: 'Valid Period',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.DateField
  },
  {
    fieldName: 'isCertificateStillValid',
    displayName: 'Is the certificate still valid?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'isProductNameCorrect',
    displayName: 'Is the product name and the botanical/scientific name of the product (species name) correct?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'woodSpeciesNameOnCertificate',
    displayName: 'What wood species is named on the phytosanitary certificate?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'nameOwnerOfDocument',
    displayName: 'Name (owner of the document)',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.StringField
  },
  {
    fieldName: 'scopeOfBusiness',
    displayName: 'Scope of Business',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.TextareaField
  },
  {
    fieldName: 'isNameTheSameAsThatShownOnCertificate',
    displayName: 'Is the name the same as that shown on the business registration certificate?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'isTaxRegistrationCodeTheSame',
    displayName:
      'Is the tax registration code the same as that shown on the invoice issued by the tax registration certificate holder (if available)?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  {
    fieldName: 'isScopeTheSameAsOnCertificate',
    displayName: 'Is the scope the same as it is on the business registration certificate?',
    areaType: [AreaTypeEnum.stepForm],
    type: FieldTypeIds.BoolField,
    configuration: {
      position: 0,
      renderType: FieldRenderTypeEnum.radio
    }
  },
  // comment fields
  {
    fieldName: 'commentContent',
    displayName: 'Content',
    areaType: [AreaTypeEnum.comment],
    type: FieldTypeIds.TextareaField
  },
  {
    fieldName: 'commentDate',
    displayName: 'Date',
    areaType: [AreaTypeEnum.comment],
    type: FieldTypeIds.DateTimeField
  },
  {
    fieldName: 'about',
    displayName: 'About',
    areaType: [AreaTypeEnum.comment],
    type: FieldTypeIds.ListField,
    configuration: {
      position: 0,
      listName: 'commentType',
      renderType: FieldRenderTypeEnum.select
    }
  },
  {
    fieldName: 'pleaseUploadTheDocument',
    displayName: 'Please upload the document',
    areaType: [AreaTypeEnum.comment],
    type: FieldTypeIds.FileField
  },
  {
    fieldName: 'commentAuthor',
    displayName: 'Sender',
    areaType: [AreaTypeEnum.comment],
    type: FieldTypeIds.StringField
  }
];

// SCHEMAS
export const rawDataSchemas: ScriptSchema[] = [
  {
    name: 'Articles Schema - GDC',
    areaType: AreaTypeEnum.rawData,
    functions: [],
    status: CaseStatus.Open,
    fields: [
      {
        name: 'articleNumber',
        configuration: {
          position: 0
        }
      },
      {
        name: 'articleName',
        configuration: {
          position: 1
        }
      },
      {
        name: 'orderNumber',
        configuration: {
          position: 2
        }
      },
      {
        name: 'supplierNumber',
        configuration: {
          position: 3
        }
      },
      {
        name: 'supplierName',
        configuration: {
          position: 4
        }
      },
      {
        name: 'buyer',
        configuration: {
          position: 5
        }
      },
      {
        name: 'etd',
        configuration: {
          position: 6
        }
      },
      {
        name: 'eta',
        configuration: {
          position: 7
        }
      },
      {
        name: 'quantity',
        configuration: {
          position: 8
        }
      },
      {
        name: 'quantityUnit',
        configuration: {
          position: 9
        }
      }
      // {
      //   name: 'supplierNumber',
      //   configuration: {
      //     position: 8
      //   }
      // },
      // {
      //   name: 'supplierName',
      //   configuration: {
      //     position: 9
      //   }
      // },
      // {
      //   name: 'supplierEmail',
      //   configuration: {
      //     position: 10
      //   }
      // },
      // {
      //   name: 'externalKey',
      //   configuration: {
      //     position: 11
      //   }
      // },
      // {
      //   name: 'positionNumber',
      //   configuration: {
      //     position: 12
      //   }
      // },
      // {
      //   name: 'customsStorage',
      //   configuration: {
      //     position: 13
      //   }
      // },
      // {
      //   name: 'placeOfUnloading',
      //   configuration: {
      //     position: 14
      //   }
      // },
      // {
      //   name: 'bulkItem',
      //   configuration: {
      //     position: 15
      //   }
      // },
      // {
      //   name: 'plant',
      //   configuration: {
      //     position: 16
      //   }
      // },
      // {
      //   name: 'location',
      //   configuration: {
      //     position: 17
      //   }
      // },
      // {
      //   name: 'shippingMode',
      //   configuration: {
      //     position: 18
      //   }
      // },
      // {
      //   name: 'shippingPoint',
      //   configuration: {
      //     position: 19
      //   }
      // },

      // {
      //   name: 'buyerEmail',
      //   configuration: {
      //     position: 20
      //   }
      // }
    ]
  }
];

export const caseSchemas: ScriptSchema[] = [
  {
    name: 'Case Schema - GDC',
    areaType: AreaTypeEnum.case,
    functions: [],
    rawDataSchemaName: 'Articles Schema - GDC',
    commentSchemaName: 'Comment Schema - GDC',
    status: CaseStatus.Open,
    fields: [
      // as per WFM-2046, there will be 'suppliers'
      // system property in case DE which will substitute supplierName schemaField

      // {
      //   name: 'supplierName',
      //   configuration: {
      //     position: 0
      //   }
      // },
      {
        name: 'name',
        configuration: {
          position: 0,
          isSystemDefault: false,
          defaultValueType: DefaultValueTypeEnum.dynamic,
          dynamicValue: DynamicValueTypeEnum.currentDateTime,
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
  }
];

export const commentSchemas: ScriptSchema[] = [
  {
    name: 'Comment Schema - GDC',
    areaType: AreaTypeEnum.comment,
    functions: [],
    status: CaseStatus.Open,
    fields: [
      {
        name: 'about',
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
        name: 'pleaseUploadTheDocument',
        configuration: {
          position: 1
        }
      },
      {
        name: 'commentContent',
        configuration: {
          position: 2,
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
          position: 3,
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
          position: 4,
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

// simple schemas without nesting
export const stepSchemas: ScriptSchema[] = [
  // checked with stage

  {
    name: 'Business License or equivalent',
    areaType: AreaTypeEnum.stepForm,
    functions: [],
    status: CaseStatus.Open,
    fields: [
      {
        name: 'documentAvailable',
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
        name: 'name',
        configuration: {
          position: 1
        }
      },
      {
        name: 'address',
        configuration: {
          position: 2
        }
      },
      {
        name: 'isCompanyNameCorrect',
        configuration: {
          position: 3
        }
      },
      {
        name: 'isProductTypeCorrect',
        configuration: {
          position: 4
        }
      },
      {
        name: 'isTheCertificateValid',
        configuration: {
          position: 5
        }
      },
      {
        name: 'isTheUniqueSocialCreditCodeTheSameAsShownOnTheInvoice',
        configuration: {
          position: 6
        }
      },
      {
        name: 'pleaseUploadTheBusinessLicense',
        configuration: {
          position: 7
        }
      }
    ]
  },
  // checked with stage
  {
    //
    name: 'Wood Certification',
    areaType: AreaTypeEnum.stepForm,
    functions: [],
    status: CaseStatus.Open,
    fields: [
      {
        name: 'documentAvailable',
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
        name: 'fscCertificate',
        configuration: {
          position: 1
        }
      },
      {
        name: 'fscCertificateCode',
        configuration: {
          position: 2
        }
      },
      {
        name: 'pefcCertificate',
        configuration: {
          position: 3
        }
      },
      {
        name: 'pefcCertificateNumber',
        configuration: {
          position: 4
        }
      }
    ]
  },
  // checked with stage
  {
    name: 'Further Document',
    areaType: AreaTypeEnum.stepForm,
    functions: [],
    status: CaseStatus.Open,
    fields: [
      {
        name: 'furtherDocumentAvailable',
        configuration: {
          position: 0
        }
      },
      {
        name: 'nameOfTheDocument',
        configuration: {
          position: 1
        }
      },
      {
        name: 'content',
        configuration: {
          position: 2
        }
      },
      {
        name: 'uploadDocument',
        configuration: {
          position: 3
        }
      }
    ]
  },
  // checked with stage

  {
    name: 'Transportation Document',
    areaType: AreaTypeEnum.stepForm,
    functions: [],
    status: CaseStatus.Open,
    fields: [
      {
        name: 'ownerOfTheProduct',
        configuration: {
          position: 0
        }
      },
      {
        name: 'originOfProduct',
        configuration: {
          position: 1
        }
      },
      {
        name: 'validityOfCertificate',
        configuration: {
          position: 2
        }
      },
      {
        name: 'species',
        configuration: {
          position: 3
        }
      },
      {
        name: 'product',
        configuration: {
          position: 4
        }
      },
      {
        name: 'volume',
        configuration: {
          position: 5
        }
      },
      {
        name: 'isCorrectDate',
        configuration: {
          position: 6
        }
      },
      {
        name: 'isHolderSame',
        configuration: {
          position: 7
        }
      },
      {
        name: 'isVolumeEqual',
        configuration: {
          position: 8
        }
      },
      {
        name: 'isLaterThanHarvesting',
        configuration: {
          position: 9
        }
      },
      {
        name: 'isSpeciesTheSame',
        configuration: {
          position: 10
        }
      },
      {
        name: 'isStartingLocationInSameRegion',
        configuration: {
          position: 11
        }
      },
      {
        name: 'isEndpointTheSame',
        configuration: {
          position: 12
        }
      },
      {
        name: 'woodSpeciesNameOnTransportationPermit',
        configuration: {
          position: 13
        }
      },
      {
        name: 'hasSignatureBeenProvidedByAuthority',
        configuration: {
          position: 14
        }
      },
      {
        name: 'uploadTransportPermit',
        configuration: {
          position: 15
        }
      }
    ]
  },
  // checked with stage
  {
    name: 'Business relationship proof (invoice, delivery note, purchase order)',
    areaType: AreaTypeEnum.stepForm,
    functions: [],
    status: CaseStatus.Open,
    fields: [
      {
        name: 'documentType',
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
        name: 'issuingTime',
        configuration: {
          position: 1
        }
      },
      {
        name: 'nameBuyer',
        configuration: {
          position: 2,
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
        name: 'addressBuyer',
        configuration: {
          position: 3
        }
      },
      {
        name: 'nameOfProduct',
        configuration: {
          position: 4
        }
      },
      {
        name: 'unit',
        configuration: {
          position: 5
        }
      },
      {
        name: 'quantity',
        configuration: {
          position: 6
        }
      },
      {
        name: 'nameSeller',
        configuration: {
          position: 7,
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
        name: 'addressSeller',
        configuration: {
          position: 8
        }
      },
      {
        name: 'isProductTypeCorrectForBusiness',
        configuration: {
          position: 9
        }
      },
      {
        name: 'isDocumentPlausibleWithCertificate',
        configuration: {
          position: 10
        }
      },

      {
        name: 'speciesOrProductsOnVatInvoice',
        configuration: {
          position: 11
        }
      },
      {
        name: 'hasCorrectDate',
        configuration: {
          position: 12
        }
      },
      {
        name: 'doesVolumeOrQuantityMatchPermit',
        configuration: {
          position: 13
        }
      },
      {
        name: 'doesProductDescriptionMatchPermit',
        configuration: {
          position: 14
        }
      },
      {
        name: 'isDateOfDocumentAfterTimberHarvest',
        configuration: {
          position: 15
        }
      },
      {
        name: 'areNamesOfBuyerOrSellerSameOnPermit',
        configuration: {
          position: 16
        }
      },
      {
        name: 'uploadOriginalDocumentMayCoverPrice',
        configuration: {
          position: 17,
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
  // checked with stage
  {
    name: 'Further business relationship proof (invoice, delivery note, purchase order)',
    areaType: AreaTypeEnum.stepForm,
    functions: [],
    status: CaseStatus.Open,
    fields: [
      {
        name: 'documentAvailable',
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
        name: 'issuingTime',
        configuration: {
          position: 1
        }
      },
      {
        name: 'nameBuyer',
        configuration: {
          position: 2
        }
      },
      {
        name: 'addressBuyer',
        configuration: {
          position: 3
        }
      },
      {
        name: 'nameOfProduct',
        configuration: {
          position: 4
        }
      },
      {
        name: 'unit',
        configuration: {
          position: 5
        }
      },
      {
        name: 'quantity',
        configuration: {
          position: 5
        }
      },
      {
        name: 'nameSeller',
        configuration: {
          position: 6
        }
      },
      {
        name: 'addressSeller',
        configuration: {
          position: 7
        }
      },
      {
        name: 'isProductTypeCorrectForBusiness',
        configuration: {
          position: 8
        }
      },
      {
        name: 'whatWoodSpeciesIsNamedOnDocument',
        configuration: {
          position: 9
        }
      },
      {
        name: 'hasCorrectDate',
        configuration: {
          position: 11
        }
      },
      {
        name: 'doesVolumeOrQuantityMatchPermit',
        configuration: {
          position: 12
        }
      },
      {
        name: 'doesProductDescriptionMatchPermit',
        configuration: {
          position: 13
        }
      },
      {
        name: 'isDateOfDocumentAfterTimberHarvest',
        configuration: {
          position: 14
        }
      },
      {
        name: 'areNamesOfBuyerOrSellerSameOnPermit',
        configuration: {
          position: 15
        }
      },
      {
        name: 'uploadOriginalDocumentMayCoverPrice',
        configuration: {
          position: 16
        }
      }
    ]
  },
  // checked with stage

  {
    name: 'Harvesting license',
    areaType: AreaTypeEnum.stepForm,
    functions: [],
    status: CaseStatus.Open,
    fields: [
      {
        name: 'holderOfPermit',
        configuration: {
          position: 0,
          validators: [
            {
              key: ValidatorType.Required,
              value: <IRequiredValidatorDto>{
                required: true,
                validatorType: ValidatorType.Required
              }
            },
            {
              key: ValidatorType.MinMax,
              value: <IMinMaxValidatorDto<number>>{
                min: 1,
                max: 55,
                validatorType: ValidatorType.MinMax,
                fieldType: FieldTypeIds.StringField
              }
            }
          ]
        }
      },
      {
        name: 'location',
        configuration: {
          position: 1,
          validators: [
            {
              key: ValidatorType.Required,
              value: {
                required: true,
                validatorType: ValidatorType.Required
              }
            },
            {
              key: ValidatorType.MinMax,
              value: <IMinMaxValidatorDto<number>>{
                min: 1,
                max: 100,
                validatorType: ValidatorType.MinMax,
                fieldType: FieldTypeIds.StringField
              }
            }
          ]
        }
      },
      {
        name: 'species',
        configuration: {
          position: 2,
          validators: [
            {
              key: ValidatorType.Required,
              value: {
                required: true,
                validatorType: ValidatorType.Required
              }
            },
            {
              key: ValidatorType.MinMax,
              value: <IMinMaxValidatorDto<number>>{
                min: 1,
                max: 100,
                validatorType: ValidatorType.MinMax,
                fieldType: FieldTypeIds.StringField
              }
            }
          ]
        }
      },
      {
        name: 'harvestingVolume',
        configuration: {
          position: 3,
          validators: [
            {
              key: ValidatorType.MinMax,
              value: <IMinMaxValidatorDto<number>>{
                min: 1,
                max: 100,
                validatorType: ValidatorType.MinMax,
                fieldType: FieldTypeIds.DecimalField
              }
            }
          ]
        }
      },
      {
        name: 'timeOfHarvestingFrom',
        configuration: {
          position: 4
        }
      },
      {
        name: 'timeOfHarvestingUntil',
        configuration: {
          position: 5
        }
      },
      {
        name: 'isDateOnDocumentPriorDateOfTransport',
        configuration: {
          position: 6
        }
      },
      {
        name: 'hasSignatureBeenProvidedByAuthority',
        configuration: {
          position: 7
        }
      },
      {
        name: 'areaAndForestTypeIncludedInPermit',
        configuration: {
          position: 8
        }
      },
      {
        name: 'isNameOfHolderTheSameAsSellersName',
        configuration: {
          position: 9
        }
      },
      {
        name: 'isHarvestinVolumeEqualOrGreaterThanInInvoice',
        configuration: {
          position: 10
        }
      },
      {
        name: 'isSpeciesTheSameAsInInvoice',
        configuration: {
          position: 11
        }
      },
      {
        name: 'isDateOfHarvestingEarlierThanTransportationDate',
        configuration: {
          position: 12
        }
      },
      {
        name: 'isHarvestingLocationSameOrNearToTransportingPlace',
        configuration: {
          position: 13
        }
      },
      {
        name: 'woodSpeciesOnHarvestLicence',
        configuration: {
          position: 14,
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
        name: 'uploadOriginalDocumentMayCoverPrice',
        configuration: {
          position: 15,
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
  //checked with stage
  {
    name: 'Tax registration certificate',
    areaType: AreaTypeEnum.stepForm,
    functions: [],
    status: CaseStatus.Open,
    fields: [
      {
        name: 'documentAvailable',
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
        name: 'nameOwnerOfDocument',
        configuration: {
          position: 1
        }
      },
      {
        name: 'address',
        configuration: {
          position: 2
        }
      },
      {
        name: 'scopeOfBusiness',
        configuration: {
          position: 3
        }
      },
      {
        name: 'isNameTheSameAsThatShownOnCertificate',
        configuration: {
          position: 4
        }
      },
      {
        name: 'isTaxRegistrationCodeTheSame',
        configuration: {
          position: 5
        }
      },
      {
        name: 'isCertificateStillValid',
        configuration: {
          position: 6
        }
      },

      {
        name: 'isScopeTheSameAsOnCertificate',
        configuration: {
          position: 7
        }
      },
      {
        name: 'hasSignatureBeenProvidedByAuthority',
        configuration: {
          position: 8
        }
      },
      {
        name: 'uploadOriginalDocument',
        configuration: {
          position: 9
        }
      }
    ]
  },
  //checked with stage

  {
    name: 'Phytosanitary Certificate',
    areaType: AreaTypeEnum.stepForm,
    functions: [],
    status: CaseStatus.Open,
    fields: [
      {
        name: 'documentAvailable',
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
        name: 'name',
        configuration: {
          position: 1
        }
      },
      {
        name: 'address',
        configuration: {
          position: 2
        }
      },
      {
        name: 'validPeriod',
        configuration: {
          position: 3
        }
      },
      {
        name: 'isNameTheSameAsThatShownOnCertificate',
        configuration: {
          position: 4
        }
      },
      {
        name: 'isCertificateStillValid',
        configuration: {
          position: 5
        }
      },
      {
        name: 'isProductNameCorrect',
        configuration: {
          position: 6
        }
      },
      {
        name: 'woodSpeciesNameOnCertificate',
        configuration: {
          position: 7
        }
      },
      {
        name: 'hasSignatureBeenProvidedByAuthority',
        configuration: {
          position: 8
        }
      },
      {
        name: 'uploadOriginalDocument',
        configuration: {
          position: 9
        }
      }
    ]
  }
];

export const nestedStepSchemas: ScriptSchema[] = [
  // checked with stage
  {
    name: 'GDC Direct Supplier Schema',
    areaType: AreaTypeEnum.stepForm,
    functions: [],
    status: CaseStatus.Open,
    fields: [
      {
        name: 'supplierType',
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
        name: 'supplierName',
        configuration: {
          position: 1
        }
      },
      {
        name: 'address',
        configuration: {
          position: 2
        }
      },
      {
        name: 'contactPerson',
        configuration: {
          position: 3
        }
      },
      {
        name: 'email',
        configuration: {
          position: 4
        }
      },
      {
        name: 'phoneNumber',
        configuration: {
          position: 5
        }
      },
      {
        name: 'suppliedGoodsMaterialService',
        configuration: {
          position: 6
        }
      },
      {
        name: 'businessLicenseOrEquivalent',
        configuration: {
          position: 7,
          isSchema: true,
          schemaName: 'Business License or equivalent'
        }
      },
      {
        name: 'woodCertification',
        configuration: {
          position: 8,
          isSchema: true,
          schemaName: 'Wood Certification'
        }
      },
      {
        name: 'furtherDocument',
        configuration: {
          position: 9,
          isSchema: true,
          schemaName: 'Further Document'
        }
      }
    ]
  },
  // checked with stage

  {
    name: 'Only Transporter Schema',
    areaType: AreaTypeEnum.stepForm,
    functions: [],
    status: CaseStatus.Open,
    fields: [
      {
        name: 'supplyChainComponentOne',
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
        name: 'transporterName',
        configuration: {
          position: 1
        }
      },
      {
        name: 'transportationDocument',
        configuration: {
          position: 2,
          isSchema: true,
          schemaName: 'Transportation Document'
        }
      },
      {
        name: 'furtherDocument',
        configuration: {
          position: 3,
          isSchema: true,
          schemaName: 'Further Document'
        }
      }
    ]
  },
  // checked with stage
  {
    name: 'Manufacturer Schema',
    areaType: AreaTypeEnum.stepForm,
    functions: [],
    status: CaseStatus.Open,
    fields: [
      {
        name: 'supplyChainComponentOne',
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
        name: 'supplierName',
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
        name: 'address',
        configuration: {
          position: 2,
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
        name: 'contactPerson',
        configuration: {
          position: 3,
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
        name: 'email',
        configuration: {
          position: 4
        }
      },
      {
        name: 'phoneNumber',
        configuration: {
          position: 5
        }
      },

      {
        name: 'businessLicenseOrEquivalent',
        configuration: {
          position: 6,
          isSchema: true,
          schemaName: 'Business License or equivalent'
        }
      },
      {
        name: 'businessRelationshipProof',
        configuration: {
          position: 7,
          isSchema: true,
          schemaName: 'Business relationship proof (invoice, delivery note, purchase order)'
        }
      },
      {
        name: 'furtherBusinessRelationshipProof',
        configuration: {
          position: 8,
          isSchema: true,
          schemaName: 'Further business relationship proof (invoice, delivery note, purchase order)'
        }
      },
      {
        name: 'woodCertification',
        configuration: {
          position: 9,
          isSchema: true,
          schemaName: 'Wood Certification'
        }
      },
      {
        name: 'furtherDocument',
        configuration: {
          position: 10,
          isSchema: true,
          schemaName: 'Further Document'
        }
      }
    ]
  },
  {
    name: 'Paper producer',
    areaType: AreaTypeEnum.stepForm,
    functions: [],
    status: CaseStatus.Open,
    fields: [
      {
        name: 'supplyChainComponentOne',
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
        name: 'supplierName',
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
        name: 'address',
        configuration: {
          position: 2,
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
        name: 'contactPerson',
        configuration: {
          position: 3,
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
        name: 'email',
        configuration: {
          position: 4
        }
      },
      {
        name: 'phoneNumber',
        configuration: {
          position: 5
        }
      },

      {
        name: 'businessLicenseOrEquivalent',
        configuration: {
          position: 6,
          isSchema: true,
          schemaName: 'Business License or equivalent'
        }
      },
      {
        name: 'businessRelationshipProof',
        configuration: {
          position: 7,
          isSchema: true,
          schemaName: 'Business relationship proof (invoice, delivery note, purchase order)'
        }
      },
      {
        name: 'furtherBusinessRelationshipProof',
        configuration: {
          position: 8,
          isSchema: true,
          schemaName: 'Further business relationship proof (invoice, delivery note, purchase order)'
        }
      },
      {
        name: 'phytosanitaryCertificate',
        configuration: {
          position: 9,
          isSchema: true,
          schemaName: 'Phytosanitary Certificate'
        }
      },
      {
        name: 'woodCertification',
        configuration: {
          position: 10,
          isSchema: true,
          schemaName: 'Wood Certification'
        }
      },
      {
        name: 'furtherDocument',
        configuration: {
          position: 11,
          isSchema: true,
          schemaName: 'Further Document'
        }
      }
    ]
  },
  {
    name: 'Pulp producer',
    areaType: AreaTypeEnum.stepForm,
    functions: [],
    status: CaseStatus.Open,
    fields: [
      {
        name: 'supplyChainComponentOne',
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
        name: 'supplierName',
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
        name: 'address',
        configuration: {
          position: 2,
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
        name: 'contactPerson',
        configuration: {
          position: 3,
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
        name: 'email',
        configuration: {
          position: 4
        }
      },
      {
        name: 'phoneNumber',
        configuration: {
          position: 5
        }
      },

      {
        name: 'businessLicenseOrEquivalent',
        configuration: {
          position: 6,
          isSchema: true,
          schemaName: 'Business License or equivalent'
        }
      },
      {
        name: 'businessRelationshipProof',
        configuration: {
          position: 7,
          isSchema: true,
          schemaName: 'Business relationship proof (invoice, delivery note, purchase order)'
        }
      },
      {
        name: 'furtherBusinessRelationshipProof',
        configuration: {
          position: 8,
          isSchema: true,
          schemaName: 'Further business relationship proof (invoice, delivery note, purchase order)'
        }
      },
      {
        name: 'phytosanitaryCertificate',
        configuration: {
          position: 9,
          isSchema: true,
          schemaName: 'Phytosanitary Certificate'
        }
      },
      {
        name: 'woodCertification',
        configuration: {
          position: 10,
          isSchema: true,
          schemaName: 'Wood Certification'
        }
      },
      {
        name: 'furtherDocument',
        configuration: {
          position: 11,
          isSchema: true,
          schemaName: 'Further Document'
        }
      }
    ]
  },
  {
    name: 'Harvester',
    areaType: AreaTypeEnum.stepForm,
    functions: [],
    status: CaseStatus.Open,
    fields: [
      {
        name: 'supplyChainComponentOne',
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
        name: 'supplierName',
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
        name: 'address',
        configuration: {
          position: 2
        }
      },
      {
        name: 'contactPerson',
        configuration: {
          position: 3
        }
      },
      {
        name: 'email',
        configuration: {
          position: 4
        }
      },
      {
        name: 'phoneNumber',
        configuration: {
          position: 5
        }
      },

      {
        name: 'businessLicenseOrEquivalent',
        configuration: {
          position: 6,
          isSchema: true,
          schemaName: 'Business License or equivalent'
        }
      },
      {
        name: 'furtherBusinessRelationshipProof',
        configuration: {
          position: 7,
          isSchema: true,
          schemaName: 'Further business relationship proof (invoice, delivery note, purchase order)'
        }
      },
      {
        name: 'woodCertification',
        configuration: {
          position: 8,
          isSchema: true,
          schemaName: 'Wood Certification'
        }
      },
      {
        name: 'harvestingLicense',
        configuration: {
          position: 9,
          isSchema: true,
          schemaName: 'Harvesting license'
        }
      },
      {
        name: 'furtherDocument',
        configuration: {
          position: 10,
          isSchema: true,
          schemaName: 'Further Document'
        }
      }
    ]
  },
  {
    name: 'Only Trader',
    areaType: AreaTypeEnum.stepForm,
    functions: [],
    status: CaseStatus.Open,
    fields: [
      {
        name: 'supplyChainComponentOne',
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
        name: 'supplierName',
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
        name: 'address',
        configuration: {
          position: 2,
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
        name: 'contactPerson',
        configuration: {
          position: 3,
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
        name: 'email',
        configuration: {
          position: 4
        }
      },
      {
        name: 'phoneNumber',
        configuration: {
          position: 5
        }
      },

      {
        name: 'businessLicenseOrEquivalent',
        configuration: {
          position: 6,
          isSchema: true,
          schemaName: 'Business License or equivalent'
        }
      },
      {
        name: 'furtherBusinessRelationshipProof',
        configuration: {
          position: 7,
          isSchema: true,
          schemaName: 'Further business relationship proof (invoice, delivery note, purchase order)'
        }
      },
      {
        name: 'woodCertification',
        configuration: {
          position: 8,
          isSchema: true,
          schemaName: 'Wood Certification'
        }
      },
      {
        name: 'furtherDocument',
        configuration: {
          position: 9,
          isSchema: true,
          schemaName: 'Further Document'
        }
      }
    ]
  },
  {
    name: 'Sawmill',
    areaType: AreaTypeEnum.stepForm,
    functions: [],
    status: CaseStatus.Open,
    fields: [
      {
        name: 'supplyChainComponentOne',
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
        name: 'supplierName',
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
        name: 'address',
        configuration: {
          position: 2,
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
        name: 'contactPerson',
        configuration: {
          position: 3,
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
        name: 'email',
        configuration: {
          position: 4
        }
      },
      {
        name: 'phoneNumber',
        configuration: {
          position: 5
        }
      },

      {
        name: 'businessLicenseOrEquivalent',
        configuration: {
          position: 6,
          isSchema: true,
          schemaName: 'Business License or equivalent'
        }
      },
      {
        name: 'furtherBusinessRelationshipProof',
        configuration: {
          position: 7,
          isSchema: true,
          schemaName: 'Further business relationship proof (invoice, delivery note, purchase order)'
        }
      },
      {
        name: 'phytosanitaryCertificate',
        configuration: {
          position: 8,
          isSchema: true,
          schemaName: 'Phytosanitary Certificate'
        }
      },
      {
        name: 'woodCertification',
        configuration: {
          position: 9,
          isSchema: true,
          schemaName: 'Wood Certification'
        }
      },
      {
        name: 'furtherDocument',
        configuration: {
          position: 10,
          isSchema: true,
          schemaName: 'Further Document'
        }
      }
    ]
  }
];

export const processSteps: StepConfig[] = [
  {
    name: 'GDC Direct Supplier',
    refName: 'gdcDirectSupplier',
    schema: 'GDC Direct Supplier Schema',
    resolution: [
      // {
      //   name: 'Unresolved'
      // },
      // {
      //   name: 'Approved'
      // },
      // {
      //   name: 'Canceled'
      // },
      {
        name: 'OK'
      }
    ],
    link: {
      defaultOverride: {
        numberOfInstances: 1
      },
      overrides: [
        {
          name: 'allStatusesLink',
          expression: {
            userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
          },
          rights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve,
            WorkflowRightsEnum.CanView
          ],
          numberOfInstances: 1
        },
        {
          name: 'doneStatusLink',
          status: 'Done',
          disallowedRights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve
          ],
          numberOfInstances: 1
        },
        {
          name: 'finishedStatusLink',
          status: 'Finished',
          disallowedRights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve
          ],
          numberOfInstances: 1
        },
        {
          name: 'canceledStatusLink',
          status: 'Canceled',
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
    name: 'Only transporter',
    refName: 'onlyTransporter',
    schema: 'Only Transporter Schema',
    resolution: [
      // {
      //   name: 'Unresolved'
      // },
      // {
      //   name: 'Approved'
      // },
      // {
      //   name: 'Canceled'
      // },
      {
        name: 'OK'
      }
    ],
    link: {
      // SAT: commented those out, they are throwing error on createLink request
      // parentStepName: 'gdcDirectSupplier',
      defaultOverride: {
        numberOfInstances: 999
      },
      overrides: [
        {
          name: 'allStatusesLink',
          expression: {
            ruleSet: {
              condition: RuleSetCustomCondition.And,
              rules: [
                {
                  operator: RuleCustomOperatorEnum.Equal,
                  propertyPath: {
                    path: ['steps', 'gdcDirectSupplier', 'resolution']
                  },
                  value: 'OK'
                }
              ]
            },
            userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
          },
          rights: [WorkflowRightsEnum.CanAdd],
          numberOfInstances: 999
        },
        {
          name: 'allStatusesLink2',
          expression: {
            userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
          },
          rights: [
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve,
            WorkflowRightsEnum.CanView
          ],
          numberOfInstances: 999
        },
        {
          name: 'doneStatusLink',
          status: 'Done',
          disallowedRights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve
          ],
          numberOfInstances: 999
        },
        {
          name: 'finishedStatusLink',
          status: 'Finished',
          disallowedRights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve
          ],
          numberOfInstances: 999
        },
        {
          name: 'canceledStatusLink',
          status: 'Canceled',
          disallowedRights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve
          ],
          numberOfInstances: 999
        }
      ]
    }
  },
  {
    name: 'Manufacturer',
    refName: 'manufacturer',
    schema: 'Manufacturer Schema',
    resolution: [
      // {
      //   name: 'Unresolved'
      // },
      // {
      //   name: 'Approved'
      // },
      // {
      //   name: 'Canceled'
      // },
      {
        name: 'OK'
      }
    ],
    link: {
      // parentStepName: 'gdcDirectSupplier',
      defaultOverride: {
        numberOfInstances: 999
      },
      overrides: [
        {
          name: 'allStatusesLink',
          expression: {
            ruleSet: {
              condition: RuleSetCustomCondition.And,
              rules: [
                {
                  operator: RuleCustomOperatorEnum.Equal,
                  propertyPath: {
                    path: ['steps', 'gdcDirectSupplier', 'resolution']
                  },
                  value: 'OK'
                }
              ]
            },
            userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
          },
          rights: [WorkflowRightsEnum.CanAdd],
          numberOfInstances: 999
        },
        {
          name: 'allStatusesLink2',
          expression: {
            userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
          },
          rights: [
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve,
            WorkflowRightsEnum.CanView
          ],
          numberOfInstances: 999
        },
        {
          name: 'doneStatusLink',
          status: 'Done',
          disallowedRights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve
          ],
          numberOfInstances: 999
        },
        {
          name: 'finishedStatusLink',
          status: 'Finished',
          disallowedRights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve
          ],
          numberOfInstances: 999
        },
        {
          name: 'canceledStatusLink',
          status: 'Canceled',
          disallowedRights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve
          ],
          numberOfInstances: 999
        }
      ]
    }
  },
  // {
  //   name: 'Harvesting license',
  //   refName: 'harvestingLicense',
  //   schema: 'Harvesting license',
  //   resolution: [
  //     {
  //       name: 'OK'
  //     }
  //   ],
  //   processStepLinks: [
  //     {
  //       status: 'All',
  //       expressions: {},
  //       numberOfInstances: 999,
  //       actions: []
  //     },
  //     {
  //       status: 'All',
  //       expressions: {
  //         ruleSet: {
  //           condition: RuleSetCustomCondition.And,
  //           rules: [
  //             {
  //               operator: RuleCustomOperatorEnum.Equal,
  //               propertyPath: {
  //                 path: ['steps', 'gdcDirectSupplier', 'resolution']
  //               },
  //               value: 'OK'
  //             }
  //           ]
  //         },
  //         userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
  //       },
  //       rights: [WorkflowRightsEnum.CanAdd],
  //       parentStepName: 'gdcDirectSupplier',
  //       numberOfInstances: 999
  //     },
  //     {
  //       status: 'All',
  //       expressions: {
  //         userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
  //       },
  //       rights: [WorkflowRightsEnum.CanEdit, WorkflowRightsEnum.CanDelete, WorkflowRightsEnum.CanResolve, WorkflowRightsEnum.CanUnresolve],
  //       parentStepName: 'gdcDirectSupplier',
  //       numberOfInstances: 999
  //     },
  //     {
  //       status: 'Done',
  //       expressions: {
  //         userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //       },
  //       rights: [
  //         WorkflowRightsEnum.CanAdd,
  //         WorkflowRightsEnum.CanEdit,
  //         WorkflowRightsEnum.CanDelete,
  //         WorkflowRightsEnum.CanResolve,
  //         WorkflowRightsEnum.CanUnresolve
  //       ],
  //       // parentStepName: 'gdcDirectSupplier',
  //       numberOfInstances: 999
  //     },
  //     {
  //       status: 'Finished',
  //       expressions: {
  //         userRoles: [Roles.TenantAdmin, Roles.Tenant]
  //       },
  //       rights: [
  //         WorkflowRightsEnum.CanAdd,
  //         WorkflowRightsEnum.CanEdit,
  //         WorkflowRightsEnum.CanDelete,
  //         WorkflowRightsEnum.CanResolve,
  //         WorkflowRightsEnum.CanUnresolve
  //       ],
  //       // parentStepName: 'gdcDirectSupplier',
  //       numberOfInstances: 999
  //     }
  //   ]
  // },
  {
    name: 'Paper Producer',
    refName: 'paperProducer',
    schema: 'Paper producer',
    resolution: [
      {
        name: 'OK'
      }
    ],
    link: {
      // parentStepName: 'gdcDirectSupplier',
      defaultOverride: {
        numberOfInstances: 999
      },
      overrides: [
        {
          name: 'allStatusesLink',
          expression: {
            ruleSet: {
              condition: RuleSetCustomCondition.And,
              rules: [
                {
                  operator: RuleCustomOperatorEnum.Equal,
                  propertyPath: {
                    path: ['steps', 'gdcDirectSupplier', 'resolution']
                  },
                  value: 'OK'
                }
              ]
            },
            userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
          },
          rights: [WorkflowRightsEnum.CanAdd],
          numberOfInstances: 999
        },
        {
          name: 'allStatusesLink2',
          expression: {
            userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
          },
          rights: [
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve,
            WorkflowRightsEnum.CanView
          ],
          numberOfInstances: 999
        },
        {
          name: 'doneStatusLink',
          status: 'Done',
          disallowedRights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve
          ],
          numberOfInstances: 999
        },
        {
          name: 'finishedStatusLink',
          status: 'Finished',
          disallowedRights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve
          ],
          numberOfInstances: 999
        },
        {
          name: 'canceledStatusLink',
          status: 'Canceled',
          disallowedRights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve
          ],
          numberOfInstances: 999
        }
      ]
    }
  },
  {
    name: 'Pulp Producer',
    refName: 'pulpProducer',
    schema: 'Pulp producer',
    resolution: [
      {
        name: 'OK'
      }
    ],
    link: {
      // parentStepName: 'gdcDirectSupplier',
      defaultOverride: {
        numberOfInstances: 999
      },
      overrides: [
        {
          name: 'allStatusesLink',
          expression: {
            ruleSet: {
              condition: RuleSetCustomCondition.And,
              rules: [
                {
                  operator: RuleCustomOperatorEnum.Equal,
                  propertyPath: {
                    path: ['steps', 'gdcDirectSupplier', 'resolution']
                  },
                  value: 'OK'
                }
              ]
            },
            userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
          },
          rights: [WorkflowRightsEnum.CanAdd],
          numberOfInstances: 999
        },
        {
          name: 'allStatusesLink2',
          expression: {
            userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
          },
          rights: [
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve,
            WorkflowRightsEnum.CanView
          ],
          numberOfInstances: 999
        },
        {
          name: 'doneStatusLink',
          status: 'Done',
          disallowedRights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve
          ],
          numberOfInstances: 999
        },
        {
          name: 'finishedStatusLink',
          status: 'Finished',
          disallowedRights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve
          ],
          numberOfInstances: 999
        },
        {
          name: 'canceledStatusLink',
          status: 'Canceled',
          disallowedRights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve
          ],
          numberOfInstances: 999
        }
      ]
    }
  },
  {
    name: 'Harvester',
    refName: 'harvester',
    schema: 'Harvester',
    resolution: [
      {
        name: 'OK'
      }
    ],
    link: {
      // parentStepName: 'gdcDirectSupplier',
      defaultOverride: {
        numberOfInstances: 999
      },
      overrides: [
        {
          name: 'allStatusesLink',
          expression: {
            ruleSet: {
              condition: RuleSetCustomCondition.And,
              rules: [
                {
                  operator: RuleCustomOperatorEnum.Equal,
                  propertyPath: {
                    path: ['steps', 'gdcDirectSupplier', 'resolution']
                  },
                  value: 'OK'
                }
              ]
            },
            userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
          },
          rights: [WorkflowRightsEnum.CanAdd],
          numberOfInstances: 999
        },
        {
          name: 'allStatusesLink2',
          expression: {
            userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
          },
          rights: [
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve,
            WorkflowRightsEnum.CanView
          ],
          numberOfInstances: 999
        },
        {
          name: 'doneStatusesLink',
          status: 'Done',
          disallowedRights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve
          ],
          numberOfInstances: 999
        },
        {
          name: 'finishedStatusesLink',
          status: 'Finished',
          disallowedRights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve
          ],
          numberOfInstances: 999
        },
        {
          name: 'canceledStatusesLink',
          status: 'Canceled',
          disallowedRights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve
          ],
          numberOfInstances: 999
        }
      ]
    }
  },
  {
    name: 'Only trader',
    refName: 'onlyTrader',
    schema: 'Only Trader',
    resolution: [
      {
        name: 'OK'
      }
    ],
    link: {
      // parentStepName: 'gdcDirectSupplier',
      defaultOverride: {
        numberOfInstances: 999
      },
      overrides: [
        {
          name: 'allStatusesLink',
          expression: {
            ruleSet: {
              condition: RuleSetCustomCondition.And,
              rules: [
                {
                  operator: RuleCustomOperatorEnum.Equal,
                  propertyPath: {
                    path: ['steps', 'gdcDirectSupplier', 'resolution']
                  },
                  value: 'OK'
                }
              ]
            },
            userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
          },
          rights: [WorkflowRightsEnum.CanAdd],
          numberOfInstances: 999
        },
        {
          name: 'allStatusesLink2',
          expression: {
            userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
          },
          rights: [
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve,
            WorkflowRightsEnum.CanView
          ],
          numberOfInstances: 999
        },
        {
          name: 'doneStatusLink',
          status: 'Done',
          disallowedRights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve
          ],
          numberOfInstances: 999
        },
        {
          name: 'finishedStatusLink',
          status: 'Finished',
          disallowedRights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve
          ],
          numberOfInstances: 999
        },
        {
          name: 'canceledStatusLink',
          status: 'Canceled',
          disallowedRights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve
          ],
          numberOfInstances: 999
        }
      ]
    }
  },
  {
    name: 'Sawmill',
    refName: 'sawmill',
    schema: 'Sawmill',
    resolution: [
      {
        name: 'OK'
      }
    ],
    link: {
      // parentStepName: 'gdcDirectSupplier',
      defaultOverride: {
        numberOfInstances: 999
      },
      overrides: [
        {
          name: 'allStatusesLink',
          expression: {
            ruleSet: {
              condition: RuleSetCustomCondition.And,
              rules: [
                {
                  operator: RuleCustomOperatorEnum.Equal,
                  propertyPath: {
                    path: ['steps', 'gdcDirectSupplier', 'resolution']
                  },
                  value: 'OK'
                }
              ]
            },
            userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
          },
          rights: [WorkflowRightsEnum.CanAdd],
          numberOfInstances: 999
        },
        {
          name: 'allStatusesLink2',
          expression: {
            userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
          },
          rights: [
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve,
            WorkflowRightsEnum.CanView
          ],
          numberOfInstances: 999
        },
        {
          name: 'doneStatusLink',
          status: 'Done',
          disallowedRights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve
          ],
          numberOfInstances: 999
        },
        {
          name: 'finishedStatusLink',
          status: 'Finished',
          disallowedRights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve
          ],
          numberOfInstances: 999
        },
        {
          name: 'canceledStatusLink',
          status: 'Canceled',
          disallowedRights: [
            WorkflowRightsEnum.CanAdd,
            WorkflowRightsEnum.CanEdit,
            WorkflowRightsEnum.CanDelete,
            WorkflowRightsEnum.CanResolve,
            WorkflowRightsEnum.CanUnresolve
          ],
          numberOfInstances: 999
        }
      ]
    }
  }
];

// WORKFLOW
export const workflow: ScriptWorkflow = {
  name: 'GDC',
  caseName: 'Case Schema - GDC',
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
      position: 3,
      configuration: {
        label: 'Reopen The Case',
        color: 'red'
      }
    },
    {
      name: 'Finished',
      position: 4,
      configuration: {
        label: 'Finish',
        color: 'green'
      }
    },
    {
      name: 'Canceled',
      position: 5,
      configuration: {
        label: 'Cancel Case',
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
        userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
      }
    },
    {
      fromStatus: 'In Progress',
      toStatus: 'Done',
      name: 'inProgressToDoneExpression',
      expression: {
        userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
      }
    },
    {
      fromStatus: 'Done',
      toStatus: 'Finished',
      name: 'doneToFinishedExpression',
      expression: {
        userRoles: [Roles.TenantAdmin, Roles.Tenant]
      }
    },
    {
      fromStatus: 'Finished',
      toStatus: 'Reopened',
      name: 'finishedToReopenedExpression',
      expression: {
        userRoles: [Roles.TenantAdmin, Roles.Tenant]
      }
    },
    {
      fromStatus: 'Reopened',
      toStatus: 'Done',
      name: 'reopenedToDoneExpression',
      expression: {
        userRoles: [Roles.TenantAdmin, Roles.Tenant, Roles.Supplier]
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
      fromStatus: 'Open',
      toStatus: 'Canceled',
      name: 'openToCanceledExpression',
      expression: {
        userRoles: [Roles.TenantAdmin, Roles.Tenant]
      }
    },
    {
      fromStatus: 'In Progress',
      toStatus: 'Canceled',
      name: 'inProgressToCanceledExpression',
      expression: {
        userRoles: [Roles.TenantAdmin, Roles.Tenant]
      }
    },
    {
      fromStatus: 'Done',
      toStatus: 'Canceled',
      name: 'doneToCanceledExpression',
      expression: {
        userRoles: [Roles.TenantAdmin, Roles.Tenant]
      }
    },
    {
      fromStatus: 'Reopened',
      toStatus: 'Canceled',
      name: 'reopenedToCanceledExpression',
      expression: {
        userRoles: [Roles.TenantAdmin, Roles.Tenant]
      }
    },
    {
      fromStatus: 'Canceled',
      toStatus: 'Reopened',
      name: 'canceledToReopenExpression',
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

export const titleSettings = [
  {
    area: AreaTypeEnum.case,
    schemaName: 'Case Schema - GDC',
    schemaTitles: [
      {
        area: UiAreasEnum.caseKanbanTitle,
        keyValueSeparator: ':',
        fieldSeparator: '',
        fields: ['name']
      },
      {
        area: UiAreasEnum.caseQuickInfo,
        keyValueSeparator: ':',
        fieldSeparator: '',
        fields: ['name']
      },
      {
        area: UiAreasEnum.caseDetailTitle,
        keyValueSeparator: ':',
        fieldSeparator: '',
        fields: ['name']
      }
    ]
  }
];

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
      template: GDCNewRawDataTemplate,
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
      template: GDCNewRawDataTemplate,
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
      template: GDCNewRawDataTemplate,
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
      template: GDCNewRawDataTemplate,
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
      template: GDCCasesTemplate,
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
      template: GDCCasesTemplate,
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
      template: GDCInvitationsTemplate,
      logoId: ''
    }
  }
];
