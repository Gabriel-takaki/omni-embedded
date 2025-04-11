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

@Component({
  templateUrl: 'newslist.component.html'
})
export class NewslistComponent {

  public columns = [
    {caption: $localize`ID`, dataField: 'id', cssClass: 'pad5A', width: 60},
    {caption: $localize`Título`, dataField: 'title', cssClass: 'pad5A'},
    {caption: $localize`Criador`, dataField: 'writtenbyname', cellTemplate: 'writtenByTemplate', width: 220},
    {caption: $localize`Tipo`, dataField: 'type', cellTemplate: 'typeTemplate', width: 150, alignment: 'center'},
    {
      caption: $localize`Avaliação`,
      dataField: 'rating',
      cellTemplate: 'ratingTemplate',
      width: 70,
      alignment: 'center'
    },
    {caption: $localize`Válida`, dataField: 'valid', cellTemplate: 'validityTemplate', width: 70, alignment: 'center'},
    {
      caption: $localize`Funções`,
      dataField: 'id',
      encodeHtml: false,
      cellTemplate: 'functionsTemplate',
      cssClass: 'pad5A',
      width: 120, alignment: 'center'
    }];

  public faqs = [];

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
    this.http.get(BASE_URL + '/news/getAllNews').subscribe((r: any[]) => {
      this.faqs = r;
    }, err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao recuperar dados.`);
    });
  }

  add() {
    const newReason = this.dialog.open(NewsformComponent);
    const sub = newReason.afterClosed().subscribe(r => {
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
    const newReason = this.dialog.open(NewsformComponent, {data: item});
    const sub = newReason.afterClosed().subscribe(r => {
      sub.unsubscribe();
      if (r) {
        this.loadData();
      }
    })
  }


  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja excluir esta novidade?`,
    title: $localize`Excluir novidade`,
    yesButtonText: $localize`Excluir`,
    noButtonText: $localize`Cancelar`
  })
  removeItem(reason) {
    this.http.delete(BASE_URL + '/news/' + reason.id, {

      observe: "response"
    }).subscribe(res => {
      this.notifications.success($localize`Sucesso`, $localize`Novidade excluída com sucesso!`);
      this.loadData();
    }, err => {
      this.notifications.error($localize`Erro ao excluir novidade.`, err.statusText);
    });
  }


}
