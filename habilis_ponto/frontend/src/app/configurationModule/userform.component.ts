/**
 * Created by filipe on 19/09/16.
 */
import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {AGENT_TYPE, BASE_URL} from "../app.consts";
import {HttpClient} from "@angular/common/http";
import {SocketService} from "../services/socket.service";
import {StatusService} from "../services/status.service";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  templateUrl: 'userform.component.html'
})
export class UserFormComponent implements AfterViewInit {

  public username = '';
  public password = '';
  public fullname = '';
  public sipuser = '';
  public clockNum = '';
  public changepass = false;
  public showscoreondashboard = false;
  public type = 2;
  public botkey = '';
  public passVisible = false;
  public userAvaiable = true;

  public agentType = AGENT_TYPE;

  @ViewChild('usernameInput') usernameInput: ElementRef<HTMLInputElement>;

  constructor(public socket: SocketService, private notifications: NotificationsService,
              public status: StatusService,
              private dialog: MatDialogRef<UserFormComponent>, private http: HttpClient) {


  }

  ngAfterViewInit() {
    this.focusTimer();
  }

  focusTimer() {
    setTimeout(() => {
      if (this.usernameInput) {
        this.usernameInput.nativeElement.focus();
      } else {
        this.focusTimer();
      }
    }, 50)
  }

  close() {
    this.dialog.close();
  }

  save() {

    if ((this.type === 3 && this.username && this.fullname && this.botkey) ||
      (((((this.type === 0 || this.type === 1) && this.sipuser) || this.status.disableTelephony) || this.type === 2 || this.type === 4) &&
        this.username && this.fullname && this.password) ||
        (this.type === 5 && this.username && this.fullname && this.password && this.clockNum) 
      ) {
      const u = {
        username: this.username,
        fullname: this.fullname,
        password: this.type !== 3 ? this.password : 'kladmas93448mvs03823n',
        sipuser: this.type === 0 || this.type === 1 ? this.sipuser : '',
        sippass: '',
        type: this.type,
        status: 1,
        changepass: this.changepass ? 1 : 0,
        showscoreondashboard: this.showscoreondashboard ? 1 : 0,
        botkey: this.botkey,
        tasksenabled: this.status.taskManagerEnabled && !this.status.chatCenterEnabled ? 1 : 0,
        chatenabled: !this.status.taskManagerEnabled && this.status.chatCenterEnabled ? 1 : 0,
        clockNum: this.clockNum,
      };

      this.http.post(BASE_URL + '/users', u, { observe: "response"}).subscribe(r => {
        this.socket.socket.emit('supervisorQuery', {type: 'agents'});
        this.notifications.success($localize`Sucesso`, $localize`Novo usuário cadastrado com sucesso!`);
        this.dialog.close(true);
      }, err => {
        if (err.error.message === 'already exists') {
          this.notifications.error($localize`Erro ao salvar`, $localize`Já existe um usuário com este nome de usuário cadastrado.`);
        } else if (err.error.message?.includes('sipuser_UNIQUE')) {
          this.notifications.error($localize`Erro ao salvar`, $localize`Já existe um usuário com este número SIP cadastrado.`);
        } else if (err.error.message?.includes('username_UNIQUE')) {
          this.notifications.error($localize`Erro ao salvar`, $localize`Este usuário já está cadastrado na base.`);
        } else if (err.error === 'Limite excedido') {
          this.notifications.error($localize`Erro ao salvar`, $localize`Limite de agentes atingido. Por favor, entre em contato com o suporte.`);
        }
          else if (err.error === 'invalid_wanum') {
            this.notifications.error($localize`Erro ao salvar`, $localize`Número de whatsapp inválido.`);
        } else {
          this.notifications.error($localize`Erro ao salvar`, err.statusText);
        }
      });

    }

  }

}
