/**
 * Created by filipe on 19/09/16.
 */
import {Component, Inject} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BASE_URL} from "../app.consts";
import {NotificationsService} from "angular2-notifications";
import * as _ from 'lodash';
import * as uuid from 'uuid';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  templateUrl: 'timetableform.component.html'
})
export class TimeTableFormComponent {

  public table = [];

  constructor(private http: HttpClient, private dialog: MatDialogRef<TimeTableFormComponent>,
              private notifications: NotificationsService, @Inject(MAT_DIALOG_DATA) public data: any) {

    this.load();

  }

  load() {
    this.http.get(BASE_URL + '/timetable/?limit=500&fk_queue=' + this.data.id).subscribe((r: any) => {
      this.table = r;
    }, err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao obter dados.`);
      this.dialog.close();
    });
  }

  removeItem(t) {

    _.remove(this.table, t);

  }

  addTime() {

    this.table.push({
      uuid: uuid.v1(),
      fk_queue: this.data.id,
      fk_user: 0,
      type: 0,
      date: new Date(),
      weekdaybegin: 1,
      weekdayend: 1,
      hourbegin: 0,
      hourend: 23,
      minutebegin: 0,
      minuteend: 59
    });

  }

  save() {

    this.http.post(BASE_URL + '/timetable/deleteTable', {id: this.data.id}).subscribe((r: any) => {
      this.http.post(BASE_URL + '/timetable/', this.table).subscribe((re: any) => {
        this.notifications.success($localize`Sucesso`, $localize`Tabela de horários salva com sucesso!`);
        this.dialog.close();
      }, err => {
        this.notifications.error($localize`Erro`, $localize`Erro ao salvar tabela de horários. Verifique os dados e tente novamente.`);
      });
    }, err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao salvar tabela de horários. Verifique os dados e tente novamente.`);
    });

  }

  close() {
    this.dialog.close();
  }

}
