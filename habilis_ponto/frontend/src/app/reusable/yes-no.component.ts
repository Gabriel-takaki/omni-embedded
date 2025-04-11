/**
 * Created by filipe on 19/09/16.
 */
import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {StatusService} from "../services/status.service";

@Component({
  templateUrl: 'yes-no.component.html'
})

export class YesNoComponent implements AfterViewInit {

  text = '';

  title = '';

  noButtonText = $localize`Cancelar`;
  noButtonStyle = '';
  yesButtonStyle = 'success';
  yesButtonText = $localize`Continuar`;
  noButtonRet;
  taskId;
  big = false;
  @ViewChild('yesButton') yesButton: ElementRef<HTMLButtonElement>;
  @ViewChild('noButton') noButton: ElementRef<HTMLButtonElement>;

  constructor(private dialogRef: MatDialogRef<YesNoComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              public status: StatusService) {

    this.text = data.text;
    this.title = data.title || '';
    this.noButtonText = data.noButtonText || $localize`Cancelar`;
    this.noButtonRet = data.noButtonRet || null;
    this.yesButtonStyle = data.yesButtonStyle || 'success';
    this.yesButtonText = data.yesButtonText || $localize`Continuar`;
    this.taskId = data.taskId || 0;
    this.big = data.big || false;

  }

  ngAfterViewInit() {
    this.focusTimer();
  }

  handleArrows(e, button) {
    if (['ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) {
      if (button === 'yesButton') {
        this.noButton.nativeElement.focus();
      } else {
        this.yesButton.nativeElement.focus();
      }
      e.stopPropagation();
      e.preventDefault();
    }
  }

  openTask(){
    this.status.selectedTask = this.status.allTasksMap[this.taskId];
    this.status.showTasks = true;
    this.dialogRef.close(false);
  }

  focusTimer() {
    setTimeout(() => {
      if (this.yesButton && this.yesButton.nativeElement) {
        this.yesButton.nativeElement.focus();
      } else {
        this.focusTimer();
      }
    }, 10)
  }

  result(r, e) {

    this.dialogRef.close(r ? r : this.noButtonRet ? this.noButtonRet : false);
    e.preventDefault();

  }

}
