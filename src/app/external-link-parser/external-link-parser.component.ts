/**
 * global
 */

import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { dataMainRoute, dataViewRoute } from '@wfm/raw-data/raw-data.routing';
import { AreaTypeEnum, ExternalIntegrationService } from '@wfm/service-layer';
import { convertTenantName } from '@wfm/shared/utils';
import { workflowStatesListRoute, workflowStatesMainRoute, workflowStateUpdate } from '@wfm/workflow-state/workflow-state.routing.module';
/**
 * local
 */
import { ExternalLinkQueries, UrlEntityType, UrlViewEnum } from './external-link-parser';

@Component({
  selector: 'app-external-link-parser',
  template: ''
})
export class ExternalLinkParserComponent implements OnInit {
  urlQueries: ExternalLinkQueries;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private externalIntegration: ExternalIntegrationService,
    private snackBar: MatSnackBar,
    private ts: TranslateService
  ) {}

  async ngOnInit() {
    this.populateUrlData();
    this.processExternalUrl();
  }

  populateUrlData(): void {
    this.urlQueries = {
      tenantId: this.activatedRoute.snapshot.queryParams['tenantId'],
      view: this.activatedRoute.snapshot.queryParams['view'],
      type: this.activatedRoute.snapshot.queryParams['type'],
      entityId: this.activatedRoute.snapshot.queryParams['entityId'],
      isSideMenuHidden: this.activatedRoute.snapshot.queryParams['isSideMenuHidden'] === 'true' ? true : false,
      stepToLoad: this.activatedRoute.snapshot.queryParams['stepToLoad'] || null
    };
  }

  async processExternalUrl(): Promise<void> {
    try {
      const tenantName = await this.getTenantName();
      let areaSpecificRoute;
      const navigationExtras: NavigationExtras = {
        queryParams: {
          itemId: this.urlQueries.entityId
        }
      };

      if (this.urlQueries.isSideMenuHidden) {
        navigationExtras.queryParams.isSideMenuHidden = true;
      }
      // RawData urls
      if (this.urlQueries.type === UrlEntityType.rawData) {
        const schemaId = await this.getSchemaId();
        areaSpecificRoute = [dataMainRoute, dataViewRoute, schemaId];
        navigationExtras.queryParams['itemId'] = this.urlQueries.entityId;

        if (this.urlQueries.view === UrlViewEnum.editPopupView) {
          navigationExtras.queryParams['action'] = 'update';
          // data/list/${schemaId}&itemId=${id1}&action=update
        } else if (this.urlQueries.view === UrlViewEnum.gridView) {
          navigationExtras.queryParams['action'] = 'highlight';
          // data/list/${schemaId}&itemId=${id1}&action=highlight
        }

        // Case urls
      } else if (this.urlQueries.type === UrlEntityType.case) {
        const workflowId = await this.getWorkflowId();
        switch (this.urlQueries.view) {
          case UrlViewEnum.gridView:
            areaSpecificRoute = [workflowStatesMainRoute, workflowStatesListRoute, workflowId];
            navigationExtras.queryParams['itemId'] = this.urlQueries.entityId;
            navigationExtras.queryParams['action'] = 'highlight';
            // workflow-states/list/${workflowId}?itemId=${id1}&action=highlight
            break;

          case UrlViewEnum.processSidePanelView:
            areaSpecificRoute = [workflowStatesMainRoute, workflowStatesListRoute, workflowId];
            navigationExtras.queryParams['workflowStateId'] = this.urlQueries.entityId;
            if (this.urlQueries.stepToLoad) {
              navigationExtras.queryParams['stepToLoad'] = this.urlQueries.stepToLoad;
            }
            // workflow-states/list/${workflowId}?&workflowStateId=${id1}
            break;
          case UrlViewEnum.editPopupView:
            areaSpecificRoute = [workflowStatesMainRoute, workflowStateUpdate, this.urlQueries.entityId, workflowId];
            navigationExtras.queryParams['isEditCase'] = true;
            //workflow-states/update/${workflowStateId}/${workflowId}?isEditCase=true
            break;
          case UrlViewEnum.processFullScreenView:
            areaSpecificRoute = [workflowStatesMainRoute, workflowStateUpdate, this.urlQueries.entityId, workflowId];
            if (this.urlQueries.stepToLoad) {
              navigationExtras.queryParams['stepToLoad'] = this.urlQueries.stepToLoad;
            }
            // workflow-states/update/${workflowStateId}/${workflowId}
            break;
          default:
            break;
        }
      } else if (this.urlQueries.type === UrlEntityType.comment) {
        //  workflowStateId to be get from new endpoint or from queries
        const workflowId = await this.getWorkflowId();
        let wfStateId;
        switch (this.urlQueries.view && this.urlQueries.entityId) {
          case UrlViewEnum.processSidePanelView:
            areaSpecificRoute = [workflowStatesMainRoute, workflowStatesListRoute, workflowId];
            navigationExtras.queryParams['workflowStateId'] = wfStateId;
            navigationExtras.queryParams['commentId'] = this.urlQueries.entityId;

            break;
          case UrlViewEnum.processFullScreenView:
            areaSpecificRoute = [workflowStatesMainRoute, workflowStateUpdate, this.urlQueries.entityId, workflowId];
            navigationExtras.queryParams['commentId'] = this.urlQueries.entityId;
            break;
          default:
            break;
        }
      }

      if (tenantName && areaSpecificRoute) {
        let tenantNameSerialized = convertTenantName(tenantName);
        const route = this.router.createUrlTree([`/${tenantNameSerialized}`, ...areaSpecificRoute], navigationExtras);
        const finalUrl = window.location.origin + this.router.serializeUrl(route);
        window.location.href = finalUrl;
      }
    } catch (error) {
      this.handleError();
    }
  }

  async getSchemaId(): Promise<string> {
    const data = await this.externalIntegration.getSchemaId(this.urlQueries.tenantId, this.urlQueries.entityId, AreaTypeEnum.rawData);
    return data?.schemaPublicId;
  }

  async getTenantName(): Promise<string> {
    const data = await this.externalIntegration.getTenantName(this.urlQueries.tenantId);
    return data?.tenantName;
  }
  async getWorkflowId(): Promise<string> {
    const data = await this.externalIntegration.getWorkflowId(this.urlQueries.tenantId, this.urlQueries.entityId);
    return data?.workflowPublicId;
  }

  handleError(): void {
    this.snackBar.open(this.ts.instant('Something went wrong fetching the requested data'), 'CLOSE', {
      duration: 2000,
      panelClass: ['bg-light', 'text-danger']
    });
    setTimeout(() => {
      this.router.navigate(['error', '404']);
    }, 2000);
  }
}

//  externalUrlExample
// '/external-link?tenantId=6F588242218D3C45BBCDE2E7F4C697B2&view=gridView&type=case&entityId=62A0A2A6903542BA3E3542CE&isSideMenuHidden=false';
