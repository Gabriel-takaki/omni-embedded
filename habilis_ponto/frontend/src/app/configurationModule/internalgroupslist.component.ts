/**
 * Created by filipe on 25/09/16.
 */
import {Component} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {StatusService} from "../services/status.service";
import {SocketService} from "../services/socket.service";
import {HttpClient} from "@angular/common/http";
import {BASE_URL} from "../app.consts";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {InternalGroupFormComponent} from "./internalgroupform.component";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmAction} from "../reusable/confirmaction.decorator";

@Component({
  templateUrl: 'internalgroupslist.component.html'
})
export class InternalGroupsListComponent {

  public columns = [
    {caption: $localize`Nome`, dataField: 'name', cssClass: 'pad5A'},
    {
      caption: $localize`Funções`,
      dataField: 'id',
      encodeHtml: false,
      cellTemplate: 'functionsTemplate',
      width: 60,
      cssClass: 'pad5A'
    }
  ];

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  public users = [];
  public groups = [];

  constructor(public service: StatusService, private notifications: NotificationsService,
              public dialog: MatDialog, private socket: SocketService, private http: HttpClient) {

    this.loadGroups();
    this.loadUsers();

  }

  copyData(e) {

    // Cria uma cópia do objeto para que o grid não atualize junto com o formulário
    const copy = JSON.parse(JSON.stringify(e.key));
    e.key.copy = copy;

  }

  loadUsers() {
    console.log('Carregando usuários');
    this.http.get(BASE_URL + '/users/?status=1&limit=500').subscribe((r: any[]) => {
      this.users = r;
    }, err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao recuperar dados.`);
    });
  }

  loadGroups() {
    console.log('Carregando grupos');
    this.http.get(BASE_URL + '/internalchatgroups/getInternalChatGroups').subscribe((r: any[]) => {
      for (const g of r) {
        g.copy = {};
        const u = [];
        for (const q of g.users) {
          u.push(q.id);
        }
        g.users = u;
      }
      this.groups = r;
      // console.log(this.groups);
    }, err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao recuperar dados.`);
    });
  }

  addGroup() {
    const newUser = this.dialog.open(InternalGroupFormComponent);
    const sub = newUser.afterClosed().subscribe(r => {
      sub.unsubscribe();
      if (r) {
        console.log('Chamando carregamento de grupos.');
        this.loadGroups();
      }
    })
  }

  saveConfig(group) {

    const g = {
      name: group.copy.name,
      color: group.copy.color,
      users: group.copy.users
    };

    const sub = this.http.put(BASE_URL + '/internalchatgroups/' + group.id, g, {

      observe: 'response'
    }).subscribe(r => {
      sub.unsubscribe();
      this.notifications.success($localize`Sucesso`, $localize`Configurações salvas com sucesso!`);
      group.name = group.copy.name;
      group.color = group.copy.color;
      group.users = group.copy.users;
    }, error => {
      this.notifications.error($localize`Erro ao salvar`, error.statusText);
    });

  }


  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja excluir este grupo?`,
    title: $localize`Excluir grupo`,
    yesButtonText: $localize`Excluir`,
    noButtonText: $localize`Cancelar`
  })
  removeItem(group) {
    this.http.put(BASE_URL + '/internalchatgroups/' + group.id, {
      status: 0
    }, {

      observe: "response"
    }).subscribe(res => {
      this.notifications.success($localize`Sucesso`, $localize`Grupo inativado com sucesso!`);
      this.loadGroups();
    }, err => {
      this.notifications.error($localize`Erro ao inativar grupo.`, err.statusText);
    });
  }

}
