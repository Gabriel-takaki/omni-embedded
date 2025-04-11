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
import {NewsformComponent} from "./newsform.component";
import {NewsPreviewComponent} from "./news-preview.component";
import {HtmlTemplateFormComponent} from "./htmltemplateform.component";

@Component({
  templateUrl: 'htmltemplatelist.component.html'
})
export class HtmlTemplateListComponent {

  public columns = [
    {caption: $localize`Nome`, dataField: 'name', cssClass: 'pad5A'},
    {caption: $localize`Assunto`, dataField: 'subject', cssClass: 'pad5A'},
    {
      caption: $localize`Funções`,
      dataField: 'id',
      encodeHtml: false,
      cellTemplate: 'functionsTemplate',
      cssClass: 'pad5A',
      width: 120, alignment: 'center'
    }];

  public templates = [];

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
    this.http.get(BASE_URL + '/htmltemplates/').subscribe((r: any[]) => {
      this.templates = r;
    }, err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao recuperar dados.`);
    });
  }

  add() {
    const newTemplate = this.dialog.open(HtmlTemplateFormComponent);
    const sub = newTemplate.afterClosed().subscribe(r => {
      sub.unsubscribe();
      if (r) {
        this.loadData();
      }
    })
  }

  preview(item) {
    const newReason = this.dialog.open(NewsPreviewComponent, {data: {id: item.id}});
    const sub = newReason.afterClosed().subscribe(r => {
      sub.unsubscribe();
    })
  }

  edit(item) {
    const newTemplate = this.dialog.open(HtmlTemplateFormComponent, {data: item});
    const sub = newTemplate.afterClosed().subscribe(r => {
      sub.unsubscribe();
      if (r) {
        this.loadData();
      }
    })
  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja excluir este modelo?`,
    title: $localize`Excluir modelo`,
    yesButtonText: $localize`Excluir`,
    noButtonText: $localize`Cancelar`
  })
  removeItem(reason) {
    this.http.delete(BASE_URL + '/htmltemplates/' + reason.id, {
      observe: "response"
    }).subscribe(res => {
      this.notifications.success($localize`Sucesso`, $localize`Modelo excluído com sucesso!`);
      this.loadData();
    }, err => {
      this.notifications.error($localize`Erro ao excluir modelo.`, err.statusText);
    });
  }


}
