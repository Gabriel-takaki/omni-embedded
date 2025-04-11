/**
 * Created by filipe on 19/09/16.
 */
import {Component, Inject, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BASE_URL} from "../app.consts";
import {NotificationsService} from "angular2-notifications";
import * as _ from 'lodash';
import * as uuid from 'uuid';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ConfirmAction} from "../reusable/confirmaction.decorator";

@Component({
  templateUrl: 'usertimetableform.component.html'
})
export class UserTimeTableFormComponent {

  public table = [];
  @ViewChild('importDialog') importDialog;

  constructor(private http: HttpClient, private dialogRef: MatDialogRef<UserTimeTableFormComponent>,
              public dialog: MatDialog,
              private notifications: NotificationsService, @Inject(MAT_DIALOG_DATA) public data: any) {

    this.load();

  }

  load() {
    this.http.get(BASE_URL + '/timetable/?limit=500&fk_user=' + this.data.id).subscribe((r: any) => {
      this.table = r;
    }, err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao obter dados.`);
      this.dialogRef.close();
    });
  }

  removeItem(t) {

    _.remove(this.table, t);

  }

  async fileSelected(e = null) {

    if (!e?.target.files[0]) {
      return;
    }

    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (event: any) => {
      try {
        this.table = [];
        const newTable = JSON.parse(decodeURIComponent(escape(window.atob(event.target.result))));
        for (const i of newTable) {
          this.table.push({
            uuid: uuid.v4(),
            fk_queue: 0,
            fk_user: this.data.id,
            type: i.type,
            date: new Date(i.date),
            weekdaybegin: i.weekdaybegin,
            weekdayend: i.weekdayend,
            hourbegin: i.hourbegin,
            hourend: i.hourend,
            minutebegin: i.minutebegin,
            minuteend: i.minuteend
          });
        }
      } catch (e) {
        this.notifications.error($localize`Erro ao importar tabela`, 'O arquivo selecionado não é válido.');
      }
    };
    reader.readAsText(file);

  }

  addTime() {

    this.table.push({
      uuid: uuid.v4(),
      fk_queue: 0,
      fk_user: this.data.id,
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

  import() {
    this.importDialog?.nativeElement?.click();
  }

  @ConfirmAction('dialog', {
    text: $localize`Deseja exportar esta tabela de horários?`,
    title: $localize`Exportar tabela`,
    yesButtonText: $localize`Exportar`,
    noButtonText: $localize`Cancelar`,
    yesButtonStyle: 'success'
  })
  export() {

    const table = [];

    for (const t of this.table) {
      table.push({
        type: t.type,
        date: t.date,
        weekdaybegin: t.weekdaybegin,
        weekdayend: t.weekdayend,
        hourbegin: t.hourbegin,
        hourend: t.hourend,
        minutebegin: t.minutebegin,
        minuteend: t.minuteend
      });
    }

    const strTable = JSON.stringify(table);
    const tableB64 = window.btoa(unescape(encodeURIComponent(strTable)));
    const blob = new Blob([tableB64], {type: 'plain/text'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `timetable.export`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

  }

  save() {

    this.http.post(BASE_URL + '/timetable/deleteUserTable', {id: this.data.id}).subscribe((r: any) => {
      this.http.post(BASE_URL + '/timetable/', this.table).subscribe((re: any) => {
        this.notifications.success($localize`Sucesso`, $localize`Tabela de horários salva com sucesso!`);
        this.dialogRef.close();
      }, err => {
        this.notifications.error($localize`Erro`, $localize`Erro ao salvar tabela de horários. Verifique os dados e tente novamente.`);
      });
    }, err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao salvar tabela de horários. Verifique os dados e tente novamente.`);
    });

  }

  close() {
    this.dialogRef.close();
  }

}
