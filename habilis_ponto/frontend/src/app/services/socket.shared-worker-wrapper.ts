import * as uuid from 'uuid';
import {StatusService} from "./status.service";

export class SharedWorkerSocket {

    private socket;
    private awaitingResponse = {};
    public events = {};
    public broadCastEvents = {};
    private statusService: StatusService;
    private port;

    constructor(private status: StatusService) {

        this.statusService = status;

        if (typeof SharedWorker !== 'undefined') {
            this.socket = new SharedWorker('assets/socket.worker.js', {name: 'Omni Socket'});
        } else {
            // Chrome no Android não suporte SharedWorker, então carrega um worker normal
            console.log('Executando em Chrome Mobile, carregando Worker.');
            this.socket = new Worker('assets/socket.worker.js');
        }

        this.port = this.socket?.port || this.socket;
        const sharedWorker = !!this.socket?.port;

        this.port.addEventListener('message', (messageData: { type: string, data: any }) => {

            const {type, data} = messageData.data;

            if (data?.id && this.awaitingResponse[data?.id]) {
                this.awaitingResponse[data.id].resolve(data);
                delete this.awaitingResponse[data.id];
            }

            if (type === 'socketMessage') {
                const event = data.event;
                const socketMsgData = data.data;
                if (this.events[event]) {
                    Object.keys(this.events[event]).forEach(key => {
                        this.events[event][key](socketMsgData);
                    });
                }
            }

            if (type === 'ping') {
                this.port.postMessage({type: 'pong'});
            }

            if (type === 'log') {
                console.log('Log do Worker:', data);
            }

            if (type === 'getGlobalState') {
                console.log('Recebida solicitação para envio do estado atual dessa aba.');
                const state = {
                    // Retorna todos os dados obtidos pelo allObjects, estado pessoal, chats e filas + allPipelineMaps
                    // porque tem o estado dos pipes já carregados no allOpportunitiesMap, que são carregados sob demanda
                    allOpportunitiesMap: JSON.parse(JSON.stringify(this.statusService.allOpportunitiesMap)),
                    offlineOpportunitiesCache: JSON.parse(JSON.stringify(this.statusService.offlineOpportunitiesCache)),
                    allChatsMap: JSON.parse(JSON.stringify(this.statusService.allChatsMap)),
                    allQueuesMap: JSON.parse(JSON.stringify(this.statusService.allQueuesMap)),
                    allAgentsMap: JSON.parse(JSON.stringify(this.statusService.allAgentsMap)),
                    allLoggedMap: JSON.parse(JSON.stringify(this.statusService.allLoggedMap)),
                    allTasksMap: JSON.parse(JSON.stringify(this.statusService.allTasksMap)),
                    allPipelinesMap: JSON.parse(JSON.stringify(this.statusService.allPipelinesMap)),
                    myStatus: JSON.parse(JSON.stringify(this.statusService.myStatus)),
                    pause: JSON.parse(JSON.stringify(this.statusService.pause)),
                    agentQueuesObj: JSON.parse(JSON.stringify(this.statusService.agentQueuesObj)),
                    queuesObj: JSON.parse(JSON.stringify(this.statusService.queuesObj)),
                    chatsObj: JSON.parse(JSON.stringify(this.statusService.chatsObj)),
                    internalChatsObj: JSON.parse(JSON.stringify(this.statusService.internalChatsObj)),
                    agentsObj: JSON.parse(JSON.stringify(this.statusService.agentsObj))
                };
                this.port.postMessage({type: 'getGlobalStateResponse', data: {state}});
            }

            if (type === 'broadcast') {
                const event = data.event;
                const broadcastMsgData = data.data;
                if (this.broadCastEvents[event]) {
                    Object.keys(this.broadCastEvents[event]).forEach(key => {
                        this.broadCastEvents[event][key](data);
                    });
                }
            }

        });
        if (sharedWorker) {
            this.port.start();
        }
    }

    connect(hostname = '', specialport = false, hostport = '') {
        this.port.postMessage({type: 'connect', data: {hostname, specialport, hostport}});
    }

    isRegistered() {
        return new Promise((resolve, reject) => {
            const id = uuid.v4();
            this.awaitingResponse[id] = {resolve, reject};
            this.port.postMessage({type: 'isRegistered', data: {id}});
        });
    }

    register(data) {
        return new Promise((resolve, reject) => {
            const id = uuid.v4();
            this.awaitingResponse[id] = {resolve, reject};
            this.port.postMessage({type: 'register', data: {id, data}});
        });
    }

    unregister(data) {
        return new Promise((resolve, reject) => {
            const id = uuid.v4();
            this.awaitingResponse[id] = {resolve, reject};
            this.port.postMessage({type: 'unregister', data: {id, data}});
        });
    }

    /**
     * Envia uma mensagem para todas as abas
     * @param data
     */
    broadcast(event, data) {
        this.port.postMessage({type: 'broadcast', data: {event, data}});
    }

    /**
     * Busca o estado de alguma aba já autenticada
     * Caso exista mais de uma aba aberta, e a outra já esteja autenticada, não é necessário puxar o estado do servidor
     * novamente, basta pegar o estado da aba já aberta
     */
    getGlobalState() {
        return new Promise((resolve, reject) => {
            const id = uuid.v4();
            this.awaitingResponse[id] = {resolve, reject};
            this.port.postMessage({type: 'getGlobalState', data: {id}});
        });
    }


    /**
     * Abstração dos eventos do socket
     * @param event
     * @param cb
     */
    on(event, cb) {
        this.events[event] = this.events[event] || {};
        const key = uuid.v4();
        this.events[event][key] = cb;
        return key;
    }

    /**
     * Abstração dos eventos do socket
     * @param event
     * @param cb
     */
    onBroadcast(event, cb) {
        this.broadCastEvents[event] = this.broadCastEvents[event] || {};
        const key = uuid.v4();
        this.broadCastEvents[event][key] = cb;
        return key;
    }

    emit(event, data) {
        this.port.postMessage({type: 'sendToServer', data: {event, data}});
    }

}
