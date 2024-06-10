import { Component, OnDestroy } from '@angular/core';
import { AppBarData, SharedService } from '@wfm/service-layer/services/shared.service';
import { Test, TestResult } from '@wfm/tests/models';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface IViewTest extends Test {
  running$: BehaviorSubject<boolean>;
  result$: BehaviorSubject<boolean>;
}

@Component({
  selector: 'app-test-ui-page',
  templateUrl: './test-ui-page.component.html',
  styleUrls: ['./test-ui-page.component.scss']
})
export class TestUiPageComponent implements OnDestroy {
  isDeskTop: boolean = true;
  appBarData: AppBarData = {} as AppBarData;
  protected destroyed$ = new Subject<any>();
  private _tests: IViewTest[] = [];
  private _runAll = <IViewTest>{
    running$: new BehaviorSubject<boolean>(false),
    result$: new BehaviorSubject<boolean>(undefined),
    function: async () => await this.runAllTests(),
    name: 'Run All'
  };

  public title = 'Tests';

  public init(title: string, tests: Test[]) {
    setTimeout(() => {
      this.title = title;
      this.tests = tests;
    }, 0);
  }

  public set tests(x: Test[]) {
    this._tests = x.map(
      (t) =>
        <IViewTest>{
          running$: new BehaviorSubject<boolean>(false),
          result$: new BehaviorSubject<boolean>(undefined),
          function: t.function,
          name: t.name
        }
    );
    this._tests.unshift(this.runAll);
    this.appBarData.title = this.title + ' - ' + this._tests.length;
    this.sharedService.setAppBarData(this.appBarData);
  }

  public get tests() {
    return this._tests;
  }

  get runAll(): IViewTest {
    return this._runAll;
  }
  constructor(private sharedService: SharedService) {
    this.sharedService.updateMobileQuery.pipe(takeUntil(this.destroyed$)).subscribe((isDeskTop: boolean) => (this.isDeskTop = isDeskTop));
  }

  public async execute(test: IViewTest) {
    test.running$.next(true);

    let rez: TestResult = null;
    try {
      rez = await test.function();
    } catch (e) {
      console.error(e);
      test.result$.next(false);
    }

    test.running$.next(false);
    test.result$.next(rez.success);
  }

  public getBtnColor(test: IViewTest): string {
    switch (test.result$.getValue()) {
      case undefined:
        return undefined;
      case true:
        return 'primary';
      case false:
        return 'warn';
    }
  }

  public async runAllTests(): Promise<TestResult> {
    this._runAll.running$.next(true);

    for (const test of this._tests) {
      if (test.name !== 'Run All') {
        await this.execute(test);
      }
    }

    this._runAll.running$.next(false);
    return TestResult.success();
  }

  ngOnDestroy(): void {
    this.destroyed$.next({});
    this.destroyed$.complete();
  }
}
