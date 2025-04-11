/**
 * Created by filipe on 19/09/16.
 */
import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {StatusService} from "../services/status.service";
import {BASE_URL} from "../app.consts";
import {HttpClient} from "@angular/common/http";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  templateUrl: 'changepass.component.html'
})
export class ChangePassComponent implements AfterViewInit {

  public password = "";
  public newpassword = "";
  public newPassVisible = false;
  public passVisible = false;
  public self = false;
  public changepass = false;
  public newPassScore = 0;
  @ViewChild('firstInput') firstInput: ElementRef<HTMLInputElement>;

  constructor(private notifications: NotificationsService, private dialogRef: MatDialogRef<ChangePassComponent>,
              private http: HttpClient, @Inject(MAT_DIALOG_DATA) public data: any, public status: StatusService) {

    if (status.user.id === data.id) {
      this.self = true;
    }

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

  changed(e) {
    console.log('força mudou', e);
  }

  save() {

    if (this.newpassword && (!this.self || (this.self && this.password))) {
      const sub = this.http.post(BASE_URL + '/users/changePassword', {
        userid: this.data.id,
        oldpassword: this.password,
        newpassword: this.newpassword,
        changepass: this.changepass ? 1 : 0
      }, { observe: "response"}).subscribe(r => {
        sub.unsubscribe();
        this.notifications.success($localize`Sucesso`, $localize`Senha alterada com sucesso!`);
        this.dialogRef.close(true);
      }, err => {
        this.notifications.error($localize`Erro`, $localize`Erro ao alterar a senha, por favor, verifique os dados digitados e tente novamente.`);
      });
    }

  }

}
