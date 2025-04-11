/**
 * Created by filipe on 19/09/16.
 */
import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  templateUrl: 'date-range-selection.component.html'
})

export class DateRangeSelectionComponent {

  startDate;
  endDate;

  constructor(private dialogRef: MatDialogRef<DateRangeSelectionComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.startDate = data?.startDate;
    this.endDate = data?.endDate;
  }

  result(r) {
    this.dialogRef.close(r ? {startDate: this.startDate, endDate: this.endDate} : null);
  }

}
