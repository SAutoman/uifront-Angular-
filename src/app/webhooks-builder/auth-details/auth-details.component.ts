import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AuthDetails, WebHookData } from '@wfm/service-layer/models/webHooks';
import { SubscriptionAuthorizationTypes } from '@wfm/service-layer/models/webHooks-enum';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { AddWebHookSuccess, WebHookBuilderActionTypes } from '@wfm/store/webhooks-builder/webhooks-builder-actions';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-auth-details',
  templateUrl: './auth-details.component.html',
  styleUrls: ['./auth-details.component.scss']
})
export class AuthDetailsComponent extends TenantComponent implements OnInit, OnChanges {
  @Input() showBasicAuth: boolean;
  @Input() showClientCreds: boolean;
  @Input() showGrantType: boolean;
  @Input() showApiKeyInfo: boolean;
  @Input() webHookData: WebHookData;

  @Output() authDetails: EventEmitter<AuthDetails> = new EventEmitter();
  @Output() scopes: EventEmitter<string[]> = new EventEmitter();

  authDetailsForm: FormGroup;
  scopesList: string[] = [];

  constructor(private formBuilder: FormBuilder, private store: Store<any>, private actions$: Actions) {
    super(store);
    this.authDetailsForm = this.formBuilder.group({
      username: [null],
      password: [null],
      grantType: [null],
      tokenEndpoint: [null],
      clientId: [null],
      clientSecret: [null],
      scopes: [null],
      key: [null],
      value: [null],
      addToHeader: [false]
    });
  }

  ngOnInit(): void {
    this.authDetailsForm.valueChanges.pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe((x) => {
      this.authDetails.emit(x);
    });
    this.listenForWebHookAddSuccess();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.webHookData?.currentValue) {
      this.fillAuthDetails(changes?.webHookData.currentValue);
      this.authDetails.emit(this.authDetailsForm.value);
    }
  }

  listenForWebHookAddSuccess(): void {
    this.actions$
      .pipe(ofType(WebHookBuilderActionTypes.AddWebHookSuccess), takeUntil(this.destroyed$))
      .subscribe((x: AddWebHookSuccess) => {
        if (x.type === WebHookBuilderActionTypes.AddWebHookSuccess) {
          this.authDetailsForm.reset();
        }
      });
  }

  addScope(scope: string): void {
    if (scope.trim().length > 0) {
      this.scopesList.push(scope.trim());
      this.scopes.emit(this.scopesList);
      this.authDetailsForm.controls.scopes.setValue(null);
    }
  }

  removeScope(index: number): void {
    this.scopesList.splice(index, 1);
    this.scopes.emit(this.scopesList);
  }

  fillAuthDetails(webHookData: WebHookData): void {
    switch (webHookData.authorizationInfo.type) {
      case SubscriptionAuthorizationTypes.OAuth:
        this.authDetailsForm.controls.grantType.setValue(webHookData.authorizationInfo.oAuthInfo?.grantType);
        this.authDetailsForm.patchValue(webHookData.authorizationInfo.oAuthInfo?.clientCredentialsInfo);
        this.authDetailsForm.controls.scopes.setValue(null);
        this.scopesList = webHookData.authorizationInfo.oAuthInfo?.clientCredentialsInfo.scopes;
        break;
      case SubscriptionAuthorizationTypes.BasicAuth:
        this.authDetailsForm.patchValue(webHookData.authorizationInfo.basicAuthorizationInfo);
        break;
      case SubscriptionAuthorizationTypes.ApiKey:
        this.authDetailsForm.patchValue(webHookData.authorizationInfo.apiKeyAuthorization);
        break;
      case SubscriptionAuthorizationTypes.OAuthPassword:
        this.authDetailsForm.patchValue(webHookData.authorizationInfo.oAuthPasswordInfo);
        break;
      default:
        break;
    }
  }
}
