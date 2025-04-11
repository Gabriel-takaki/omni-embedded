/**
 * Created by filipe on 19/09/16.
 */
import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  templateUrl: 'select-location-dialog.component.html',
  styleUrls: ['select-location-dialog.component.scss']
})
export class SelectLocationDialogComponent {

  selectedItem;

  constructor(private dialogRef: MatDialogRef<SelectLocationDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {

  }

  placeSelected(place) {
    this.selectedItem = place;
  }

  result(r) {

    this.dialogRef.close(r ? this.selectedItem : false);

  }

}
