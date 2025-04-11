/**
 * Created by filipe on 19/09/16.
 */
import {ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {StatusService} from "../services/status.service";
import {SocketService} from "../services/socket.service";
import {ChangePassComponent} from "../configurationModule/changepass.component";
import {texts} from '../app.texts';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ConfirmAction} from "../reusable/confirmaction.decorator";
import {ActionsService} from "../services/actions.service";

@Component({
  templateUrl: 'agentdetail.component.html',
  styleUrls: ['./agentdetail.component.scss']
})
export class AgentDetailComponent implements OnDestroy {

  public agent: any;
  timerObj;
  texts = texts;
  filter = '';

  selectedChatQueueId;

  constructor(private dialogRef: MatDialogRef<AgentDetailComponent>, private _changeDetectorRef: ChangeDetectorRef,
              public status: StatusService, private socket: SocketService, public dialog: MatDialog,
              private actions: ActionsService) {

    this.agent = status.detailAgent;
    this.generatePieData();
    this.timer();

  }

  ngOnDestroy() {
    if (this.timerObj) {
      clearTimeout(this.timerObj);
    }
  }

  timer() {
    this.timerObj = setTimeout(() => {
      this.timer();
      this._changeDetectorRef.markForCheck();
    }, 1000)
  }

  openContact(id) {
  }

  generatePieData() {

    this.agent.pie = [
      {
        title: $localize`Tempo disponível`,
        value: (this.agent.loggedTimeCount - this.agent.pausedTimeCount - this.agent.incallTimeCount) || 0
      },
      {title: $localize`Tempo em pausa`, value: this.agent.pausedTimeCount},
      {title: $localize`Tempo em atendimento`, value: this.agent.incallTimeCount}
    ];

  }

  changeUserPass(user) {
    this.dialog.open(ChangePassComponent, {
      data: {
        username: user.userName,
        fullname: user.fullName,
        id: user.id
      }
    });
  }


  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja deslogar este usuário?`,
    title: $localize`Deslogar usuário`,
    yesButtonText: $localize`Deslogar`,
    noButtonText: $localize`Não`
  })
  logoutUser(user) {
    this.socket.socket.emit('supervisorAction', {type: 'logoutAgent', userId: user.id});
  }


  result(r) {

    this.dialogRef.close(r);

  }

  openChat(id, client, agent, queueId, clientId, pageId) {

   

  }

  openTransferDialog(c) {
    if (c) {
      this.actions.transferChat(c);
    }
  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja encerrar este atendimentos?`,
    title: $localize`Encerrar atendimento`,
    yesButtonText: $localize`Encerrar`,
    noButtonText: $localize`Não`
  })
  endChat(c) {
    if (c) {
      this.socket.socket.emit('supervisorAction', {type: 'endChat', clientId: c.clientId, queueId: c.queueId});
    }
  }

  spyUser(user, channel, whisper) {
    this.socket.socket.emit('supervisorAction', {type: 'spyAgent', sipUser: user.sipUser, channel, whisper});
  }

}
