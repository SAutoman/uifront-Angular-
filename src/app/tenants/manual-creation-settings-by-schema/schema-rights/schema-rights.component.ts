import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  AreaTypeEnum,
  RightsData,
  RoleManualCreation,
  Roles,
  SchemaRights,
  SchemaRightsEnum,
  UserGroupManualCreation
} from '@wfm/service-layer';
import { BaseComponent } from '@wfm/shared/base.component';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-schema-rights',
  templateUrl: './schema-rights.component.html',
  styleUrls: ['./schema-rights.component.scss'],
  host: {
    class: 'row ml-0 mr-0'
  }
})
export class SchemaRightsComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() areaType: AreaTypeEnum;
  @Input() role?: Roles;
  @Input() groupId?: string;
  @Input() schemaPermissions?: RoleManualCreation | UserGroupManualCreation;
  @Input() schemaId: string;
  @Output() schemaRightsEmitter: EventEmitter<RoleManualCreation | UserGroupManualCreation> = new EventEmitter(null);

  selectedRightsControl: FormControl = new FormControl(null);
  allowedRights: SchemaRightsEnum[];
  rightsOptions: RightsData[];

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.populateAllowedRights();
    this.selectedRightsControl.valueChanges.pipe(takeUntil(this.destroyed$), distinctUntilChanged()).subscribe(() => {
      this.onAllowedSchemaRights();
    });
    this.updateControl(true);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.schemaId?.currentValue && !changes?.schemaPermissions?.currentValue) {
      this.selectedRightsControl.setValue(null);
    }
    if (changes?.schemaPermissions?.currentValue) {
      this.updateControl(false);
    }
  }

  updateControl(emitEvent?: boolean): void {
    let rights: string[] = this.getSelection();
    this.selectedRightsControl?.setValue(rights, { emitEvent: emitEvent });
  }

  populateAllowedRights(): void {
    switch (this.areaType) {
      case AreaTypeEnum.rawData:
        this.allowedRights = [
          SchemaRightsEnum.Add,
          SchemaRightsEnum.Edit,
          SchemaRightsEnum.Delete,
          SchemaRightsEnum.HideGridSelectbox,
          SchemaRightsEnum.EnableLayout,
          SchemaRightsEnum.HideSchemaFromMenu
        ];
        break;
      case AreaTypeEnum.case:
        this.allowedRights = [
          SchemaRightsEnum.Add,
          SchemaRightsEnum.Edit,
          SchemaRightsEnum.Delete,
          SchemaRightsEnum.HideGridSelectbox,
          SchemaRightsEnum.EnableLayout,
          SchemaRightsEnum.HideSchemaFromMenu,
          SchemaRightsEnum.ShowVisualViewButton
        ];
        break;
      case AreaTypeEnum.comment:
        this.allowedRights = [SchemaRightsEnum.Add, SchemaRightsEnum.Edit, SchemaRightsEnum.Delete];
        break;

      default:
        break;
    }

    this.rightsOptions = this.allowedRights.map((right) => {
      return SchemaRights[right];
    });
  }

  getSelection(): string[] {
    const selectedRights: string[] = [];
    const permissions = this.schemaPermissions?.permission || {};
    for (const key in permissions) {
      if (permissions.hasOwnProperty(key) && permissions[key]) {
        selectedRights.push(key);
      }
    }
    return selectedRights;
  }

  onAllowedSchemaRights(): void {
    const selectedRights: string[] = this.selectedRightsControl.value || [];

    const permissions = {
      add: false,
      edit: false,
      delete: false
    };
    selectedRights.forEach((key) => {
      permissions[key] = true;
    });
    const data = {
      permission: permissions
    } as RoleManualCreation | UserGroupManualCreation;

    if (this.role) {
      (<RoleManualCreation>data).role = this.role;
    } else {
      (<UserGroupManualCreation>data).groupId = this.groupId;
    }
    this.schemaRightsEmitter.emit(data);
  }
}
