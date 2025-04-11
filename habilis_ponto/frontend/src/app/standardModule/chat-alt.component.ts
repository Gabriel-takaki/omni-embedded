/**
 * Created by filipe on 18/09/16.
 */
import {LoadingService} from "../loadingModule/loading.service";
import {Component, Input, OnChanges, OnDestroy, SimpleChanges} from "@angular/core";
import {StatusService} from "../services/status.service";
import {SocketService} from "../services/socket.service";
import {DomSanitizer} from "@angular/platform-browser";
import {MatDialog} from "@angular/material/dialog";
import {BASE_URL} from "../app.consts";
import {SendMediaComponent} from "./send-media.component";
import {CepQueryComponent} from "./cep-query.component";
import * as moment from 'moment';
import {texts} from '../app.texts';
import {Router} from "@angular/router";
import {UtilitiesService} from "../services/utilities.service";

@Component({
  selector: 'ca-chat-alt',
  templateUrl: 'chat-alt.component.html',
  styleUrls: ['./chat-alt.component.scss']
})
export class ChatAltComponent implements OnChanges, OnDestroy {

  @Input() chat;
  baseUrl = BASE_URL;
  substitutionTable = {};
  replyTo = {id: '', text: ''};
  contact;
  contacts = [];

  texts = texts;

  now = moment().unix();
  nowTimer;

  constructor(private loading: LoadingService, public status: StatusService, private socket: SocketService,
              public sanitizer: DomSanitizer, public dialog: MatDialog,
              private router: Router, private util: UtilitiesService) {

    loading.stop();

    this.substitutionTable = util.generateSubstitutionTable();

    this.timer();

  }

  ngOnDestroy() {
    if (this.nowTimer) {
      clearTimeout(this.nowTimer);
    }
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes.hasOwnProperty('chat') && changes.chat.previousValue !== changes.chat.currentValue) {
      this.replyTo = {id: '', text: ''};
    }
    if (changes.hasOwnProperty('chat')) {
      // console.log(this.chat);
    }

  }

  back() {
    this.status.internalSelectedChat = null;
  }

  timer() {
    this.nowTimer = setTimeout(() => {
      this.timer();
      this.now = moment().unix();
    }, 1000);
  }

  requestMoreMsgs() {
    if (this.chat.hasMoreOld || this.chat.type === 2 || this.chat.type === 3) {
      this.socket.getMoreInternalMsgs(this.status.internalSelectedChat);
    }
  }

  sendMsg(msg) {
    this.socket.socket.emit('action', {
      type: 'sendInternalMessage',
      chatId: this.status.internalSelectedChat.id,
      queueId: this.status.internalSelectedChat.queueId,
      fk_file: msg.fk_file,
      file_mimetype: '',
      text: msg.text,
      quotedText: msg.quotedText,
      quotedId: msg.quotedId,
      quotedMine: msg.quotedMine,
      chatType: this.status.internalSelectedChat.type
    });
  }

  sendAudio(audio) {
    this.socket.socket.emit('action', {
      type: 'sendInternalFile',
      chatId: this.status.internalSelectedChat.id,
      queueId: this.status.internalSelectedChat.queueId,
      filename: 'audiomsg',
      mimetype: 'audio/ogg; codecs=opus',
      duration: audio.duration,
      data: audio.data,
      chatType: this.status.internalSelectedChat.type
    });
  }

  openFileDialog(type, file = null) {
    if (this.chat) {
      this.dialog.open(SendMediaComponent, {
        data: {
          chat: this.status.internalSelectedChat,
          type,
          chatId: this.status.internalSelectedChat.id,
          queueId: this.status.internalSelectedChat.queueId,
          file,
          internal: true,
          chatType: this.status.internalSelectedChat.type
        }
      });
    }
  }

  resetScrollNewMsgCount() {
    if (this.chat) {
      this.chat.scrollNewMsgCount = 0;
    }
  }

  openCEPDialog() {
    this.dialog.open(CepQueryComponent);
  }

  onPaste(e: ClipboardEvent) {
    const items = e.clipboardData.items;
    let blob = null;
    let type = '';

    // @ts-ignore
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        blob = item.getAsFile();
        type = 'image';
      } else if (item.type.indexOf('video') === 0) {
        blob = item.getAsFile();
        type = 'video';
      }
    }

    // load image if there is a pasted image
    if (blob !== null) {
      this.openFileDialog(type, blob);
    }
  }

  onDrop(e: DragEvent) {
    const items = e.dataTransfer.items;
    e.preventDefault();
    let blob = null;
    let type = '';

    // @ts-ignore
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        blob = item.getAsFile();
        type = 'image';
      } else if (item.type.indexOf('video') === 0) {
        blob = item.getAsFile();
        type = 'video';
      } else if (item.type.indexOf('application') === 0 || item.type.indexOf('text') === 0) {
        blob = item.getAsFile();
        type = 'document';
      }
    }

    // load image if there is a pasted image
    if (blob !== null) {
      this.openFileDialog(type, blob);
    }

  }

  preventDefault(e: MouseEvent) {
    e.preventDefault();
  }

}
