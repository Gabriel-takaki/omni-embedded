/**
 * Created by filipe on 19/09/16.
 */
import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {BASE_URL} from "../app.consts";
import {HttpClient} from "@angular/common/http";
import {SocketService} from "../services/socket.service";
import {StatusService} from "../services/status.service";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  templateUrl: 'internalgroupform.component.html'
})
export class InternalGroupFormComponent implements AfterViewInit {

  public name = '';

  @ViewChild('nameInput') nameInput: ElementRef<HTMLInputElement>;

  constructor(public socket: SocketService, private notifications: NotificationsService,
              public status: StatusService,
              private dialogRef: MatDialogRef<InternalGroupFormComponent>, private http: HttpClient) {


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

    if (this.name) {
      const u = {
        name: this.name,
        color: '',
        status: 1
      };

      this.http.post(BASE_URL + '/internalchatgroups', u, { observe: "response"}).subscribe(r => {
        this.socket.socket.emit('supervisorQuery', {type: 'groups'});
        this.notifications.success($localize`Sucesso`, $localize`Novo grupo cadastrado com sucesso!`);
        this.dialogRef.close(true);
      }, err => {
        this.dialogRef.close();
      });

    }

  }

}
