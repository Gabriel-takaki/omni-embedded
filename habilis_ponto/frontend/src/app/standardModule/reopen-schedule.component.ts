/**
 * Created by filipe on 19/09/16.
 */
import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  templateUrl: 'reopen-schedule.component.html'
})

export class ReopenScheduleComponent {

  haveSchedule = false;
  date = new Date();
  hour = 10;
  minute = 15;

  public update = $localize`:atualizar um agendamento existente:Atualizar`;
  public create = $localize`:criar novo agendamento:Criar`;

  constructor(private dialogRef: MatDialogRef<ReopenScheduleComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {

    this.getSchedules(data.remoteId);


  }

  getSchedules(id) {


  }

  keyp(e) {
    if (e.key === 'Enter') {
      this.result(true);
    }
  }

  result(r) {

    this.dialogRef.close(r ? typeof r === 'string' ? r : {
      date: this.date,
      hour: this.hour,
      minute: this.minute
    } : false);

  }

}
