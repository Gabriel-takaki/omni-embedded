/**
 * Created by filipe on 25/09/16.
 */
import {Component} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {StatusService} from "../services/status.service";
import {HttpClient} from "@angular/common/http";
import {BASE_URL} from "../app.consts";
import {ConfirmAction} from "../reusable/confirmaction.decorator";
import {MatDialog} from "@angular/material/dialog";

@Component({
  templateUrl: 'visualgrouplist.component.html',
  styleUrls: ['visualgrouplist.component.scss'],
})
export class VisualGroupListComponent {

  public columns = [
    {caption: $localize`ID`, dataField: 'id', cssClass: 'pad5A', alignment: 'center', width: 60},
    {caption: $localize`Nome`, dataField: 'name', cssClass: 'pad5A'},
    {caption: $localize`Descrição`, dataField: 'description', cssClass: 'pad5A'},
    {
      caption: $localize`Funções`,
      dataField: 'id',
      encodeHtml: false,
      cellTemplate: 'functionsTemplate',
      width: 60,
      cssClass: 'pad5A'
    }
  ];

  public visualgroups = [];

  constructor(public service: StatusService, private notifications: NotificationsService,
              public dialog: MatDialog, private http: HttpClient) {

    this.loadVisualGroups();

  }

  copyData(e) {

    // Cria uma cópia do objeto para que o grid não atualize junto com o formulário
    const copy = JSON.parse(JSON.stringify(e.key));
    e.key.copy = copy;

  }

  loadVisualGroups() {
    this.http.get(BASE_URL + '/visualgroup/?limit=500').subscribe((r: any[]) => {
      this.visualgroups = r;
    }, err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao recuperar dados.`);
    });
  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja criar um novo grupo de visualização?`,
    title: $localize`Criar grupo de visualização`,
    yesButtonText: $localize`Criar`,
    noButtonText: $localize`Cancelar`,
    yesButtonStyle: 'success'
  })
  addVisualGroup() {

    const u = {
      name: $localize`Novo grupo de visualização`,
      description: $localize`Sem descrição`
    };

    this.http.post(BASE_URL + '/visualgroup/', u, { observe: "response"}).subscribe(r => {
      this.notifications.success($localize`Sucesso`, $localize`Novo grupo de visualização cadastrado com sucesso!`);
      this.loadVisualGroups();
    }, err => {
      this.notifications.success($localize`Sucesso`, $localize`Erro ao cadastrar novo grupo de visualização!`);
    });

  }

  saveConfig(visualgroup) {

    const g = {
      name: visualgroup.copy.name,
      description: visualgroup.copy.description
    };

    const sub = this.http.put(BASE_URL + '/visualgroup/' + visualgroup.id, g, {
      observe: 'response'
    }).subscribe(r => {
      sub.unsubscribe();
      this.notifications.success($localize`Sucesso`, $localize`Configurações salvas com sucesso!`);
      visualgroup.name = visualgroup.copy.name;
      visualgroup.description = visualgroup.copy.description;
    }, error => {
      this.notifications.error($localize`Erro ao salvar`, error.statusText);
    });

  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja excluir este grupo de visualização?`,
    title: $localize`Excluir grupo de visualização`,
    yesButtonText: $localize`Excluir`,
    noButtonText: $localize`Cancelar`
  })
  removeItem(tag) {
    this.http.delete(BASE_URL + '/visualgroup/' + tag.id, {
      observe: "response"
    }).subscribe(res => {
      this.notifications.success($localize`Sucesso`, $localize`Grupo de visualização removido com sucesso!`);
      this.loadVisualGroups();
    }, err => {
      this.notifications.error($localize`Erro ao excluir grupo de visualização.`, err.statusText);
    });
  }

}
