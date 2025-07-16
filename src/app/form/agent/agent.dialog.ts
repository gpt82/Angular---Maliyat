import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { AgentService } from './agent.service';
import { concat, Observable, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  tap
} from 'rxjs/operators';
import { AuthService } from '../../core/services/app-auth-n.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'agent-dialog',
  templateUrl: 'agent.dialog.html'
})
// tslint:disable-next-line:component-class-suffix
export class AgentDialog extends ModalBaseClass implements OnInit {
  form: FormGroup;
  citiesLoading = false;
  cities$: Observable<Object | any[]>;
  citiesInput$ = new Subject<string>();

  constructor(
    public dialogRef: MatDialogRef<AgentDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private _agentService: AgentService,
    public authService: AuthService
  ) {
    super();
    this.loadCities();
  }

  ngOnInit() {
    this.form = this.fb.group(
      {
        code: [
          this.data.Agent.code,
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(8)
          ],
          this.uniqueCode.bind(this)
        ],
        name: [this.data.Agent.name, Validators.required],
        cityId: [this.data.Agent.cityId, Validators.required],
        address: [this.data.Agent.address, Validators.required],
        phone: [this.data.Agent.phone, Validators.required]
      },
      { updateOn: 'blur' }
    );

    // if (this.data.isEdit === true) {
    //   this.form.patchValue({
    //     code: this.data.Agent.code,
    //     name: this.data.Agent.name,
    //     cityId: this.data.Agent.cityId,
    //     address: this.data.Agent.address,
    //     phone: this.data.Agent.phone
    //   });
    // }
  }

  get code() {
    return this.form.get('code');
  }
  private loadCities() {
    this.cities$ = concat(
      of([
        {
          id: this.data.Agent.cityId,
          title: this.data.Agent.cityName
        }
      ]),
      this.citiesInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => (this.citiesLoading = true)),
        switchMap(term =>
          this.http.get('/v1/api/Lookup/cities/' + term).pipe(
            catchError(() => of([])),
            tap(() => (this.citiesLoading = false))
          )
        )
      )
    );
  }

  uniqueCode(ctrl: AbstractControl): Observable<ValidationErrors | null> {
    if (ctrl.value === this.data.Agent.code) { return of(null); }
    const equalOriginal = ctrl.value === this.data.Agent.code;
    return this._agentService.getAgentByCode(ctrl.value).pipe(
      map(codes => {
        return codes && !equalOriginal ? { uniqueAgentCode: true } : null;
      })
    );
  }

  uniqueCode2(): AsyncValidatorFn {
    return (
      control: AbstractControl
    ):
      | Promise<ValidationErrors | null>
      | Observable<ValidationErrors | null> => {
      if (control.value === this.data.Agent.code) {
        return of(null);
      } else {
        return this._agentService.getAgentByCode(control.value).pipe(
          map(codes => {
            return codes ? { uniqueAgentCode: true } : null;
          })
        );
      }
    };
  }

  OnNgSelectKeyDown(event: any, type: string) {
    if (event.code === 'Escape') {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  onClose(): void {
    if (!this.form.dirty) { this.dialogRef.close({ data: null, state: 'cancel' }); } else {
      const dialogRef = this.dialog.open(ConfirmDialog, {
        width: '250px',
        data: { state: 'ok' }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.state === 'confirmed') {
          this.dialogRef.close({ data: null, state: 'cancel' });
        }
      });
    }
  }

  onSave(): void {
    if (this.form.valid) {
      const header = new HttpHeaders({ 'Content-Type': 'application/json' });

      const agent = JSON.stringify({
        Code: this.form.get('code').value,
        Name: this.form.get('name').value,
        City: this.form.get('cityId').value,
        Phone: this.form.get('phone').value,
        Address: this.form.get('address').value,
        Description: this.data.Agent.description,
        IsActive: this.data.Agent.isActive
      });
      if (this.data.isEdit === true) {
        this.http
          .put(this.getUrl() + this.data.Agent.id, agent, { headers: header })
          .subscribe(
            result => {
              this.dialogRef.close({ state: 'successful' });
            },
            (error: any) => {
              console.log('edit agent');
              console.log(error);
            }
          );
      } else {
        this.http.post(this.getUrl(), agent, { headers: header }).subscribe(
          result => {
            this.dialogRef.close({ state: 'successful' });
          },
          (error: any) => {
            console.log('create agent');
            console.log(error);
          }
        );
      }
    }
  }

  getUrl() {
    return '/v1/api/Agent/';
  }
}
