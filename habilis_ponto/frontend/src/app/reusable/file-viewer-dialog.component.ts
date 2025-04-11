import {Component, Inject} from '@angular/core';
import {StatusService} from '../services/status.service';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {BASE_URL} from "../app.consts";

@Component({
  templateUrl: './file-viewer-dialog.component.html'
})
export class FileViewerDialogComponent {

  public file;
  public showError = false;
  baseUrl = BASE_URL;

  constructor(private dialogRef: MatDialogRef<FileViewerDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, public status: StatusService) {

    this.file = data.file;

  }

  close() {
    this.dialogRef.close();
  }

}
