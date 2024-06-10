/**
 * global
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@wfm/shared/shared.module';

/**
 * project
 */
import { MissingTranslationHandlerService } from '@wfm/translate/missingtranslationhandler.service';
import { MissingTranslationSaverService } from '@wfm/translate/missingtranslationsaver.service';
/**
 * local
 */
import { Error404Component } from './error404/error404.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '404',
    pathMatch: 'full'
  },
  {
    path: '',
    children: [
      {
        path: '404',
        component: Error404Component
      }
    ]
  }
];
@NgModule({
  declarations: [Error404Component],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    TranslateModule.forChild({
      extend: true,
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useExisting: MissingTranslationHandlerService,
        deps: [MissingTranslationSaverService]
      }
    })
  ],
  exports: [RouterModule]
})
export class ErrorModule {}
