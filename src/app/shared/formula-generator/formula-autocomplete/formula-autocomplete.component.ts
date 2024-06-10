import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import {
  DATE_FUNCTIONS,
  TEXT_FUNCTIONS,
  LOGICAL_FUNCTIONS,
  STATISTICAL_FUNCTIONS,
  MATH_FUNCTIONS
} from '@wfm/service-layer/services/formula-library';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormulaDetails } from '@wfm/service-layer/models/formula';
import { TranslateService } from '@ngx-translate/core';

const dateFunctions = DATE_FUNCTIONS;
const textFunctions = TEXT_FUNCTIONS;
const logicFunctions = LOGICAL_FUNCTIONS;
const statFunctions = STATISTICAL_FUNCTIONS;
const mathFunctions = MATH_FUNCTIONS;

interface FormulaDetailsExtended extends FormulaDetails {
  showDetails: boolean;
}

export interface FunctionGroup {
  group: string;
  formulas: FormulaDetailsExtended[];
}

export const _filter = (options: FormulaDetailsExtended[], value: string): FormulaDetailsExtended[] => {
  const filterValue = value.toLowerCase();
  return options.filter((formula) => {
    return formula.name.toLowerCase().includes(filterValue);
  });
};

@Component({
  selector: 'app-formula-autocomplete',
  templateUrl: './formula-autocomplete.component.html',
  styleUrls: ['./formula-autocomplete.component.scss']
})
export class FormulaAutocompleteComponent {
  @Output() formulaEmitter: EventEmitter<string> = new EventEmitter();
  filteredFormulas: Observable<FormulaDetailsExtended[]>;
  formulaGroups: FunctionGroup[];
  form = this.fb.group({
    functionGroup: ''
  });
  formulaGroupOptions: Observable<FunctionGroup[]>;

  constructor(private fb: FormBuilder, private clipboard: Clipboard, private snackbar: MatSnackBar, private ts: TranslateService) {
    this.populateFormulas();

    this.formulaGroupOptions = this.form.get('functionGroup')!.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterGroup(value || ''))
    );
  }

  private _filterGroup(value: string): FunctionGroup[] {
    if (value) {
      return this.formulaGroups
        .map((group) => ({ group: group.group, formulas: _filter(group.formulas, value) }))
        .filter((group) => group.formulas.length > 0);
    }

    return this.formulaGroups;
  }

  populateFormulas(): void {
    const dateFuncs = Object.values(dateFunctions).map((f) => {
      return <FormulaDetailsExtended>{
        ...f,
        showDetails: false,
        group: 'Date Functions'
      };
    });

    const textFuncs = Object.values(textFunctions).map((f) => {
      return <FormulaDetailsExtended>{
        ...f,
        showDetails: false,
        group: 'Text Functions'
      };
    });

    const logicFuncs = Object.values(logicFunctions).map((f) => {
      return <FormulaDetailsExtended>{
        ...f,
        showDetails: false,
        group: 'Logical Functions'
      };
    });

    const statFuncts = Object.values(statFunctions).map((f) => {
      return <FormulaDetailsExtended>{
        ...f,
        showDetails: false,
        group: 'Statistical Functions'
      };
    });

    const mathFuncs = Object.values(mathFunctions).map((f) => {
      return <FormulaDetailsExtended>{
        ...f,
        showDetails: false,
        group: 'Math Functions'
      };
    });

    this.formulaGroups = [
      {
        group: 'Date Functions',
        formulas: [...dateFuncs]
      },
      {
        group: 'Text Functions',
        formulas: [...textFuncs]
      },
      {
        group: 'Logical Functions',
        formulas: [...logicFuncs]
      },
      {
        group: 'Statistical Functions',
        formulas: [...statFuncts]
      },
      {
        group: 'Math Functions',
        formulas: [...mathFuncs]
      }
    ];
  }

  toggleDetails(event: Event, formula): void {
    event.stopPropagation();
    formula.showDetails = formula.showDetails ? false : true;
  }

  optionSelected(data: MatAutocompleteSelectedEvent): void {
    this.clipboard.copy(data.option.value);
    this.snackbar.open(this.ts.instant('Formula Copied'), 'Close', { duration: 2000 });
    this.form.reset();
    this.hideDetails();
  }

  hideDetails(): void {
    this.formulaGroups.forEach((group) => {
      group.formulas.forEach((f) => {
        f.showDetails = false;
      });
    });
  }
}
