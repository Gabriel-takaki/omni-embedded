/**
 * Created by filipe on 19/09/16.
 */
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {SocketService} from "../services/socket.service";
import {StatusService} from "../services/status.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {UtilitiesService} from "../services/utilities.service";
import * as rrweb from "rrweb";

@Component({
  templateUrl: 'live-session-dialog.component.html',
  styleUrls: ['live-session-dialog.component.scss']
})
export class LiveSessionDialogComponent implements OnDestroy, AfterViewInit, OnChanges {

  @ViewChild('player') player: ElementRef<HTMLDivElement>;
  @ViewChild('playerBase') playerBase: ElementRef<HTMLDivElement>;

  tabId = '';
  chatId = 0;
  queueId = 0;
  remoteControl = false;
  disconnectedTab = false;
  chat;

  constructor(public socket: SocketService, private notifications: NotificationsService, public status: StatusService,
              private dialogRef: MatDialogRef<LiveSessionDialogComponent>, public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: any, private utils: UtilitiesService) {

    this.tabId = data.tabId;
    this.chatId = data.chat.id;
    this.queueId = data.chat.queueId;
    this.remoteControl = data.remoteControl;
    this.chat = data.chat;

  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.chat?.tabsObj[this.tabId]) {
      this.disconnectedTab = true;
    }
    if (this.disconnectedTab && this.chat?.tabsObj[this.tabId]) {
      this.disconnectedTab = false;
      this.startPlayer();
    }
  }

  ngOnDestroy() {
    if (this.status.liveSessionPlayer) {
      this.status.liveSessionPlayer.destroy();
      this.status.liveSessionPlayer = null;
      this.status.liveSessionTabId = '';
      this.status.remoteControlAccepted = false;
    }
    this.socket.socket.emit('action', {
      type: 'stopLiveViewSession',
      tabId: this.tabId,
      chatId: this.chatId
    });
  }

  ngAfterViewInit() {
    this.startPlayer();
  }

  async startPlayer() {
    while (!this.player) {
      await this.utils.sleep(100);
    }
    if (this.status.liveSessionPlayer) {
      this.status.liveSessionPlayer.destroy();
    }
    this.status.liveSessionPlayer = new rrweb.Replayer([], {
      root: this.player.nativeElement,
      liveMode: true
    });
    this.status.liveSessionPlayer.startLive();
    this.status.liveSessionTabId = this.tabId;
    this.status.liveSessionPlayer.adjustScale = this.adjustScale.bind(this);
    this.remoteControl ? this.requestRemoteControl() : this.requestLiveSessionView();
  }

  requestLiveSessionView() {
    this.socket.socket.emit('action', {
      type: 'startLiveViewSession',
      tabId: this.tabId,
      chatId: this.chatId
    });
  }

  requestRemoteControl() {
    this.status.remoteControlRejected = false;
    this.status.remoteControlAccepted = false;
    this.status.remoteControlRequested = true;
    this.socket.socket.emit('action', {
      type: 'requestRemoteControl',
      chatId: this.chatId
    });
  }

  async adjustScale() {
    // Aguarda o CANVAS ser criado
    let counter = 0;
    while (!document.getElementsByClassName('replayer-mouse-tail')[0]) {
      await this.utils.sleep(100);
      counter++;
      if (counter > 50) {
        return;
      }
    }
    const canvas = document.getElementsByClassName('replayer-mouse-tail')[0];
    if (canvas) {
      counter = 0;
      // Depois de recebido o primeiro evento, com a montagem inicial do iframe, o tamanho do canvas será ajustado
      // Busca esse tamanho para ajustar a escala e fazer o player caber na tela
      while (!Number(canvas.getAttribute('width'))) {
        await this.utils.sleep(100);
        counter++;
        if (counter > 150) {
          return;
        }
      }
      const width = Number(canvas.getAttribute('width'));
      const height = Number(canvas.getAttribute('height'));
      // Ajusta a escala com base na menor dimensão
      const scale = Math.min(this.playerBase.nativeElement.offsetWidth / width, this.playerBase.nativeElement.offsetHeight / height);
      this.player.nativeElement.style.transform = `scale(${scale})`;
    }
  }

  close() {
    this.dialogRef.close();
  }

}
