/**
 * Created by filipe on 25/09/16.
 */
import {Component} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {StatusService} from "../services/status.service";
import {SocketService} from "../services/socket.service";
import {HttpClient} from "@angular/common/http";
import {BASE_URL} from "../app.consts";
import {ConfirmAction} from "../reusable/confirmaction.decorator";
import {MatDialog} from "@angular/material/dialog";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import * as uuid from 'uuid';
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  templateUrl: 'webhook-capture-list.component.html',
  styleUrls: ['webhook-capture-list.component.scss'],
})
export class WebhookCaptureListComponent {

  public columns = [
    {caption: $localize`ID`, dataField: 'id', cssClass: 'pad5A', alignment: 'center', width: 60},
    {caption: $localize`Chave`, dataField: 'key', cssClass: 'pad5A', alignment: 'center'},
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
  public captures = [];
  public ivrs = [];

  lastData = '';
  window = window;

  constructor(public service: StatusService, private notifications: NotificationsService, private snack: MatSnackBar,
              public dialog: MatDialog, private socket: SocketService, private http: HttpClient) {

    this.loadCaptures();
    this.loadIvrs();

  }

  async loadIvrs() {
    this.ivrs = await this.service.getAutomationResumedList();
  }

  loadLastData(key) {

    this.http.post(BASE_URL + '/webhookcapture/getLastCapture', {key}).subscribe((r: any[]) => {
      this.lastData = JSON.stringify(r || {}, null, 2);
    }, err => {
      console.log(err);
      this.lastData = '';
    });

  }

  copyUrl(key) {
    const url = `https://${window.location.host}/webhookcapture/capture/${key}`;
    navigator.clipboard.writeText(url);
    this.snack.open($localize`Copiado!`, '', {duration: 700});
  }

  copyData(e) {

    // Cria uma cópia do objeto para que o grid não atualize junto com o formulário
    const copy = JSON.parse(JSON.stringify(e.key));
    e.key.copy = copy;

  }

  loadCaptures() {
    this.http.get(BASE_URL + '/webhookcapture/?limit=500').subscribe((r: any[]) => {
      this.captures = r;
    }, err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao recuperar dados.`);
    });
  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja criar uma nova captura de webhook?`,
    title: $localize`Criar captura`,
    yesButtonText: $localize`Criar`,
    noButtonText: $localize`Cancelar`,
    yesButtonStyle: 'success'
  })
  addCapture() {

    const u = {
      name: 'Nova captura',
      key: uuid.v4().replace(/-/g, ''),
      fk_ivr: 0,
      fk_queue: 0
    };

    this.http.post(BASE_URL + '/webhookcapture/', u, {observe: "response"}).subscribe(r => {
      this.notifications.success($localize`Sucesso`, $localize`Nova captura cadastrada com sucesso!`);
      this.loadCaptures();
    }, err => {
      this.notifications.success($localize`Sucesso`, $localize`Erro ao cadastrar nova captura!`);
    });

  }

  saveConfig(capture) {

    const g = {
      name: capture.copy.name,
      key: capture.copy.key,
      fk_ivr: capture.copy.fk_ivr,
      fk_queue: capture.copy.fk_queue,
      redirecturl: capture.copy.redirecturl
    };

    const sub = this.http.put(BASE_URL + '/webhookcapture/' + capture.id, g, {
      observe: 'response'
    }).subscribe(r => {
      sub.unsubscribe();
      this.notifications.success($localize`Sucesso`, $localize`Configurações salvas com sucesso!`);
      capture.name = capture.copy.name;
      capture.key = capture.copy.key;
      capture.fk_ivr = capture.copy.fk_ivr;
      capture.fk_queue = capture.copy.fk_queue;
    }, error => {
      this.notifications.error($localize`Erro ao salvar`, error.statusText);
    });

  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja excluir esta captura?`,
    title: $localize`Excluir captura`,
    yesButtonText: $localize`Excluir`,
    noButtonText: $localize`Cancelar`
  })
  removeItem(tag) {
    this.http.delete(BASE_URL + '/webhookcapture/' + tag.id, {
      observe: "response"
    }).subscribe(res => {
      this.notifications.success($localize`Sucesso`, $localize`Captura removida com sucesso!`);
      this.loadCaptures();
    }, err => {
      this.notifications.error($localize`Erro ao excluir captura.`, err.statusText);
    });
  }

}
