import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { DynamicEntitySearchProfileUI, Roles } from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

export interface SearchProfilesRoleBased {
  allowedSearchProfiles: string[];
  defaultSearchProfile: string;
  role?: Roles;
  groupId?: string;
}

@Component({
  selector: 'app-select-search-profile',
  templateUrl: './select-search-profile.component.html',
  styleUrls: ['./select-search-profile.component.scss'],
  host: {
    class: 'row ml-0 mr-0'
  }
})
export class SelectSearchProfileComponent extends TenantComponent implements OnInit {
  @Input() userId: string;
  @Input() role?: Roles;
  @Input() groupId?: string;
  @Input() searchProfileSetting: SearchProfilesRoleBased;
  @Input() searchProfiles: DynamicEntitySearchProfileUI[];
  @Output() searchProfileEmitter: EventEmitter<SearchProfilesRoleBased> = new EventEmitter(null);

  selectedSearchProfiles: DynamicEntitySearchProfileUI[] = [];
  allowedSearchProfilesControl: FormControl = new FormControl(null);
  defaultSearchProfileControl: FormControl = new FormControl(null);

  constructor(store: Store<ApplicationState>) {
    super(store);
  }

  async ngOnInit(): Promise<void> {
    this.setSearchProfilesData();
    this.allowedSearchProfilesControl.valueChanges.pipe(takeUntil(this.destroyed$), distinctUntilChanged()).subscribe(() => {
      this.onAllowedSearchProfileChange();
      this.emitData();
    });
    this.defaultSearchProfileControl.valueChanges.pipe(takeUntil(this.destroyed$), distinctUntilChanged()).subscribe(() => {
      this.emitData();
    });
  }

  setSearchProfilesData(): void {
    if (this.searchProfileSetting) {
      this.populateSelectedSearchProfiles(this.searchProfileSetting.allowedSearchProfiles);

      if (this.searchProfiles.find((sProfile) => sProfile.id === this.searchProfileSetting.defaultSearchProfile)) {
        this.defaultSearchProfileControl.setValue(this.searchProfileSetting.defaultSearchProfile);
      }
      const filteredAllowedSearchProfiles = this.searchProfileSetting.allowedSearchProfiles?.filter((profileId) =>
        this.searchProfiles.find((sProfile) => sProfile.id === profileId)
      );
      this.allowedSearchProfilesControl.setValue(filteredAllowedSearchProfiles);
      this.emitData();
    }
  }

  populateSelectedSearchProfiles(ids: string[]): void {
    this.selectedSearchProfiles = [];
    if (ids?.length) {
      for (let index = 0; index < ids.length; index++) {
        const profile = this.searchProfiles?.find((x) => x.id === ids[index]);
        if (profile) this.selectedSearchProfiles.push(profile);
      }
    }
  }

  /**
   * populate options for defaultSearchProfile
   * in case current default searchProfile is not in the list, reset it
   */
  onAllowedSearchProfileChange(): void {
    const selectedProfiles: string[] = this.allowedSearchProfilesControl.value;
    if (selectedProfiles?.length) {
      this.populateSelectedSearchProfiles(selectedProfiles);
      if (
        this.defaultSearchProfileControl.value &&
        !this.selectedSearchProfiles.find((x) => x.id === this.defaultSearchProfileControl.value)
      ) {
        this.defaultSearchProfileControl.setValue(null);
      }
    } else {
      this.selectedSearchProfiles = [];
      this.defaultSearchProfileControl.setValue(null);
    }
  }

  emitData(): void {
    const data = {
      allowedSearchProfiles: this.allowedSearchProfilesControl.value,
      defaultSearchProfile: this.defaultSearchProfileControl.value,
      role: this.role,
      groupId: this.groupId
    };

    this.searchProfileEmitter.emit(data);
  }

  clearSelectedProfile(): void {
    this.defaultSearchProfileControl.reset();
  }
}
