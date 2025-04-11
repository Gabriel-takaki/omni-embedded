/**
 * Created by filipe on 08/10/16.
 */

import {Injectable} from "@angular/core";
import {BASE_URL} from "../app.consts";
import * as _ from 'lodash';
import {NotificationsService} from "angular2-notifications";
import {EventsService} from "./events.service";
import {AuthService} from "./auth.service";
import {StatusService} from "./status.service";
import {HttpClient} from "@angular/common/http";
import {Title} from "@angular/platform-browser";
import {MatDialog} from "@angular/material/dialog";
import {SocketService} from "./socket.service";
import {AgentTransferComponent} from "../standardModule/agent-transfer.component";
import {TemplateDataFormComponent} from "../standardModule/template-data-form.component";
import {SendTemplateObject, TemplateObjectFormData} from "../definitions";
import {EndChatComponent} from "../standardModule/end-chat.component";
import {ConfirmAction} from "../reusable/confirmaction.decorator";

@Injectable({providedIn: 'root'})
export class ActionsService {

    constructor(private http: HttpClient, private notification: NotificationsService, private events: EventsService,
                private autenticador: AuthService, private items: StatusService, private titleService: Title,
                public dialog: MatDialog, private socket: SocketService) {

        this.events.on('clearSelectedChat', () => {
            this.clearSelectedChat();
        });

        this.events.on('selectChat', (chat) => {
            this.selectChat(chat);
        });

    }

    getStyle() {
        this.http.get(BASE_URL + '/static/getTitle').subscribe((title: any) => {
            this.items.defaultTitle = title.title;
            this.titleService.setTitle(title.title);
        });

        // this.http.get(BASE_URL + '/static/getColor').subscribe((r: any) => {
        //   this.items.headerColor = r.color || '#9C27B0';
        //   this.items.headerAltColor = r.colorAlt || '#9C27B0';
        //   this.items.secondaryColor = r.secondaryColor || '#9C27B0';
        //   this.items.headerFontColor = r.fgColor || '#fff';
        // });
    }

    lockUser(userid: string) {
        return new Promise((resolve, reject) => {
            this.http.post(BASE_URL + '/asterisk/lockAgent', {userid}).subscribe((resp: any) => {
                if (resp.message === 'success') {
                    this.notification.success($localize`Sucesso`, $localize`Usuário bloqueado com sucesso.`);
                    const tmp: any = _.find(this.items.items['agents'], {id: userid});
                    tmp.locked = 1;
                } else {
                    this.notification.error($localize`Falha`, $localize`Falha ao bloquear usuário.`);
                }
            }, err => {
                reject(err);
            });
        });
    }

    unLockUser(userid: string) {
        return new Promise((resolve, reject) => {
            this.http.post(BASE_URL + '/asterisk/unlockAgent', {userid}).subscribe((resp: any) => {
                if (resp.message === 'success') {
                    this.notification.success($localize`Sucesso`, $localize`Usuário desbloqueado com sucesso.`);
                    const tmp: any = _.find(this.items.items['agents'], {id: userid});
                    tmp.locked = 0;
                } else {
                    this.notification.error($localize`Falha`, $localize`Falha ao desbloquear usuário.`);
                }
            }, err => {
                reject(err);
            });
        });
    }

    spyAgent(channel, whisper = false) {
        return new Promise((resolve, reject) => {
            channel = channel ? channel.split('-')[0] : '';
            if (channel) {
                this.http.post(BASE_URL + '/api/spyAgent', {
                    channel: '"' + channel + '",bqE',
                    whisper,
                    exten: this.items.mineExtenNumber
                }).subscribe((res: Response) => {
                    resolve(true);
                }, err => {
                    reject(false);
                });
            } else {
                reject(false);
            }
        });
    }

    redirectCall(channel: string, sipuser = '') {

        return this.items.getGenericData('/api/redirectCall', {
            channel,
            exten: sipuser ? sipuser : this.items.mineExtenNumber
        }).then((res: any) => {
            this.items.genericReturn(res);
        }).catch(err => {
            this.notification.error($localize`Falha`, $localize`Falha ao enviar requisição.`);
        });

    }

    blindTransfer(channel: string, sipuser = '') {

        return this.items.getGenericData('/api/blindTransfer', {
            channel,
            exten: sipuser ? sipuser : this.items.mineExtenNumber
        }).then((res: any) => {
            this.items.genericReturn(res);
        }).catch(err => {
            this.notification.error($localize`Falha`, $localize`Falha ao enviar requisição.`);
        });

    }

    attendedTransfer(channel: string, sipuser: string) {

        return this.items.getGenericData('/api/attendedTransfer', {channel, exten: sipuser}).then((res: any) => {
            this.items.genericReturn(res);
        }).catch(err => {
            this.notification.error($localize`Falha`, $localize`Falha ao enviar requisição.`);
        });

    }

    originateCall(destination: string, exten: string) {

        return this.items.getGenericData('/api/originateCall', {destination, exten}).then((res: any) => {
            this.items.genericReturn(res);
        }).catch(err => {
            this.notification.error($localize`Falha`, $localize`Falha ao enviar requisição.`);
        });

    }

    pauseAgent(userid: string) {
        return new Promise((resolve, reject) => {
            this.http.post(BASE_URL + '/asterisk/pauseAgent', {
                userid,
                reasonid: 0
            }).subscribe((resp: any) => {
                if (resp.message === 'success') {
                    this.notification.success($localize`Sucesso`, $localize`Comando de pausa enviado com sucesso.`);
                } else {
                    this.notification.error($localize`Falha`, $localize`Falha ao enviar comando de pausa.`);
                }
            }, err => {
                reject(err);
            });
        });
    }

    unpauseAgent(userid: string) {
        return new Promise((resolve, reject) => {
            this.http.post(BASE_URL + '/asterisk/unpauseAgent', {userid})
                .subscribe((resp: any) => {
                    if (resp.message === 'success') {
                        this.notification.success($localize`Sucesso`, $localize`Comando de finalização de pausa enviado com sucesso.`);
                    } else {
                        this.notification.error($localize`Falha`, $localize`Falha ao enviar comando de finalização de pausa.`);
                    }
                }, err => {
                    reject(err);
                });
        });
    }

    addToQueue(userid: string, queuenumber, queueid, paused) {
        return new Promise((resolve, reject) => {
            this.http.post(BASE_URL + '/asterisk/addToQueue', {userid, queuenumber, queueid, paused})
                .subscribe((resp: any) => {
                    if (resp.message === 'success') {
                        this.notification.success($localize`Sucesso`, $localize`Comando de log in enviado com sucesso.`);
                    } else {
                        this.notification.error($localize`Falha`, $localize`Falha ao enviar comando de log in.`);
                    }
                }, err => {
                    reject(err);
                });
        });
    }

    removeFromQueue(userid: string, queuenumber, queueid) {
        return new Promise((resolve, reject) => {
            this.http.post(BASE_URL + '/asterisk/removeFromQueue', {userid, queuenumber, queueid})
                .subscribe((resp: any) => {
                    if (resp.message === 'success') {
                        this.notification.success($localize`Sucesso`, $localize`Comando de log out enviado com sucesso.`);
                    } else {
                        this.notification.error($localize`Falha`, $localize`Falha ao enviar comando de log out.`);
                    }
                }, err => {
                    reject(err);
                });
        });
    }

    setDND(exten: string, dnd: boolean = false) {
        return new Promise((resolve, reject) => {
            this.http.post(BASE_URL + '/api/setDND', {exten, dnd})
                .subscribe((resp: any) => {
                    if (resp.message === 'success') {
                        this.notification.success($localize`Sucesso`, $localize`Configuração de DND enviada com sucesso.`);
                        resolve(true);
                    } else {
                        this.notification.error($localize`Falha`, $localize`Falha ao enviar configuração de DND.`);
                        resolve(true);
                    }
                }, err => {
                    reject(err);
                });
        });
    }

    transferChat(chat) {
        this.items.loggedAgents = [];
        this.socket.socket.emit('query', {type: 'loggedAgents'});
        this.dialog.open(AgentTransferComponent, {
            data: {
                tags: chat.queueTransferTags,
                queueId: this.items.allQueuesMap[chat.queueId]?.limitChatTransferToQueueAgents ||
                this.items.agentQueuesObj[chat.queueId]?.limitChatTransferToQueueAgents ? chat.queueId : 0
            }
        }).afterClosed().subscribe(r => {
            if (r) {
                this.sendTransferCommand(chat, r);
                if (this.items.isMobile && this.items.selectedChat === chat) {
                    this.clearSelectedChat();
                }
            }
        });
    }

    setAsNotReaded(chat) {
        this.socket.socket.emit('action', {type: 'setAsNotReaded', id: chat.id});
    }

    @ConfirmAction('dialog', {
        text: $localize`Tem certeza que deseja enviar esse atendimento para a sala de espera? Atendimentos na sala de espera não são distribuídos automaticamente pelo sistema, eles precisam ser puxados manualmente ou transferidos por um supervisor ou automação.`,
        title: $localize`Enviar para sala de espera`,
        yesButtonText: $localize`Enviar`,
        yesButtonStyle: 'warning'
    })
    sendToWaitingRoom(chat) {
        this.socket.socket.emit('action', {type: 'putOnWaitingList', id: chat.id});
    }

    clearSelectedChat() {
        this.items.selectedChat = null;
        if (this.items.isEmbedded) {
            sessionStorage.setItem(this.items.user?.id + '-selectedChat', "0");
        }
    }

    sendTransferCommand(chat, userId: string | number) {
        if (!chat) {
            return;
        }
        this.events.emit('omniChatTransfered', {
            chatId: chat.id,
            userId: typeof userId === 'number' ? userId : 0,
            filter: typeof userId === 'string' ? userId : ''
        });
        if ([2, 3, 4].includes(this.items.user.type)) {
            this.socket.socket.emit('action', {
                type: 'transferChat',
                userId: userId,
                chatId: chat.id,
                queueId: chat.queueId
            });
        } else {
            this.socket.socket.emit('supervisorAction', {
                type: 'transferChat',
                userId: userId,
                clientId: chat.clientId,
                queueId: chat.queueId,
                pageId: chat.pageId
            });
        }
    }

    setChatProtocol(chat, protocol) {
        if (chat && !chat.protocol && protocol) {
            this.socket.socket.emit('action', {
                type: 'generateChatProtocol',
                id: chat.id,
                protocol
            });
        }
    }

    async selectChat(chat, resultType = 0, msgId = '') {
        this.items.selectedChat = chat;
        if (this.items.isEmbedded) {
            const chatId = chat.id.toString();
            if (chatId) {
                sessionStorage.setItem(this.items.user.id + '-selectedChat', chatId);
            }
        }
        this.socket.socket?.emit('changeChatNewStatus', {
            chatId: chat.id
        });
        this.events.emit('chatSelected');
        this.events.emit('omniChatSelected', {
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
        chat.selectedNow = true;
        if (chat.isNew || !chat.messages.length || !chat.messagesRequested) {
            chat.messagesRequested = true;
            chat.messagesLoading = true;
            chat.messagesInitialLoading = true;
            await this.socket.emitAndWait('action', {
                type: 'getAllMessages',
                chatId: chat.id
            });
            this.socket.socket.emit('action', {
                type: 'setChatAsSeen',
                chatId: chat.id
            });
            // Espera o próximo loop para que a view tenha sido atualizada
            setTimeout(() => {
                chat.messagesLoading = false;
            }, 100);
        }
        if (chat?.lastSeenMessageId && chat?.newMsgCount) {
            chat.showLastSeenBanner = true;
        }
        chat.oldMsgCount = chat.newMsgCount;
        chat.newMsgCount = 0;
        if (chat.messages) {
            for (const m of chat.messages) {
                // Se a mensagem ainda não foi lida ou não foi lida por esse usuário, enviar notificação de leitura
                if (!['event'].includes(m.direction) && (!m.readed || !m.readedby.includes(this.items.user?.id))) {
                    this.socket.socket.emit('action', {
                        type: 'setMessageAsReaded',
                        chatId: chat.id,
                        messageId: m.messageid
                    });
                }
            }
        }
        this.items.sortChats();
        if (resultType === 1 && msgId) {
            setTimeout(() => {
                this.events.emit('goToMessage', {id: msgId, chatid: chat.id});
            }, 1250);
        }
    }

    endChat(chat) {
        if (chat) {
            this.dialog.open(EndChatComponent, {
                data: {
                    queueId: chat.queueId,
                    queueRequireReason: chat.queueRequireReason,
                    queueType: chat.queueType,
                    clientId: chat.clientId,
                    opportunities: chat.opportunities
                }
            }).afterClosed().subscribe(r => {
                if (r) {
                    this.sendEndChatCommand({
                        chatId: chat.id,
                        endReason: r.endReason,
                        endReasonObs: r.endReasonObs,
                        reopen: r.reopen,
                        reopenReason: r.reopenReason,
                        reopenTemplate: r.reopenTemplate,
                        reopenAutomationId: r.reopenAutomationId,
                        dontSendAutoMsg: r.dontSendAutoMsg,
                        date: r.date,
                        hour: r.hour,
                        minute: r.minute
                    });
                }
            });
        }
    }

    sendEndChatCommand(options) {
        this.socket.socket.emit('action', {
            type: 'endChat',
            ...options
        });
        this.events.emit('omniChatEnded', options);
    }

    getTemplateFormData(queueId): Promise<TemplateObjectFormData> {
        return new Promise((resolve, reject) => {
            this.dialog.open(TemplateDataFormComponent, {data: {queueId}}).afterClosed().subscribe((formData: TemplateObjectFormData) => {
                return resolve(formData);
            }, error => {
                return resolve(null);
            });
        })
    }

    sendWaTemplateMessage(requestBody: SendTemplateObject) {
        if (requestBody.openNewChat) {
            this.events.emit('omniNewChat', {
                queueId: requestBody.queueid,
                number: requestBody.number,
                country: requestBody.country,
                mail: '',
                markerId: requestBody.markerId
            });
        }
        return new Promise((resolve, reject) => {
            this.http.post(BASE_URL + '/api/sendWaTemplate', requestBody).subscribe((ret: any) => {
                return resolve({error: null, result: ret});
            }, err => {
                return resolve({error: err.error, result: null});
            });
        });
    }

    openNewChatByNumber(queueId, number = '', country = '', mail = '', message = '', markerId = 0, filters = ''): Promise<{
        result: any,
        error: any
    }> {
        if (!queueId) {
            return;
        }
        this.events.emit('omniNewChat', {queueId, number, country, mail, markerId});
        return new Promise((resolve, reject) => {
            this.http.post(BASE_URL + '/api/openChatNewClient', {
                queueid: queueId,
                ...(number ? {number: number} : {}),
                ...(country ? {country: country} : {}),
                ...(message ? {message: message} : {}),
                ...(markerId ? {markerId: markerId} : {}),
                ...(filters ? {filters: filters} : {}),
                ...(mail ? {mail: mail} : {})
            }).subscribe((ret: any) => {
                return resolve({error: null, result: ret});
            }, err => {
                return resolve({error: err.error, result: null});
            });
        });
    }

    openNewChatByChatId(chatId, filter = 0, queueId = 0, number = '', mail = '',): Promise<{
        result: any,
        error: any
    }> {
        if (!chatId) {
            return;
        }
        this.events.emit('omniNewChat', {queueId, number, mail});
        return new Promise((resolve, reject) => {
            this.http.post(BASE_URL + '/api/openNewChat', {
                chatid: chatId,
                filter: filter
            }).subscribe((ret: any[]) => {
                return resolve({error: null, result: ret});
            }, err => {
                return resolve({error: err.error, result: null});
            });
        });
    }

}
