/**
 * Created by filipe on 08/10/16.
 */

import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {StatusService} from "./status.service";
import {SocketService} from "./socket.service";
import {AuthService} from "./auth.service";
import {EventsService} from "./events.service";
import {ActionsService} from "./actions.service";
import {UtilitiesService} from "./utilities.service";
import {FileDef} from "../definitions";

@Injectable({providedIn: 'root'})
export class EmbeddedService {

  constructor(private http: HttpClient, private status: StatusService, private socket: SocketService,
              private auth: AuthService, private events: EventsService,
              private actions: ActionsService, private utils: UtilitiesService) {


  }

  initialize() {

    this.externalEventsHandlers();
    this.internalEventsHandlers();

    // Caso o sistema esteja embedado em um iframe, sinaliza o parent informando que a aplicação foi carregada
    window.parent.postMessage(["omniLoaded"], "*");

  }

  /**
   * Configura os handlers para os eventos gerados internamente
   */
  internalEventsHandlers() {

    this.events.on('socketAuth', () => {
      if (this.status.isEmbedded) {
        // Evento de que o sistema está autenticado e conectado
        window.parent.postMessage(["omniAuthenticated", {
          username: this.status.user?.username,
          fullName: this.status.user?.fullName,
          id: this.status.user?.id
        }], "*");
      }
    });

    this.events.on('loggedOut', () => {
      if (this.status.isEmbedded) {
        // Evento de que o sistema está autenticado e conectado
        window.parent.postMessage(["omniLoggedOut", {
          username: this.status.user?.username,
          fullName: this.status.user?.fullName,
          id: this.status.user?.id
        }], "*");
      }
    });

    ['omniChatReceived', 'omniNewChat', 'omniChatEnded', 'omniChatTransferred', 'omniMessageReceived',
      'omniChatRemoved', 'omniChatSelected', 'omniCallReceived', 'omniCallAnswered', 'omniCallInitiated',
      'omniCallEnded'].forEach((event) => {
      this.events.on(event, (data) => {
        if (this.status.isEmbedded) {
          window.parent.postMessage([event, data], "*");
        }
      });
    });

  }

  /**
   * Configura os handlers para os eventos gerados externamente, no parent, quando embedado
   */
  externalEventsHandlers() {

    window.addEventListener('message', async (e) => {
      const event = e.data[0];
      const data = e.data[1];

      switch (event) {

        // Evento recebido do parent, que confirma que o sistema está embedado
        case 'embedded':
          this.status.isEmbedded = true;
          this.status.hideChangePasswordButton = data.hideChangePasswordButton || false;
          this.status.hideLogoutButton = data.hideLogoutButton || false;
          break;

        case 'omniLogin':
          this.auth.login(data.username, data.password).then((r) => {
            window.parent.postMessage(["commandResponse", {id: data.id, data: {success: true}}], "*");
          }).catch((err) => {
            window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
          });
          break;

        case 'omniLogout':
          this.auth.logout();
          window.parent.postMessage(["commandResponse", {id: data.id, data: {success: true}}], "*");
          break;

        case 'omniIsLogged':
          this.auth.isLogged().then(r => {
            window.parent.postMessage(["commandResponse", {id: data.id, data: {logged: r}}], "*");
          }).catch(err => {
            window.parent.postMessage(["commandResponse", {id: data.id, data: {logged: false}}], "*");
          });
          break;

        case 'omniOpenNewChat':
          // Abre um novo chat
          if (this.status.user?.type !== 2) {
            return window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
          }
          const queue = this.status.agentQueuesObj[data.queueId];
          if (!queue || ![1, 5, 10, 16, 17, 18].includes(queue.type)) {
            return window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
          }
          try {
            if ([5, 16].includes(queue.type)) {
              // Filas que não dependem de template
              const mail = queue.type === 16 ? data.clientId : '';
              const number = queue.type === 5 ? data.clientId : '';
              const ret = await this.actions.openNewChatByNumber(data.queueId, number, data.country, mail);
              if (ret.result) {
                return window.parent.postMessage(["commandResponse", {id: data.id, data: {success: true}}], "*");
              } else {
                return window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
              }
            } else {
              // Filas que dependem de template
              let template = {templateId: data.templateId || 0, data: data.teplateVars || []};
              if (!template.templateId) {
                // Se o template não foi informado, abre o formulário de seleção de templates para o agente
                template = await this.actions.getTemplateFormData(data.queueId);
              }
              if (!template) {
                // Se o agente cancelou a seleção de template, cancela a operação
                return window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
              }
              await this.actions.sendWaTemplateMessage({
                queueid: data.queueId,
                number: data.clientId.replace(/\ /g, '').replace(/\+/g, ''),
                openNewChat: true,
                checkForOpen: true,
                transfer: true,
                formData: template
              });
              return window.parent.postMessage(["commandResponse", {id: data.id, data: {success: true}}], "*");
            }
          } catch (e) {
            return window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
          }
          break;

        case 'omniCloseChat':
          // Fecha um atendimento aberto
          try {
            const chat = this.status.chatsObj[data?.chatId];
            if (chat) {
              if (data.showDialog) {
                this.actions.endChat(chat);
              } else {
                this.actions.sendEndChatCommand({
                  chatId: chat.id,
                  endReason: data.reason || '',
                  endReasonObs: data.reasonObs || '',
                  reopen: false,
                  reopenReason: '',
                  reopenTemplate: 0,
                  reopenAutomationId: 0,
                  dontSendAutoMsg: data.dontSendCloseMsg ?? false
                })
              }
              window.parent.postMessage(["commandResponse", {id: data.id, data: {success: true}}], "*");
            } else {
              window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
            }
          } catch (e) {
            window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
          }
          break;

        case 'omniSendMessage':
          // Envia uma mensagem para um chat aberto
          if (this.status.user?.type !== 2) {
            window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
            return;
          }
          try {
            const chat = this.status.chatsObj[data?.chatId];
            if (chat) {
              this.socket.socket.emit('action', {
                type: 'sendMessage',
                chatId: chat.id,
                fk_file: data.fileId || 0,
                text: data.message,
                disableSignature: data.disableSignature ?? false
              });
              window.parent.postMessage(["commandResponse", {id: data.id, data: {success: true}}], "*");
            } else {
              window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
            }
          } catch (e) {
            window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
          }
          break;

        case 'omniSendPreDefinedMessage':
          // Envia uma mensagem pre definida para um chat aberto
          if (this.status.user?.type !== 2) {
            window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
            return;
          }
          try {
            const chat = this.status.chatsObj[data?.chatId];
            const message = this.status.allPredefinedTexts[data.messageId];
            if (chat && message?.text) {
              this.socket.socket.emit('action', {
                type: 'sendMessage',
                chatId: chat.id,
                fk_file: 0,
                text: message.text,
                disableSignature: data.disableSignature ?? false
              });
              window.parent.postMessage(["commandResponse", {id: data.id, data: {success: true}}], "*");
            } else {
              window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
            }
          } catch (e) {
            window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
          }
          break;

        case 'omniTransferChat':
          // Transfere um chat para um atendente ou fila
          try {
            const chat = this.status.chatsObj[data?.chatId];
            if (chat) {
              this.actions.sendTransferCommand(chat, data.userId || data.distributionFilter);
              window.parent.postMessage(["commandResponse", {id: data.id, data: {success: true}}], "*");
            } else {
              window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
            }
          } catch (e) {
            window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
          }
          break;

        case 'omniWriteMessageToChatTextField':
          // Escreve uma mensagem no campo de texto do chat
          if (this.status.user?.type !== 2) {
            window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
            return;
          }
          try {
            const chat = this.status.chatsObj[data?.chatId];
            if (chat) {
              this.status.chatText[chat?.id] = data.message;
              window.parent.postMessage(["commandResponse", {id: data.id, data: {success: true}}], "*");
            } else {
              window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
            }
          } catch (e) {
            window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
          }
          break;

        case 'omniSetChatMarker':
          // Troca a etiqueta de um chat
          if (this.status.user?.type !== 2) {
            window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
            return;
          }
          try {
            const chat = this.status.chatsObj[data?.chatId];
            if (chat) {
              this.socket.requestMarkerChange(data.markerId, chat.id);
              window.parent.postMessage(["commandResponse", {id: data.id, data: {success: true}}], "*");
            } else {
              window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
            }
          } catch (e) {
            window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
          }
          break;

        case 'omniSetChatProtocol':
          // Aplica um protocolo no chat, caso ele não possua um
          if (this.status.user?.type !== 2) {
            window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
            return;
          }
          try {
            const chat = this.status.chatsObj[data?.chatId];
            if (chat) {
              this.actions.setChatProtocol(chat, data.protocol);
              window.parent.postMessage(["commandResponse", {id: data.id, data: {success: true}}], "*");
            } else {
              window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
            }
          } catch (e) {
            window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
          }
          break;

        case 'omniGetSelectedChat':
          // Retorna o chat selecionado atual
          if (this.status.user?.type !== 2) {
            window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
            return;
          }
          try {
            const chat = this.status.selectedChat;
            if (chat) {
              // chatId: number, queueId: number, clientId: string, beginTime: number, clientNumber: string, clientUsername: string, clientName: string, clientDocument: string, contactId: number
              window.parent.postMessage(["commandResponse", {
                id: data.id,
                data: {
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
                }
              }], "*");
            } else {
              window.parent.postMessage(["commandResponse", {id: data.id, data: null}], "*");
            }
          } catch (e) {
            window.parent.postMessage(["commandResponse", {id: data.id, data: null}], "*");
          }
          break;

        case 'omniSetSelectedChat':
          // Seleciona um chat
          if (this.status.user?.type !== 2) {
            window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
            return;
          }
          try {
            const chat = this.status.chatsObj[data?.chatId];
            if (chat) {
              this.actions.selectChat(chat);
              window.parent.postMessage(["commandResponse", {id: data.id, data: {success: true}}], "*");
            } else {
              window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
            }
          } catch (e) {
            window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
          }
          break;

        case 'omniGetAllChats':
          // Retorna todos os chats atribuídos ao atual
          if (this.status.user?.type !== 2) {
            window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
            return;
          }
          try {
            if (!this.status.chats) {
              return window.parent.postMessage(["commandResponse", {id: data.id, data: null}], "*");
            }
            const result = [];
            for (const chat of this.status.chats) {
              result.push({
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
            window.parent.postMessage(["commandResponse", {id: data.id, data: result}], "*");
          } catch (e) {
            window.parent.postMessage(["commandResponse", {id: data.id, data: null}], "*");
          }
          break;

        case 'omniGetAllQueues':
          // Retorna todos os chats atribuídos ao atual
          if (this.status.user?.type !== 2) {
            window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
            return;
          }
          try {
            const result = [];
            for (const q of this.status.agentQueues) {
              result.push({
                id: q.id,
                name: q.name,
                type: q.type,
                logged: q.logged,
                paused: q.paused
              });
            }
            window.parent.postMessage(["commandResponse", {id: data.id, data: result}], "*");
          } catch (e) {
            window.parent.postMessage(["commandResponse", {id: data.id, data: null}], "*");
          }
          break;

        case 'omniLoginAllQueues':
          // Loga em todas as filas do agente
          if (this.status.user?.type !== 2) {
            window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
            return;
          }
          this.socket.logInAll();
          window.parent.postMessage(["commandResponse", {id: data.id, data: {success: true}}], "*");
          break;

        case 'omniLogoutAllQueues':
          // Desloga de todas as filas do agente
          if (this.status.user?.type !== 2) {
            window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false}}], "*");
            return;
          }
          this.socket.logOutAll();
          window.parent.postMessage(["commandResponse", {id: data.id, data: {success: true}}], "*");
          break;

        case 'omniSaveFile':
          // Salva um arquivo no servidor e retorna o ID
          try {
            const blob = await this.utils.base64toBlob(data.fileData);
            if (blob) {
              const file: FileDef = {
                name: data.fileName,
                mimetype: data.fileMime,
                data: blob
              };
              const id = await this.utils.saveFile(file);
              window.parent.postMessage(["commandResponse", {id: data.id, data: {success: !!id, fileId: id}}], "*");
            } else {
              window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false, fileId: 0}}], "*");
            }
          } catch (e) {
            window.parent.postMessage(["commandResponse", {id: data.id, data: {success: false, fileId: 0}}], "*");
          }
          break;

      }
    });

  }


}

