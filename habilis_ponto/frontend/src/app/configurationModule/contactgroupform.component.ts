/**
 * Created by filipe on 19/09/16.
 */
import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {BASE_URL} from "../app.consts";
import {SocketService} from "../services/socket.service";
import {HttpClient} from "@angular/common/http";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  templateUrl: 'contactgroupform.component.html'
})

export class ContactGroupFormComponent implements AfterViewInit {

  public id;
  public name = '';
  public description = '';
  @ViewChild('titleInput') titleInput: ElementRef<HTMLInputElement>;

  constructor(public socket: SocketService, private notifications: NotificationsService,
              private dialogRef: MatDialogRef<ContactGroupFormComponent>, private http: HttpClient,
              @Inject(MAT_DIALOG_DATA) public data: any) {

    if (data) {
      this.name = data.name || '';
      this.description = data.description || '';
      this.id = data.id;
    }

  }

  ngAfterViewInit() {
    this.focusTimer();
  }

  focusTimer() {
    setTimeout(() => {
      if (this.titleInput) {
        this.titleInput.nativeElement.focus();
      } else {
        this.focusTimer();
      }
    }, 50)
  }

  close() {
    this.dialogRef.close();
  }

  save() {

    if (this.name) {
      if (!this.id) {
        const re = {
          name: this.name,
          description: this.description
        };

        this.http.post(BASE_URL + '/contactsgroups', re, { observe: "response"}).subscribe(r => {
          this.notifications.success($localize`Sucesso`, $localize`Novo grupo cadastrado com sucesso!`);
          this.dialogRef.close(true);
        }, err => {
          this.notifications.error($localize`Erro ao salvar`, err.statusText);
        });
      } else {
        const re = {
          name: this.name,
          description: this.description
        };

        this.http.put(BASE_URL + '/contactsgroups/' + this.id, re, {

          observe: "response"
        }).subscribe(r => {
          this.notifications.success($localize`Sucesso`, $localize`Grupo atualizado com sucesso!`);
          this.dialogRef.close(true);
        }, err => {
          this.notifications.error($localize`Erro ao salvar`, err.statusText);
        });
      }
    }

  }

}
