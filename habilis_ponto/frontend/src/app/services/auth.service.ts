/**
 * Created by filipe on 17/09/16.
 */

import {Injectable} from "@angular/core";
import {BASE_URL, agentType} from "../app.consts";
import {HttpClient} from "@angular/common/http";
import {StatusService} from "./status.service";
import {SocketService} from "./socket.service";
import {Router} from "@angular/router";
import {NotificationsService} from "angular2-notifications";
import {MonitorService} from "./monitor.service";
import {ProtobufService} from "./protobuf.service";
import {MatDialog} from "@angular/material/dialog";
import {AlertDialogComponent} from "../reusable/alert-dialog.component";
import {EventsService} from "./events.service";
import {WarningDialogComponent} from "../reusable/warning-dialog.component";

@Injectable({providedIn: 'root'})
export class AuthService {

  private loginUrl = BASE_URL + '/login';
  private loggedUrl = BASE_URL + '/logged';

  _jwtToken = '';

  get jwtToken(): string {
    // Se a variável da memória estiver limpa, busca no localStorage algum token salvo.
    if (!this._jwtToken) {
      const localStorageToken = window.localStorage.getItem('jwtToken');
      if (localStorageToken) {
        this._jwtToken = localStorageToken;
      }
    }
    return this._jwtToken;
  }

  set jwtToken(value: string) {
    this._jwtToken = value;
    window.localStorage.setItem('jwtToken', this._jwtToken);
  }

  constructor(private http: HttpClient, private status: StatusService, private s: SocketService, private router: Router,
              private notifications: NotificationsService, private monitor: MonitorService, private dialog: MatDialog,
               private protobuf: ProtobufService, private events: EventsService) {

    s.logoutEvent.subscribe(r => {
      this.logout(false, r);
    });

    s.isLoggedEvent.subscribe(async (r) => {
      const isLogged = await this.isLogged();
      if (isLogged) {
        // @ts-ignore
        this.router.navigate([agentType.agent, agentType.mobile].includes(isLogged.type) ? ['/base', 'agentdashboard'] : ['/base', 'clockindashboard']);
      }
    });

  }

  async setStatusServiceConfig(resp) {
  

    await this.protobuf.load();

    this.status.user = resp.user;
    this.status.config = resp.config;

    setTimeout(() => {
      // @ts-ignore
      const userBack = window.Userback;
      if (userBack && this.status.user) {
        userBack.setData({
          account_id: this.status.user.id,
          user_type: this.status.user.type,
          instance_name: window.location.origin,
          name: this.status.user.fullname,
          version: this.status.version
        });
      }
    }, 3000);

    if ([0, 1, 98, 99].includes(this.status.user.type) && !resp.sweepNotificationShown &&
      this.status.config?.markforsweep) {
      // Marcado para limpeza e ainda não notificado

      this.dialog.open(AlertDialogComponent, {
        data: {
          noButtonText: $localize`Fechar`,
          text: $localize`A cota de armazenamento foi excedida e uma limpeza automática foi agendada para ${this.status.config?.cutdate}.
          Nesta data, atendimentos antigos serão apagados e não poderão ser recuperados. Se você deseja manter estes atendimentos é possível fazer um backup local em Configurações -> Geral.`,
          title: $localize`Exclusão de dados`
        }
      }).afterClosed().subscribe(r => {
        if (this.s.socket && this.s.socket.connected) {
          this.s.sweepNotificationShown();
        }
      });

    }

    if (resp.hasInstancesWithDefaultPassword && resp.enableManagerPanel && (this.status.user.partnerpanelaccess || this.status.user.masteruser)) {

      this.dialog.open(WarningDialogComponent, {
        data: {
          noButtonText: $localize`Fechar`,
          text: $localize`Existem instâncias cuja senha padrão para o usuário admin ainda não foi alterada. Isso representa um risco de segurança severo para o cliente e para nossa infraestrutura. Por favor, altere a senha padrão para o usuário admin destas instâncias o mais breve possível.`,
          title: $localize`Exclusão de dados`
        }
      });

    }

    // Carrega as preferências locais do usuário
    this.status.loadConfig();

    this.status.adminDefaultPassword = resp.adminDefaultPassword || false;
    this.status.notificationQueueId = resp.notificationQueueId;
    this.status.contactAutomationQueueId = resp.contactAutomationQueueId;
    this.status.mineExtenNumber = resp.mineExtenNumber;
    this.status.enableAI = resp.enableAI;
    this.status.enableAIPremium = resp.enableAIPremium;
    this.status.openAiKey = resp.openAiKey;
    this.status.googleAiStudioKey = resp.googleAiStudioKey;
    this.status.deepInfraKey = resp.deepInfraKey;
    this.status.awsBedRockKey = resp.awsBedRockKey;
    this.status.enablePremiumTicket = resp.enablePremiumTicket;
    this.status.notifications = resp.notifications || [];
    if (this.status.mineExtenNumber) {
      this.status.getExten = false;
    }
    this.status.quoteAuthor = resp.quoteAuthor;
    this.status.quoteMessage = resp.quoteMessage;
    this.status.encryptKey = resp.externalEncryptKey;
    this.status.generateGreetingsMessage();
    this.status.showBugReport = resp.showBugReport;
    this.status.altwssphoneregister = resp.altwssphoneregister;
    this.status.asteriskWssHost = resp.asteriskWssHost;
    this.status.disableCRM = resp.disableCRM;
    this.status.asteriskWssPort = resp.asteriskWssPort;
    this.status.surveyExtension = resp.surveyExtension;
    this.status.disableTelephony = resp.disableTelephony;
    this.status.webHookTest = resp.webHookTest || false;
    this.status.hideDeletedMessages = resp.hideDeletedMessages;
    this.status.disableAdvancedContacts = resp.disableAdvancedContacts;
    this.status.enableManagerPanel = resp.enableManagerPanel;
    this.status.taskManagerEnabled = resp.enableTaskManager;
    this.status.chatCenterEnabled = resp.enableChatCenter;
    // this.status.headerAlertColor = resp.headerAlertColor || this.status.headerAlertColor;
    // this.status.primaryColor = resp.primaryColor || this.status.primaryColor;
    // this.status.headerColor = resp.headerColor || this.status.headerColor;
    // this.status.headerFontColor = resp.headerFontColor || this.status.headerFontColor;
    // this.status.primaryBgColor = resp.headerAltColor || this.status.primaryBgColor;
    // this.status.secondaryColor = resp.secondaryColor || this.status.secondaryColor;
    this.status.limitIvr = resp.limitIvr;
    this.status.supportChatEnabled = resp.supportChatEnabled;
    this.status.supportChatDomain = resp.supportChatDomain;
    this.status.supportChatQueueId = resp.supportChatQueueId;
    this.status.hideMobileUser = resp.hideMobileUser;
    this.status.hideSupervisorUser = resp.hideSupervisorUser;
    this.status.hideAdminUser = resp.hideAdminUser;
    this.status.hideExternalBotUser = resp.hideExternalBotUser;
    this.status.hideContactImport = resp.hideContactImport;
    this.status.disableInternalChat = resp.disableInternalChat;
    this.status.disableFAQs = resp.disableFAQs;
    this.status.disabledAPI = resp.disabledAPI;
    this.status.disabledQueueTypes = resp.disabledQueueTypes;
    this.status.defaultCountry = resp.defaultCountry;
    this.status.screenshotMaxWidth = resp.screenshotMaxWidth;
    this.status.supportPhone = resp.supportPhone || '';
    this.status.supportMsg = resp.supportMsg || '';
    this.status.serverIp = resp.serverIp || '';
    this.status.gatewayMode = resp.gatewayMode;
    this.status.enableFormulaCerta = resp.enableFormulaCerta;

    this.status.inclockin = resp.inclockin || false;
    this.status.clockinMethod = resp.clockinMethod;
    this.status.clockinenabled = resp.clockinenabled;


    this.status.enableWebChatHTMLRemoteAssistance = resp.enableWebChatHTMLRemoteAssistance || false;
    this.status.enableWebChatDesktopRemoteAssistance = resp.enableWebChatDesktopRemoteAssistance || false;
    this.status.enableWebChatLiveSessionView = resp.enableWebChatLiveSessionView || false;
    this.status.enableWebChatCall = resp.enableWebChatCall || false;

  }

  /**
   * Efetua o login do usuário na API Rest.
   * @param {string} username - Nome do usuário
   * @param {string} password - Senha
   * @param {string} authkey - Chave de autenticação
   * @return {Promise} Retorna promessa. Resolve com parametro true se autenticado com sucesso e com parametro false se houver falha na autenticação. Rejeita se houver falha na requisição.
   */
  login(username, password, authkey = '') {

    return new Promise((resolve, reject) => {

      if (!this.status.user) {
        if (this.status.socketConnected) {
          const user = {
            username,
            ...(password ? {password} : {}),
            ...(authkey ? {authkey} : {})
          };
          this.http.post(this.loginUrl, user)
            .toPromise()
            .then(async (res: any) => {

              if (res.token) {
                this.jwtToken = res.token;
              }
              const result = await this.initializeSystem(res);
              console.log('RESULT', result)
              if (!result) {
                this.logout();
                reject({error: {message: 'notMobile'}});
              }
              resolve({result: true, type: res.user.type});

            }).catch(err => {
            this.monitor.disconnect();
            reject(err);
          });
        } else {
          this.monitor.disconnect();
          reject($localize`Falha ao se conectar ao servidor`);
        }
      } else {
        reject($localize`Já autenticado.`);
      }
    });

  }

  /**
   * Efetua logout do usuário na API Rest
   */
  logout(logout = false, clearJwt = true) {

    if (clearJwt) {
      this.jwtToken = '';
    }

    if (this.s.socket) {
      this.s.unregister(logout);
    }

    this.status.socketAuth = false;
    this.status.user = null;
    this.status.resetStates();
    this.monitor.disconnect();
    this.router.navigate([clearJwt ? '' : '/alreadyLogged']);
    this.events.emit('loggedOut');

  }

  /**
   * Verifica se há usuário logado.
   * @return {Promise} Retorna promessa. Resolve com parametro true se não houver usuário logado e false se não houver. Rejeita se houver falha na comunicação com o servidor.
   */
  isLogged() {

    return new Promise(async (resolve, reject) => {

        if (!this.jwtToken) {
          return resolve(false);
        }
        console.log(this.status.user)
        if (this.jwtToken && this.status.user) {
          return resolve(true);
        }

        // Possui token porém não possui usuário na memória, significa que o token veio do local storage e socket ainda não foi inicializado
        // Faz requisição ao logged para buscar configurações e inicializa sockets
        if (this.jwtToken && !this.status.user) {
          this.http.get(this.loggedUrl).toPromise().then(async (res: any) => {

            const result = await this.initializeSystem(res);
            if (!result) {
              this.logout();
              reject({error: {message: 'notMobile'}});
            }
            resolve({result: true, type: res.user.type});

          }).catch(err => {
            this.logout();
            reject(false);
          });
        }

      }
    );

  }

  async initializeSystem(res) {

    if ([agentType.admin, agentType.supervisor, agentType.super, agentType.superadmin].includes(res.user.type) && this.status.isMobile) {
      console.log('Usuário não permitido em ambiente mobile.');
      return false;
    }

    await this.setStatusServiceConfig(res);
    console.log('passou aqui ')
    if (!this.status.isMobile) {
      this.monitor.connect();
    }

    // USUÁRIO MOBILE SENDO REMOVIDO DO SISTEMA. NÃO É MAIS NECESSÁRIO
    // if ([agentType.admin, agentType.supervisor, agentType.agent, agentType.super, agentType.superadmin].includes(res.user.type) && this.s.socketType === 'mobile') {
    //   await this.s.initializeSocket();
    // } else if ([agentType.mobile].includes(res.user.type) && !this.status.isMobile && this.s.socketType === 'normal') {
    //   await this.s.initializeMobileSocket();
    // }

    console.log('Solicitando registro.');
    this.s.register(this.status.user.id, this.status.user.socketaccess, this.status.user.type);
    this.status.loadContactsExtraFields();
    console.log('Registrado.');

    return true;

  }

  isAdmin() {
    return this.status.adminTypesNoSup.includes(this.status.user?.type);
  }

  isSupervisor() {
    return this.isAdmin() || (this.status.user?.type === 1);
  }

  isOperator() {
    return this.isAdmin() || (this.status.user?.type === 3);
  }

  isAgent(isAdminValid: boolean = false) {
    return (this.isAdmin() && isAdminValid) || (this.status.user?.type === 2 || this.status.user?.type === 4);
  }

  isType(types: number[]) {
    return true;
  }
}
