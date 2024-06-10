// /**
//  * global
//  */
// import { Component } from '@angular/core';

// /**
//  * project
//  */
// import { GridConfiguration, processStepsGridSettings } from '@wfm/service-layer';
// import { defaultSchemasListGridSettings } from '@wfm/shared/default-grid-settings';

// /**
//  * local
//  */
// import { IListRootComponent } from '../../forms-flow-struct/interface';
// import { ProcessProxyService } from '../../forms-flow-struct/services';

// @Component({
//   selector: 'app-page-process-list',
//   templateUrl: './page-process-list.component.html',
//   styleUrls: ['./page-process-list.component.scss']
// })
// export class PageProcessListComponent implements IListRootComponent {
//   gridConfigBase: GridConfiguration;
//   gridSettingsKeyBase: string;
//   settingsKey: string;
//   constructor(public service: ProcessProxyService) {
//     this.gridConfigBase = defaultSchemasListGridSettings;
//     this.gridSettingsKeyBase = processStepsGridSettings;
//     // this.settingsKey = appProcessStepsSettingsExclusive;
//   }
// }
