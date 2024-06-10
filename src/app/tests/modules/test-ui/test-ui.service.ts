// import { Injectable } from '@angular/core';
// import { IBoolValue, IViewTest } from '@wfm/tests/models';
// import { BehaviorSubject } from 'rxjs';

// export function createTestUi(name: string, fn: (test: IViewTest) => void): IViewTest {
//   const test: IViewTest = {
//     name: name,
//     success: undefined,
//     running$: new BehaviorSubject<IBoolValue>({ value: false }),
//     result$: new BehaviorSubject<IBoolValue>({ value: undefined }),
//     function: () => fn(test)
//   };

//   return test;
// }

// @Injectable()
// export class TestUiService {
//   constructor() {}

//   createTestUi(name: string, fn: (test: IViewTest) => void): IViewTest {
//     return createTestUi(name, fn);
//   }

//   async runAll(runAllTest: IViewTest, allTests: IViewTest[]) {
//     const tests = allTests.filter((x) => x !== runAllTest);
//     for (let index = 0; index < tests.length; index++) {
//       await tests[index].function();
//     }
//   }

//   createTestAsyncFn(name: string, fn: (test: IViewTest) => Promise<boolean>): IViewTest {
//     return this.createTestUi(name, (test) => {
//       this.testStart(test);
//       fn(test).then(
//         (r) => this.testEnd(test, r),
//         (e) => this.testEnd(test, false)
//       );
//       return test;
//     });
//   }

//   testStart(test: IViewTest): void {
//     test.running$.next({ value: true });
//     test.result$.next({ value: undefined });
//   }
//   testEnd(test: IViewTest, result: boolean): void {
//     test.success = result;
//     test.running$.next({ value: false });
//     test.result$.next({ value: test.success });
//   }
// }
