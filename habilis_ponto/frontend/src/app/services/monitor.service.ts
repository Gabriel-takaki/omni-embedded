/**
 * Created by filipe on 08/10/16.
 */

import {Injectable} from "@angular/core";
import {BASE_URL} from "../app.consts";
import {HttpClient} from "@angular/common/http";
import {SocketService} from "./socket.service";
import {StatusService} from "./status.service";
import {io} from 'socket.io-client';
import {EventsService} from "./events.service";

@Injectable({providedIn: 'root'})
export class MonitorService {

  private _localServiceAvailable = false;
  agentVersion = {
    major: 0,
    minor: 0,
    patch: 0
  };
  private agentCheckFails = 0;

  private lastEvent = {
    pId: 0,
    tId: 0,
    title: '',
    userIdle: false
  };

  private URL = "ws://127.0.0.1:8656";
  private socket = io(this.URL, {autoConnect: false});

  get localServiceAvailable() {
    return this._localServiceAvailable;
  }

  set localServiceAvailable(v) {

    if (v !== this._localServiceAvailable) {
      console.log('O agente local está ' + (v ? "disponível" : "indisponível"));
      this._localServiceAvailable = v;
        this.socketService.updateLocalServiceStatus(v);
    }

  }

  constructor(private http: HttpClient, private socketService: SocketService, private status: StatusService,
              private eventsService: EventsService) {

    // Evento quanto a conexão com o agente local é perdida ou encerrada
    this.socket.on('disconnect', () => {
      this.localServiceAvailable = false;
      // Tenta se reconectar em 1 segundo
      setTimeout(() => {
        this.connect();
      }, 1000);
    });

    // Evento quanto a conexão com o agente local é perdida ou encerrada
    this.socket.on('connect_error', () => {
      this.localServiceAvailable = false;
      // Tenta se reconectar em 1 segundo
      setTimeout(() => {
        this.connect();
      }, 1000);
    });

    // Evento disparado quando a conexão com o agente local é estabelecida, anterior ao registro
    this.socket.on('connect', () => {
      // Solicita o challenge para registro
      this.send('challenge');
    });

    // Evento com o challenge que deve ser assinado para registro
    this.socket.on('challenge', async (data) => {
      console.log('Challenge recebido. Solicitando assinatura.');
      try {
        // Assina o challenge e tenta o registro
        const signedData = await this.signChallenge(data.challenge);
        signedData.maxWidth = this.status.screenshotMaxWidth;
        this.send('register', signedData);
      } catch (e) {
        setTimeout(() => {
          console.log('Requisição de assinatura do challenge falhou. Solicitando novo challenge em 30 segundos.');
          this.send('challenge');
        }, 30000);
      }
    });

    // Evento para falha na solicitação de registro
    this.socket.on('failed', (data) => {
      console.log('Erro ao se autenticar no agente local. Tentando novamente em alguns segundos.');
      setTimeout(() => {
        this.send('challenge');
      }, 10000);
    });

    // Evento para registro realizado com sucesso
    this.socket.on('success', (data) => {
      console.log('Autenticado com sucesso no agente local.');
      this.localServiceAvailable = true;
    });

    // Evento de mudança de software em uso no cliente
    this.socket.on('monitorChange', (data) => {
      this.registerUseDataOnServer(data);
    });

    // Essa aba não era a principal e se tornou
    this.eventsService.on('isMainTab', () => {
      this.connect();
    });

  }

  /**
   * Envia o evento de uso para o servidor
   * @param data
   */
  registerUseDataOnServer(data) {

    if ((data.idle && !this.lastEvent.userIdle) || (!data.idle && this.lastEvent.userIdle)
      || (data.process.id !== this.lastEvent.pId) || (data.process.tId !== this.lastEvent.tId)
      || (data.window.title !== this.lastEvent.title)) {
      this.lastEvent.userIdle = data.idle;
      this.lastEvent.tId = data.process.tId;
      this.lastEvent.pId = data.process.id;
      this.lastEvent.title = data.window.title;
      this.http.post(BASE_URL + '/tasks/registerLocalAgentEvent', {
        ...data
      }, { observe: "response"}).subscribe(r => {
      }, err => {
      });
    }

  }

  /**
   * Solicita ao servidor a assinatura do challenge recebido pelo agente
   * @param challenge
   */
  signChallenge(challenge): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(BASE_URL + '/tasks/signRegisterRequest', {
        challenge
      }, { observe: "response"}).subscribe(r => {
        resolve(r.body);
      }, err => {
        reject(err);
      });
    });
  }

  /**
   * Envia um evento pelo socket de comunicação com o agente local
   * @param event
   * @param data
   */
  send(event, data = null) {
    if (this.socket.connected) {
      this.socket.emit(event, data);
    }
  }

  /**
   * Inicia conexão com o agente local
   */
  connect() {
    if (!this.socket.connected && this.status.user && this.status.taskManagerEnabled && this.status.user.tasksenabled &&
      this.status.user.tasksmonitor && this.status.isMainTab) {
      console.log('Tentando se conectar ao agente local.');
      this.socket.connect();
    }
  }

  /**
   * Desconecta do agente local
   */
  disconnect() {
    console.log('Desconectando-se do agente local.');
    this.socket.disconnect();
  }

  checkAgent() {
    return new Promise((resolve, reject) => {
      this.http.get(`http://127.0.0.1:8655/agentCheck`)
        .toPromise()
        .then((res: any) => {
          this.agentCheckFails = 0;
          this.localServiceAvailable = true;
          this.agentVersion = res.version;
        })
        .catch(err => {
          this.agentCheckFails++;
          if (this.agentCheckFails >= 3) {
            this.localServiceAvailable = false;
          }
        });
    });
  }

  /**
   * Limpa o estado da classe
   */
  clearState() {
    this.disconnect();
    this.localServiceAvailable = false;
    this.agentCheckFails = 0;
    this.lastEvent = {
      pId: 0,
      tId: 0,
      title: '',
      userIdle: false
    };
  }

}
