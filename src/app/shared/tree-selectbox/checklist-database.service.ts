import { Injectable } from '@angular/core';
import { IConfigurableListItem } from '@wfm/common/models';
import { DatasourceField } from '@wfm/report/report-datasource.model';
import { FieldTypeIds } from '@wfm/service-layer';
import { BehaviorSubject } from 'rxjs';

export interface TreeNodeAdditionalData {
  fieldType?: FieldTypeIds;
  field?: IConfigurableListItem;
  datasourceField?: DatasourceField;
  // we can add more data here, if we need something
}

/**
 * Node for item
 */
export class SelectItemNode {
  children: SelectItemNode[];
  item: string;
  rawValue: string;
  additionalData?: TreeNodeAdditionalData;
}

/** Flat item node with expandable and level information */
export class SelectItemFlatNode {
  item: string;
  level: number;
  expandable: boolean;
  rawValue: string;
  additionalData?: TreeNodeAdditionalData;
}

export interface TreeLikeNodes {
  [key: string]: {
    rawValue?: string;
    children: TreeLikeNodes;
    additionalData?: TreeNodeAdditionalData;
  };
}

@Injectable()
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<SelectItemNode[]>([]);

  get data(): SelectItemNode[] {
    return this.dataChange.value;
  }

  constructor() {}

  initialize(treeData: TreeLikeNodes) {
    // Build the tree nodes from Json object. The result is a list of `SelectItemNode` with nested
    //     file node as children.
    const data = this.buildFileTree(treeData, 0);

    // Notify the change.
    this.dataChange.next(data);
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `SelectItemNode`.
   */
  buildFileTree(obj: { [key: string]: any }, level: number): SelectItemNode[] {
    return Object.keys(obj).reduce<SelectItemNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new SelectItemNode();
      node.item = key;
      node.rawValue = value?.rawValue;
      if (value?.additionalData) {
        node.additionalData = value.additionalData;
      }

      if (value?.children != null) {
        if (typeof value?.children === 'object') {
          node.children = this.buildFileTree(value?.children, level + 1);
        } else {
          node.item = value?.children;
          node.rawValue = value?.rawValue;
          if (value?.additionalData) {
            node.additionalData = value.additionalData;
          }
        }
      }

      return accumulator.concat(node);
    }, []);
  }
}
