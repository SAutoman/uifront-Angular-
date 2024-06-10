import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { WorkflowStateStepDto } from '@wfm/service-layer';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-workflow-state-step-search',
  templateUrl: './workflow-state-step-search.component.html',
  styleUrls: ['./workflow-state-step-search.component.scss']
})
export class WorkflowStateStepSearchComponent implements OnInit {
  @Output() clear: EventEmitter<void> = new EventEmitter();
  @Output() filter: EventEmitter<WorkflowStateStepDto[]> = new EventEmitter();
  @Input() processSteps: WorkflowStateStepDto[] = [];
  searchField: FormControl;
  cleared: boolean = true;

  constructor() {}

  ngOnInit(): void {
    this.searchField = new FormControl('');
    this.searchField.valueChanges.pipe(debounceTime(500), startWith(''), distinctUntilChanged()).subscribe(() => {
      if (!this.cleared) this.filterList();
      else this.cleared = false;
    });
  }

  filterList(): void {
    if (this.searchField.value === '') {
      this.clearInput();
      return;
    }
    this.processSteps = this.processSteps.filter((x) => x.name.toLowerCase().includes(this.searchField.value.toLowerCase()));
    this.filter.next(this.processSteps);
  }

  clearInput(): void {
    this.cleared = true;
    this.searchField.reset();
    this.clear.next();
  }
}
