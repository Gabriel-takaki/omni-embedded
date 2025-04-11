/**
 * Created by filipe on 17/09/16.
 */

import {EventEmitter, Injectable} from "@angular/core";
import {StatusService} from "./status.service";
import * as _ from 'lodash';
import {NotificationsService} from "angular2-notifications";
import {CallConstructor} from "../app.interfaces";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DomSanitizer} from "@angular/platform-browser";
import {EventsService} from "./events.service";
import * as moment from 'moment';
import {Router} from "@angular/router";
import {ProtobufService} from "./protobuf.service";
import {MatDialog} from "@angular/material/dialog";
import {YesNoComponent} from "../reusable/yes-no.component";
import {AutomationDataFormComponent} from "../standardModule/automation-data-form.component";
import {SharedWorkerSocket} from "./socket.shared-worker-wrapper";
import {SPECIAL_PORT} from "../app.consts";
import {v4} from 'uuid';

@Injectable({providedIn: 'root'})
export class SocketService {

    private notificationMsgs = {
        0: $localize`Há chats na fila, porém trancados, na URA ou com filtros incompatíveis com seu usuário.`,
        1: $localize`Nenhum chat na fila`,
        2: $localize`Usuário bloqueado. Solicite o desbloqueio ao supervisor.`,
        3: $localize`Usuário bloqueado, solicite o desbloqueio ao supervisor.`,
        4: $localize`Usuário desbloqueado.`,
        5: $localize`Não é possível dar pausa. Uma ou mais filas não possuem agentes suficientes logados. Aguarde alguns minutos e tente novamente ou solicite ao supervisor.`,
        6: $localize`Não é possível dar pausa. O número máximo de pausas desse tipo por dia foi excedido.`,
        7: $localize`Devido a um erro de comunicação não é mais possível garantir a sincronia com o servidor. Por favor recarregue a página pressionando F5.`,
        8: $localize`O contato escolhido não possui nome ou número cadastrado.`,
        9: $localize`Limite de licenças atingido, não é possível autenticar.`,
        10: $localize`Limite de atendimentos para o seu usuário atingido. Você não pode receber mais atendimentos até que um seja encerrado ou transferido.`,
        11: $localize`O limite de atendimentos para o seu usuário, vindos dessa fila, foi atingido. Você não pode receber mais atendimentos até que um, dessa fila, seja encerrado ou transferido.`,
        151: $localize`Devido às políticas de horário, você será deslogado em 1 minuto.`,
        152: $localize`Devido às políticas de horário, você será deslogado em 2 minutos.`,
        153: $localize`Devido às políticas de horário, você será deslogado em 3 minutos.`,
        154: $localize`Devido às políticas de horário, você será deslogado em 4 minutos.`,
        155: $localize`Devido às políticas de horário, você será deslogado em 5 minutos.`,
        156: $localize`Devido às políticas de horário, você será deslogado em 6 minutos.`,
        157: $localize`Devido às políticas de horário, você será deslogado em 7 minutos.`,
        158: $localize`Devido às políticas de horário, você será deslogado em 8 minutos.`,
        159: $localize`Devido às políticas de horário, você será deslogado em 9 minutos.`,
        160: $localize`Devido às políticas de horário, você será deslogado em 10 minutos.`,
        161: $localize`Devido às políticas de horário, você será deslogado em 11 minutos.`,
        162: $localize`Devido às políticas de horário, você será deslogado em 12 minutos.`,
        163: $localize`Devido às políticas de horário, você será deslogado em 13 minutos.`,
        164: $localize`Devido às políticas de horário, você será deslogado em 14 minutos.`,
        165: $localize`Devido às políticas de horário, você será deslogado em 15 minutos.`,
    };

    public socket;
    public connected: EventEmitter<any> = new EventEmitter();
    public logoutEvent: EventEmitter<any> = new EventEmitter();
    public isLoggedEvent: EventEmitter<any> = new EventEmitter();

    private registerSent = false;

    // TEMPORARIO
    public channelsTable = [];
    public linksTable = [];
    public tagsDict = [];

    public waitingResponse = {};

    public socketType = 'normal';
    public getInternalMsgsLastTimeStamp = 0;

    constructor(private status: StatusService, private notifications: NotificationsService,
                private snack: MatSnackBar, private sanitizer: DomSanitizer, private events: EventsService,
                private router: Router, private protobuf: ProtobufService, public dialog: MatDialog) {

        this.initializeService();
        this.timer();

    }

    async initializeService() {

        while (!this.status.statusInitialized) {
            await this.sleep(10);
        }

        this.initializeSocket();

    }

    emitAndWait(event, data, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const eventId = v4();
            this.waitingResponse[eventId] = {resolve, reject};
            const timeoutId = setTimeout(() => {
                if (this.waitingResponse[eventId]) {
                    resolve(null);
                    delete this.waitingResponse[eventId];
                }
            }, timeout);
            data.eventId = eventId;
            this.socket.emit(event, data);
        });
    }

    timer() {
        setTimeout(() => {
            this.timer();
            // De 5 em 5 minutos, envia um ping para sinalizar a conexão ativa. Usado para estatísticas de tempo logado
            this.socket.emit('action', {type: 'ping'});
        }, 300000);
    }

    initializeSocket() {

        console.log('Inicializando o socket no service');

        this.socket = new SharedWorkerSocket(this.status);

        this.socket.on('connect', (data) => {
            console.log('Socket conectado.', data);
            this.status.socketConnected = true;
            this.status.socketUnstable = false;
            this.connected.emit();
            if (this.status.user && !data.recovered) {
                // Faz um novo registro quando o socket é reconectado
                this.register(this.status.user.id, this.status.user.socketaccess, this.status.user.type);
            }
        });

        this.socket.on('fullReRegister', (data) => {
            if (this.status.user) {
                // Faz um novo registro quando o socket é reconectado
                this.register(this.status.user.id, this.status.user.socketaccess, this.status.user.type);
            }
        });

        this.socket.on('unregister', () => {
            console.log('Desconectado do servidor.');
            this.logout();
        });

        this.registerSocketEventsHandler();
        this.socket.connect(window.location.hostname, SPECIAL_PORT, window.location.port);

    }

    getMoreInternalMsgs(chat) {
        if (Date.now() > this.getInternalMsgsLastTimeStamp + 500) {
            this.getInternalMsgsLastTimeStamp = Date.now();
            this.socket?.emit('action', {
                type: 'getMoreInternalOldMessages',
                chatId: chat.id,
                queueId: chat.queueId,
                oldMessagesLastId: chat.oldMessagesLastId,
                chatType: chat.type
            });
        }
    }

    logout(clearJwt = true) {
        this.registerSent = false;
        this.logoutEvent.emit(clearJwt);
    }

    ackEvent(id, error = false) {
        // console.log('ackEvent', id, error);
        if (this.status.user?.type === 4 && id && this.socket) {
            this.socket.emit('ack', {ackId: id, syncError: error});
            if (error) {
                this.socket.emit('getCurrentStatus');
            }
        }
    }

    checkStateSync(data, ackOnly = false) {
        if (this.status.user?.type !== 4) {
            return true;
        }

        if (ackOnly) {
            if (data.ackId) {
                this.ackEvent(data.ackId, false);
            }
            return true;
        }

        // console.log('checkState', data, this.status.localState, this.status.localStateTimestamp);
        let error = false;
        const id = data.ackId || data.serverState;
        const time = data.stateTimestamp || data.timestamp;
        // Estado está desincronizado, necessário resincronizar o estado da aplicação com servidor
        if (id > this.status.localState + 30 || (id <= this.status.localState - 5)) {
            error = true;
        }
        if (data.ackId) {
            this.ackEvent(data.ackId, error);
        } else {
            this.socket?.emit('setStateSync', {state: !error});
        }
        if (error || !this.status.localState) {
            // console.log('Versão do estado com problema ou zerada. Solicitando estado completo. Local: ' + this.status.localState + ' Remota: ' + id);
            this.socket?.emit('getCurrentStatus');
        }
        const ret = id > this.status.localState && !error;
        if (!error && data.ackId && id > this.status.localState) {
            this.status.localState = data.ackId;
            this.status.localStateTimestamp = data.stateTimestamp;
        }
        return ret;
    }

    validateForm(form) {
        // O formulário deve ter um nome e pelo menos um campo
        let valid = form.name && form.fields.length;
        if (valid) {
            for (const f of form.fields) {
                // Valida os campos dos formulários

                // É obrigatório ter um label, um id e um type
                if (!f.label || !f.id || typeof f.id !== 'string' || typeof f.label !== 'string' || !f.hasOwnProperty('type')
                    || typeof f.type !== 'number') {
                    valid = false;
                    break;
                }

            }
        }
        return valid;
    }

    showFormHandler(data) {

        if (this.checkStateSync(data)) {

            if (data.automationId) {
                const form = data.type === 0 ? this.status.allFormsMap[data.formId] : data.form;
                if (form && this.validateForm(form)) {
                    const subs = this.dialog.open(AutomationDataFormComponent,
                        {
                            data: {
                                showType: 1,
                                ...form,
                                chatId: data.chatId,
                                queueId: data.queueId
                            }
                        }).afterClosed().subscribe(r => {
                        subs.unsubscribe();
                        if (r) {
                            this.socket.emit('action', {
                                type: 'executeAutomation',
                                queueId: data.queueId,
                                chatId: data.chatId,
                                automationId: data.automationId,
                                vars: r
                            });
                        } else if (data.cancelAutomationId) {
                            this.socket.emit('action', {
                                type: 'executeAutomation',
                                queueId: data.queueId,
                                chatId: data.chatId,
                                automationId: data.cancelAutomationId,
                                vars: {}
                            });
                        }
                    });
                }
            }

        }

    }

    responseHandler(data) {

        if (this.checkStateSync(data)) {

            if (this.status.hasOwnProperty(data.type)) {
                if (Array.isArray(data.data)) {
                    this.status[data.type] = [];
                    for (const o of data.data) {
                        if (o.hasOwnProperty('chats')) {
                            o.chatsObj = {};
                            if (Array.isArray(o.chats)) {
                                for (const c of o.chats) {
                                    o.chatsObj[c.id] = c;
                                }
                            }
                        }
                        if (o.hasOwnProperty('queues')) {
                            o.queuesObj = {};
                            if (Array.isArray(o.queues)) {
                                for (const c of o.queues) {
                                    o.queuesObj[c.id] = c;
                                }
                            }
                        }
                        if (this.status.hasOwnProperty(data.type + 'Obj') && o.id) {
                            this.status[data.type + 'Obj'][o.id] = o;
                        }
                        if (!this.status.hasOwnProperty(data.type + 'Map') && Array.isArray(this.status[data.type])) {
                            this.status[data.type].push(o);
                        }
                    }
                } else if (typeof data.data === 'object') {
                    for (const k in data.data) {
                        if (this.status[data.type].hasOwnProperty(k)) {
                            this.status[data.type][k] = data.data[k];
                        }
                    }
                }
            }

            if (data.type === 'internalChats') {
                for (const item of this.status['internalChats']) {
                    this.status['internalChatsObj'][item.id] = item;
                    item.uploads = item.uploads || [];
                    for (const m of item.messages) {
                        m.fk_file = m.fkFile || '';
                        m.file_auth = m.fileAuth || '';
                        m.file_name = m.fileName || '';
                        m.file_mimetype = m.fileMimetype || '';
                    }
                    for (const m of item.oldMessages) {
                        m.fk_file = m.fkFile || '';
                        m.file_auth = m.fileAuth || '';
                        m.file_name = m.fileName || '';
                        m.file_mimetype = m.fileMimetype || '';
                    }
                }
                this.status.sortInternalChats();
            }

        }


    }

    updateHandler(data) {
        if (this.checkStateSync(data)) {
            if (this.status.hasOwnProperty(data.type)) {
                const obj = data.id ? this.status[data.type][data.id] : this.status[data.type];
                if (obj && typeof data.data === 'object') {
                    for (const k of Object.keys(data.data)) {
                        obj[k] = data.data[k];
                        // if (obj.hasOwnProperty(k)) {
                        //
                        // }
                    }
                }
                if (data.type === 'agentsObj' && data.data.hasOwnProperty('chats')) {
                    obj.chatsObj = {};
                    for (const c of obj.chats) {
                        obj.chatsObj[c.id] = c;
                    }
                }
                if (data.type === 'agentsObj' && data.data.hasOwnProperty('queues')) {
                    obj.queuesObj = {};
                    for (const c of obj.queues) {
                        obj.queuesObj[c.id] = c;
                    }
                }
                if (data.type === 'chatsObj' && data.data.hasOwnProperty('tabs')) {
                    // Atualiza o contador de updates de abas. Isso é para forçar a atualização da view do componente
                    this.status.allTabsCounter++;
                    this.status.prepareChatTabsObj(obj);
                }
                if (data.type === 'chatsObj' && data.data.hasOwnProperty('cardvars')) {
                    obj.varsChangeCounter = obj.varsChangeCounter || 0;
                    obj.varsChangeCounter++;
                }
                if (data.data.hasOwnProperty('contactId')) {
                    this.events.emit('updateContact');
                }
                if (data.type === 'queuesObj' && data.data.hasOwnProperty('qrCode')) {
                    this.status.events.emit('qrCode');
                }
                if (data.type === 'queuesObj' && data.data.authenticated) {
                    this.status.events.emit('queueAuth');
                }
            }
        }
    }

    appendHandler(data) {
        if (this.checkStateSync(data)) {
            if (this.status.hasOwnProperty(data.type)) {
                const obj = data.id ? this.status[data.type][data.id] : this.status[data.type];
                if (obj) {
                    for (const k in data.data) {
                        if (obj.hasOwnProperty(k) && Array.isArray(obj[k])) {
                            for (const a of data.data[k]) {
                                obj[k].push(a);
                            }
                        }
                    }

                    if (data.type === 'chatsObj' && data.data.hasOwnProperty('oldMessages') && (!data.data.oldMessages.length || data.data.oldMessages.length < 20)) {
                        obj.hasMoreOld = false;
                    }
                    if (data.type === 'chatsObj' && data.data.hasOwnProperty('oldMessages') && data.data.oldMessages.length) {
                        obj.oldMessages = _.sortBy(obj.oldMessages, ['timestamp']);
                        for (const m of data.data.oldMessages) {
                            this.status.prepareMsg(m);
                            this.status.messageRef[data.id] = this.status.messageRef[data.id] || {};
                            this.status.messageRef[data.id][m.messageid] = m;
                        }
                        obj.msgChangeCounter++;
                    }

                    if (data.type === 'internalChatsObj' && data.data.hasOwnProperty('oldMessages') && (!data.data.oldMessages.length || data.data.oldMessages.length < 20)) {
                        obj.hasMoreOld = false;
                        obj.oldMessagesLastId = data.oldMessagesLastId;
                    }
                    if (data.type === 'internalChatsObj' && data.data.hasOwnProperty('oldMessages') && data.data.oldMessages.length) {
                        obj.oldMessages = _.sortBy(obj.oldMessages, ['timestamp']);
                        obj.oldMessagesLastId = data.oldMessagesLastId;
                        for (const m of data.data.oldMessages) {
                            m.chatId = m.chatId || data.id;
                            this.status.internalMessageRef[data.id] = this.status.internalMessageRef[data.id] || {};
                            this.status.internalMessageRef[data.id][m.messageid] = m;
                        }
                    }
                }
            }
        }
    }

    addHandler(data) {
        if (this.checkStateSync(data)) {
            if (this.status.hasOwnProperty(data.type)) {
                this.status[data.type].push(data.data);
                if (this.status.hasOwnProperty(data.type + 'Obj')) {
                    this.status[data.type + 'Obj'] = data.data;
                }
            }
        }
    }

    addQueuesHandler(data) {
        if (this.checkStateSync(data)) {
            console.log('Fila recebida.');

            for (const q of [].concat(data)) {
                this.status.prepareAgentQueueObj(q);
                if (!this.status.agentQueuesObj[q.id]) {
                    this.status.agentQueues.push(q);
                    this.status.agentQueuesObj[q.id] = q;
                }
            }

            this.updateQueuesSize();

        }
    }

    removeQueueHandler(data) {

        if (this.checkStateSync(data)) {
            delete this.status.agentQueuesObj[data.id];
            _.remove(this.status.agentQueues, {id: data.id});
        }

    }

    updateQueueHandler(data) {

        if (this.checkStateSync(data)) {
            // console.log('Atualização de fila recebida.');
            // console.log(data);

            const q = this.status.agentQueuesObj[data.id];
            if (q) {
                for (const k of Object.keys(data.queue)) {
                    q[k] = data.queue[k];
                }
                if (data.queue.hasOwnProperty('queueSize')) {
                    this.updateQueuesSize();
                }
            }
        }

    }

    updateQueuesSize() {
        // console.log('updateQueuesSize', this.status.agentQueuesObj);
        this.status.totalQueuesSize = 0;
        for (const k of Object.keys(this.status.agentQueuesObj)) {
            const queue = this.status.agentQueuesObj[k];
            this.status.totalQueuesSize += queue.queueSize || 0;
        }
    }

    chatOrderChanged(data) {
        if (this.checkStateSync(data)) {
            this.status.user.chatOrder = data.chatOrder;
            this.status.persistData('_user');
            this.status.sortChats();
        }
    }

    pullIncludesOnWaitingListChanged(data) {
        if (this.checkStateSync(data)) {
            this.status.user.pullincludesonwaitinglist = data.pullincludesonwaitinglist;
            this.status.persistData('_user');
        }
    }

    notifyMessagesChanged(data) {
        if (this.checkStateSync(data)) {
            this.status.user.notifyMessages = data.notifyMessages;
            this.status.persistData('_user');
            this.status.sortChats();
        }
    }

    addChatHandler(data) {
        if (this.checkStateSync(data)) {
            // TODO: Tocar alerta quando receber novo chat
            if (!this.status.chatsObj[data.id]) {
                // console.log('adicionando o chat', data);
                // this.sanitizer.bypassSecurityTrustResourceUrl(data.clientPic);
                this.status.prepareAgentChat(data);
                this.status.chatsObj[data.id] = data;
                this.status.messageRef[data.id] = this.status.messageRef[data.id] || {};
                this.status.chatText[data.id] = data.preMessage || '';
                this.status.aiChatControl[data.id] = {aiModified: false, oldText: ''};
                this.updateNewChatMsgsCount(data);
                if (data.isNew) {
                    this.status.playChatAlert(data.id, data?.clientName || data?.clientEmail || data?.clientNumber);
                }
                if (!this.router.url.includes('agentchat') && !this.router.url.includes('mobileagentchat')) {
                    this.status.newChats = true;
                }
                this.status.prepareChatTabsObj(data);

                this.events.emit('omniChatReceived', {
                    id: data.id,
                    queueId: data.queueId,
                    queueType: data.queueType,
                    queueName: data.queueName,
                    clientId: data.clientId,
                    beginTime: data.beginTime,
                    clientNumber: data.clientNumber,
                    clientUsername: data.clientUsername,
                    clientName: data.clientName,
                    clientDocument: data.clientDocument,
                    clientProfileName: data.clientProfileName,
                    markerId: data.markerId,
                    protocol: data.protocol,
                    sessionLocked: data.sessionLocked,
                    responded: data.responded,
                    userResponded: data.userResponded,
                    distributionFilter: data.distributionFilter,
                    desigBeginTime: data.desigBeginTime,
                    contactId: data.contactId
                });

                if (this.status.savedSelectedChatId === data.id && moment().unix() - this.status.savedSelectedChatIdTime < 4) {
                    this.status.savedSelectedChatIdTime = 0;
                    this.status.savedSelectedChatId = 0;
                    this.events.emit('selectChat', data);
                }

            }

            const c = _.find(this.status.chats, {id: data.id});
            if (!c) {
                this.status.chats.unshift(data);
                this.status.sortChats();
            }
        }
    }

    updateNewChatMsgsCount(chat) {
        if (!chat) {
            return;
        }
        let newMsgs = 0;
        let lastSeenTimestamp = 0;
        for (const m of (chat?.messages || [])) {
            if (!this.status.messageRef[chat.id][m.messageid]) {
                this.status.messageRef[chat.id][m.messageid] = m;
            }
            if (m.direction === 'in' && !m.readedby.includes(this.status.user.id)) {
                newMsgs++;
            }
            // Marca qual a última mensagem lida por esse agente
            if (this.status.selectedChat !== chat && ['in', 'out'].includes(m.direction) &&
                m.readedby.includes(this.status.user.id) && (!lastSeenTimestamp || m.timestamp > lastSeenTimestamp)) {
                lastSeenTimestamp = m.timestamp;
                chat.lastSeenMessageId = m.messageid;
            }
        }

        for (const m of (chat?.oldMessages || [])) {
            this.status.messageRef[chat.id][m.messageid] = m;
        }
        if (this.status.selectedChat !== chat) {
            chat.newMsgCount += newMsgs;
        } else {
            chat.scrollNewMsgCount += newMsgs;
        }
    }

    updateInternalChatMsgsCount(chat) {
        if (!chat) {
            return;
        }
        let newMsgs = 0;
        for (const m of (chat?.messages || [])) {
            newMsgs += (m.direction === 'in' ? 1 : 0);
            this.status.internalMessageRef[chat.id][m.messageid] = m;
        }
        for (const m of (chat?.oldMessages || [])) {
            this.status.internalMessageRef[chat.id][m.messageid] = m;
        }
        if (this.status.internalSelectedChat !== chat) {
            chat.newMsgCount = newMsgs;
        } else {
            chat.scrollNewMsgCount = newMsgs;
        }
    }

    addInternalChatHandler(data) {
        if (this.checkStateSync(data)) {
            if (!this.status.internalChatsObj[data.id]) {
                this.status.internalChatsObj[data.id] = data;
                this.status.internalMessageRef[data.id] = this.status.internalMessageRef[data.id] || {};
                data.messages = data.messages || [];
                data.oldMessages = data.oldMessages || [];
                data.uploads = data.uploads || [];
                for (const m of data.messages) {
                    this.status.internalMessageRef[data.id][m.messageid] = m;
                    m.chatId = data.id;
                    m.fk_file = m.fkFile || '';
                    m.file_auth = m.fileAuth || '';
                    m.file_name = m.fileName || '';
                    m.file_mimetype = m.fileMimetype || '';
                }
                for (const m of data.oldMessages) {
                    this.status.internalMessageRef[data.id][m.messageid] = m;
                    m.chatId = data.id;
                    m.fk_file = m.fkFile || '';
                    m.file_auth = m.fileAuth || '';
                    m.file_name = m.fileName || '';
                    m.file_mimetype = m.fileMimetype || '';
                }
                this.status.internalChats = Object.values(this.status.internalChatsObj);
                this.status.sortInternalChats();
            }
        }
    }

    removeChatHandler(data) {
        if (this.checkStateSync(data)) {
            if (this.status.selectedChat?.id === data.id) {
                this.events.emit('clearSelectedChat');
                if (this.status.isMobile && this.router.url === '/base/mobilechat') {
                    this.router.navigate(['/base', 'mobileagentchat']);
                }
            }
            const chat = this.status.chatsObj[data.id];
            delete this.status.chatsObj[data.id];
            delete this.status.messageRef[data.id];
            delete this.status.chatText[data.id];
            delete this.status.aiChatControl[data.id];
            if (chat) {
                this.events.emit('omniChatRemoved', {
                    id: chat.id,
                    queueId: chat.queueId,
                    queueType: chat.queueType,
                    queueName: chat.queueName,
                    clientId: chat.clientId,
                    beginTime: chat.beginTime,
                    clientNumber: chat.clientNumber,
                    clientUsername: chat.clientUsername,
                    clientName: chat.clientName,
                    clientDocument: chat.clientDocument,
                    clientProfileName: chat.clientProfileName,
                    markerId: chat.markerId,
                    protocol: chat.protocol,
                    sessionLocked: chat.sessionLocked,
                    responded: chat.responded,
                    userResponded: chat.userResponded,
                    distributionFilter: chat.distributionFilter,
                    desigBeginTime: chat.desigBeginTime,
                    contactId: chat.contactId
                });
            }
            _.remove(this.status.chats, {id: data.id});
        }
    }

    addMsgsHandler(data) {
        if (this.checkStateSync(data)) {
            const chat = this.status.chatsObj[data.id];
            if (chat) {
                this.status.messageRef[data.id] = this.status.messageRef[data.id] || {};
                const msgs = [];
                for (const m of (data.messages || [])) {
                    if (!this.status.messageRef[data.id][m.messageid]) {
                        this.status.messageRef[data.id][m.messageid] = m;
                        msgs.push(m);
                        this.status.prepareMsg(m);
                        this.events.emit('omniMessageReceived', m);
                    }
                }

                let hasNewIncomingMessages = false;

                for (const m of (data.messages || [])) {
                    if (m.direction === 'in' && Array.isArray(m?.readedby) && !m.readedby.includes(this.status.user.id)) {
                        hasNewIncomingMessages = true;
                        break;
                    }
                }

                // console.log('adicionando mensagens ao chat', msgs);
                // if (msgs.length) {
                //   chat.lastMessageTimestamp = moment().unix();
                // }
                chat.messages = chat.messages.concat(msgs);
                chat.messages = _.sortBy(chat.messages, ['timestamp']);

                chat.msgChangeCounter = chat.msgChangeCounter || 0;
                chat.msgChangeCounter++;

                // Se o chat não for o selecionado atualmente, conta quantas mensagens novas foram recebidas
                // TODO: Tocar alerta quando receber nova mensagem que a origem seja o cliente
                this.updateNewChatMsgsCount(chat);
                // Se as mensagens recebidas forem do chat aberto, já marca as mensagens como lidas
                if (this.status.selectedChat === chat) {
                    for (const m of chat.messages) {
                        if (!['event'].includes(m.direction) && (!m.readed || !m.readedby.includes(this.status.user?.id))) {
                            this.socket.emit('action', {
                                type: 'setMessageAsReaded',
                                chatId: chat.id,
                                messageId: m.messageid
                            });
                        }
                    }
                }
                if (hasNewIncomingMessages) {
                    if (!this.router.url.includes('agentchat') && !this.router.url.includes('mobileagentchat')) {
                        this.status.newChats = true;
                    }
                    this.status.playMessageAlert(data.id, chat?.clientName || chat?.clientEmail || chat?.clientNumber, $localize`Há uma nova mensagem para você.`);
                }
                this.status.sortChats();
            }
        }
    }

    /**
     * Remove um chat interno
     * @param data
     */
    removeInternalChatHandler(data) {
        const chat = this.status.internalChatsObj[data.id];
        delete this.status.internalChatsObj[data.id];
        if (chat) {
            this.status.internalChats = Object.values(this.status.internalChatsObj);
            delete this.status.internalMessageRef[data.id];
            if (this.status.internalSelectedChat === chat) {
                this.status.internalSelectedChat = null;
            }
        }
    }

    addInternalMsgHandler(data) {
        if (this.status.disableInternalChat) {
            return;
        }
        if (this.checkStateSync(data)) {
            // console.log('Recebida mensagem interna.', data);
            const chat = this.status.internalChatsObj[data.id];
            if (chat) {
                if (!this.router.url.includes('mobileinternalchat') && !this.router.url.includes('internalchat')) {
                    this.status.newInternalMsg = true;
                }
                // console.log('chat encontrado.');
                const msgs = [];
                this.status.internalMessageRef[data.id] = this.status.internalMessageRef[data.id] || {};
                const messageRef = this.status.internalMessageRef[data.id];
                for (const m of data.messages) {
                    if (!messageRef[m.messageid]) {
                        messageRef[m.messageid] = m;
                        msgs.push(m);
                        this.status.prepareMsg(m);
                    }
                }
                if (msgs.length) {
                    chat.lastMessageTimestamp = moment().unix();
                }
                chat.messages = chat.messages.concat(msgs);
                chat.messages = _.sortBy(chat.messages, ['timestamp']);
                // Se o chat não for o selecionado atualmente, conta quantas mensagens novas foram recebidas
                // TODO: Tocar alerta quando receber nova mensagem que a origem seja o cliente
                this.updateInternalChatMsgsCount(chat);
                // Se as mensagens recebidas forem do chat aberto, já marca as mensagens como lidas
                if (this.status.internalSelectedChat === chat) {
                    for (const m of chat.messages) {
                        if (['in', 'in-ex'].includes(m.direction) && !m.readed) {
                            this.socket.emit('action', {
                                type: 'setInternalMessageAsReaded',
                                chatId: chat.id,
                                chatType: chat.type,
                                messageId: m.messageid,
                                srcId: this.status.user?.id
                            });
                        }
                    }
                }
                if (chat.newMsgCount) {
                    this.status.playMessageAlert(data.id, chat.name, $localize`Há uma nova mensagem no chat interno para você.`, true);
                }
                this.status.sortInternalChats();
            }
        }
    }

    addOldMsgsHandler(data) {
        if (this.checkStateSync(data)) {
            const chat = this.status.chatsObj[data.id];
            if (chat) {
                this.status.messageRef[data.id] = this.status.messageRef[data.id] || {};
                const msgs = [];
                for (const m of data.messages) {
                    if (!this.status.messageRef[data.id][m.messageid]) {
                        this.status.messageRef[data.id][m.messageid] = m;
                        msgs.push(m);
                        this.status.prepareMsg(m);
                    }
                }
                chat.oldMessages = chat.oldMessages.concat(msgs);
                chat.oldMessages = _.sortBy(chat.oldMessages, ['timestamp']);
                chat.msgChangeCounter = chat.msgChangeCounter || 0;
                chat.msgChangeCounter++;
            }
        }
    }

    updateMsgHandler(data) {
        if (this.checkStateSync(data)) {
            const chat = this.status.chatsObj[data.chatid];
            if (chat) {
                chat.msgChangeCounter = chat.msgChangeCounter || 0;
                chat.msgChangeCounter++;
                const msg = _.find(chat.messages, {id: data.msgid});
                if (msg) {
                    for (const k of Object.keys(data.msg)) {
                        if (k === 'messageid') {
                            delete this.status.messageRef[data.chatid][msg[k]];
                            this.status.messageRef[data.chatid][data.msg[k]] = msg;
                        }
                        msg[k] = data.msg[k];
                    }
                    this.status.prepareMsg(msg);
                    msg.messageCounter = msg.messageCounter || 0;
                    msg.messageCounter++;
                }
            }
        }
    }

    updateInternalMsgHandler(data) {
        if (this.status.disableInternalChat) {
            return;
        }
        if (this.checkStateSync(data)) {

            const msg = this.status.internalMessageRef[data.chatId]?.[data.msgid];

            if (msg) {
                for (const k of Object.keys(data.msg)) {
                    msg[k] = data.msg[k];
                }
                if (this.status.internalSelectedChat?.id === data.chatId) {
                    this.status.internalSelectedChat.msgChangeCounter = this.status.internalSelectedChat.msgChangeCounter || 0;
                    this.status.internalSelectedChat.msgChangeCounter++;
                }
                this.status.prepareMsg(msg);
            }

        }
    }

    updateInternalChatStatusHandler(data) {
        if (this.status.disableInternalChat) {
            return;
        }
        if (this.checkStateSync(data)) {
            // console.log('update de status recebido', data);

            const chat = this.status.internalChatsObj[data.chatId];
            if (chat) {
                chat.online = data.online;
            }
        }
    }

    removeHandler(data) {
        if (this.checkStateSync(data)) {
            if (this.status.hasOwnProperty(data.type) && data.data.id) {
                _.remove(this.status[data.type], {id: data.data.id});
                if (this.status.hasOwnProperty(data.type + 'Obj')) {
                    delete this.status[data.type + 'Obj'][data.data.id];
                }
            }
        }
    }

    actionResponseHandler(data) {
        if (this.checkStateSync(data)) {
            if (data && data.type === 'registerExten' && data.status === 200) {
                this.status.mineExtenNumber = data.exten;
                this.status.getExten = false;
                if (this.status.user.autologin) {
                    setTimeout(() => {
                        this.logInAll();
                    }, 500);
                }
            }

            if (data && data.showSnack) {
                if (data.status === 200) {
                    this.snack.open(data.msg, $localize`Fechar`, {panelClass: 'bg-success'});
                } else {
                    this.snack.open(data.msg, $localize`Fechar`, {panelClass: 'bg-danger'});
                }
            }
        }
    }

    notificationHandler(data) {
        if (this.checkStateSync(data)) {
            const not = this.notificationMsgs[data.msgId] || data.msg;
            this.snack.open(not, $localize`Fechar`, {panelClass: data.class || '', duration: data.duration || 2000});
        }
    }

    handleEventPromise(data) {
        if (data.eventId && this.waitingResponse[data.eventId]) {
            this.waitingResponse[data.eventId].resolve(data);
            delete this.waitingResponse[data.eventId];
        }
    }

    notificationWithActionHandler(data) {
        if (this.checkStateSync(data)) {
            if (data.action === 1 && this.status.phoneRegistered) {
                this.dialog.open(YesNoComponent, {
                    data: {
                        text: $localize`Você possui uma chamada agendada para agora com ${data.actiondata}. Deseja iniciar a chamada? Se você já possuir uma chamada em andamento, está será colocada em espera.`,
                        title: $localize`Iniciar chamada`,
                        yesButtonText: $localize`Ligar`,
                        yesButtonStyle: 'success',
                        noButtonText: $localize`Cancelar`,
                        taskId: data.taskId
                    }
                }).afterClosed().subscribe((res) => {
                    if (res) {
                        const number = data.actiondata.split(' [')[0];
                        if (this.status.allTasksMap[data.taskId]) {
                            this.status.taskCalls[number] = this.status.allTasksMap[data.taskId];
                        }
                        this.events.emit('initiateCall', {number});
                    }
                });
            } else if (data.action === 2) {

            }
        }
    }

    loadLocalStorageQueuesData() {
        for (const queue of this.status.allQueues) {
            const expanded = localStorage.getItem(`${this.status.user.id}-${queue.id}-expanded`);
            const order = isNaN(Number(localStorage.getItem(`${this.status.user.id}-${queue.id}-order`))) ? 1500 : Number(localStorage.getItem(`${this.status.user.id}-${queue.id}-order`)) ?? 1500;
            queue.expanded = Number(expanded) ? true : false;
            queue.order = order;
        }
    }

    registrationConfirmed(recovering = false) {
        console.log('Registro confirmado');
        this.status.socketAuth = true;
        if (this.protobuf.loaded) {
            this.socket.emit('protoLoaded');
        }
        if (!recovering) {
            this.status.clearStateItems();
            this.requestAllObjects();
            if (this.status.user?.autologin) {
                this.logInAll();
            }
        }
        if (!this.status.user) {
            // Se recebeu um registerResponse e não tem usuário, é pq houve um login em outra aba, faz o login aqui também
            this.isLoggedEvent.emit();
        }
        // Emite um evento de que o socket foi autenticado
        this.events.emit('socketAuth');
    }

    registerSocketEventsHandler() {

        console.log('Registrando handler de eventos.');

        this.socket.on('registerResponse', (data) => {

            console.log('Recebido socket response.', data);

            if (data.status === 200) {
                this.status.recoveryFrom = '';
                this.registrationConfirmed(data.recovering ?? false);
            } else {
                if (data.status === 401) {
                    this.notifications.error($localize`Falha`, $localize`Já existe uma conexão estabelecida utilizando este usuário.`);
                    this.logout(false);
                } else {
                    if (data.msgId) {
                        const not = this.notificationMsgs[data.msgId] || data.msg;
                        this.notifications.error($localize`Falha`, not);
                    } else {
                        this.notifications.error($localize`Falha`, $localize`A autenticação falhou. Por favor, verifique os dados digitados e tente novamente.`);
                    }
                    this.logout();
                }
                console.log('Falha na autenticação do socket');
            }
            this.registerSent = false;
            this.handleEventPromise(data);

        });

        this.socket.on('alreadyRegistered', (data) => {
            console.log('Recebido alreadyRegistered.');
            this.status.recoveryFrom = '';
            this.registrationConfirmed(true);
            this.registerSent = false;
        });

        this.socket.on('singleConnection', () => {

            console.log('Recebido singleConnection.');
            this.status.singleConnection = true;
            this.status.multipleConnections = false;
            this.events.emit('singleConnection');

        });

        this.socket.on('multipleConnections', () => {

            console.log('Recebido multipleConnections.');
            this.status.multipleConnections = true;
            this.status.singleConnection = false;
            this.events.emit('multipleConnections');

        });

        // Ordem do servidor para deslogar
        this.socket.on('logout', (data) => {
            this.logout();
            if (data.code = 1) {
                this.notifications.warn($localize`Atenção`, $localize`Você foi desconectado por outro dispositivo logado com o mesmo usuário.`);
            }
        });

        this.socket.on('disconnect', (data) => {

            console.log(`Socket desconectado. Motivo: ${data.reason}. ID: ${data.socketId}`);

            if (data.reason === 'io server disconnect') {
                this.status.socketConnected = false;
                this.logout();
                // return;
            }

            if (data.reason === 'io client disconnect') {
                // Encerrado para troca de tipo socket
                return;
            }


            this.registerSent = false;
            this.status.socketUnstable = true;
            // Só atualiza o recoveryFrom se a última conexão já havia recebido um registerResponse
            if (this.status.user && data.registerResponseReceived) {
                this.status.recoveryFrom = data.socketId;
            }

        });

        this.socket.on('connect_timeout', () => {
            if (!this.status.isMobile) {
                this.status.socketConnected = false;
                this.logout();
            }
            this.registerSent = false;
            console.log('Timeout na conexão.');
        });

        this.socket.on("reconnect_attempt", (attempt) => {
            console.log('Tentando se reconectar. Tentativa ' + attempt);
        });

        this.socket.on("reconnect", (attempt) => {
            console.log('Reconectado com sucesso.');
            this.status.socketUnstable = false;
        });

        // Evento com os dados de contato vinculados a uma chamada
        this.socket.on('callContact', (data) => {
            try {
                this.events.emit('callContact', data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        // Evento informando que uma solicitação foi concluída
        this.socket.on('jobDone', (data) => {
            this.handleEventPromise(data);
        });

        // Evento informando que uma solicitação foi concluída
        this.socket.on('showSnack', (data) => {
            this.snack.open(data.message, data.btnText, {panelClass: 'bg-' + data.style, duration: data.duration});
        });

        // Evento de resposta a uma query, substitui todos os elementos da memória pela resposta
        this.socket.on('response', (data) => {
            try {
                this.responseHandler(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        // Evento para exibir formulário de coleta de dados para o agente
        this.socket.on('showForm', (data) => {
            try {
                this.showFormHandler(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        // Sinalização de que das etiquetas foram atualizadas
        this.socket.on('updateContactAndFaqTags', (data) => {
            try {
                this.status.loadTags();
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        // Evento emitido quando não há nenhuma oportunidade disponível para um pipeline
        this.socket.on('noOpportunitiesFound', (data) => {
            this.status.allPipelinesMap[data.pipeId].opportunitiesLoading = false;
            this.handleEventPromise(data);
        });

        this.socket.on('object', (data) => {
            try {
                if (this.checkStateSync(data, true)) {

                    // this.status[data.obj] = data.data || this.status[data.obj];
                    for (const item of (data.data || [])) {
                        if (data.obj === 'allTasks') {
                            this.status.prepareTaskObj(item);
                        }
                        if (data.obj === 'allOpportunities') {
                            if (this.status.allPipelinesMap[item.fkPipeline]?.opportunitiesLoading) {
                                this.status.allPipelinesMap[item.fkPipeline].opportunitiesLoading = false;
                            }
                            this.status.prepareOpportunityObj(item, true, true);
                        }
                        if (data.obj === 'allProducts') {
                            this.status.prepareProductObj(item, true, true);
                        }
                        if (data.obj === 'allTemplates') {
                            this.status.prepareTemplateObj(item);
                        }
                        this.status[data.obj + 'Map'][item.id] = item;
                    }

                    if (['allAgents'].includes(data.obj)) {
                        this.status.updateAllAgentsAlertStatus();
                        this.status.updateAllAgentsQueuesMap();
                    }

                    if (['allTags'].includes(data.obj)) {
                        this.status.updateAllAgentsAlertStatus();
                    }

                    if (['allQueues'].includes(data.obj)) {
                        this.loadLocalStorageQueuesData();
                    }

                    this.status.events.emit(data.obj);

                }
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        this.socket.on('updateQueueData', async (data) => {
            try {
                const decoded = await this.protobuf.decodeQueue(new Uint8Array(data.data));
                if (this.status['allQueuesMap'][decoded.id]) {
                    for (const k of Object.keys(decoded)) {
                        this.status['allQueuesMap'][decoded.id][k] = decoded[k];
                    }
                }
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        this.socket.on('allObjects', async (data) => {
            try {
                if (data?.byteLength) {
                    try {
                        const decoded = await this.protobuf.decode(new Uint8Array(data));
                        if (decoded.tagsDict?.length) {
                            this.tagsDict = decoded.tagsDict;
                        }
                        if (decoded.chats?.length) {
                            for (const newItem of decoded.chats) {
                                // Faz isso para remover a classe do protobuf
                                // const newItem = JSON.parse(JSON.stringify(item));
                                newItem.arriveTimestamp = moment().unix();
                                if (newItem.packedId) {
                                    newItem.clientId = newItem.clientId + '@s.whatsapp.net';
                                }
                                if (newItem.distributionFilter?.length) {
                                    newItem.distributionFilter = newItem.distributionFilter.map(t => this.tagsDict[t]);
                                }
                                if (newItem.queueTransferTags?.length) {
                                    newItem.queueTransferTags = newItem.queueTransferTags.map(t => this.tagsDict[t]);
                                }
                                // this.status['allChats'].push(newItem);
                                this.status['allChatsMap'][newItem.id] = newItem;
                            }
                        }
                        // console.log('decoded', decoded);
                        if (decoded.tags?.length) {
                            // this.status['allTags'] = decoded.tags;
                            for (const item of decoded.tags) {
                                this.status['allTagsMap'][item.id] = item;
                            }
                            this.status.updateAllAgentsAlertStatus();
                        }
                        if (decoded.queues?.length) {
                            // this.status['allQueues'] = decoded.queues;
                            for (const item of decoded.queues) {
                                this.status['allQueuesMap'][item.id] = item;
                            }
                            this.loadLocalStorageQueuesData();
                        }
                        if (decoded.agents?.length) {
                            for (const newItem of decoded.agents) {
                                // Faz isso para remover a classe do protobuf
                                // const newItem = JSON.parse(JSON.stringify(newItem));
                                if (newItem.tags?.length) {
                                    newItem.tags = newItem.tags.map(t => this.tagsDict[t]);
                                }
                                // this.status['allAgents'].push(newItem);
                                this.status['allAgentsMap'][newItem.id] = newItem;
                            }
                            this.status.updateAllAgentsAlertStatus();
                            this.status.updateAllAgentsQueuesMap();
                        }
                        if (decoded.users?.length) {
                            // this.status['allUsers'] = decoded.users;
                            for (const item of decoded.users) {
                                this.status['allUsersMap'][item.id] = item;
                            }
                        }
                        if (decoded.logged?.length) {
                            // this.status['allLogged'] = decoded.logged;
                            for (const item of decoded.logged) {
                                this.status['allLoggedMap'][item.id] = item;
                            }
                        }
                        if (decoded.opportunities?.length) {
                            // this.status['allOpportunities'] = [];
                            for (const item of decoded.opportunities) {
                                // Faz isso para remover a classe do protobuf
                                const newItem = JSON.parse(JSON.stringify(item));
                                // this.status['allOpportunities'].push(newItem);
                                this.status.prepareOpportunityObj(newItem, true, true);
                                this.status['allOpportunitiesMap'][newItem.id] = newItem;
                                if (this.status.allPipelinesMap[newItem.fkPipeline]?.opportunitiesLoading) {
                                    this.status.allPipelinesMap[newItem.fkPipeline].opportunitiesLoading = false;
                                }
                            }
                            this.status.events.emit('allOpportunities');
                        }
                        if (decoded.tasks?.length) {
                            // this.status['allTasks'] = decoded.tasks;
                            for (const item of decoded.tasks) {
                                this.status.prepareTaskObj(item);
                                this.status['allTasksMap'][item.id] = item;
                            }
                            this.status.tasksEventsCounter++;
                        }
                        if (decoded.internalChats?.length) {
                            // this.status['internalChats'] = [];
                            for (const item of decoded.internalChats) {
                                const newItem = JSON.parse(JSON.stringify(item));
                                newItem.messages = newItem.messages || [];
                                newItem.oldMessages = newItem.oldMessages || [];
                                newItem.uploads = newItem.uploads || [];
                                this.status['internalChatsObj'][newItem.id] = newItem;
                                this.status.internalMessageRef[newItem.id] = this.status.internalMessageRef[newItem.id] || {};
                                for (const m of newItem.messages) {
                                    this.status.internalMessageRef[newItem.id][m.messageid] = m;
                                    m.chatId = newItem.id;
                                    m.fk_file = m.fkFile;
                                    m.file_auth = m.fileAuth;
                                    m.file_name = m.fileName;
                                    m.file_mimetype = m.fileMimetype;
                                }
                                for (const m of newItem.oldMessages) {
                                    this.status.internalMessageRef[newItem.id][m.messageid] = m;
                                    m.chatId = newItem.id;
                                    m.fk_file = m.fkFile;
                                    m.file_auth = m.fileAuth;
                                    m.file_name = m.fileName;
                                    m.file_mimetype = m.fileMimetype;
                                }
                            }
                            this.status.internalChats = Object.values(this.status.internalChatsObj);
                            this.status.sortInternalChats();
                        }
                        this.events.emit('allObjects');
                    } catch (e) {
                        // Fallback para se o decode do protobuf falhar, resolicita tudo sem protobuf
                        console.log('Erro ao fazer decode do protobuf.')
                        console.log(e);
                        this.protobuf.failed = true;
                        this.protobuf.loaded = false;
                        this.loadAllObjects();
                    }
                }
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        this.socket.on('addNotification', (data) => {
            try {
                if (this.checkStateSync(data)) {
                    this.status.notifications.push(data);
                    this.snack.open(data.text, $localize`Lida`, {
                        panelClass: data.type === 0 ? 'bg-info' : data.type === 1 ? 'bg-success' : data.type === 2 ? 'bg-warning' : 'bg-danger',
                        duration: 10000
                    }).onAction().subscribe(r => {
                        this.socket.emit('action', {type: 'readNotification', id: data.id});
                    });
                }
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        this.socket.on('removeNotification', (data) => {
            try {
                if (this.checkStateSync(data)) {
                    _.remove(this.status.notifications, {id: data.id});
                }
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        this.socket.on('addObjectItem', (data) => {
            try {
                if (this.checkStateSync(data)) {
                    if (this.status[data.obj + 'Map'][data.data.id]) {
                        for (const k of Object.keys(data.data)) {
                            this.status[data.obj + 'Map'][data.data.id][k] = data.data[k];
                        }
                    } else {
                        this.status[data.obj + 'Map'][data.data.id] = data.data;
                        // this.status[data.obj].push(data.data);
                    }

                    if (this.status.hasOwnProperty(data.obj + 'Counter')) {
                        this.status[data.obj + 'Counter']++;
                    }

                    if (['allAgents'].includes(data.obj)) {
                        this.status.updateAgentsAlertStatus(this.status[data.obj + 'Map'][data.data.id]);
                        this.status.updateAgentQueuesMap(this.status[data.obj + 'Map'][data.data.id]);
                    }

                    if (['allTags'].includes(data.obj)) {
                        this.status.updateAllAgentsAlertStatus();
                    }

                    if (['allTasks'].includes(data.obj)) {
                        this.status.tasksEventsCounter++;
                        this.status.prepareTaskObj(this.status['allTasksMap'][data.data.id]);
                    }

                    if (['allOpportunities'].includes(data.obj)) {
                        this.status.prepareOpportunityObj(this.status['allOpportunitiesMap'][data.data.id], true, true);
                        delete this.status.offlineOpportunitiesCache[data.data.id];
                    }

                    if (['allProducts'].includes(data.obj)) {
                        this.status.prepareProductObj(this.status['allProductsMap'][data.data.id], true, true, true, true, true);
                    }

                    this.status.events.emit(data.obj);

                }
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        this.socket.on('updateObjectItem', (data) => {
            try {
                if (this.checkStateSync(data)) {

                    if (this.status[data.obj + 'Map'][data.data.id]) {
                        for (const k of Object.keys(data.data)) {
                            if (['duedate', 'finishdate', 'expectedclosedate'].includes(k)) {
                                this.status[data.obj + 'Map'][data.data.id][k] = data.data[k] ? moment(data.data[k] * 1000) : null;
                            } else {
                                this.status[data.obj + 'Map'][data.data.id][k] = data.data[k];
                            }
                        }

                        if (this.status.hasOwnProperty(data.obj + 'Counter')) {
                            this.status[data.obj + 'Counter']++;
                        }

                        if (['allAgents'].includes(data.obj)) {
                            this.status.updateAgentsAlertStatus(this.status[data.obj + 'Map'][data.data.id]);
                            if (data.data.queues) {
                                this.status.updateAgentQueuesMap(this.status[data.obj + 'Map'][data.data.id]);
                            }
                        }

                        if (['allTags'].includes(data.obj)) {
                            this.status.updateAllAgentsAlertStatus();
                        }

                        if (['allChats'].includes(data.obj)) {
                            this.status.updateAgentWithSpecificChatAlertStatus(data.data.id);
                        }

                        if (['allTasks'].includes(data.obj)) {
                            this.status.tasksEventsCounter++;
                            this.status.prepareTaskObj(this.status['allTasksMap'][data.data.id]);
                        }

                        if (['allOpportunities'].includes(data.obj)) {
                            this.status.prepareOpportunityObj(this.status['allOpportunitiesMap'][data.data.id], data.data.hasOwnProperty('value'), data.data.hasOwnProperty('recurrentvalue'));
                        }

                        if (['allProducts'].includes(data.obj)) {
                            this.status.prepareProductObj(this.status['allProductsMap'][data.data.id], data.data.hasOwnProperty('value'), data.data.hasOwnProperty('recurrentvalue'), data.data.hasOwnProperty('maxdiscount'), data.data.hasOwnProperty('commission'), data.data.hasOwnProperty('maxrecurrentdiscount'));
                        }

                    }

                    this.status.events.emit(data.obj);
                }
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        this.socket.on('removeObjectItem', (data) => {
            try {
                if (this.checkStateSync(data)) {

                    if (this.status[data.obj + 'Map'][data.data.id]) {
                        this.status[data.obj].splice(this.status[data.obj].indexOf(this.status[data.obj + 'Map'][data.data.id]), 1);
                        delete this.status[data.obj + 'Map'][data.data.id];
                    }

                    if (this.status.hasOwnProperty(data.obj + 'Counter')) {
                        this.status[data.obj + 'Counter']++;
                    }

                    if (['allTags'].includes(data.obj)) {
                        this.status.updateAllAgentsAlertStatus();
                    }

                    if (['allTasks'].includes(data.obj)) {
                        this.status.tasksEventsCounter++;
                    }

                    this.status.events.emit(data.obj);

                }
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        this.socket.on('instancesList', (data) => {
            this.status.instances = [];
            this.status.instancesObj = {};
            this.status.instances = data.instances;
            for (const instance of this.status.instances) {
                this.status.instancesObj[instance.id] = instance;
                instance.fidelityDate = instance.endOfFineDate ? moment(instance.endOfFineDate).toDate() : null;
            }
            this.status.instances = _.sortBy(this.status.instances, ['statusCode', 'name']);
            this.handleEventPromise(data);
        });

        this.socket.on('updateInstance', (data) => {
            if (this.status.instancesObj[data.id]) {
                for (const k of Object.keys(data.data)) {
                    this.status.instancesObj[data.id][k] = data.data[k];
                }
            }
            this.handleEventPromise(data);
        });

        // Evento para atualizar um objeto na memória
        this.socket.on('update', (data) => {
            try {
                this.updateHandler(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        // Recebido quando há um novo evento de Live Session View
        this.socket.on('liveViewData', (data) => {
            if (this.status.liveSessionPlayer && this.status.liveSessionTabId === data.tabId) {
                this.status.liveSessionPlayer.addEvent(data.data);
                if (!this.status.liveSessionPlayer.scaleAdjusted) {
                    this.status.liveSessionPlayer.scaleAdjusted = true;
                    this.status.liveSessionPlayer.adjustScale();
                }
                // Evento recebido quando há um resize na tela do cliente, ajusta o tamanho do player
                if (data.data.data.source === 4) {
                    this.status.liveSessionPlayer.adjustScale();
                }
            } else {
                // Se não há uma sessão local acontecendo, solicita a interrupção do Live Session View
                this.socket.emit('action', {
                    type: 'stopLiveViewSession',
                    tabId: data.tabId,
                    chatId: data.chatId
                });
            }
            this.handleEventPromise(data);
        });

        this.socket.on('append', (data) => {
            try {
                this.appendHandler(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        this.socket.on('appendMsg', (data) => {
            try {
                console.log('Recebido quoted do servidor', data);
                if (!this.status.messageRef[data.chatId]?.[data.msg?.messageid]) {
                    this.status.prepareMsg(data);
                    this.status.messageRef[data.chatId] = this.status.messageRef[data.chatId] || {};
                    this.status.messageRef[data.chatId][data.msg?.messageid] = data.msg;
                }
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        this.socket.on('appendInternalMsg', (data) => {
            try {
                console.log('Recebido quoted interno do servidor', data);
                if (!this.status.internalMessageRef[data.chatId]?.[data.msg?.messageid]) {
                    this.status.internalMessageRef[data.chatId] = this.status.internalMessageRef[data.chatId] || {};
                    this.status.internalMessageRef[data.chatId][data.msg?.messageid] = data.msg;
                }
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        // Evento para adicionar um objeto na memória
        this.socket.on('add', (data) => {
            try {
                this.addHandler(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        this.socket.on('addQueues', (data) => {
            try {
                this.addQueuesHandler(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        this.socket.on('removeQueue', (data) => {
            try {
                this.removeQueueHandler(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        this.socket.on('updateQueue', (data) => {
            try {
                this.updateQueueHandler(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        this.socket.on('chatOrderChanged', (data) => {
            try {
                this.chatOrderChanged(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        this.socket.on('pullIncludesOnWaitingListChanged', (data) => {
            try {
                this.pullIncludesOnWaitingListChanged(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        this.socket.on('notifyMessagesChanged', (data) => {
            try {
                this.notifyMessagesChanged(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        // Adiciona um novo chat ao usuário
        this.socket.on('requery', (data) => {
            if (data.type === 'ivrs') {
                this.status.supervisorIvrsQueried = true;
            }
            this.socket.emit('supervisorQuery', {type: data.type});
            this.handleEventPromise(data);
        });

        // Adiciona um novo chat ao usuário
        this.socket.on('addChat', (data) => {
            try {
                this.addChatHandler(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        // Adiciona um novo chat ao usuário
        this.socket.on('addInternalChat', (data) => {
            try {
                this.addInternalChatHandler(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        // Remove um chat do usuário
        this.socket.on('removeChat', (data) => {
            try {
                this.removeChatHandler(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        // Adiciona uma nova mensagem ao chat do usuário
        this.socket.on('addMsgs', (data: { id: string, messages: any[] }) => {
            try {
                this.addMsgsHandler(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        // Adiciona uma nova mensagem ao chat do usuário
        this.socket.on('addInternalMsg', (data: { id: string, messages: any[] }) => {
            try {
                this.addInternalMsgHandler(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        // Remove um chat interno
        this.socket.on('removeInternalChat', (data: { id: string }) => {
            try {
                this.removeInternalChatHandler(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        // Adiciona uma nova mensagem ao chat do usuário
        this.socket.on('addOldMsgs', (data: { id: string, messages: any[] }) => {
            try {
                this.addOldMsgsHandler(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        // Atualiza o status da mensagem no chat do usuário
        this.socket.on('updateMsg', (data) => {
            try {
                this.updateMsgHandler(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        // Atualiza o status da mensagem no chat do usuário
        this.socket.on('updateInternalMsg', (data) => {
            try {
                this.updateInternalMsgHandler(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        // Atualiza o status da mensagem no chat do usuário
        this.socket.on('updateInternalChatStatus', (data) => {
            try {
                this.updateInternalChatStatusHandler(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        // Evento para remover um objeto da memória
        this.socket.on('remove', (data) => {
            try {
                this.removeHandler(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        this.socket.on('actionResponse', (data) => {
            try {
                this.actionResponseHandler(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        this.socket.on('notification', (data) => {
            try {
                this.notificationHandler(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        this.socket.on('notificationWithAction', (data) => {
            try {
                this.notificationWithActionHandler(data);
            } catch (e) {
                console.log('Erro no evento', e, data);
                this.socket.emit('logError', {error: e, data});
            }
            this.handleEventPromise(data);
        });

        this.socket.on('instanceCreationUpdate', (data) => {
            this.status.instanceCreationStatus.msg = data.msg || this.status.instanceCreationStatus.msg;
            this.status.instanceCreationStatus.progress = data.progress || this.status.instanceCreationStatus.progress;
            this.status.instanceCreationStatus.status = data.status || this.status.instanceCreationStatus.status;
            this.handleEventPromise(data);
        });

    }

    /**
     * Aguarda a autenticação do socket por até 2 segundos
     */
    async waitForSocketAuthentication() {
        if (this.status.socketAuth) {
            return;
        }
        return new Promise((resolve) => {
            let counter = 0;
            const interval = setInterval(() => {
                counter++;
                if (this.status.socketAuth || counter > 10) {
                    clearInterval(interval);
                    resolve(true);
                }
            }, 100);
        });
    }

    // Solicita a relação de IVRs e fluxos de automação do supervisor / administrador
    // Solicita somente uma vez em todo o tempo de vida da sessão
    async querySupervisorIvrs() {
        // Se o socket ainda não estiver autenticado, aguarda a autenticação
        await this.waitForSocketAuthentication();
        if (!this.status.supervisorIvrsQueried && this.status.socketAuth) {
            this.status.supervisorIvrsQueried = true;
            this.socket.emit('supervisorQuery', {type: 'ivrs'});
        }
    }

    async register(id, socketaccess, type) {

        if (this.registerSent) {
            return;
        }
        this.registerSent = true;
        const alreadyRegistered = await this.socket.isRegistered();
        console.log('Verificando se já está registrado');
        if (alreadyRegistered?.registered) {
            console.log('Socket já registrado por outra aba. Solicitando estado.');
            // Se caiu aqui, significa que o socket já está registrado no sharedworker, foi registrado por outra aba
            // Verifica se alguma aba já registrada possui o estado já carregado
            const state = await this.socket.getGlobalState();
            if (state?.state) {
                console.log('Outra aba possui estado, aplicando.')
                // Se existe já um estado, aplica o estado na aba atual
                this.status.clearStateItems();
                this.status.socketAuth = true;
                await this.queryAllObjects();
                this.status.loadState(state.state);
            } else {
                console.log('Não há estado disponível, seguindo fluxo normal.');
                // Não há estado disponível em nenhuma outra aba, segue o fluxo padrão
                this.registrationConfirmed(false);
            }
        } else {
            console.log('Registrando-se no socket.');
            console.log('Enviando solicitação de registro.');
            this.socket.register({
                id, socketaccess, type, byId: true,
                ...(this.status.recoveryFrom ? {recoveryFrom: this.status.recoveryFrom} : {}),
                pushSub: this.status.pushSub,
                isMobile: this.status.isMobile
            });
        }

    }

    unregister(logout = false) {
        if (this.status.user) {
            this.socket?.unregister({type: this.status.user.type, isMobile: this.status.isMobile, logout});
        }
    }

    sweepNotificationShown() {
        if (!this.status.socketAuth) {
            return;
        }
        this.socket.emit('supervisorAction', {type: 'sweepNotificationShown'});
    }

    logInQueue(queue) {
        if (!this.status.socketAuth) {
            return;
        }
        this.socket.emit('action', {type: 'queueLogin', queueId: queue.id});
    }

    logInAll() {
        if (!this.status.socketAuth) {
            return;
        }
        this.socket.emit('action', {type: 'loginToAllQueues'});
    }

    logOutAll() {
        if (!this.status.socketAuth) {
            return;
        }
        this.socket.emit('action', {type: 'logoutFromAllQueues'});
    }

    requestContactUpdate(queueId, clientId) {
        if (!this.status.socketAuth) {
            return;
        }
        this.socket.emit('action', {type: 'updateContact', queueId, clientId});
    }

    requestCallContactUpdate(number) {
        this.socket.emit('action', {type: 'updateCallContact', number});
    }

    requestMarkerChange(markerId, chatId) {
        this.socket.emit('action', {type: 'changeMarker', markerId, chatId});
    }

    requestMarkerChangeSupervisor(markerId, queueId, clientId) {
        this.socket.emit('supervisorAction', {type: 'changeMarker', markerId, queueId, clientId});
    }

    logOutQueue(queue) {
        this.socket.emit('action', {type: 'queueLogout', queueId: queue.id});
    }

    updateLocalServiceStatus(status) {
        this.socket.emit('action', {type: 'changeLocalServiceStatus', status});
    }

    splitData(string, arr = false) {
        let tmp: any | any[] = '';
        if (string) {
            if (arr) {
                tmp = string.split('&');
                for (let a = 0; a < tmp.length; a++) {
                    tmp[a] = this.splitData(tmp[a]);
                }
            } else {
                tmp = string.split('/')[1];
                if (tmp) {
                    tmp = tmp.split('-')[0];
                    if (tmp) {
                        tmp = tmp.split('@')[0];
                        if (tmp) {
                            tmp = tmp.split(',')[0];
                        }
                    }
                }
            }
        }
        return tmp;
    }

    initialize() {

        return new Promise((resolve, reject) => {

            if (this.socket) {


            } else {

                this.socket.on('subscribe', (data) => {
                    if (data.message === 'success') {
                        this.status.updateAgentsStatus().then(res => {
                            this.status.getGenericData('/users/requestBroadCastAgent');
                            resolve(true);
                        });
                    }
                });

                this.socket.on('event', (data) => {

                    let user;
                    let exten;
                    let trunk;
                    let queue;
                    let channel;
                    let destchannel;

                    switch (data.event.event) {

                        case 'BlindTransfer':
                            user = _.find(this.status.items['agents'], {sipuser: data.event.transferercalleridnum.toString()});
                            const tmpe: any = _.find(this.status.items['extensions'], {exten: data.event.transferercalleridnum.toString()});
                            if (user) {
                                _.remove(user.calls, {channel: data.event.transfererchannel.toString()});
                            }
                            if (tmpe) {
                                _.remove(tmpe.calls, {channel: data.event.transfererchannel.toString()});
                            }
                            break;

                        case 'AttendedTransfer':
                            user = _.find(this.status.items['agents'], {sipuser: data.event.origtransferercalleridnum.toString()});
                            exten = _.find(this.status.items['extensions'], {exten: data.event.origtransferercalleridnum.toString()});
                            if (user) {
                                _.remove(user.calls, {channel: data.event.origtransfererchannel.toString()});
                            }
                            if (exten) {
                                _.remove(exten.calls, {channel: data.event.origtransfererchannel.toString()});
                            }
                            break;

                        case 'DialEnd':
                            if (data.event.channel) {

                                channel = data.event.channel.toString();
                                destchannel = data.event.destchannel.toString();

                                if (this.channelsTable[channel] || this.channelsTable[destchannel]) {

                                    const channels = [];
                                    if (this.channelsTable[channel]) {
                                        channels.push(channel);
                                    }
                                    if (this.channelsTable[destchannel]) {
                                        channels.push(destchannel);
                                    }

                                    if (['ABORT', 'BUSY', 'CANCEL', 'CHANUNAVAIL', 'CONGESTION', 'NOANSWER'].includes(data.event.dialstatus)) {
                                        channels.forEach((chan) => {
                                            if (this.channelsTable[chan].ringingchannels) {
                                                _.remove(this.channelsTable[chan].ringingchannels, {channel: destchannel});
                                            }
                                            if (this.channelsTable[chan] && !this.channelsTable[chan].ringingchannels) {
                                                this.clearChannelTable(chan);
                                            }
                                        });
                                    } else if (data.event.dialstatus === 'ANSWER') {
                                        if (this.channelsTable[channel]) {
                                            this.channelsTable[channel].answered = true;
                                            this.channelsTable[channel].ringing = false;
                                            this.channelsTable[channel].destchannel = destchannel;
                                        }
                                        if (this.channelsTable[destchannel]) {
                                            this.channelsTable[destchannel].answered = true;
                                            this.channelsTable[destchannel].ringing = false;
                                            this.channelsTable[destchannel].destchannel = channel;
                                        }
                                    }

                                }
                            }
                            break;

                        case 'CoreShowChannel':
                            if (data.event.channel) {

                                // console.log(data.event);

                                channel = data.event.channel.toString();
                                const calleridnum = data.event.calleridnum;
                                const linkedid = data.event.linkedid;
                                const splitedChannel = this.splitData(channel);
                                // exten = _.find(this.status.status['extensions'], {exten: calleridnum});
                                // user = _.find(this.status.status['agents'], {sipuser: calleridnum});
                                exten = _.find(this.status.items['extensions'], {exten: splitedChannel});
                                user = _.find(this.status.items['agents'], {sipuser: splitedChannel});
                                trunk = _.find(this.status.items['trunks'], {channelid: splitedChannel});
                                const duration = this.getDuration(data.event.duration);
                                const channelstate = Number(data.event.channelstate);

                                if (['vesfone01', '9997'].includes(splitedChannel)) {
                                    // console.log(data.event);
                                }

                                if ((exten || user || trunk || this.linksTable[linkedid]) && [3, 4, 5, 6].includes(channelstate)) {

                                    const destcalleridnum = data.event.exten;
                                    const uniqueid = data.event.uniqueid.toString();

                                    this.channelsTable[channel] = this.channelsTable[channel] || new CallConstructor();
                                    this.linksTable[linkedid] = this.linksTable[linkedid] || {};

                                    this.channelsTable[channel]['localnumber'] = calleridnum;
                                    this.channelsTable[channel]['calleridnum'] = calleridnum;
                                    this.channelsTable[channel]['connectedlinenum'] = data.event.connectedlinenum;
                                    this.channelsTable[channel]['exten'] = destcalleridnum;
                                    this.channelsTable[channel]['name'] = '';
                                    this.channelsTable[channel]['number'] = data.event.connectedlinenum;
                                    this.channelsTable[channel]['uniqueid'] = uniqueid;
                                    this.channelsTable[channel]['linkedid'] = this.linksTable[linkedid];
                                    this.channelsTable[channel]['linkedidstring'] = linkedid;
                                    this.channelsTable[channel]['dialstring'] = '';
                                    this.channelsTable[channel]['channel'] = channel;
                                    this.channelsTable[channel]['direction'] = data.event.uniqueid === data.event.linkedid ? 'out' : 'in';
                                    this.channelsTable[channel]['timer'] = duration;
                                    this.channelsTable[channel]['ringing'] = [3, 4, 5].includes(channelstate) ? true : false;
                                    this.channelsTable[channel]['answered'] = channelstate === 6 ? true : false;
                                    this.channelsTable[channel]['timer'] = channelstate === 6 ? duration : 0;
                                    // this.channelsTable[channel]['direction'] = data.event.application === 'Dial' ? 'out' : 'in';

                                    this.linksTable[linkedid].channels = this.linksTable[linkedid].channels || [];
                                    this.linksTable[linkedid].channels.push(this.channelsTable[channel]);

                                    if (exten) {
                                        this.channelsTable[channel]['exten'] = exten;
                                        exten.calls.push(this.channelsTable[channel]);
                                    }
                                    if (user) {
                                        this.channelsTable[channel]['agent'] = user;
                                        user.calls.push(this.channelsTable[channel]);
                                    }
                                    if (trunk) {
                                        this.channelsTable[channel]['trunk'] = trunk;
                                        trunk.calls.push(this.channelsTable[channel]);
                                    }

                                    /*
                                    if (this.linksTable[linkedid].channels[0]) {
                                      this.linksTable[linkedid].channels[0].direction = 'out';
                                    }

                                    if (this.linksTable[linkedid].channels.length > 1) {
                                      for (let x = 1; x < this.linksTable[linkedid].channels.length; x++) {
                                        this.linksTable[linkedid].channels[x].direction = 'in';
                                      }
                                    }
                                    */

                                }

                                // VERIFY QUEUES
                                if (data.event.application === 'Queue' && data.event.bridgeid === '') {
                                    queue = _.find(this.status.items['queues'], {number: Number(data.event.exten)});
                                    if (queue) {
                                        queue.callscount++;
                                        queue.callers.push({
                                            calleridnum: data.event.calleridnum,
                                            position: queue.callscount,
                                            time: new Date(),
                                            holdTime: duration
                                        });
                                    }
                                }
                            }
                            break;

                        case 'Newchannel':
                            if (data.event.channel) {

                                channel = data.event.channel.toString();
                                const calleridnum = data.event.calleridnum;
                                const linkedid = data.event.linkedid;
                                const splitedChannel = this.splitData(channel);
                                exten = _.find(this.status.items['extensions'], {exten: calleridnum});
                                user = _.find(this.status.items['agents'], {sipuser: calleridnum});
                                trunk = _.find(this.status.items['trunks'], {channelid: splitedChannel});

                                if (['vesfone01', '9997', '9998'].includes(splitedChannel)) {
                                    // console.log(data.event);
                                }

                                if (exten || user || trunk || this.linksTable[linkedid]) {

                                    const destcalleridnum = data.event.exten;
                                    const uniqueid = data.event.uniqueid.toString();

                                    this.channelsTable[channel] = this.channelsTable[channel] || new CallConstructor();
                                    this.linksTable[linkedid] = this.linksTable[linkedid] || {};

                                    this.channelsTable[channel]['localnumber'] = calleridnum;
                                    this.channelsTable[channel]['calleridnum'] = calleridnum;
                                    this.channelsTable[channel]['connectedlinenum'] = data.event.connectedlinenum;
                                    this.channelsTable[channel]['extens'] = destcalleridnum;
                                    this.channelsTable[channel]['name'] = '';
                                    this.channelsTable[channel]['uniqueid'] = uniqueid;
                                    this.channelsTable[channel]['linkedid'] = this.linksTable[linkedid];
                                    this.channelsTable[channel]['linkedidstring'] = linkedid;
                                    this.channelsTable[channel]['dialstring'] = data.event.dialstring;
                                    this.channelsTable[channel]['channel'] = channel;
                                    this.channelsTable[channel]['direction'] = '';
                                    this.channelsTable[channel]['timer'] = 0;

                                    this.linksTable[linkedid].channels = this.linksTable[linkedid].channels || [];

                                    if ((destcalleridnum === '' || destcalleridnum === '<unknown>' || destcalleridnum === 's') && this.linksTable[linkedid].channels.length > 0) {
                                        this.channelsTable[channel]['number'] = this.linksTable[linkedid].channels[0].localnumber;
                                        this.channelsTable[channel]['localnumber'] = this.linksTable[linkedid].channels[0].extens;
                                    } else {
                                        this.channelsTable[channel]['number'] = destcalleridnum;
                                    }

                                    this.linksTable[linkedid].channels.push(this.channelsTable[channel]);

                                    if (exten) {
                                        this.channelsTable[channel]['exten'] = exten;
                                        exten.calls.push(this.channelsTable[channel]);
                                    }
                                    if (user) {
                                        this.channelsTable[channel]['agent'] = user;
                                        user.calls.push(this.channelsTable[channel]);
                                    }
                                    if (trunk) {
                                        this.channelsTable[channel]['trunk'] = trunk;
                                        trunk.calls.push(this.channelsTable[channel]);
                                    }

                                    if (this.linksTable[linkedid].channels[0]) {
                                        this.linksTable[linkedid].channels[0].direction = 'out';
                                    }

                                    if (this.linksTable[linkedid].channels.length > 1) {
                                        for (let x = 1; x < this.linksTable[linkedid].channels.length; x++) {
                                            this.linksTable[linkedid].channels[x].direction = 'in';
                                        }
                                    }

                                }

                            }
                            break;

                    }

                    this.status.sortItems();

                });

            }
        });
    }

    async requestAllObjects() {

        await this.waitForSocketAuthentication();
        if (this.status.socketAuth) {

            if (this.status.user?.type === 2) {
                this.socket.emit('query', {type: 'agentQueues'});
            }

            this.socket.emit('query', {type: 'myStatus'});

            if (!this.status.htmlTemplates.length) {
                this.socket.emit('query', {type: 'getHtmlTemplates'});
            }

            if (!Object.keys(this.status.allTemplatesMap).length) {
                this.socket.emit('globalQuery', {type: 'templates'});
            }

            await this.loadAllObjects();

        }

    }

    async loadAllObjects() {

        await this.protobuf.finishLoad();
        this.socket.emit('globalQuery', this.protobuf.loaded ? {type: 'allObjects'} : {
            type: 'allObjects',
            noProto: true
        });

        await this.queryAllObjects()

    }

    async queryAllObjects() {
        await this.status.queryAllUsers();
        await this.status.queryAllForms();
        await this.status.queryAllProducts();
        await this.status.queryAllActions();
        await this.status.queryAllOrigins();
        await this.status.queryAllAssistants();
        await this.status.queryAllTags();
        await this.status.queryAllPredefinedTexts();
        await this.status.queryAllGallerys();
        await this.status.queryAllPipelines();
        await this.status.queryAllPipestages();
        await this.status.queryAllInformationCards();
        await this.status.queryAllIvrs();
    }

    sendAction(action, userid, queueid, sipuser: number | string = 9999999999999, remotenumber: number | string = 0, cName = '', cNumber = '') {
        this.socket.emit('action', {action, userid, queueid, sipuser, remotenumber, cName, cNumber});
    }

    getDuration(duration: string) {
        const parts = duration.split(':');
        const hours = Number(parts[0]) * 3600;
        const minutes = Number(parts[1]) * 60;
        const seconds = Number(parts[2]);
        return hours + minutes + seconds;
    }

    private clearChannelTable(channel) {
        if (this.channelsTable[channel].exten) {
            _.remove(this.channelsTable[channel].exten.calls, {channel: channel});
        }
        if (this.channelsTable[channel].agent) {
            _.remove(this.channelsTable[channel].agent.calls, {channel: channel});
        }
        if (this.channelsTable[channel].trunk) {
            _.remove(this.channelsTable[channel].trunk.calls, {channel: channel});
        }
        if (this.channelsTable[channel].linkedid) {
            _.remove(this.channelsTable[channel].linkedid.channels, {channel: channel});
        }
        if (this.channelsTable[channel].linkedid && this.channelsTable[channel].linkedid.channels && this.channelsTable[channel].linkedid.channels.length === 0) {
            delete this.linksTable[this.channelsTable[channel].linkedidstring];
        }

        if (this.channelsTable[channel].linkedid && this.channelsTable[channel].linkedid.channels.length > 1) {

            for (let x = 1; x < this.channelsTable[channel].linkedid.channels.length; x++) {
                const chan = this.channelsTable[channel].linkedid.channels[x];
                if (chan.extens === '' || chan.extens === '<unknown>' || chan.extens === 's') {
                    chan['number'] = this.channelsTable[channel].linkedid.channels[0].localnumber;
                }
            }

        }


        delete this.channelsTable[channel];
    }


    sleep(time) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, time);
        });
    }

}
