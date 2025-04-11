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
import {ConfirmAction} from "../reusable/confirmaction.decorator";
import {MatDialog} from "@angular/material/dialog";


@Component({
  templateUrl: 'triggerslist.component.html',
  styleUrls: ['triggerslist.component.scss'],
})
export class TriggersListComponent {

  public columns = [
    {caption: $localize`Nome`, dataField: 'name', cssClass: 'pad5A'},
    {
      caption: $localize`Quantidade de gatilhos`,
      dataField: 'name',
      cssClass: 'pad5A',
      cellTemplate: 'triggersTemplate',
      width: 200
    },
    {
      caption: $localize`Funções`,
      dataField: 'id',
      encodeHtml: false,
      cellTemplate: 'functionsTemplate',
      width: 50,
      cssClass: 'pad5A'
    }
  ];

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  public triggers = [];
  public ivrs = [];


  constructor(public service: StatusService, private notifications: NotificationsService,
              public dialog: MatDialog, private socket: SocketService, private http: HttpClient) {

    this.loadTriggers();

  }

  copyData(e) {

    // Cria uma cópia do objeto para que o grid não atualize junto com o formulário
    const copy = JSON.parse(JSON.stringify(e.key));
    e.key.copy = copy;

  }

  addRule(data) {
    /**
     * lm - Última mensagem por
     * dp - Dependência, ativa somente se a regra com o ID já tiver sido acionada
     * resp - Se já foi respondido, primeira resposta ou respondido pelo agente atual
     * at - Se está atualmente atribuído
     * in - Inatividade por agente ou cliente ou ambos
     */
    data.push({
      rId: (data[data.length - 1]?.rId || 0) + 1,
      type: 0,
      time: 20,
      aId: 0,
      lm: 0,
      dp: 0,
      resp: 0,
      at: 0,
      in: 0
    });
  }

  removeRule(item, array) {
    array.splice(array.indexOf(item), 1);
  }

  loadTriggers() {
    this.http.get(BASE_URL + '/triggers/getTriggers').subscribe((r: any[]) => {
      this.triggers = r;
    }, err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao recuperar dados.`);
    });
  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja criar um novo conjunto?`,
    title: $localize`Criar conjunto de gatilhos`,
    yesButtonText: $localize`Criar`,
    noButtonText: $localize`Cancelar`,
    yesButtonStyle: 'success'
  })
  addTrigger() {

    const u = {
      name: 'Novo conjunto de gatilhos',
      data: '[]'
    };

    this.http.post(BASE_URL + '/triggers/', u, { observe: "response"}).subscribe(r => {
      this.notifications.success($localize`Sucesso`, $localize`Novo conjunto cadastrado com sucesso!`);
      this.loadTriggers();
    }, err => {
      this.notifications.success($localize`Sucesso`, $localize`Erro ao cadastrar novo conjunto!`);
    });

  }

  saveConfig(trigger) {

    const g = {
      name: trigger.copy.name,
      data: JSON.stringify(trigger.copy.data)
    };

    const sub = this.http.put(BASE_URL + '/triggers/' + trigger.id, g, {

      observe: 'response'
    }).subscribe(r => {
      sub.unsubscribe();
      this.notifications.success($localize`Sucesso`, $localize`Configurações salvas com sucesso!`);
      trigger.name = trigger.copy.name;
      trigger.data = trigger.copy.data;
    }, error => {
      this.notifications.error($localize`Erro ao salvar`, error.statusText);
    });

  }


  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja excluir este conjunto?`,
    title: $localize`Excluir conjunto`,
    yesButtonText: $localize`Excluir`,
    noButtonText: $localize`Cancelar`
  })
  removeItem(tag) {
    this.http.delete(BASE_URL + '/triggers/' + tag.id, {

      observe: "response"
    }).subscribe(res => {
      this.notifications.success($localize`Sucesso`, $localize`Conjunto removido com sucesso!`);
      this.loadTriggers();
    }, err => {
      this.notifications.error($localize`Erro ao excluir conjunto.`, err.statusText);
    });
  }

}
