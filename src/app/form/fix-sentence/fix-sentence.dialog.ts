import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { ConfirmDialog } from '../../shared/dialogs/Confirm/confirm.dialog';
import { ModalBaseClass } from '../../shared/services/modal-base-class';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/app-auth-n.service';
@Component({
  selector: 'fix-sentence-dialog',
  templateUrl: 'fix-sentence.dialog.html',

})
export class FixSentenceDialog extends ModalBaseClass implements OnInit {
  form: FormGroup;
  constructor(
    public http: HttpClient,
    public dialogRef: MatDialogRef<FixSentenceDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public dialog: MatDialog,
    public authService: AuthService) {
    super();
  }
  ngOnInit() {
    this.form = this.fb.group({
      description: ['', Validators.required]
    }); // ,{updateOn: 'blur'}
    if (this.data.isEdit === true) {
      this.form.setValue({
        description: this.data.Sentence.description
      });
    }
  }
  onClose(): void {
    if (!this.form.dirty) {
      this.dialogRef.close({ data: null, state: 'cancel' });
    } else {
      const dialogRef = this.dialog.open(ConfirmDialog, {
        width: '250px',
        data: { state: 'ok' }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.state == 'confirmed') {
          this.dialogRef.close({ data: null, state: 'cancel' });
        }
      });
    }
  }
  onSave(): void {
    if (this.form.valid) {
      if (this.data.isEdit === true) {
        this.edit(this.data);
      } else {
        this.create(this.data);
      }
    }
  }
  create(data): void {
    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.post(this.getUrl(), JSON.stringify(this.form.get('description').value), { headers: headers1 }).subscribe((result) => {
      this.dialogRef.close({ state: 'successful' });
    }, (error: any) => {
      console.log('create fix');
      console.log(error);
    });
  }

  edit(data): void {
    const headers1 = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (data) {
      this.http.put(this.getUrl() + data.Sentence.id,
        JSON.stringify(this.form.get('description').value),
        { headers: headers1 }).subscribe((result) => {
          this.dialogRef.close({ state: 'successful' });
        }, (error: any) => {
          console.log('edit fix');
          console.log(error);
        });
    }
  }
  getUrl() {
    return '/v1/api/FixedSentence/';
  }
}
