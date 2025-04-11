/**
 * Created by filipe on 19/09/16.
 */
import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  templateUrl: 'popup-message.component.html'
})

export class PopupMessageComponent {

  text = '';
  title = '';
  buttonText = $localize`Cancelar`;

  constructor(private dialogRef: MatDialogRef<PopupMessageComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {

    this.text = data.text;
    this.title = data.title || '';
    this.buttonText = data.buttonText || $localize`Fechar`;

  }

  result(r) {

    this.dialogRef.close(r);

  }

}
