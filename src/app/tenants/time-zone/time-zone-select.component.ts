/**
 * global
 */

import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TimeZone } from '@vvo/tzdb';
import { DateTime } from 'luxon';
import { distinctUntilChanged, debounceTime, takeUntil } from 'rxjs/operators';
/**
 * project
 */
import { BaseComponent } from '@wfm/shared/base.component';

/**
 * local
 */
import { getTimezonesFromtzdb } from './timezone.helper';

@Component({
  selector: 'app-time-zone-select',
  templateUrl: './time-zone-select.component.html',
  styleUrls: ['./time-zone-select.component.scss']
})
export class TimeZoneSelectComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() timezoneSelected?: string;
  @Output() timezoneUpdated = new EventEmitter();
  currentTime: string;
  currentDate: string;
  currentOffset: number;
  tzForm: FormGroup;
  tzOptions: TimeZone[];
  filteredTzOptions: TimeZone[];

  constructor(private formBuilder: FormBuilder) {
    super();
    this.initForm();
  }

  ngOnInit() {
    this.populateTimezoneOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.timezoneSelected && changes.timezoneSelected.currentValue !== changes.timezoneSelected.previousValue) {
      this.updateForm();
    }
  }

  initForm(): void {
    this.tzForm = this.formBuilder.group({
      tzSearchTerm: [''],
      timezone: ['', [Validators.required]]
    });

    this.tzForm.get('timezone').valueChanges.subscribe((newTzName: string) => {
      this.loadTimeZoneFormats(newTzName);
      this.timezoneUpdated.emit({ timezone: newTzName });
    });

    this.tzForm
      .get('tzSearchTerm')
      .valueChanges.pipe(distinctUntilChanged(), debounceTime(300), takeUntil(this.destroyed$))
      .subscribe((x: string) => {
        this.filterTimezones(x);
      });
  }

  updateForm(): void {
    this.tzForm?.patchValue({
      timezone: this.timezoneSelected
    });
  }

  populateTimezoneOptions(): void {
    this.tzOptions = getTimezonesFromtzdb();
    this.filteredTzOptions = [...this.tzOptions];
  }

  filterTimezones(key: string): void {
    const normalizedKey = key?.trim()?.toLowerCase();
    if (normalizedKey) {
      this.filteredTzOptions = this.tzOptions.filter((tz) => {
        return (
          tz.name.toLowerCase().includes(normalizedKey) ||
          tz.abbreviation.toLowerCase().includes(normalizedKey) ||
          tz.alternativeName.toLowerCase().includes(normalizedKey)
        );
      });
    } else {
      this.filteredTzOptions = [...this.tzOptions];
    }
  }

  loadTimeZoneFormats(timezoneName: string): void {
    this.currentTime = DateTime.local().setZone(timezoneName).toFormat('HH:mm a');
    this.currentDate = DateTime.local().setZone(timezoneName).toLocaleString(DateTime.DATE_MED);
    this.currentOffset = DateTime.local().setZone(timezoneName).offset / 60;
  }
}
