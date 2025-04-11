/**
 * Created by filipe on 19/09/16.
 */
import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {StatusService} from "../services/status.service";

@Component({
  templateUrl: 'shortcuts-dialog.component.html'
})
export class ShortcutsDialogComponent implements AfterViewInit {

  text = '';

  title = '';

  noButtonText = $localize`Cancelar`;
  noButtonStyle = '';
  noButtonRet;
  taskId;
  big = false;
  @ViewChild('noButton') noButton: ElementRef<HTMLButtonElement>;

  constructor(private dialogRef: MatDialogRef<ShortcutsDialogComponent>, public status: StatusService) {

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
