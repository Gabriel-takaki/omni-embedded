/**
 * Created by filipe on 25/09/16.
 */
import {Component} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {StatusService} from "../services/status.service";
import {BASE_URL} from "../app.consts";
import {HttpClient} from "@angular/common/http";
import {ConfirmAction} from "../reusable/confirmaction.decorator";
import {MatDialog} from '@angular/material/dialog';
import * as _ from 'lodash';
import {CustomFormFormComponent} from "./custom-form-form.component";

@Component({
  templateUrl: 'custom-forms-list.component.html'
})
export class CustomFormsListComponent {

  public columns = [
    {caption: $localize`Nome`, dataField: 'name', cssClass: 'pad5A'},
    {caption: $localize`Descrição`, dataField: 'description'},
    {caption: $localize`Campos`, dataField: 'fieldscount'},
    {
      caption: $localize`Funções`,
      dataField: 'id',
      encodeHtml: false,
      cellTemplate: 'functionsTemplate',
      cssClass: 'pad5A',
      width: 90, alignment: 'center'
    }];

  public forms = [];

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
    await this.service.queryAllForms();
    this.forms = _.cloneDeep(this.service.allForms);
  }

  add() {
    const newReason = this.dialog.open(CustomFormFormComponent);
    const sub = newReason.afterClosed().subscribe(r => {
      sub.unsubscribe();
      if (r) {
        this.loadData();
      }
    })
  }

  edit(item) {
    const newReason = this.dialog.open(CustomFormFormComponent, {data: item});
    const sub = newReason.afterClosed().subscribe(r => {
      sub.unsubscribe();
      if (r) {
        this.loadData();
      }
    })
  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja excluir este formuário? Essa ação não poderá ser desfeita!`,
    title: $localize`Excluir formulário`,
    yesButtonText: $localize`Excluir`,
    noButtonText: $localize`Cancelar`
  })
  removeItem(reason) {
    this.http.delete(BASE_URL + '/forms/' + reason.id, {
      observe: "response"
    }).subscribe(res => {
      this.notifications.success($localize`Sucesso`, $localize`Formulário excluído com sucesso!`);
      this.loadData();
    }, err => {
      this.notifications.error($localize`Erro ao excluir formulário.`, err.statusText);
    });
  }


}
