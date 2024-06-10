/**
 * Global
 */
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { select, Store } from '@ngrx/store';

/**
 * Project
 */
import {
  ApiKeyAuthorization,
  AuthDetails,
  BasicAuthorizationInfo,
  OAuthInfo,
  OAuthPasswordInfo,
  WebHook,
  WebHookData
} from '@wfm/service-layer/models/webHooks';
import { MethodTypes, PayloadTypes, SubscriptionAuthorizationTypes } from '@wfm/service-layer/models/webHooks-enum';
import { TenantComponent } from '@wfm/shared/tenant.component';
import {
  AddWebHook,
  GetWebHookDetailsById,
  ResetWebHookDetails,
  ResetWebHookOperationMsg,
  UpdateWebHook
} from '@wfm/store/webhooks-builder/webhooks-builder-actions';
import { WebHookBuilderState } from '@wfm/store/webhooks-builder/webhooks-builder-reducer';
import {
  webHooksDetailByIdSelector,
  webHooksLoadingSelector,
  webHooksOperationMsgSelector
} from '@wfm/store/webhooks-builder/webhooks-builder-selector';

/**
 * Local
 */

interface types {
  name: string;
  value: number;
}

@Component({
  selector: 'app-webhook-create',
  templateUrl: './webhook-create.component.html',
  styleUrls: ['./webhook-create.component.scss']
})
export class WebhookCreateComponent extends TenantComponent implements OnInit {
  allMethodTypes: types[];
  authorizationTypes: types[];
  payloadTypes: types[];
  webHooksForm: FormGroup;
  webHook: WebHook;

  loading$: Observable<boolean>;
  webHookId: string;
  scopesList: string[];

  webHookDetails: WebHookData;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<WebHookBuilderState>,
    private snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
    private ts: TranslateService
  ) {
    super(store);

    this.webHook = this.initWebhookObject();
    this.loading$ = this.store.pipe(select(webHooksLoadingSelector), takeUntil(this.destroyed$));

    this.webHookId = this.activatedRoute.snapshot.paramMap.get('id');

    if (this.webHookId) {
      this.store.dispatch(new GetWebHookDetailsById({ data: { id: this.webHookId } }));
      this.getWebHookDetails();
    }

    this.webHooksForm = this.formBuilder.group({
      name: [null, Validators.required],
      webhookUri: [null, Validators.required],
      httpMethod: [MethodTypes.POST, Validators.required],
      payloadType: [PayloadTypes.JSON, Validators.required],
      isActive: [true, Validators.required],
      authorizationType: [SubscriptionAuthorizationTypes.NONE, Validators.required],
      headers: this.formBuilder.array([])
    });

    this.initTypeOptions();
  }

  initTypeOptions(): void {
    const methodTypes = [MethodTypes.POST, MethodTypes.PUT, MethodTypes.PATCH];
    this.allMethodTypes = methodTypes.map((type) => {
      return {
        name: MethodTypes[type],
        value: type
      };
    });

    const authorizationTypes = [
      SubscriptionAuthorizationTypes.NONE,
      SubscriptionAuthorizationTypes.OAuth,
      SubscriptionAuthorizationTypes.BasicAuth,
      SubscriptionAuthorizationTypes.ApiKey,
      SubscriptionAuthorizationTypes.OAuthPassword
    ];

    this.authorizationTypes = authorizationTypes.map((type) => {
      return {
        name: SubscriptionAuthorizationTypes[type],
        value: type
      };
    });

    const payloadTypes = [PayloadTypes.JSON, PayloadTypes.XML];
    this.payloadTypes = payloadTypes.map((type) => {
      return {
        name: PayloadTypes[type],
        value: type
      };
    });
  }

  get headers(): FormArray {
    return this.webHooksForm.get('headers') as FormArray;
  }

  addHeader(data?: { key: string; value: string }): void {
    this.headers.push(
      this.formBuilder.group({
        name: [data ? data.key : null],
        value: [data ? data.value : null]
      })
    );
  }

  removeHeader(index: number): void {
    this.headers.removeAt(index);
  }

  ngOnInit(): void {
    this.store.pipe(select(webHooksOperationMsgSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x) {
        this.snackBar.open(x, 'Ok', { duration: 2000 });
        if (x.toLowerCase().includes('fail')) {
          this.webHook = {
            ...this.webHook,
            name: null,
            httpMethod: null,
            webhookUri: null,
            payloadType: null,
            authorizationInfo: {
              ...this.webHook.authorizationInfo,
              type: null
            }
          };
        }
      }
      this.store.dispatch(new ResetWebHookOperationMsg());
    });
  }

  getWebHookDetails(): void {
    this.store.pipe(select(webHooksDetailByIdSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x) {
        this.webHookDetails = x;
        this.webHooksForm.patchValue({
          httpMethod: x.httpMethod,
          isActive: x.isActive,
          name: x.name,
          payloadType: x.payloadType,
          webhookUri: x.webhookUri,
          authorizationType: x.authorizationInfo.type
        });
        this.getHeaders(x.headers);
      }
    });
  }

  onAuthTypeChange(): void {
    this.webHook.authorizationInfo.apiKeyAuthorization = {};
    this.webHook.authorizationInfo.basicAuthorizationInfo = {};
    this.webHook.authorizationInfo.oAuthInfo = {};
    this.webHook.authorizationInfo.oAuthPasswordInfo = {};
  }

  onSubmit(): void {
    this.webHook.name = this.webHooksForm.controls.name.value;
    this.webHook.webhookUri = this.webHooksForm.controls.webhookUri.value;
    this.webHook.httpMethod = this.webHooksForm.controls.httpMethod.value;
    this.webHook.payloadType = this.webHooksForm.controls.payloadType.value;
    this.webHook.headers = null;
    this.webHook.isActive = this.webHooksForm.controls.isActive.value;
    this.webHook.authorizationInfo.type = this.webHooksForm.controls.authorizationType.value;

    const headersValues: types[] = this.headers.value;
    let headersObjData = headersValues.reduce((prev, current) => ({ ...prev, [current.name]: current.value }), {});
    this.webHook.headers = headersObjData;

    if (this.isAuthorizationDataValid()) {
      !this.webHookId ? this.addWebHook() : this.updateWebHook();
    }
  }

  isAuthorizationDataValid(): boolean {
    const authType = this.webHooksForm.controls.authorizationType.value;
    switch (authType) {
      case SubscriptionAuthorizationTypes.OAuth:
        let oAuthData = this.webHook.authorizationInfo.oAuthInfo;
        if (
          !oAuthData?.grantType ||
          !oAuthData.clientCredentialsInfo?.clientId ||
          !oAuthData.clientCredentialsInfo?.clientSecret ||
          !oAuthData.clientCredentialsInfo?.tokenEndpoint ||
          oAuthData.clientCredentialsInfo?.scopes?.length === 0
        ) {
          this.showAuthValidationMessage('oAuth');
          return false;
        }
        break;
      case SubscriptionAuthorizationTypes.BasicAuth:
        let basicAuthData = this.webHook.authorizationInfo.basicAuthorizationInfo;
        if (!basicAuthData?.username || !basicAuthData?.password) {
          this.showAuthValidationMessage('Basic Authorization');
          return false;
        }
        break;
      case SubscriptionAuthorizationTypes.ApiKey:
        let apiKeyInfo = this.webHook.authorizationInfo.apiKeyAuthorization;
        if (!apiKeyInfo?.key || !apiKeyInfo?.value) {
          this.showAuthValidationMessage('ApiKey Authorization');
          return false;
        }
        break;
      case SubscriptionAuthorizationTypes.OAuthPassword:
        let oAuthPasswordInfo = this.webHook.authorizationInfo.oAuthPasswordInfo;
        if (
          !oAuthPasswordInfo?.clientId ||
          !oAuthPasswordInfo?.clientSecret ||
          !oAuthPasswordInfo?.username ||
          !oAuthPasswordInfo?.password ||
          !oAuthPasswordInfo?.tokenEndpoint ||
          oAuthPasswordInfo?.scopes.length === 0
        ) {
          this.showAuthValidationMessage('oAuthPassword');
          return false;
        }
        break;
      default:
        return true;
    }
    // if we have reached this line, everything good
    return true;
  }

  showAuthValidationMessage(authName: string): void {
    this.snackBar.open(`${this.ts.instant('Please fill all the required details for')} ${authName}`, 'Ok', { duration: 2000 });
  }

  initWebhookObject(): WebHook {
    return <WebHook>{
      name: null,
      httpMethod: null,
      payloadType: null,
      webhookUri: null,
      headers: null,
      isActive: false,
      authorizationInfo: {
        type: null,
        apiKeyAuthorization: {},
        basicAuthorizationInfo: {},
        oAuthInfo: {},
        oAuthPasswordInfo: {}
      }
    };
  }

  fillAuthDetails(event: AuthDetails): void {
    const authType = this.webHooksForm.controls.authorizationType.value;
    switch (authType) {
      case SubscriptionAuthorizationTypes.OAuth:
        let authData: OAuthInfo = {
          grantType: event?.grantType,
          clientCredentialsInfo: {
            clientId: event?.clientId,
            clientSecret: event?.clientSecret,
            tokenEndpoint: event?.tokenEndpoint,
            scopes: this.scopesList
          }
        };
        this.webHook.authorizationInfo.oAuthInfo = authData;
        break;
      case SubscriptionAuthorizationTypes.BasicAuth:
        let basicAuthData: BasicAuthorizationInfo = {
          username: event?.username,
          password: event?.password
        };
        this.webHook.authorizationInfo.basicAuthorizationInfo = basicAuthData;
        break;
      case SubscriptionAuthorizationTypes.ApiKey:
        let apiKeyData: ApiKeyAuthorization = {
          key: event?.key,
          value: event?.value,
          addToHeader: event?.addToHeader
        };
        this.webHook.authorizationInfo.apiKeyAuthorization = apiKeyData;
        break;
      case SubscriptionAuthorizationTypes.OAuthPassword:
        let oAuthPasswordData: OAuthPasswordInfo = {
          clientId: event?.clientId,
          clientSecret: event?.clientSecret,
          password: event?.password,
          scopes: this.scopesList,
          tokenEndpoint: event?.tokenEndpoint,
          username: event?.username
        };
        this.webHook.authorizationInfo.oAuthPasswordInfo = oAuthPasswordData;
        break;
      default:
        break;
    }
  }

  addWebHook(): void {
    this.store.dispatch(new AddWebHook({ data: this.webHook }));
  }

  updateWebHook(): void {
    this.store.dispatch(new UpdateWebHook({ data: this.webHook, webHookId: this.webHookId }));
  }

  getScopesList(scopes: string[]): void {
    this.scopesList = scopes;
  }

  getHeaders(headersData: { [key: string]: string }): void {
    let headers: { key: string; value: string }[] = [];
    for (const key in headersData) {
      headers.push({ key: key, value: headersData[key] });
    }
    if (headers.length > 0) {
      headers.forEach((x) => {
        this.addHeader(x);
      });
    }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.webHookId) this.store.dispatch(new ResetWebHookDetails());
  }
}
