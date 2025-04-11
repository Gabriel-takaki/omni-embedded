/**
 * Created by filipe on 18/09/16.
 */
import {LoadingService} from "../loadingModule/loading.service";
import {
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild
} from "@angular/core";
import {StatusService} from "../services/status.service";
import {BASE_URL} from "../app.consts";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DomSanitizer} from "@angular/platform-browser";
import {MatDialog} from "@angular/material/dialog";
import {OpenFileComponent} from "./open-file.component";
import {texts} from '../app.texts';
import {ConfirmAction} from "./confirmaction.decorator";
import {NotificationsService} from "angular2-notifications";
import {HttpClient} from "@angular/common/http";
import {MessageShareComponent} from "./message-share.component";
import {MatMenuTrigger} from "@angular/material/menu";
import {MessageDetailsComponent} from "./message-details.component";
import {ActionsService} from "../services/actions.service";
import {AgentAutomation} from "../definitions";
import {SocketService} from "../services/socket.service";
import {YesNoComponent} from "./yes-no.component";
import {UtilitiesService} from "../services/utilities.service";

@Component({
    selector: 'ca-message',
    templateUrl: 'message.component.html',
    styleUrls: ['./message.component.scss'],
    animations: [
        trigger('visibilityChanged', [
            state('shown', style({
                "opacity": 1
            })),
            state('hidden', style({
                "opacity": 0
            })),
            transition('* => *',
                animate('0.1s'))
        ]),

        trigger('cardShown', [
            state('shown', style({
                "height": '272px'
            })),
            state('hidden', style({
                "height": '24px'
            })),
            transition('* => *',
                animate('0.1s'))
        ])
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageComponent implements OnChanges {

    @Input() m;
    @Input() messageChangeCounter = 0;
    @Input() highlight = '';
    @Input() idPrefix = '';
    @Input() showReplyTo = false;
    @Input() blink = false;
    @Input() chatType = 1;
    @Input() queueId = 0;
    @Input() queueType = 0;
    @Input() now = 0;
    @Input() disabledDelete = false;
    @Input() serverRcvd = false;
    @Input() clientRcvd = false;
    @Input() readed = false;
    @Input() deleted = false;
    @Input() internal = false;
    @Input() supervisorView = false; // Visão do supervisor
    @Input() oldMessage = false; // É uma mensagem de um atendimento anterior
    @Input() chat;
    @Output() toQuoted = new EventEmitter<{ id: string, chatid: string }>();
    @Output() replyTo = new EventEmitter<{
        id: string,
        text: string,
        mine: boolean,
        quotedFile: boolean,
        comment: boolean,
        previewUrl: string
    }>();
    @Output() buttonClicked = new EventEmitter<any>();
    @Output() delete = new EventEmitter<{ id: string }>();
    @Output() edit = new EventEmitter<any>();
    @ViewChild('hiddenButton', {read: MatMenuTrigger, static: false}) messageAreaMenu: MatMenuTrigger;

    public audioMsg = false;
    public textMsg = false;
    public imageMsg = false;
    public locationMsg = false;
    public videoMsg = false;
    public pdfMsg = false;
    public showActions = false;
    public msgActions: AgentAutomation[] = [];

    public showActionsMenu = false;

    executingAutomation = false;
    showCard = false;
    canCloseMenu = false;

    messageRef = this.internal ? this.status.internalMessageRef : this.status.messageRef;

    colors = ['fg-success', 'fg-info', 'fg-danger', 'fg-warning', 'fg-purple', 'fg-orange', 'fg-azure', 'fg-blue', 'fg-dark-blue', 'fg-dark-green'];

    getComputedStyle = window.getComputedStyle;
    texts = texts;

    baseUrl = BASE_URL;
    visibility = 'hidden';

    constructor(private notifications: NotificationsService, private http: HttpClient, private dialog: MatDialog,
                private loading: LoadingService, public status: StatusService, private snack: MatSnackBar,
                private sanitizer: DomSanitizer, private matDialog: MatDialog, private actions: ActionsService,
                private socket: SocketService, private changeDetector: ChangeDetectorRef,
                public utils: UtilitiesService) {

        loading.stop();

        if (this.m && this.m.locationThumbnail) {
            sanitizer.bypassSecurityTrustResourceUrl(this.m.locationThumbnail);
        }

    }

    async ngOnChanges(changes: SimpleChanges) {
        this.showActions = false;
        this.msgActions = [];
        this.textMsg = !!this.m?.text;
        this.locationMsg = !!this.m?.latitude || !!this.m?.longitude;
        if (this.m?.file_mimetype && this.m?.fk_file) {
            this.audioMsg = this.status.audioMimes.includes(this.m?.file_mimetype);
            this.imageMsg = this.status.imageMimes.includes(this.m?.file_mimetype);
            this.videoMsg = this.status.videoMimes.includes(this.m?.file_mimetype);
            this.pdfMsg = this.status.pdfMimes.includes(this.m?.file_mimetype);
        }
        if (this.textMsg && this.status.textMsgsAutomations.length) {
            this.showActions = true;
            this.msgActions = this.msgActions.concat(this.status.textMsgsAutomations);
        }
        if (this.locationMsg && this.status.locationMsgsAutomations.length) {
            this.showActions = true;
            this.msgActions = this.msgActions.concat(this.status.locationMsgsAutomations);
        }
        if (this.audioMsg && this.status.audioMsgsAutomations.length) {
            this.showActions = true;
            this.msgActions = this.msgActions.concat(this.status.audioMsgsAutomations);
        }
        if (this.imageMsg && this.status.imageMsgsAutomations.length) {
            this.showActions = true;
            this.msgActions = this.msgActions.concat(this.status.imageMsgsAutomations);
        }
        if (this.videoMsg && this.status.videoMsgsAutomations.length) {
            this.showActions = true;
            this.msgActions = this.msgActions.concat(this.status.videoMsgsAutomations);
        }
        if (this.pdfMsg && this.status.pdfMsgsAutomations.length) {
            this.showActions = true;
            this.msgActions = this.msgActions.concat(this.status.pdfMsgsAutomations);
        }
        if (!this.internal && this.m?.quotedid && !this.status.messageRef[this.m.chatId]?.[this.m.quotedid]) {
            // A mensagem está referênciando uma outra mensagem, que ainda não foi carregada localmente
            // solicita a mensagem ao servidor
            await this.socket.emitAndWait('action', {
                type: 'getMessageByMessageId',
                id: this.m.quotedid,
                chatId: this.m.chatId
            });
            this.changeDetector.markForCheck();
        }
        if (this.internal && this.m?.quotedid && !this.status.internalMessageRef[this.m.chatId]?.[this.m.quotedid]) {
            // A mensagem está referênciando uma outra mensagem, que ainda não foi carregada localmente
            // solicita a mensagem ao servidor
            await this.socket.emitAndWait('action', {
                type: 'getInternalMessageByMessageId',
                id: this.m.quotedid,
                chatId: this.m.chatId
            });
            this.changeDetector.markForCheck();
        }
    }

    getMessage() {
        return this.internal ? this.m : this.status.messageRef[this.m.chatId]
    }

    openContact(id) {
    }

    openMenuMessageArea() {
        if (this.status.isMobile) {
            navigator.vibrate(20);
            this.canCloseMenu = false;
            this.messageAreaMenu.openMenu();
            setTimeout(() => {
                this.canCloseMenu = true;
            }, 300);
        }
    }

    closeMenu() {
        if (this.canCloseMenu) {
            this.canCloseMenu = false;
            this.messageAreaMenu.closeMenu();
        }
    }

    goToQuoted(id, chatid) {
        this.toQuoted.emit({id, chatid});
    }

    downloadFile(id, auth) {
        window.open(this.baseUrl + `/${auth ? 'static' : 'api'}/downloadMedia?id=${id}&download=true&auth=${auth}`, '_blank');
    }

    openLink(url) {
        this.utils.openLink(url);
    }

    replyMsg(id, text, mine, hasPath, comment = false, previewUrl = '') {
        this.replyTo.emit({id, text, mine, quotedFile: hasPath, comment, previewUrl});
    }

    shareMsg() {
        this.matDialog.open(MessageShareComponent, {data: {message: this.m}});
    }

    @ConfirmAction('matDialog', {
        text: $localize`Tem certeza que deseja excluir essa mensagem?`,
        title: $localize`Excluir`,
        yesButtonText: $localize`Excluir`,
        yesButtonStyle: 'danger'
    })
    deleteMsg(id) {
        this.delete.emit({id});
    }

    editMsg() {
        this.edit.emit(this.m);
    }

    @ConfirmAction('dialog', {
        text: $localize`Tem certeza que deseja abrir um novo atendimento com este cliente?`,
        title: $localize`Abrir novo atendimento`,
        yesButtonText: $localize`Abrir`,
        yesButtonStyle: 'success'
    })
    async openNewChat(m) {
        if (m && this.queueId) {
            const ret = await this.actions.openNewChatByNumber(this.queueId, m.participant?.replace(/\ /g, '').replace(/\+/g, ''), 'DNV');
            if (ret.result) {
                this.notifications.success($localize`Sucesso`, $localize`Solicitação enviada com sucesso.`);
            } else {
                console.log(ret.error);
                this.notifications.error($localize`Erro`, ret.error.message);
            }
        }
    }

    injectMessage(e, msg) {
        const iframe = e?.target;
        const doc = iframe?.contentWindow.document;
        const div = doc?.createElement('div');
        if (div) {
            div.innerHTML = `<b>${msg.subject}:</b><br/><br/>${msg.text}`;
            doc.getElementsByTagName('body')[0].appendChild(div);
        }
    }

    copyToClipboard(text) {
        this.utils.copyToClipboard(text);
    }

    showMessageInfo(message) {
        // console.log(message, this.status.chatsObj[message.chatId]);
        this.dialog.open(MessageDetailsComponent, {
            data: {
                message: message,
                queueId: this.status.chatsObj[message.chatId]?.queueId,
                clientId: this.status.chatsObj[message.chatId]?.clientId
            }
        });
    }

    executeMessageAction(action: AgentAutomation) {

        const diag = this.dialog.open(YesNoComponent, {
            data: {
                text: $localize`Deseja executar a automação "${action.title}"?`,
                title: $localize`Executar automação`,
                yesButtonText: $localize`Executar`,
                yesButtonStyle: 'success',
                noButtonText: $localize`Cancelar`
            }
        });

        const diagSub = diag.afterClosed().subscribe(async (r) => {
            diagSub.unsubscribe();
            if (r) {
                this.executingAutomation = true;
                this.changeDetector.detectChanges();
                await this.socket.emitAndWait('action', {
                    type: 'executeMessageAutomation',
                    automationId: action.id,
                    chatId: this.chat.id,
                    messageId: this.m.messageid,
                    queueId: this.queueId
                }, 20000);
                this.executingAutomation = false;
                this.changeDetector.detectChanges();
            }
        });

    }

    openFile(id, auth, cdn = '', mime = '') {
        this.matDialog.open(OpenFileComponent, {data: {id, auth, cdn, mime, chat: this.chat}});
    }

    sendButtonResponse(button) {
        this.buttonClicked.emit(button);
    }

    openSelectionList(list) {

    }

}
