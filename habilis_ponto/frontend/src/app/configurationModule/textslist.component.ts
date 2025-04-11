/**
 * Created by filipe on 25/09/16.
 */
import {Component} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {StatusService} from "../services/status.service";
import {BASE_URL} from "../app.consts";
import {HttpClient} from "@angular/common/http";
import {TextFormComponent} from "./textform.component";
import {ConfirmAction} from "../reusable/confirmaction.decorator";
import {MatDialog} from '@angular/material/dialog';
import * as _ from 'lodash';

@Component({
  templateUrl: 'textslist.component.html'
})
export class TextsListComponent {

  public columns = [
    {caption: $localize`Título`, dataField: 'title', cssClass: 'pad5A'},
    {caption: $localize`Texto`, dataField: 'text', cellTemplate: 'textTemplate', cssClass: 'pad5A'},
    // {caption: $localize`Grupos de Acesso`, dataField: 'accessgroups', cellTemplate: 'accessTemplate', cssClass: 'pad5A'},
    {
      caption: $localize`Funções`,
      dataField: 'id',
      encodeHtml: false,
      cellTemplate: 'functionsTemplate',
      cssClass: 'pad5A',
      width: 90, alignment: 'center'
    }];

  public texts = [];

  constructor(public service: StatusService, private notifications: NotificationsService, private http: HttpClient,
              public dialog: MatDialog) {

    this.loadData();

  }

  copyData(e) {

    // Cria uma cópia do objeto para que o grid não atualize junto com o formulário
    const copy = JSON.parse(JSON.stringify(e.key));
    e.key.copy = copy;

  }

  async loadData() {
    await this.service.queryAllPredefinedTexts();
    this.texts = _.cloneDeep(this.service.allPredefinedTexts);
  }

  add() {
    const newReason = this.dialog.open(TextFormComponent);
    const sub = newReason.afterClosed().subscribe(r => {
      sub.unsubscribe();
      if (r) {
        this.loadData();
      }
    })
  }

  edit(item) {
    const newReason = this.dialog.open(TextFormComponent, {data: item});
    const sub = newReason.afterClosed().subscribe(r => {
      sub.unsubscribe();
      if (r) {
        this.loadData();
      }
    })
  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja excluir esta resposta?`,
    title: $localize`Excluir resposta`,
    yesButtonText: $localize`Excluir`,
    noButtonText: $localize`Cancelar`
  })
  removeItem(reason) {
    this.http.delete(BASE_URL + '/predefinedtexts/' + reason.id, {
      observe: "response"
    }).subscribe(res => {
      this.notifications.success($localize`Sucesso`, $localize`Resposta excluída com sucesso!`);
      this.loadData();
    }, err => {
      this.notifications.error($localize`Erro ao excluir resposta.`, err.statusText);
    });
  }


}
