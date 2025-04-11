/**
 * Created by filipe on 25/09/16.
 */
import {Component} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {StatusService} from "../services/status.service";
import {BASE_URL} from "../app.consts";
import {HttpClient} from "@angular/common/http";
import {ReasonFormComponent} from "./reasonform.component";
import {texts} from "../app.texts";
import {ConfirmAction} from "../reusable/confirmaction.decorator";
import {MatDialog} from '@angular/material/dialog';

@Component({
  templateUrl: 'reasonslist.component.html'
})
export class ReasonsListComponent {

  texts = texts;
  public columns = [
    {caption: $localize`Motivo`, dataField: 'text', cssClass: 'pad5A'},
    {caption: $localize`Tempo máximo`, dataField: 'maxtime', cellTemplate: 'maxTimeTemplate', cssClass: 'pad5A'},
    {caption: $localize`Vezes por dia`, dataField: 'timesperday', cssClass: 'pad5A'},
    {
      caption: $localize`Ação`,
      dataField: 'action',
      cellTemplate: 'actionTemplate',
      cssClass: 'pad5A',
      width: 140,
      alignment: 'center'
    },
    {
      caption: `Funções`,
      dataField: 'id',
      encodeHtml: false,
      cellTemplate: 'functionsTemplate',
      cssClass: 'pad5A',
      width: 60, alignment: 'center'
    }];

  public reasons = [];

  constructor(public service: StatusService, private notifications: NotificationsService, private http: HttpClient,
              public dialog: MatDialog) {

    this.loadReasons();

  }

  copyData(e) {

    // Cria uma cópia do objeto para que o grid não atualize junto com o formulário
    const copy = JSON.parse(JSON.stringify(e.key));
    e.key.copy = copy;

  }

  loadReasons() {
    this.http.get(BASE_URL + '/reasons/?status=1&limit=500').subscribe((r: any[]) => {
      for (const u of r) {
        u.copy = {};
        const qu = [];
        for (const q of u.queues) {
          qu.push(q.id);
        }
        u.queues = qu;
      }
      this.reasons = r;
    }, err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao recuperar dados.`);
    });
  }

  addReason() {
    const newReason = this.dialog.open(ReasonFormComponent);
    const sub = newReason.afterClosed().subscribe(r => {
      sub.unsubscribe();
      if (r) {
        this.loadReasons();
      }
    })
  }

  saveConfig(reason) {

    const re = {
      maxtime: reason.copy.maxtime,
      timesperday: reason.copy.timesperday,
      action: reason.copy.action,
      queues: reason.copy.queues
    };

    const sub = this.http.put(BASE_URL + '/reasons/' + reason.id, re, {

      observe: 'response'
    }).subscribe(r => {
      sub.unsubscribe();
      this.notifications.success($localize`Sucesso`, $localize`Configurações salvas com sucesso!`);
      reason.maxtime = reason.copy.maxtime;
      reason.timesperday = reason.copy.timesperday;
      reason.action = reason.copy.action;
      reason.queues = reason.copy.queues
    }, error => {
      this.notifications.error($localize`Erro ao salvar`, error.statusText);
    });

  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja excluir este motivo de pausa?`,
    title: $localize`Excluir motivo`,
    yesButtonText: $localize`Excluir`,
    noButtonText: $localize`Cancelar`
  })
  removeItem(reason) {
    this.http.put(BASE_URL + '/reasons/' + reason.id, {
      status: 0,
      text: reason.text.slice(0, 128) + $localize` - Excluído`
    }, {

      observe: "response"
    }).subscribe(res => {
      this.notifications.success($localize`Sucesso`, $localize`Motivo inativado com sucesso!`);
      this.loadReasons();
    }, err => {
      this.notifications.error($localize`Erro ao inativar motivo.`, err.statusText);
    });
  }


}
