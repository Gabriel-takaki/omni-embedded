import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {AuthService} from './services/auth.service';
import {StatusService} from "./services/status.service";
import {SocketService} from "./services/socket.service";
import {NotificationsService} from "angular2-notifications";
import {HttpClient} from "@angular/common/http";
import {BASE_URL} from "./app.consts";
import {AllowIn, ShortcutInput} from "ng-keyboard-shortcuts";
import {EventsService} from "./services/events.service";
import {ConfirmAction} from "./reusable/confirmaction.decorator";
import {MatDialog} from "@angular/material/dialog";
import {ActionsService} from "./services/actions.service";
import {SwPush} from "@angular/service-worker";
import {YesNoComponent} from "./reusable/yes-no.component";
import {MonitorService} from "./services/monitor.service";
import {Router} from "@angular/router";
import {StyleService} from "./services/style.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {AudioService} from "./services/audio.service";
import {ChangePassComponent} from "./configurationModule/changepass.component";
import * as moment from "moment";
import {ScreenRecorderService} from "./services/screen-recorder.service";

export interface Color {
    name: string;
    hex: string;
    darkContrast: boolean;
}

@Component({
    templateUrl: 'base.component.html',
    styleUrls: ['base.component.scss'],
    animations: [
        trigger('openContentState', [
            state('void', style({
                opacity: 0,
                top: '140px'
            })),
            transition('void <=> opened', [
                animate('0.2s ease-in-out')
            ])
        ]),
        trigger('callVisibilityState', [
            state('void', style({
                opacity: 0
            })),
            transition('void => visible', [
                animate('0.2s ease-in-out')
            ])
        ])
    ]
})
export class BaseComponent implements AfterViewInit, OnDestroy {

    public queuesMinSize;
    public exten = '';
    shortcuts: ShortcutInput[] = [];
    public baseUrl = BASE_URL;
    private controlDownTimer;

    readonly VAPID_PUBLIC_KEY = "BCOUzjixjTOjBqGF_Fr8nsxwLpkfjh5OOvSOoGjgO-X3LGNF9mYkILcHjmQZiVrQ-vcOuZjz2ptSX8d9vc7T1ZU";

    @ViewChild('msgReceived') msgReceivedAudio: ElementRef<HTMLAudioElement>;
    @ViewChild('msgNotification') msgNotificationAudio: ElementRef<HTMLAudioElement>;
    @ViewChild('ringingAlert') ringingAlert: ElementRef<HTMLAudioElement>;
    @ViewChild('extenInput') extenInput: ElementRef<HTMLInputElement>;

    constructor(public autenticador: AuthService, public status: StatusService, public notifications: NotificationsService,
                public socket: SocketService, private http: HttpClient, private events: EventsService, private action: ActionsService,
                private dialog: MatDialog, private swPush: SwPush, public monitor: MonitorService, private elementRef: ElementRef,
                private router: Router, private styleService: StyleService,
                public screen: ScreenRecorderService, private audio: AudioService) {

        if (this.status.isEmbedded) {
            const chatId = sessionStorage.getItem(this.status.user.id + '-selectedChat');
            if (!isNaN(Number(chatId))) {
                this.status.savedSelectedChatId = Number(chatId);
                this.status.savedSelectedChatIdTime = moment().unix();
            }
            const savedRoute = sessionStorage.getItem(this.status.user.id + '-savedRoute');
            if (savedRoute && typeof savedRoute === 'string') {
                this.router.navigate([savedRoute]);
            }
        }

        styleService.initialize();

        this.queuesMinSize = window.innerHeight - 55 + 'px';

        if (!status.disableTelephony && status.user.type === 2 && !status.mineExtenNumber) {
            status.getExten = true;
        }

        status.loadTags();

        if (!status.headerColor) {
            this.action.getStyle();
        }

        if (status.isMobile && !this.status.pushSub) {
            this.subscribeToNotifications();
        }

        router.events.subscribe((r: any) => {

            if (r?.type === 1) {

                if (this.status.isEmbedded) {
                    sessionStorage.setItem(this.status.user.id + '-savedRoute', r.urlAfterRedirects);
                }

                switch (r.urlAfterRedirects) {

                    case '/base/clockindashboard':
                        status.selectedMenu = 'clockindashboard';
                        status.selectedMenuText = $localize`Painel de pontos`;
                        break;

                    case '/base/reports/clockinreports':
                        status.selectedMenu = 'clockindashboard';
                        status.selectedMenuText = $localize`Relatórios de pontos`;
                        break;

                    case '/base/agentdashboard':
                    case '/base/agenttasksdashboard':
                        status.selectedMenu = 'agentdashboard';
                        status.selectedMenuText = this.getAgentPanelText(r.urlAfterRedirects);
                        break;

                    case '/base/mobileinternalchat':
                    case '/base/internalchat':
                        status.selectedMenu = 'internalchat';
                        status.selectedMenuText = $localize`Chat interno`;
                        break;

                    case '/base/mobileagentchat':
                    case '/base/agentchat':
                        status.selectedMenu = 'agentchat';
                        status.selectedMenuText = $localize`Chat`;
                        break;

                    case '/base/reports/chatshistoryagent':
                        status.selectedMenu = 'chatshistoryagent';
                        status.selectedMenuText = $localize`Histórico de chats`;
                        break;

                    case '/base/reports/addressbook':
                        status.selectedMenu = 'addressbook';
                        status.selectedMenuText = $localize`Contatos`;
                        break;

                    case '/base/addressbookmobile':
                        status.selectedMenu = 'addressbookmobile';
                        status.selectedMenuText = $localize`Contatos`;
                        break;

                    

                    case '/base/config/queueslist':
                    case '/base/config/campaignslist':
                    case '/base/config/visualgrouplist':
                    case '/base/config/auditlog':
                    case '/base/config/userslist':
                    case '/base/config/clockinlist':
                    case '/base/config/reasonslist':
                    case '/base/config/uralist':
                    case '/base/config/triggerslist':
                    case '/base/config/predefinedtextslist':
                    case '/base/config/galerylist':
                    case '/base/config/tagslist':
                    case '/base/config/newslist':
                    case '/base/config/chattagslist':
                    case '/base/config/faqslist':
                    case '/base/config/internalgroupslist':
                    case '/base/config/contactgroupslist':
                    case '/base/config/generalconfig':
                    case '/base/config/ivreditor':
                    case '/base/config/templatelist':
                    case '/base/config/contactextrafieldlist':
                    case '/base/config/keywordstriggerslist':
                    case '/base/config/contactautomationlist':
                    case '/base/config/webhookcapturelist':
                    case '/base/config/customformslist':
                    case '/base/config/informationcardslist':
                    case '/base/config/originslist':
                    case '/base/config/actionslist':
                    case '/base/config/cataloglist':
                    case '/base/config/assistantslist':
                        status.selectedMenu = 'config';
                        status.selectedMenuText = this.getConfigText(r.urlAfterRedirects);
                        break;

                    case '/base/reports/agentstablereport':
                    case '/base/reports/clockinreports':
                        status.selectedMenu = 'reports';
                        status.selectedMenuText = this.getReportText(r.urlAfterRedirects);
                        break;

                }
            }

        });

        document.addEventListener("visibilitychange", (vis) => {
            if (document.visibilityState === 'visible') {
                status.isVisible = true;
                status.showNewMessageTitleAlert = false;
                status.showNewChatTitleAlert = false;
            } else {
                status.isVisible = false;
            }
        });

        if (status.user?.changepass) {
            this.dialog.open(ChangePassComponent, {
                closeOnNavigation: false,
                disableClose: true,
                data: {
                    disableCancelButton: true,
                    username: status.user.userName,
                    fullname: status.user.fullName,
                    id: status.user.id
                }
            });
        }

    }

    logoutAllOtherDevices() {
        const diag = this.dialog.open(YesNoComponent, {
            data: {
                text: $localize`Deseja deslogar de todas as outras sessões que não sejam essa?`,
                title: $localize`Deslogar de todas as sessões`,
                yesButtonText: $localize`Deslogar`,
                yesButtonStyle: 'warning'
            }
        });
        const diagSub = diag.afterClosed().subscribe((r: boolean) => {
            if (r) {
                this.socket.socket.emit('action', {type: 'logoutAllOtherDevices'});
            }
        });
    }

    showNotifications(e = null) {
        this.status.showNotifications = true;
        this.status.notificationsDialogOffset = e?.offsetLeft || 0;
    }

    markNotificationAsReaded(id, event) {
        event.stopPropagation();
        const diag = this.dialog.open(YesNoComponent, {
            data: {
                text: $localize`Deseja marcar essa notificação como lida?`,
                title: $localize`Marcar como lida`,
                yesButtonText: $localize`Marcar`,
                noButtonText: $localize`Cancelar`,
                yesButtonStyle: 'success'
            }
        });
        const diagSub = diag.afterClosed().subscribe((r: boolean) => {
            if (r) {
                this.socket.socket.emit('action', {type: 'readNotification', id: id});
            }
        });
    }

    markAllNotificationsAsReaded(event) {
        event.stopPropagation();
        const diag = this.dialog.open(YesNoComponent, {
            data: {
                text: $localize`Deseja marcar todas as notificações como lidas?`,
                title: $localize`Marcar como lida`,
                yesButtonText: $localize`Marcar`,
                noButtonText: $localize`Cancelar`,
                yesButtonStyle: 'success'
            }
        });
        const diagSub = diag.afterClosed().subscribe((r: boolean) => {
            for (const n of this.status.notifications) {
                this.socket.socket.emit('action', {type: 'readNotification', id: n.id});
            }
        });
    }

    getAgentPanelText(url): string {

        switch (url) {

            case '/base/agentdashboard':
                return $localize`Painel de filas`;

            case '/base/agenttasksdashboard':
                return $localize`Minhas tarefas`;

        }

    }

    getConfigText(url): string {

        switch (url) {

            case '/base/config/assistantslist':
                return $localize`Assistentes`;

            case '/base/config/campaignslist':
                return $localize`Campanhas`;

            case '/base/config/cataloglist':
                return $localize`Catálogo de Produtos`;

            case '/base/config/visualgrouplist':
                return $localize`Grupos de Visualização`;

            case '/base/config/actionslist':
                return $localize`Ações personalizadas`;

            case '/base/config/auditlog':
                return $localize`Log de Auditoria`;

            case '/base/config/queueslist':
                return $localize`Filas`;

            case '/base/config/webhookcapturelist':
                return $localize`Captura de webhook`;

            case '/base/config/contactextrafieldlist':
                return $localize`Campos de contato personalizados`;

            case '/base/config/contactautomationlist':
                return $localize`Automação`;

            case '/base/config/templatelist':
                return $localize`Templates WA Cloud`;

            case '/base/config/userslist':
                return $localize`Usuários`;

            case '/base/config/reasonslist':
                return $localize`Pausas`;

            case '/base/config/ivreditor':
            case '/base/config/uralist':
                return $localize`Fluxo de Automação e URA`;

            case '/base/config/triggerslist':
                return $localize`Gatilhos de atendimentos`;

            case '/base/config/predefinedtextslist':
                return $localize`Mensagens pré definidas`;

            case '/base/config/galerylist':
                return $localize`Galeria de arquivos`;

            case '/base/config/tagslist':
                return $localize`Etiquetas de Contato, FAQ e Tarefas`;

            case '/base/config/faqslist':
                return $localize`FAQ`;

            case '/base/config/newslist':
                return $localize`Novidades`;

            case '/base/config/chattagslist':
                return $localize`Etiquetas de Chat`;

            case '/base/config/internalgroupslist':
                return $localize`Grupos de Chat Interno`;

            case '/base/config/contactgroupslist':
                return $localize`Grupos de acesso`;

            case '/base/config/keywordstriggerslist':
                return $localize`Gatilhos de palavras chaves`;

            case '/base/config/generalconfig':
                return $localize`Geral`;

            case '/base/config/customformslist':
                return $localize`Formulários personalizados`;

            case '/base/config/informationcardslist':
                return $localize`Cartões de informação`;

            case '/base/config/originslist':
                return $localize`Origens de oportunidades`;

        }
    }

    getReportText(url): string {
        switch (url) {
            case '/base/reports/agentstablereport':
                return $localize`Agentes`;

            case '/base/reports/queuereport':
                return $localize`Filas`;

            case '/base/reports/timesreport':
                return $localize`Pausas`;

            case '/base/reports/cdrreport':
                return $localize`CDR e Gravações`;

            case '/base/reports/chatshistory':
                return $localize`Histórico de Chats`;

            case '/base/reports/reopenreport':
                return $localize`Reaberturas agendadas`;

            case '/base/reports/opportunityhistory':
                return $localize`Histórico de Oportunidades`;

            case '/base/reports/evaluationsreport':
                return $localize`Avaliações`;

            case '/base/reports/abandonedreport':
                return $localize`Abandonadas`;
        }
    }

    getKpiText(url): string {
        switch (url) {
            case '/base/reports/kpidashboard':
                return $localize`Atendimentos`;

            case '/base/reports/crmdashboard':
                return $localize`CRM Geral`;

            case '/base/reports/crmdashboardperuser':
                return $localize`CRM por usuário`;

            case '/base/reports/monitordashboard':
                return $localize`Monitoramento`;

            case '/base/reports/tasksdashboard':
                return $localize`Tarefas`;

        }
    }

    getInstancesText(url): string {
        switch (url) {
            case '/base/partner/instancespanel':
                return $localize`Instâncias`;

            case '/base/partner/billingpanel':
                return $localize`Faturamento`;
        }
    }

    ngOnDestroy() {
        this.monitor.clearState();
    }

    subscribeToNotifications() {

        this.swPush.requestSubscription({
            serverPublicKey: this.VAPID_PUBLIC_KEY
        }).then(sub => {
            if (sub) {
                const subP = JSON.parse(JSON.stringify(sub));
                this.status.pushSub = subP;
                if (this.status.socketAuth) {
                    this.socket.socket?.emit('setPushSub', {pushSub: subP});
                }
            }
        }).catch(err => console.error($localize`Não foi possível subscrever às notificações.`, err));

    }

    sendExten() {
        // console.log('Enviando requisição de registro da extensão. ' + this.exten);
        if (this.exten && !isNaN(Number(this.exten))) {
            this.socket.socket.emit('action', {type: 'registerExten', exten: this.exten})
        } else {
            this.notifications.error($localize`Falha`, $localize`O ramal digitado não é válido.`);
        }
    }

    closeExtenDialog() {
        this.status.getExten = false;
    }

    keyp(e) {
        if (e.key === 'Enter') {
            this.sendExten();
        }
    }

    clearAltDownTimer() {
        if (this.controlDownTimer) {
            clearTimeout(this.controlDownTimer);
        }
    }

    startAltDownTimer() {
        this.clearAltDownTimer();
        this.controlDownTimer = setTimeout(() => {
            this.status.altDown = false;
            this.status.ctrlDown = false;
        }, 5000);
    }

    altDown(e) {
        if (e.key === 'Alt') {
            this.status.altDown = true;
            this.startAltDownTimer();
        }
        if (e.key === 'Control') {
            this.status.ctrlDown = true;
            this.startAltDownTimer();
        }
    }

    altUp(e) {
        if (e.key === 'Alt') {
            this.clearAltDownTimer();
            this.status.altDown = false;
        }
        if (e.key === 'Control') {
            this.clearAltDownTimer();
            this.status.ctrlDown = false;
        }
    }

    /**
     * Se o áudio não tiver sido inicializado, pega o primeiro evento de clique na página e inicializa o áudio
     */
    baseClick() {
        if (!this.audio.initialized) {
            this.audio.initialize();
        }
    }

    prepareSupportChat() {
        // @ts-ignore
        if (window.kwChat && this.status.supportChatDomain && this.status.supportChatQueueId &&
            this.status.supportChatEnabled) {
            // @ts-ignore
            const kwChat: any = window.kwChat;
            kwChat.config.domain = this.status.supportChatDomain;
            kwChat.config.queueId = this.status.supportChatQueueId;
            kwChat.config.clientId = `${window.location.hostname}-${this.status.user.username}`;
            kwChat.config.clientName = `${this.status.user.fullname} [${window.location.hostname}]`;
            kwChat.onloaded = () => {
                console.log('Chat de suporte inicializado.');
                this.status.supportChatLoaded = true;
            };
            kwChat.onnewmessages = () => {
                if (kwChat.state !== 'opened') {
                    this.status.supportChatNewMessages = true;
                }
            };
            console.log('Inicializando chat de suporte.');
            kwChat.initialize();
        }
    }

    ngAfterViewInit() {

        this.status.chatAudio = this.msgReceivedAudio.nativeElement;
        this.status.messageAudio = this.msgNotificationAudio.nativeElement;
        this.status.ringingAudio = this.ringingAlert.nativeElement;

        setTimeout(() => {
            this.loadAutomation();
            this.prepareSupportChat();
        }, 2000);

        this.shortcuts.push(
            {
                key: "alt + m",
                preventDefault: true,
                allowIn: [AllowIn.Textarea],
                command: e => {
                    this.events.emit('messages');
                }
            },
            {
                key: "alt + a",
                preventDefault: true,
                allowIn: [AllowIn.Textarea, AllowIn.Input, AllowIn.Select, AllowIn.ContentEditable],
                command: e => {
                    this.events.emit('openAssistant');
                }
            },
            {
                key: "ctrl + alt + r",
                preventDefault: true,
                allowIn: [AllowIn.Textarea, AllowIn.Input, AllowIn.Select, AllowIn.ContentEditable],
                command: e => {
                    this.screen.startRecording();
                }
            },
            {
                key: "alt + n",
                preventDefault: true,
                allowIn: [AllowIn.Textarea],
                command: e => {
                    this.events.emit('newChat');
                }
            },
            {
                key: "ctrl + alt + 1",
                preventDefault: true,
                allowIn: [AllowIn.Textarea],
                command: e => {
                    this.events.emit('chatShortCut', 1);
                }
            },
            {
                key: "ctrl + alt + 2",
                preventDefault: true,
                allowIn: [AllowIn.Textarea],
                command: e => {
                    this.events.emit('chatShortCut', 2);
                }
            },
            {
                key: "ctrl + alt + 3",
                preventDefault: true,
                allowIn: [AllowIn.Textarea],
                command: e => {
                    this.events.emit('chatShortCut', 3);
                }
            },
            {
                key: "ctrl + alt + 4",
                preventDefault: true,
                allowIn: [AllowIn.Textarea],
                command: e => {
                    this.events.emit('chatShortCut', 4);
                }
            },
            {
                key: "ctrl + alt + 5",
                preventDefault: true,
                allowIn: [AllowIn.Textarea],
                command: e => {
                    this.events.emit('chatShortCut', 5);
                }
            },
            {
                key: "ctrl + alt + 6",
                preventDefault: true,
                allowIn: [AllowIn.Textarea],
                command: e => {
                    this.events.emit('chatShortCut', 6);
                }
            },
            {
                key: "ctrl + alt + 7",
                preventDefault: true,
                allowIn: [AllowIn.Textarea],
                command: e => {
                    this.events.emit('chatShortCut', 7);
                }
            },
            {
                key: "ctrl + alt + 8",
                preventDefault: true,
                allowIn: [AllowIn.Textarea],
                command: e => {
                    this.events.emit('chatShortCut', 8);
                }
            },
            {
                key: "ctrl + alt + 9",
                preventDefault: true,
                allowIn: [AllowIn.Textarea],
                command: e => {
                    this.events.emit('chatShortCut', 9);
                }
            },
            {
                key: "alt + p",
                preventDefault: true,
                allowIn: [AllowIn.Textarea],
                command: e => {
                    this.events.emit('nextChat');
                }
            },
            {
                key: "alt + c",
                preventDefault: true,
                allowIn: [AllowIn.Textarea],
                command: e => {
                    this.events.emit('contact');
                }
            },
            {
                key: "alt + l",
                preventDefault: true,
                allowIn: [AllowIn.Textarea],
                command: e => {
                    this.events.emit('clearSearch');
                }
            },
            {
                key: "alt + g",
                preventDefault: true,
                allowIn: [AllowIn.Textarea],
                command: e => {
                    this.events.emit('gallery');
                }
            },
            {
                key: "alt + e",
                preventDefault: true,
                allowIn: [AllowIn.Textarea],
                command: e => {
                    this.events.emit('endChat');
                }
            },
            {
                key: "alt + i",
                preventDefault: true,
                allowIn: [AllowIn.Textarea],
                command: e => {
                    this.events.emit('infoMsg');
                }
            },
            {
                key: "alt + b",
                preventDefault: true,
                allowIn: [AllowIn.Textarea],
                command: e => {
                    this.events.emit('search');
                }
            },
            {
                key: "alt + s",
                preventDefault: true,
                allowIn: [AllowIn.Textarea],
                command: e => {
                    this.events.emit('sideBar');
                }
            },
            {
                key: "alt + t",
                preventDefault: true,
                allowIn: [AllowIn.Textarea],
                command: e => {
                    this.events.emit('transfer');
                }
            },
            {
                key: "alt + shift + i",
                preventDefault: true,
                allowIn: [AllowIn.Textarea],
                command: e => {
                    this.events.emit('internalChat');
                }
            },
            {
                key: "alt + shift + c",
                preventDefault: true,
                allowIn: [AllowIn.Textarea],
                command: e => {
                    this.events.emit('chats');
                }
            })

        if (this.status.getExten) {
            this.focusTimer();
        }
    }


    focusTimer() {
        setTimeout(() => {
            if (this.extenInput) {
                this.extenInput.nativeElement.focus();
            } else {
                this.focusTimer();
            }
        }, 50)
    }

    toogleSupportChat() {
        // @ts-ignore
        if (!this.status.supportChatEnabled || !this.status.supportChatLoaded || !window.kwChat) {
            return;
        }
        // @ts-ignore
        const kwChat: any = window.kwChat;

        if (kwChat.state === 'closed') {
            kwChat.show();
            this.status.supportChatNewMessages = false;
        } else {
            kwChat.hide();
        }

    }


    tooglePhone() {

        if (this.status.disableTelephony || !this.status.phoneRegistered) {
            return;
        }


    }

    toogleTasks() {
        this.status.showTasks = !this.status.showTasks;
    }

    @ConfirmAction('dialog', {
        text: $localize`Tem certeza que deseja sair do sistema? Todos os chats atribuídos a você serão retornados a fila e caso não estejam travados serão redistribuídos para outros agentes.`,
        title: $localize`Sair do sistema`,
        yesButtonText: $localize`Sair`,
        yesButtonStyle: 'danger'
    })
    logout() {
        if (this.status.user?.type === 2 && this.status.user?.keeponline) {
            const diag = this.dialog.open(YesNoComponent, {
                data: {
                    text: $localize`Deseja deslogar de todas as filas e devolver os atendimentos para a fila?`,
                    title: $localize`Sair da fila`,
                    yesButtonText: $localize`Deslogar`,
                    yesButtonStyle: 'warning',
                    noButtonText: $localize`Não deslogar`
                }
            });
            const diagSub = diag.afterClosed().subscribe((r: boolean) => {
                diagSub.unsubscribe();
                this.autenticador.logout(r);
            });
        } else {
            this.autenticador.logout();
        }
    }

    loadAutomation() {
        this.status.loadAutomations();
    }

}

