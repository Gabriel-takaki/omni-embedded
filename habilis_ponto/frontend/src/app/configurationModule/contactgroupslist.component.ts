/**
 * Created by filipe on 25/09/16.
 */
import {Component} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {StatusService} from "../services/status.service";
import {BASE_URL} from "../app.consts";
import {HttpClient} from "@angular/common/http";
import {ContactGroupFormComponent} from "./contactgroupform.component";
import {ConfirmAction} from "../reusable/confirmaction.decorator";
import {MatDialog} from '@angular/material/dialog';
import {GroupMembersListComponent} from "../reusable/group-members-list.component";

@Component({
  templateUrl: 'contactgroupslist.component.html'
})
export class ContactGroupsListComponent {

  public columns = [
    {caption: $localize`ID`, dataField: 'id', width: 60},
    {caption: $localize`Grupo`, dataField: 'name', cssClass: 'pad5A'},
    {caption: $localize`Descrição`, dataField: 'description', cellTemplate: 'textTemplate', cssClass: 'pad5A'},
    {
      caption: $localize`Funções`,
      dataField: 'id',
      encodeHtml: false,
      cellTemplate: 'functionsTemplate',
      cssClass: 'pad5A',
      width: 130, alignment: 'center'
    }];

  public groups = [];

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
    this.http.get(BASE_URL + '/contactsgroups/?limit=1000').subscribe((r: any[]) => {
      this.groups = r;
    }, err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao recuperar dados.`);
    });
  }

  add() {
    const newReason = this.dialog.open(ContactGroupFormComponent);
    const sub = newReason.afterClosed().subscribe(r => {
      sub.unsubscribe();
      if (r) {
        this.loadData();
      }
    })
  }

  edit(item) {
    const newReason = this.dialog.open(ContactGroupFormComponent, {data: item});
    const sub = newReason.afterClosed().subscribe(r => {
      sub.unsubscribe();
      if (r) {
        this.loadData();
      }
    })
  }


  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja excluir este grupo?`,
    title: $localize`Excluir grupo`,
    yesButtonText: $localize`Excluir`,
    noButtonText: $localize`Cancelar`
  })
  removeItem(reason) {
    this.http.delete(BASE_URL + '/contactsgroups/' + reason.id, {

      observe: "response"
    }).subscribe(res => {
      this.notifications.success($localize`Sucesso`, $localize`Grupo excluído com sucesso!`);
      this.loadData();
    }, err => {
      this.notifications.error($localize`Erro ao excluir grupo.`, err.statusText);
    });
  }

  showMembers(groupId){
    this.dialog.open(GroupMembersListComponent, {
      data: {
        groupId
      }
    });
  }


}
