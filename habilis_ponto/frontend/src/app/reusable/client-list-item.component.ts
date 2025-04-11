/**
 * Created by filipe on 17/09/16.
 */
import {ChangeDetectionStrategy, Component, Input, OnDestroy} from '@angular/core';
import {StatusService} from "../services/status.service";
import {SocketService} from "../services/socket.service";
import {EventsService} from 'app/services/events.service';
import {DomSanitizer} from "@angular/platform-browser";
import {texts} from "../app.texts";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {MatDialog} from "@angular/material/dialog";
import {ActionsService} from "../services/actions.service";

@Component({
  selector: 'app-client-list-item',
  templateUrl: 'client-list-item.component.html',
  styleUrls: ['client-list-item.component.scss'],
  animations: [
    trigger('chatVisibleState', [
      state('open', style({
        height: '70px'
      })),
      transition('void => open', [
        style({
          height: 0
        }),
        animate(120, style({
          height: '70px'
        }))
      ]),
      transition('open => void', [
        animate(120, style({
          height: 0
        }))
      ]),
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientListItemComponent implements OnDestroy {

  @Input() chat: any = {};
  @Input() msgsCount = 0;
  @Input() index = 0;
  @Input() selected = false;
  @Input() typing = false;
  @Input() showShortcut = false;
  @Input() now = 0;
  @Input() msgText = '';
  @Input() msgId = '';
  @Input() msgTime = '';
  @Input() resultType = 0;

  eventSubscription;

  texts = texts;
  showMarkerTooltip = false;

  constructor(public status: StatusService, private socket: SocketService, private events: EventsService,
              public sanitizer: DomSanitizer, private dialog: MatDialog, private actions: ActionsService) {

    this.eventSubscription = events.on('chatShortCut', (data) => {
      if (data === this.index + 1) {
        this.selectChat();
      }
    });

  }

  ngOnDestroy() {
    this.events.unsubscribe('chatShortCut', this.eventSubscription);
  }

  closeChat() {
    if (this.chat) {
      this.actions.endChat(this.chat);
    }
  }

  openTransferDialog() {
    if (this.chat) {
      this.actions.transferChat(this.chat);
    }
  }

  setAsNotReaded() {
    if (this.chat) {
      this.actions.setAsNotReaded(this.chat);
    }
  }

  sendToWaitingRoom() {
    if (this.chat) {
      this.actions.sendToWaitingRoom(this.chat);
    }
  }

  selectChat() {
    this.actions.selectChat(this.chat, this.resultType, this.msgId);
  }

}
