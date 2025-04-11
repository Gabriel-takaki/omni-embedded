/**
 * Created by filipe on 19/09/16.
 */
import {Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  templateUrl: 'edit-message.component.html'
})

export class EditMessageComponent {

  originalMessage = '';
  msg = '';
  @ViewChild('yesButton') yesButton: ElementRef<HTMLButtonElement>;
  @ViewChild('noButton') noButton: ElementRef<HTMLButtonElement>;
  @ViewChild('infoText') infoText: ElementRef<HTMLTextAreaElement>;

  constructor(private dialogRef: MatDialogRef<EditMessageComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {

    this.originalMessage = data.originalMessage || '';
    this.msg = data.originalMessage || '';

  }

  handleArrows(e, button) {
    if (['ArrowLeft', 'ArrowRight'].includes(e.code)) {
      if (button === 'yesButton') {
        this.noButton.nativeElement.focus();
      } else {
        this.yesButton.nativeElement.focus();
      }
      e.stopPropagation();
      e.preventDefault();
    }
    if (['Tab'].includes(e.code)) {
      if (button === 'noButton') {
        this.infoText.nativeElement.focus();
        e.stopPropagation();
        e.preventDefault();
      }
    }

  }

  result(r) {

    this.dialogRef.close(r ? this.msg : false);

  }

}
