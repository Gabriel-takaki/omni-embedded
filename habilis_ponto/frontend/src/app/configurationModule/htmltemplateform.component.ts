/**
 * Created by filipe on 19/09/16.
 */
import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {BASE_URL} from "../app.consts";
import {SocketService} from "../services/socket.service";
import {HttpClient} from "@angular/common/http";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatChipInputEvent} from "@angular/material/chips";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {StatusService} from "../services/status.service";

@Component({
  templateUrl: 'htmltemplateform.component.html'
})
export class HtmlTemplateFormComponent implements AfterViewInit {

  public id;
  public name = '';
  public subject = '';
  public attachments = [];
  public template = '';
  public type = 0;
  @ViewChild('nameInput') nameInput: ElementRef<HTMLInputElement>;

  constructor(public socket: SocketService, private notifications: NotificationsService, public service: StatusService,
              private dialogRef: MatDialogRef<HtmlTemplateFormComponent>, private http: HttpClient,
              @Inject(MAT_DIALOG_DATA) public data: any, private snack: MatSnackBar) {

    if (data) {
      this.name = data.name || '';
      this.template = data.template || '';
      this.subject = data.subject || '';
      this.attachments = data.attachments || [];
      this.type = data.type || 0;
      this.id = data.id;
    }

  }

  ngAfterViewInit() {
    this.focusTimer();
  }

  focusTimer() {
    setTimeout(() => {
      if (this.nameInput) {
        this.nameInput.nativeElement.focus();
      } else {
        this.focusTimer();
      }
    }, 50)
  }

  close() {
    this.dialogRef.close();
  }

  save() {

    if (this.name && this.template && this.subject) {

      const re = {
        name: this.name,
        subject: this.subject,
        template: this.template,
        attachments: this.attachments,
        type: this.type
      };

      if (!this.id) {

        this.http.post(BASE_URL + '/htmltemplates', re, { observe: "response"}).subscribe(r => {
          this.notifications.success($localize`Sucesso`, $localize`Novo modelo cadastrado com sucesso!`);
          this.dialogRef.close(true);
        }, err => {
          this.notifications.error($localize`Erro ao salvar`, err.statusText);
        });

      } else {

        this.http.put(BASE_URL + '/htmltemplates/' + this.id, re, {
          observe: "response"
        }).subscribe(r => {
          this.notifications.success($localize`Sucesso`, $localize`Modelo atualizado com sucesso!`);
          this.dialogRef.close(true);
        }, err => {
          this.notifications.error($localize`Erro ao salvar`, err.statusText);
        });

      }
    }

  }

}
