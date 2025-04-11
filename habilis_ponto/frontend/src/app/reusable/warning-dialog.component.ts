/**
 * Created by filipe on 19/09/16.
 */
import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {StatusService} from "../services/status.service";

@Component({
  templateUrl: 'warning-dialog.component.html'
})
export class WarningDialogComponent implements AfterViewInit {

  text = '';

  title = '';

  noButtonText = $localize`Cancelar`;
  noButtonStyle = '';
  noButtonRet;
  taskId;
  big = false;
  @ViewChild('noButton') noButton: ElementRef<HTMLButtonElement>;

  constructor(private dialogRef: MatDialogRef<WarningDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              public status: StatusService) {

    this.text = data.text;
    this.title = data.title || '';
    this.noButtonText = data.noButtonText || $localize`Cancelar`;
    this.noButtonRet = data.noButtonRet || null;
    this.big = data.big || false;

  }

  ngAfterViewInit() {
    this.focusTimer();
  }

  focusTimer() {
    setTimeout(() => {
      if (this.noButton && this.noButton.nativeElement) {
        this.noButton.nativeElement.focus();
      } else {
        this.focusTimer();
      }
    }, 10)
  }

  result() {

    this.dialogRef.close(false);

  }

}
