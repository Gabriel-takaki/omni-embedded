/**
 * Created by filipe on 19/09/16.
 */
import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  templateUrl: 'image-cropper.component.html'
})

export class ImageCropperComponent {

  imageChangedEvent;
  imageFile;
  croppedBase64;
  loaded = false;
  caption = '';
  description = '';
  resizeToHeight = 380;

  constructor(private dialogRef: MatDialogRef<ImageCropperComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private snack: MatSnackBar) {

    this.imageChangedEvent = data.imageEvent;
    this.imageFile = data.imageFile;
    this.caption = data.caption || '';
    this.description = data.description || '';
    this.resizeToHeight = data.resizeToHeight || 380;

  }

  result(r) {

    this.dialogRef.close(r ? this.croppedBase64 : false);

  }

  imageLoaded() {
    this.loaded = true;
  }

  loadImageFailed() {
    this.snack.open($localize`Erro ao carregar imagem.`, $localize`Fechar`, {panelClass: 'bg-danger', duration: 3000});
    this.dialogRef.close(false);
  }

  imageCropped(e) {
    this.croppedBase64 = e.base64;
  }

}
