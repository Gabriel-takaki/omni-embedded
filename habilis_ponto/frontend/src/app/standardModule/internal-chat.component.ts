/**
 * Created by filipe on 18/09/16.
 */
import {LoadingService} from "../loadingModule/loading.service";
import {Component, HostListener, OnDestroy} from "@angular/core";
import {StatusService} from "../services/status.service";
import {DomSanitizer} from "@angular/platform-browser";
import {BASE_URL} from "../app.consts";
import {SocketService} from "../services/socket.service";
import {EventsService} from "../services/events.service";
import {MatDialog} from "@angular/material/dialog";
import * as moment from "moment";

@Component({
  selector: 'ca-internal-chat',
  templateUrl: 'internal-chat.component.html',
  styleUrls: ['./internal-chat.component.scss']
})
export class InternalChatComponent implements OnDestroy {

  public baseUrl = BASE_URL;
  searchText = '';
  now = moment().unix();
  nowTimer;

  exampleAgents = [
    {id: 1, title: 'Agente 1', online: true, type: 1, newMsgCount: 2, messages: []},
    {id: 2, title: 'Agente 2', online: true, type: 1, newMsgCount: 2, messages: []},
    {id: 1, title: 'Grupo 1', online: true, type: 2, newMsgCount: 0, messages: []},
    {id: 2, title: 'Grupo 2', online: true, type: 2, newMsgCount: 1, messages: []},
    {id: 3, title: 'Agente 3', online: false, type: 1, newMsgCount: 0, messages: []},
    {id: 4, title: 'Agente 4', online: false, type: 1, newMsgCount: 0, messages: []},
    {id: 5, title: 'Agente 5', online: true, type: 1, newMsgCount: 5, messages: []},
    {id: 6, title: 'Agente 6', online: true, type: 1, newMsgCount: 3, messages: []},
  ];

  private nextSubscription;

  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    // Se estiver no mobile, faz o backbutton voltar para a lista de chats
    if (this.status.internalSelectedChat && this.status.isMobile) {
      this.status.internalSelectedChat = null;
      event.preventDefault();
      event.stopPropagation();
      history.go(1);
    }
  }

  constructor(private loading: LoadingService, public status: StatusService, public sanitizer: DomSanitizer,
              private socket: SocketService, private events: EventsService, private dialog: MatDialog) {

    loading.stop();

    if (status.isMobile) {
      history.pushState(null, '', location.href);
    }

    this.nextSubscription = events.on('nextChat', this.nextChat.bind(this));
    this.timer();
    this.loadChats();

    this.status.newInternalMsg = false;

  }

  loadChats() {

  }

  nextChat() {

    if (this.status.internalChats.length < 2 && this.status.internalSelectedChat) {
      return;
    }

    let next = false;
    for (const c of this.status.internalChats) {
      if (next) {
        this.selectChat(c);
        this.searchText = '';
        return;
      }
      if (c === this.status.internalSelectedChat) {
        next = true;
      }
    }

    this.selectChat(this.status.internalChats[0]);

  }

  ngOnDestroy() {
    this.events.unsubscribe('nextChat', this.nextSubscription);
    if (this.status.internalSelectedChat) {
      const lastMsg = this.status.internalSelectedChat.messages[this.status.internalSelectedChat.messages.length - 1];
      if (lastMsg) {
        this.status.internalSelectedChat.lastViewedId = lastMsg.messageid;
        this.status.internalSelectedChat = null;
      }
    }
    if (this.nowTimer) {
      clearTimeout(this.nowTimer);
    }
  }

  timer() {
    this.nowTimer = setTimeout(() => {
      this.timer();
      this.now = moment().unix();
    }, 1000);
  }

  selectChat(chat) {
    if (this.status.internalSelectedChat && this.status.internalSelectedChat !== chat) {
      const lastMsg = this.status.internalSelectedChat.messages[this.status.internalSelectedChat.messages.length - 1];
      this.status.internalSelectedChat.lastViewedId = lastMsg?.messageid || '';
    }
    if (chat.new) {
      this.socket.socket.emit('action', {
        type: 'getAllInternalMessages',
        chatId: chat.id
      });
    } else if (chat.hasMoreOld && !chat.oldLoaded) {
      chat.oldLoaded = true;
      this.socket.getMoreInternalMsgs(chat);
    }
    this.status.internalSelectedChat = chat;
    chat.new = false;
    chat.selectedNow = true;
    chat.oldMsgCount = chat.newMsgCount;
    chat.newMsgCount = 0;
    chat.firstNotRead = '';
    for (const m of chat.messages) {
      if (['in', 'in-ex'].includes(m.direction) && !m.readed) {
        chat.firstNotRead = chat.firstNotRead || m.messageid;
        this.socket.socket.emit('action', {
          type: 'setInternalMessageAsReaded',
          chatId: chat.id,
          chatType: chat.type,
          messageId: m.messageid,
          srcId: this.status.user?.id
        });
      }
    }
    this.events.emit('chatSelected');
  }

}
