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
import {MatChipInputEvent} from "@angular/material/chips";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {Template} from "../definitions";

@Component({
  templateUrl: 'templatelist.component.html',
  styleUrls: ['templatelist.component.scss'],
})
export class TemplateListComponent {

  public columns = [
    {caption: $localize`ID`, dataField: 'id', cssClass: 'pad5A', alignment: 'center', width: 60},
    {caption: $localize`Nome`, dataField: 'name', cssClass: 'pad5A'},
    {caption: $localize`Nome do Modelo`, dataField: 'templatename', cssClass: 'pad5A', alignment: 'center'},
    {caption: $localize`Idioma`, dataField: 'language', cssClass: 'pad5A', width: 160, alignment: 'center'},
    {caption: $localize`Categoria`, dataField: 'category', cssClass: 'pad5A', width: 160, alignment: 'center'},
    {
      caption: $localize`Fila`,
      dataField: 'queueid',
      cssClass: 'pad5A',
      width: 200,
      alignment: 'center',
      cellTemplate: 'queueTemplate'
    },
    {caption: $localize`Estado`, dataField: 'status', cellTemplate: 'statusTemplate', width: 160, alignment: 'center'},
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
  public templates: Template[] = [];
  public templateUpdating = false;
  public changeCounter = 0;

  constructor(public service: StatusService, private notifications: NotificationsService,
              public dialog: MatDialog, private socket: SocketService, private http: HttpClient) {

    this.loadTemplates();

  }

  incrementCounter() {
    this.changeCounter++;
  }

  copyData(e) {

    // Cria uma cópia do objeto para que o grid não atualize junto com o formulário
    const copy = JSON.parse(JSON.stringify(e.key));
    e.key.copy = copy;

  }

  addParam(params) {
    params.push({
      title: 'Novo Parâmetro',
      type: 0,
      default: '',
      options: [],
      currencyCode: 'BRL'
    });
    this.incrementCounter();
  }

  removeParam(params, param) {
    params.splice(params.indexOf(param), 1);
    this.incrementCounter();
  }

  loadTemplates() {
    this.http.get(BASE_URL + '/wacloudtemplates/?limit=500').subscribe((r: Template[]) => {
      this.templates = r;
    }, err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao recuperar dados.`);
    });
  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja criar um novo template?`,
    title: $localize`Criar template`,
    yesButtonText: $localize`Criar`,
    noButtonText: $localize`Cancelar`,
    yesButtonStyle: 'success'
  })
  addTemplate() {

    const u = {
      name: 'Novo template',
      templatename: '',
      language: '',
      headertype: 0,
      header_file: '',
      params: []
    };

    this.http.post(BASE_URL + '/wacloudtemplates/', u, {observe: "response"}).subscribe(r => {
      this.notifications.success($localize`Sucesso`, $localize`Novo template cadastrado com sucesso!`);
      this.loadTemplates();
    }, err => {
      this.notifications.success($localize`Sucesso`, $localize`Erro ao cadastrar novo template!`);
    });

  }


  @ConfirmAction('dialog', {
    text: $localize`Essa ação irá atualizar os templates existentes com base nos dados cadastrados na Meta. Templates não cadastrados serão cadastrados automaticamente. Essa funcionalidade só está disponível para filas WA Cloud API, Dialog 360 (Cloud API) e WA Smarte. Deseja continuar?`,
    title: $localize`Atualizar templates`,
    yesButtonText: $localize`Atualizar`,
    noButtonText: $localize`Cancelar`,
    yesButtonStyle: 'success'
  })
  updateTemplates() {
    this.templateUpdating = true;
    this.http.post(BASE_URL + '/wacloudtemplates/updateFromMeta', {observe: "response"}).subscribe(r => {
      this.notifications.success($localize`Sucesso`, $localize`Atualização realizada com sucesso!`);
      this.templateUpdating = false;
      this.loadTemplates();
    }, err => {
      this.templateUpdating = false;
      this.notifications.success($localize`Sucesso`, $localize`Erro ao atualizar!`);
    });

  }

  saveConfig(template) {

    const g = {
      name: template.copy.name,
      ...(template.type === 0 ? {templatename: template.copy.templatename} : {}),
      ...(template.type === 0 ? {language: template.copy.language} : {}),
      ...(template.type === 0 ? {headertype: template.copy.headertype} : {}),
      header_file: template.copy.header_file,
      params: template.copy.params,
      headerparams: template.copy.headerparams,
      buttonsparams: template.copy.buttonsparams,
    };

    const sub = this.http.put(BASE_URL + '/wacloudtemplates/' + template.id, g, {
      observe: 'response'
    }).subscribe(r => {
      sub.unsubscribe();
      this.notifications.success($localize`Sucesso`, $localize`Configurações salvas com sucesso!`);
      template.name = template.copy.name;
      template.templatename = template.copy.templatename;
      template.language = template.copy.language;
      template.params = template.copy.params;
      template.headertype = template.copy.headertype;
      template.header_file = template.copy.header_file;
      template.headerparams = template.copy.headerparams;
      template.buttonsparams = template.copy.buttonsparams;
    }, error => {
      this.notifications.error($localize`Erro ao salvar`, error.statusText);
    });

  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja excluir este template?`,
    title: $localize`Excluir template`,
    yesButtonText: $localize`Excluir`,
    noButtonText: $localize`Cancelar`
  })
  removeItem(tag) {
    this.http.delete(BASE_URL + '/wacloudtemplates/' + tag.id, {

      observe: "response"
    }).subscribe(res => {
      this.notifications.success($localize`Sucesso`, $localize`Template removido com sucesso!`);
      this.loadTemplates();
    }, err => {
      this.notifications.error($localize`Erro ao excluir template.`, err.statusText);
    });
  }


  addTag(event: MatChipInputEvent, tags): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removeTag(option, tags) {
    tags.splice(tags.indexOf(option), 1);
    this.incrementCounter();
  }

}
