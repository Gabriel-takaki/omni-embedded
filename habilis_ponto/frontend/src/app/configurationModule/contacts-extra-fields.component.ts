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
import {ContactExtraFieldsFormComponent} from "./contact-extra-fields-form.component";

@Component({
  templateUrl: 'contacts-extra-fields.component.html'
})
export class ContactsExtraFieldsComponent {

  public columns = [
    {caption: $localize`Chave`, dataField: 'id', cssClass: 'pad5A', width: 80},
    {caption: $localize`Nome`, dataField: 'name', cssClass: 'pad5A'},
    {caption: $localize`Descrição`, dataField: 'description', cssClass: 'pad5A'},
    {caption: $localize`Tipo`, dataField: 'type', cssClass: 'pad5A', cellTemplate: 'typeTemplate', width: 150},
    {caption: $localize`Bloqueado`, dataField: 'lock', cssClass: 'pad5A', cellTemplate: 'lockTemplate', width: 150},
    {
      caption: $localize`Funções`,
      dataField: 'id',
      encodeHtml: false,
      cellTemplate: 'functionsTemplate',
      cssClass: 'pad5A',
      width: 90, alignment: 'center'
    }
  ];

  constructor(public service: StatusService, private notifications: NotificationsService, private http: HttpClient,
              public dialog: MatDialog) {

    this.loadData();

  }

  copyData(e) {

    // Cria uma cópia do objeto para que o grid não atualize junto com o formulário
    const copy = JSON.parse(JSON.stringify(e.key));
    e.key.copy = copy;

  }

  loadData() {
    this.service.loadContactsExtraFields();
  }

  add() {
    const newReason = this.dialog.open(ContactExtraFieldsFormComponent);
    const sub = newReason.afterClosed().subscribe(r => {
      sub.unsubscribe();
      if (r) {
        this.loadData();
      }
    })
  }


  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja excluir este campo personalizado?`,
    title: $localize`Excluir campo`,
    yesButtonText: $localize`Excluir`,
    noButtonText: $localize`Cancelar`
  })
  removeItem(reason) {
    this.http.delete(BASE_URL + '/contactsextrafields/' + reason.id, {

      observe: "response"
    }).subscribe(res => {
      this.notifications.success($localize`Sucesso`, $localize`Resposta excluída com sucesso!`);
      this.loadData();
    }, err => {
      this.notifications.error($localize`Erro ao excluir resposta.`, err.statusText);
    });
  }


}
