import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/material/form-field';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
const textBetweenTagsRegex = '(?<=>)(.*?)(?=</)';

@Component({
  selector: 'app-formly-rich-text',
  templateUrl: './formly-rich-text.component.html',
  styleUrls: ['./formly-rich-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyRichTextComponent extends FieldType implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  constructor() {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.handleEmptyTags();
  }

  handleEmptyTags(): void {
    this.formControl.valueChanges
      .pipe(
        filter((x) => !!x),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        if (value) {
          const rawText = value.match(textBetweenTagsRegex) && value.match(textBetweenTagsRegex)[0];
          if (!rawText) {
            setTimeout(() => {
              this.formControl.patchValue(null);
            });
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    super.ngOnDestroy();
  }
}
