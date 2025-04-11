/**
 * Created by filipe on 18/09/16.
 */
import {LoadingService} from "../loadingModule/loading.service";
import {
    AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef,
    Component, ElementRef, EventEmitter,
    Input, OnChanges, OnDestroy, Output, QueryList, SimpleChanges, ViewChild, ViewChildren
} from "@angular/core";
import {StatusService} from "../services/status.service";
import {MatDialog} from "@angular/material/dialog";
import {BASE_URL} from "../app.consts";
import * as moment from 'moment';
import {MatSnackBar} from "@angular/material/snack-bar";
import {EventsService} from "../services/events.service";
import {Subscription} from "rxjs";
import {ConfirmAction} from "./confirmaction.decorator";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {SocketService} from "../services/socket.service";

@Component({
    selector: 'ca-messages',
    templateUrl: 'messages.component.html',
    styleUrls: ['./messages.component.scss'],
    animations: [
        trigger('uploadVisibility', [
            state('void', style({
                opacity: 0
            })),
            transition('void <=> visible', [
                animate('0.2s ease-in-out')
            ])
        ])
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesComponent implements AfterViewInit, OnDestroy, OnChanges {

    @Input() messages;
    @Input() oldMessages;
    @Input() uploadsCounter;
    @Input() uploads = [];
    @Input() newMsgs = 0;
    @Input() scrollNewMsgs = 0;
    @Input() internal = false;
    @Input() supervisorView = false;
    @Input() lastViewedId = '';
    @Input() showLoadingMessages = false;
    @Input() clientId = '';
    @Input() showReplyTo = false;
    @Input() chatType = 1;
    @Input() queueType = 0;
    @Input() queueId = 0;
    @Input() chatId = 0;
    @Input() chat;
    @Input() showLastSeenBanner = false;
    @Input() counter = 0;
    @Input() msgChangeCounter = 0;
    @Input() executingAutomation = false;
    @Output() scrollButtonHidden = new EventEmitter();
    @Output() requestMoreMsgs = new EventEmitter();
    @Output() buttonClicked = new EventEmitter<any>();
    @Output() replyTo = new EventEmitter<{ id: string, text: string, mine: boolean, quotedFile: boolean }>();
    @Output() delete = new EventEmitter<{ id: string }>();
    @Output() edit = new EventEmitter<any>();

    filteredMessages = [];
    filteredOldMessages = [];

    @ViewChild('messageBox') messageBox: ElementRef<HTMLDivElement>;
    @ViewChildren('allMessages') allMessages: QueryList<any>;

    baseUrl = BASE_URL;

    scrollMax = 15;
    resetScrollMaxTimer = null;
    oldChat;

    public videoMimes = ['video/mp4', 'video/mpg', 'video/mpeg', 'video/webm'];
    public imageMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    public audioMimes = ['audio/mpeg', 'audio/mp4', 'audio/ogg'];

    noTransition = false;
    transform = 0;
    math = Math;
    now = 0;
    nowTimer;
    scrolling = false;

    haveNew = false;

    private eventServiceKey;

    private messageChangeSubscription: Subscription;
    private requestMoreMsgsTime = moment().unix();

    messageRef;
    localMessageRef = {'fixed': {}};

    get messagesCount() {
        return this.messages.length + this.oldMessages.length;
    }

    constructor(private loading: LoadingService, public status: StatusService, public dialog: MatDialog,
                public alert: MatSnackBar, private events: EventsService, private changeDetector: ChangeDetectorRef,
                private socket: SocketService) {

        this.eventServiceKey = this.events.on('goToMessage', (data) => {
            this.goToQuoted(data);
        });

        loading.stop();
        this.timer();

    }

    updateLocalRef() {
        for (const m of this.messages) {
            this.localMessageRef['fixed'][m.messageid] = m;
        }
        for (const m of this.oldMessages) {
            this.localMessageRef['fixed'][m.messageid] = m;
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.hasOwnProperty('clientId')) {
            this.haveNew = !!this.newMsgs;
            this.scrollMax = this.haveNew ?
                (Math.max(this.getMessagePosition(this.lastViewedId) !== 15 ? this.getMessagePosition(this.lastViewedId) + 8 : 0, 15)) : 15;
            this.scrolling = true;
            this.filterMessages();
            this.changeDetector.detectChanges();
            if (this.oldChat) {
                this.oldChat.showLastSeenBanner = false;
            }
            this.oldChat = this.chat;
            this.scrollToLastSeen();
        }
        this.messageRef = this.supervisorView ? this.localMessageRef : (this.internal ? this.status.internalMessageRef : this.status.messageRef);
        if (this.supervisorView) {
            this.updateLocalRef();
        }
    }

    ngOnDestroy() {
        if (this.nowTimer) {
            clearTimeout(this.nowTimer);
        }
        this.messageChangeSubscription.unsubscribe();
        this.events.unsubscribe('goToMessage', this.eventServiceKey);
    }

    filterMessages() {
        this.filteredMessages = this.messages.filter((message) => {
            return message.direction !== 'system-info'
        });
        this.filteredOldMessages = this.oldMessages.filter((message) => {
            return message.direction !== 'system-info'
        });
        this.changeDetector.detectChanges();
    }

    timer() {

        this.now = moment().unix();

        this.nowTimer = setTimeout(() => {
            this.timer();
        }, 2000);

    }

    ngAfterViewInit() {

        if (this.messagesCount < 20) {
            this.requestMoreMsgsTime = Date.now();
            this.requestMoreMsgs.emit();
        }

        if (this.supervisorView) {
            this.updateLocalRef();
        }

        // Quando o scroll voltar para o ponto onde o botão de rolar para o início é escondido, emite o evento
        const element = this.messageBox.nativeElement;
        this.messageBox.nativeElement.onscroll = () => {
            if (element.scrollHeight - element.scrollTop - element.offsetHeight < 200) {
                this.scrollButtonHidden.emit(true);
            }
        };

        // Evento disparado sempre que uma nova mensagem é recebida
        this.messageChangeSubscription = this.allMessages.changes.subscribe(t => {
            // Aplica novamente o filtro, rola para o início da lista e captura os links
            this.filterMessages();
            this.scrollToNewMsg();
            this.captureLinks();
        });

    }

    captureLinks() {
        const links = document.getElementsByClassName('msg-link');
        for (let x = 0; x < links.length; x++) {
            const link = links[x];
            // @ts-ignore
            if (!link.onclick && link.innerText) {
                // @ts-ignore
                link.onclick = this.openLink.bind(this, link.innerText);
            }
        }
    }

    @ConfirmAction('dialog', {
        text: $localize`Ao clicar nesse link, você será direcionado para uma página externa ao sistema. Por favor, verifique se o link é seguro e vem de uma fonte confiável antes de prosseguir.`,
        title: $localize`Abrir link`,
        yesButtonText: $localize`Prosseguir`,
        yesButtonStyle: 'warning',
        noButtonText: $localize`Cancelar`
    })
    openLink(link) {
        window.open(link, '_blank');
    }

    copyText(text) {
        if (navigator.clipboard && text) {
            navigator.vibrate(10);
            navigator.clipboard.writeText(text);
            this.alert.open($localize`Texto copiado!`, $localize`Fechar`, {
                duration: 500
            });
        }
    }

    panStart(e, m) {
        if (['in', 'out'].includes(m.direction) && (!m.fk_file || m.hasPath) && this.status.isMobile) {
            m.noTransition = true;
        }
    }

    panMove(e, m) {
        if (['in', 'out'].includes(m.direction) && (!m.fk_file || m.hasPath) && this.status.isMobile) {
            if (e.deltaX > 0) {
                m.transform = e.deltaX;
            } else {
                m.transform = 0;
            }
            this.changeDetector.detectChanges();
        }
    }

    panEnd(e, m) {
        if (['in', 'out'].includes(m.direction) && (!m.fk_file || m.hasPath) && this.status.isMobile) {
            if (e.deltaX > 35) {
                this.replyTo.emit({
                    id: m.messageid,
                    text: m.text || m.file_name || (m.hasPath ? 'Arquivo' : ''),
                    mine: (m.direction === 'out'),
                    quotedFile: m.hasPath
                });
            }
            m.transform = 0;
            m.noTransition = false;
            this.changeDetector.detectChanges();
        }
    }

    async scrollToNewMsg() {

        // Pega a última mensagem se for enviada, rola para o início ou se forem mensagens vindas do carregamento inicial das mensagens
        let m;
        for (let x = this.messages.length - 1; x >= 0; x--) {
            if (this.messages[x].direction === 'out') {
                m = this.messages[x];
                break;
            }
            if (this.messages[x].direction === 'in' && !this.messages[x].readed) {
                m = this.messages[x];
                break;
            }
        }

        if ((m && m.direction === 'out') || this.chat?.messagesInitialLoading) {
            if (this.chat?.messagesInitialLoading) {
                setTimeout(() => {
                    this.chat.messagesInitialLoading = false;
                }, 1000);
                let counter = 0;
                // Aguarda até que a última mensagem seja renderizada
                while (!document.getElementById('last-message') && counter < 15) {
                    counter++;
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            return this.scrollToZero();
        }

        const element = this.messageBox.nativeElement;

        if (!element) {
            return;
        }

        // Ou se a mensagem foi recebida, e o usuário não está visualizando imagens do histórico
        if (m && m.direction === 'in') {
            if (element.scrollHeight - element.scrollTop - element.offsetHeight <= 200) {
                this.scrollToZero();
            }
        }

    }

    async scrollToLastSeen() {

        let counter = 0;

        // Aguarda até que a última mensagem seja renderizada
        while (!document.getElementById('last-message') && counter < 10) {
            counter++;
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        if (!this.showLastSeenBanner) {
            return this.scrollToZero();
        }

        const element = this.messageBox.nativeElement;

        if (!element) {
            return;
        }

        // Aguarda até que a última mensagem seja renderizada
        while (!document.getElementById('lastSeenMessageBanner') && counter < 10) {
            counter++;
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        const marker = document.getElementById('lastSeenMessageBanner');
        if (marker) {
            await this.smoothScroll(marker, {
                behavior: 'smooth', block: 'center', inline: "nearest"
            });
            this.scrolling = false;
            return this.changeDetector.detectChanges();
        }

        return this.scrollToZero();

    }

    getMessagePosition(messageId = '', chatId = this.chatId) {

        const quotedMsg = this.messageRef?.[chatId]?.[messageId];

        if (!quotedMsg) {
            return 15;
        }

        // Como o número de mensagens na tela em um determinado momento é limitado, é necessário ajustar o limite
        // antes de realizar o scroll
        const isOld = this.oldMessages.indexOf(quotedMsg) !== -1;

        // Verifica quantas mensagens precisam ser exibidas para que a mensagem citada fique visível
        return isOld ? this.messages.length + (this.oldMessages.length - this.oldMessages.indexOf(quotedMsg)) :
            this.messages.length - this.messages.indexOf(quotedMsg);

    }

    scrollToZero() {
        const element = this.messageBox.nativeElement;
        element.scrollTo({top: element.scrollHeight, behavior: this.newMsgs ? 'smooth' : 'auto'});
        setTimeout(() => {
            this.scrolling = false;
        }, this.supervisorView ? 1200 : 500);
    }

    getOldestId() {
        let oldestId = 0;
        for (const m of this.messages) {
            oldestId = m.id < oldestId || !oldestId ? m.id : oldestId;
        }
        for (const m of this.oldMessages) {
            oldestId = m.id < oldestId || !oldestId ? m.id : oldestId;
        }
        return oldestId;
    }

    async goToQuoted(data, block: ScrollLogicalPosition = 'center', behavior: ScrollBehavior = 'smooth') {

        const chatId = this.supervisorView ? 'fixed' : data.chatid;

        if (this.messageRef[chatId] && this.messageRef[chatId][data.id]) {

            const oldestId = this.getOldestId();
            if (this.messageRef[chatId][data.id].id < oldestId) {
                console.log('Mensagem não está no histórico, buscando...');
                if (this.status.selectedChat && !this.status.selectedChat.messagesLoading) {
                    this.status.selectedChat.messagesLoading = true;
                    await this.socket.emitAndWait('action', {
                        type: 'getMoreOldMessagesFromId',
                        messageId: this.messageRef[chatId][data.id].id,
                        chatId: chatId
                    });
                    setImmediate(() => {
                        if (this.status.selectedChat) {
                            this.status.selectedChat.messagesLoading = false;
                        }
                    });
                }
            }

            // Verifica quantas mensagens precisam ser exibidas para que a mensagem citada fique visível
            const position = this.getMessagePosition(data.id, chatId);

            if (this.scrollMax < position) {
                this.scrollMax = position + 8;
                this.scrolling = true;
                this.changeDetector.markForCheck();
            }

            // Espera o scrollmax surtir efeito e rola para a mensagem
            setTimeout(async () => {
                await this.smoothScroll(document.getElementById(data.id), {
                    behavior, block, inline: "nearest"
                });
                this.messageRef[chatId][data.id].blink = true;
                this.changeDetector.markForCheck();
            }, 200);

            setTimeout(async () => {
                this.scrolling = false;
            }, 600);

            setTimeout(() => {
                delete this.messageRef[chatId][data.id].blink;
                this.changeDetector.markForCheck();
            }, 2200);

        }

    }

    smoothScroll(elem, options): Promise<void> {
        return new Promise((resolve) => {
            if (!(elem instanceof Element)) {
                return resolve();
            }
            let same = 0; // a counter
            let lastPos = null; // last known Y position
            // pass the user defined options along with our default
            const scrollOptions = Object.assign({behavior: 'smooth'}, options);

            // let's begin
            elem.scrollIntoView(scrollOptions);
            requestAnimationFrame(check);

            // this function will be called every painting frame
            // for the duration of the smooth scroll operation
            function check() {
                // check our current position
                const newPos = elem.getBoundingClientRect().top;

                if (newPos === lastPos) { // same as previous
                    if (same++ > 2) { // if it's more than two frames
                        /* @todo: verify it succeeded
                         * if(isAtCorrectPosition(elem, options) {
                         *   resolve();
                         * } else {
                         *   reject();
                         * }
                         * return;
                         */
                        return resolve(); // we've come to an halt
                    }
                } else {
                    same = 0; // reset our counter
                    lastPos = newPos; // remember our current position
                }
                // check again next painting frame
                requestAnimationFrame(check);
            }
        });
    }

    getMoreMsgs(event) {

        if (this.resetScrollMaxTimer) {
            clearTimeout(this.resetScrollMaxTimer);
        }
        if (this.scrolling) {
            return;
        }
        if (this.scrollMax < this.messagesCount) {
            if (event.target.scrollTop < 200) {
                if (this.scrollMax + 40 >= this.messagesCount && this.requestMoreMsgsTime + 100 < Date.now()) {
                    this.requestMoreMsgsTime = Date.now();
                    this.requestMoreMsgs.emit();
                }
                this.scrollMax = this.scrollMax + 10 >= this.messagesCount ? this.messagesCount : this.scrollMax + 10;
            }
        } else {
            if (event.target.scrollTop < 200 && this.requestMoreMsgsTime + 100 < Date.now()) {
                this.requestMoreMsgsTime = Date.now();
                this.requestMoreMsgs.emit();
            }
        }
        if (this.scrollMax > 15 && event.target.scrollTop > event.target.scrollHeight - event.target.offsetHeight - 150 &&
            !this.scrolling) {
            this.resetScrollMaxTimer = setTimeout(() => {
                this.resetScrollMaxTimer = null;
                this.scrollMax = 15;
                this.changeDetector.detectChanges();
            }, 1000);
        }
    }

}
