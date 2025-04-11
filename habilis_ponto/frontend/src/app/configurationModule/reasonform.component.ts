/**
 * Created by filipe on 19/09/16.
 */
import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {BASE_URL} from "../app.consts";
import {SocketService} from "../services/socket.service";
import {HttpClient} from "@angular/common/http";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  templateUrl: 'reasonform.component.html'
})

export class ReasonFormComponent implements AfterViewInit {

  public text = '';
  @ViewChild('firstInput') firstInput: ElementRef<HTMLInputElement>;

  constructor(public socket: SocketService, private notifications: NotificationsService,
              private dialogRef: MatDialogRef<ReasonFormComponent>, private http: HttpClient) {

  }

  ngAfterViewInit() {
    this.focusTimer();
  }

  focusTimer() {
    setTimeout(() => {
      if (this.firstInput) {
        this.firstInput.nativeElement.focus();
      } else {
        this.focusTimer();
      }
    }, 50)
  }

  close() {
    this.dialogRef.close();
  }

  save() {

    if (this.text) {

      const re = {
        text: this.text,
        status: 1
      };

      this.http.post(BASE_URL + '/reasons', re, { observe: "response"}).subscribe(r => {
        this.notifications.success($localize`Sucesso`, $localize`Novo motivo cadastrado com sucesso!`);
        this.dialogRef.close(true);
      }, err => {
        this.notifications.error($localize`Erro ao salvar`, err.statusText);
      });

    }

  }

}
