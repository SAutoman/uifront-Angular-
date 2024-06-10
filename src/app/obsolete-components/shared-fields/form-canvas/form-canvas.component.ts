// /**
//  * global
//  */
// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { FormGroup, FormBuilder } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { Store } from '@ngrx/store';

// /**
//  * project
//  */
// import { ApplicationState } from '../../store';
// import { TenantComponent } from '../../shared/tenant.component';
// import { FormsService } from '../../service-layer';
// import { UIFormFieldModel } from '../../obsolete-components/forms/models';

// /**
//  * local
//  */
// @Component({
//   selector: 'app-form-canvas',
//   templateUrl: './form-canvas.component.html',
//   styleUrls: ['./form-canvas.component.scss']
// })
// export class FormCanvasComponent extends TenantComponent implements OnInit {
//   @Input() formFields: UIFormFieldModel[];
//   @Input() name: string;

//   @Output() isFormSubmited: EventEmitter<boolean> = new EventEmitter();
//   @Output() isCopySubmited: EventEmitter<boolean> = new EventEmitter();
//   createFormForm: FormGroup;
//   names: string[] = [];
//   isEditUrl: boolean;
//   componentId = 'be23775c-1542-421c-84e7-04273369a389';

//   constructor(
//     private formBuilder: FormBuilder,
//     private formService: FormsService,
//     store: Store<ApplicationState>,
//     private snackBar: MatSnackBar,
//     private route: ActivatedRoute,
//     private router: Router
//   ) {
//     super(store);

//     this.router.url.includes('edit') ? (this.isEditUrl = true) : (this.isEditUrl = false);
//   }

//   async ngOnInit() {
//     this.names = [];
//     this.createFormForm = this.formBuilder.group({});

//     const data = await this.formService.getForms(this.tenant);
//     data.items.forEach((i) => {
//       this.names.push(i.name);
//     });
//   }

//   onSubmit(formValue?: any): void {
//     if (this.names.includes(this.name) && !this.route.snapshot.params.id) {
//       this.snackBar.open('Form With That Name Already Exists !', 'CLOSE', {
//         duration: 3000
//       });
//     } else {
//       this.isFormSubmited.emit(true);
//     }
//   }

//   onCopy(): void {
//     this.isCopySubmited.emit(true);
//   }
// }
