import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { AggregationEnumBackendExtended, FieldTypeIds, FieldTypeNameMap } from '@wfm/service-layer';
import { Guid } from '@wfm/shared/guid';
import { ChecklistDatabase, SelectItemFlatNode, SelectItemNode, TreeLikeNodes, TreeNodeAdditionalData } from './checklist-database.service';
import { KeyValueView } from '@wfm/common/models';
import { AggregateTypeNameMap } from '@wfm/service-layer/models/aggregate-types-enum';

export interface TreeNodeOutput {
  key: string;
  value: string;
  additionalData?: TreeNodeAdditionalData;
}

@Component({
  selector: 'app-tree-selectbox',
  templateUrl: './tree-selectbox.component.html',
  styleUrls: ['./tree-selectbox.component.scss'],
  providers: [ChecklistDatabase]
})
export class TreeSelectboxComponent implements OnInit {
  @Input() rawDatasource: TreeLikeNodes;
  @Input() selectedItems: string[];
  @Input() parentSelectionAllowed: boolean = true;
  @Input() multipleSelection: boolean = true;
  @Input() isReportGrid?: boolean = false;
  @Input() showAggregationSelectbox: boolean = false;

  @Output() selectionEmitter: EventEmitter<TreeNodeOutput[]> = new EventEmitter();
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<SelectItemFlatNode, SelectItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<SelectItemNode, SelectItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: SelectItemFlatNode | null = null;

  treeControl: FlatTreeControl<SelectItemFlatNode>;

  treeFlattener: MatTreeFlattener<SelectItemNode, SelectItemFlatNode>;

  dataSource: MatTreeFlatDataSource<SelectItemNode, SelectItemFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<SelectItemFlatNode>(true /* multiple */);
  radioButtonGroupName: string;
  aggregationTypes: KeyValueView<string, AggregationEnumBackendExtended>[];
  constructor(private _database: ChecklistDatabase) {}

  ngOnInit() {
    if (!this.multipleSelection) {
      this.radioButtonGroupName = Guid.createQuickGuidAsString();
    }
    this._database.initialize(this.rawDatasource);
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<SelectItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this._database.dataChange.subscribe((data) => {
      this.dataSource.data = data;
      if (this.selectedItems) {
        this.processSelection();
      }
    });
    if (this.showAggregationSelectbox) {
      this.getAggregationOptions();
    }
  }

  getLevel = (node: SelectItemFlatNode) => node.level;

  isExpandable = (node: SelectItemFlatNode) => node.expandable;

  getChildren = (node: SelectItemNode): SelectItemNode[] => node.children;

  hasChild = (_: number, _nodeData: SelectItemFlatNode) => _nodeData.expandable;

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: SelectItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item ? existingNode : new SelectItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children?.length;
    flatNode.rawValue = node.rawValue;
    if (node.additionalData) {
      flatNode.additionalData = node.additionalData;
    }
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: SelectItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every((child) => {
        return this.checklistSelection.isSelected(child);
      });
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: SelectItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some((child) => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the  item selection. Select/deselect all the descendants node */
  itemSelectionToggle(node: SelectItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.forEach((child) => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
    this.emitToParent();
  }

  /** Toggle a leaf item selection. Check all the parents to see if they changed */
  leafItemSelectionToggle(node: SelectItemFlatNode): void {
    if (!this.multipleSelection) {
      this.checklistSelection.deselect(...this.treeControl.dataNodes);
    }
    this.checklistSelection.toggle(node);
    if (this.parentSelectionAllowed) {
      this.checkAllParentsSelection(node);
    }
    this.emitToParent();
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: SelectItemFlatNode): void {
    let parent: SelectItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: SelectItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every((child) => {
        return this.checklistSelection.isSelected(child);
      });
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: SelectItemFlatNode): SelectItemFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  processSelection(): void {
    const allSelectedNodes = [];
    this.selectedItems.forEach((item: string) => {
      const flatNode = this.treeControl.dataNodes.find((flatNode) => flatNode.rawValue === item);
      if (flatNode) {
        this.expandParentNode(flatNode);
        allSelectedNodes.push(flatNode);
      }
    });
    this.checklistSelection.select(...allSelectedNodes);
    this.emitToParent();
  }

  expandParentNode(node: SelectItemFlatNode): void {
    let parent: SelectItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.treeControl.expand(parent);
      parent = this.getParentNode(parent);
    }
  }

  emitToParent(): void {
    const selectedNodes = this.checklistSelection.selected || [];
    const selection: TreeNodeOutput[] = selectedNodes.map((item) => {
      let output: TreeNodeOutput = {
        key: item.item,
        value: item.rawValue
      };
      if (item.additionalData) {
        output.additionalData = item.additionalData;
      }
      return output;
    });
    // build the required object and emit to parent
    this.selectionEmitter.emit(selection);
  }

  getFieldTypeLabel(type: FieldTypeIds): string {
    return FieldTypeNameMap.get(type).viewValue;
  }

  toggleEditMode(node: SelectItemFlatNode): void {
    node['allowNameEdit'] = node['allowNameEdit'] ? !node['allowNameEdit'] : true;
  }

  onFieldNameUpdate(value: string, node: SelectItemFlatNode): void {
    if (this.isEmpty(value) || !node.additionalData?.datasourceField) return;
    node.additionalData.datasourceField.customReportTitle = value?.trim();
    node['allowNameEdit'] = false;
  }

  resetCustomTitle(node: SelectItemFlatNode): void {
    if (node.additionalData?.datasourceField) {
      node.additionalData.datasourceField.customReportTitle = null;
    }
  }

  isEmpty(value: string): boolean {
    return !value?.trim().length ? true : false;
  }

  getAggregationOptions(): void {
    this.aggregationTypes = [
      AggregationEnumBackendExtended.Group,
      AggregationEnumBackendExtended.Min,
      AggregationEnumBackendExtended.Max,
      AggregationEnumBackendExtended.Avg,
      AggregationEnumBackendExtended.Sum,
      AggregationEnumBackendExtended.Count
    ].map((agg) => AggregateTypeNameMap.get(agg));
  }
}
