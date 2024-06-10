import { IConfigurableListItem } from '@wfm/common/models';
import { FieldTypeIds } from '@wfm/service-layer';
import { pathSeparator } from '../actions/field-path-generator/field-path-generator.component';
import { TreeLikeNodes, TreeNodeAdditionalData } from './checklist-database.service';

export function populateFieldOptions(fields: IConfigurableListItem[], allowedTypes: FieldTypeIds[]): TreeLikeNodes {
  let fieldTree: TreeLikeNodes = {};
  buildFieldsTree(fields, fieldTree, allowedTypes);

  return fieldTree;
}

/**
 * recursively build each level of the tree
 */
function buildFieldsTree(
  fields: IConfigurableListItem[],
  treeObject: TreeLikeNodes,
  allowedTypes: FieldTypeIds[],
  parentRawValue?: string
): void {
  fields.forEach((field) => {
    if (allowedTypes?.length && !allowedTypes.includes(field.type)) {
      return;
    }
    if (!treeObject[field.fieldName]) {
      treeObject[field.fieldName] = {
        rawValue: parentRawValue ? `${parentRawValue}${pathSeparator}${field.fieldName}` : field.fieldName,
        children: {},
        additionalData: <TreeNodeAdditionalData>{
          field: { ...field },
          fieldType: field.type
        }
      };
    }
    if (field.type == FieldTypeIds.EmbededField && field.fields?.length) {
      const nestedTreeObj = treeObject[field.fieldName].children;
      buildFieldsTree(field.fields, nestedTreeObj, allowedTypes, treeObject[field.fieldName].rawValue);
    }
  });
}
