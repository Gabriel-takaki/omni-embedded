/**
 * Created by filipe on 19/09/16.
 */
import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {BASE_URL} from "../app.consts";

@Component({
  templateUrl: 'call-record-listen-dialog.component.html',
  styleUrls: ['call-record-listen-dialog.component.scss']
})
export class CallRecordListenDialogComponent {

  base = BASE_URL;
  linkedid = '';
  accesskey = '';

  constructor(private dialogRef: MatDialogRef<CallRecordListenDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.linkedid = data.linkedid || '';
    this.accesskey = data.accesskey || '';
  }

  close() {
    this.dialogRef.close(false);
  }

}
