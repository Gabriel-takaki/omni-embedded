/**
 * Created by filipe on 18/09/16.
 */
import {AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild} from "@angular/core";
import {StatusService} from "../services/status.service";
import {SocketService} from "../services/socket.service";
import {BASE_URL} from "../app.consts";
import {HttpClient} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {animate, state, style, transition, trigger} from "@angular/animations";
import * as _ from "lodash";
import {EventsService} from "../services/events.service";

@Component({
    selector: 'ca-message-search',
    templateUrl: 'message-search.component.html',
    styleUrls: ['./message-search.component.scss'],
    animations: [
        trigger('visibilityState', [
            state('void', style({
                opacity: 0
            })),
            state('transparent', style({
                opacity: 0.25
            })),
            transition('void <=> visible', [
                animate('0.2s ease-in-out'),
            ]),
            transition('transparent => void', [
                animate('0.2s ease-in-out'),
            ]),
            transition('transparent <=> visible', [
                animate('0.2s ease-in-out'),
            ])
        ])
    ]
})
export class MessageSearchComponent implements AfterViewInit, OnChanges {

    @Input() chat;
    @ViewChild('searchField') searchField: ElementRef<HTMLInputElement>;

    baseUrl = BASE_URL;
    visibilityState = 'visible';
    mouseOver = false;
    inputFocus = true;
    loading = false;

    constructor(public status: StatusService, private socket: SocketService, private events: EventsService,
                private snackbar: MatSnackBar, private http: HttpClient) {

    }

    ngAfterViewInit() {
        this.focusTimer();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.chat) {
            this.chat.searchResult = this.chat.searchResult || [];
        }
    }

    hide() {
        if (this.chat && this.chat.showSearch) {
            this.chat.showSearch = false;
        }
    }

    search() {
        this.loading = true;
        this.chat.searchResult = [];
        this.http.post(`${BASE_URL}/api/searchMessage`, {
            chatId: this.chat.id,
            text: this.chat.searchText
        }).subscribe(async (messages: any) => {
            let min = 0;
            for (const message of messages) {
                min = !min || message.id < min ? message.id : min;
            }
            this.chat.searchResult = messages;
            const oldestId = this.getOldestId();
            if (min < oldestId && this.status.selectedChat && !this.status.selectedChat.messagesLoading) {
                this.status.selectedChat.messagesLoading = true;
                await this.socket.emitAndWait('action', {
                    type: 'getMoreOldMessagesFromId',
                    messageId: min,
                    chatId: this.status.selectedChat.id
                });
                setImmediate(() => {
                    if (this.status.selectedChat) {
                        this.status.selectedChat.messagesLoading = false;
                    }
                });
            }
            this.loading = false;
        }, err => {
            this.loading = false;
            this.snackbar.open('Erro ao buscar mensagens', 'OK', {duration: 3000});
        });

    }

    goToMessage(message) {
        this.events.emit('goToMessage', {id: message.mid, chatid: this.chat.id});
    }

    getOldestId() {
        let oldestId = 0;
        for (const m of this.chat.messages) {
            oldestId = m.id < oldestId || !oldestId ? m.id : oldestId;
        }
        for (const m of this.chat.oldMessages) {
            oldestId = m.id < oldestId || !oldestId ? m.id : oldestId;
        }
        return oldestId;
    }

    focusTimer() {
        setTimeout(() => {
            if (this.searchField) {
                this.searchField.nativeElement.focus();
            } else {
                this.focusTimer();
            }
        }, 50)
    }

}
