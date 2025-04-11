/**
 * Created by filipe on 25/09/16.
 */
import {Component} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {StatusService} from "../services/status.service";
import {BASE_URL} from "../app.consts";
import {HttpClient} from "@angular/common/http";
import {GalleryFormComponent} from "./galleryform.component";
import {texts} from '../app.texts';
import {ConfirmAction} from "../reusable/confirmaction.decorator";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {RecordAudioFormComponent} from "./recordaudioform.component";
import * as _ from 'lodash';

@Component({
  templateUrl: 'gallerylist.component.html',
  styleUrls: ['./gallerylist.component.scss']
})
export class GallerylistComponent {

  baseUrl = BASE_URL;

  public columns = [
    {caption: $localize`ID`, dataField: 'fk_file', cssClass: 'pad5A', width: 75},
    {caption: $localize`Arquivo`, dataField: 'text', cellTemplate: 'photoTemplate', cssClass: 'pad5A'},
    {caption: $localize`Título`, dataField: 'title', cssClass: 'pad5A'},
    {
      caption: $localize`Funções`,
      dataField: 'id',
      encodeHtml: false,
      cellTemplate: 'functionsTemplate',
      cssClass: 'pad5A',
      width: 130, alignment: 'center'
    }];
  public texts = [];
  messages = texts;

  constructor(public service: StatusService, private notifications: NotificationsService, private http: HttpClient,
              public dialog: MatDialog, private snack: MatSnackBar) {

    this.loadData();

  }

  copyData(e) {

    // Cria uma cópia do objeto para que o grid não atualize junto com o formulário
    const copy = JSON.parse(JSON.stringify(e.key));
    e.key.copy = copy;

  }

  copyShareLink(id, auth) {
    navigator.clipboard.writeText(this.baseUrl + `/static/downloadMedia?id=${id}&download=false&auth=${auth}`);
    this.snack.open($localize`Copiado!`, '', {duration: 700});
  }

  downloadFile(id, auth) {
    window.open(this.baseUrl + `/static/downloadMedia?id=${id}&download=true&auth=${auth}`, '_blank');
  }

  changePlaybackRate() {
    if (this.service.playBackSpeed === 1) {
      this.service.playBackSpeed = 1.25
    } else if (this.service.playBackSpeed === 1.25) {
      this.service.playBackSpeed = 1.5
    } else if (this.service.playBackSpeed === 1.5) {
      this.service.playBackSpeed = 1.75
    } else if (this.service.playBackSpeed === 1.75) {
      this.service.playBackSpeed = 2
    } else if (this.service.playBackSpeed === 2) {
      this.service.playBackSpeed = 1
    }
  }

  async loadData() {
    await this.service.queryAllGallerys();
    this.texts = _.cloneDeep(this.service.allGallerys);
  }

  add() {
    const newReason = this.dialog.open(GalleryFormComponent);
    const sub = newReason.afterClosed().subscribe(r => {
      sub.unsubscribe();
      if (r) {
        this.loadData();
      }
    });
  }

  recordAudio() {
    const newReason = this.dialog.open(RecordAudioFormComponent);
    const sub = newReason.afterClosed().subscribe(r => {
      sub.unsubscribe();
      if (r) {
        this.loadData();
      }
    });
  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja excluir este arquivo?`,
    title: $localize`Excluir arquivo`,
    yesButtonText: $localize`Excluir`,
    noButtonText: $localize`Cancelar`
  })
  removeItem(reason) {
    this.http.delete(BASE_URL + '/predefinedtexts/' + reason.id, {

      observe: "response"
    }).subscribe(res => {
      this.notifications.success($localize`Sucesso`, $localize`Resposta excluída com sucesso!`);
      this.loadData();
    }, err => {
      this.notifications.error($localize`Erro ao excluir resposta.`, err.statusText);
    });
  }


}
