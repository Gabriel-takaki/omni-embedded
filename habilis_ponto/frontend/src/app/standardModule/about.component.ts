/**
 * Created by filipe on 18/09/16.
 */
import {Component} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {LoadingService} from "../loadingModule/loading.service";
import {StatusService} from "../services/status.service";
import {AuthService} from "../services/auth.service";

@Component({
  templateUrl: 'about.component.html'
})
export class AboutComponent {

  public columns = [
    {caption: 'Nome do contato', dataField: 'name'},
    {captions: 'Número', dataField: 'number'}
  ];

  constructor(private notifications: NotificationsService, private loading: LoadingService,
              public items: StatusService, private auth: AuthService) {

  }

  logEvent(info) {
    console.log(info);
  }

  updateRow(row) {
    const item = row.key;
    delete item.createdAt;
    delete item.updatedAt;
    item.createdBy = this.items.user.id;
    this.items.updateItem(item, 'contacts').then((res) => {
      this.notifications.success('Sucesso', 'Contato atualizado com sucesso.');
    });
  }

  createRow(row) {
    const item = row.key;
    item.createdBy = this.items.user.id;
    this.items.createItem(item, 'contacts').then((res) => {
      this.notifications.success('Sucesso', 'Contato criado com sucesso.');
    });
  }

  deleteRow(row) {
    const item = row.key.id;
    this.items.deleteItem(item, 'contacts').then((res) => {
      this.notifications.success('Sucesso', 'Contato excluido com sucesso.');
    });
  }

}
