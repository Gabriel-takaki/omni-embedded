importScripts('https://statics.atenderbem.com/js/socket.io.min.js');

let BASE_IP = '';
let BASE_PORT = '';
let SPECIAL_PORT = false;

let registered = false;

function isWorkerContext() {
    return typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
}

function isSharedWorkerContext() {
    return typeof SharedWorkerGlobalScope !== 'undefined' && self instanceof SharedWorkerGlobalScope;
}

function setRegistered(value) {
    registered = value;
    registerResponseReceived = true;
    registerSent = 0;
    if (!value) {
        registerData = null;
        for (const tab of tabs) {
            tab.allObjects = false;
        }
    }
}

// Timestamp do último register já foi enviado, evita que seja enviado novamente por outra aba
let registerSent = 0;
let registerResponseReceived = false;

// Allobjects aguardando retorno, evita que um novo seja enviado antes do retorno do anterior, por outra aba
let waitingObjects = false;
let waitingQueues = false;

let registerData = null;
let socket = null;
let lastSocketId = '';
let lostSocketId = '';
let lostRegisterData = null;

let tabs = [];

class BrowserTabs {

    #tabStatePromise = null;
    #tabStatePromiseReturnObject = null;
    #online = false;
    #worker = false;
    #weakref = false;

    constructor(port, worker = false) {
        this.allObjects = false; // Flag para indicar que a aba já recebeu o allObjects
        this.#weakref = typeof WeakRef !== 'undefined';
        this.#worker = worker;
        this.port = port;
        if (!worker) {
            if (this.#weakref) {
                this.weakRef = new WeakRef(port);
            }
            port.start();
            (this.#weakref ? this.weakRef.deref() : this.port)?.addEventListener('message', (msg) => {
                this.handleMessage(msg);
            });
        } else {
            addEventListener('message', (msg) => {
                this.handleMessage(msg);
            });
        }
        this.pingTimer();
    }

    handleMessage(msg) {
        // Trata o retorno do estado atual da aba
        if (msg.data.type === 'getGlobalStateResponse' && this.#tabStatePromiseReturnObject) {
            const resolve = this.#tabStatePromiseReturnObject.resolve;
            this.#tabStatePromise = null;
            this.#tabStatePromiseReturnObject = null;
            return resolve(msg.data.data.state);
        }
        if (msg.data.type === 'pong') {
            this.#online = Date.now();
        }
    }

    /**
     * O gerenciamento de memória pode levar um tempo até remover a referência da aba da memória
     * assim, é necessário um ping / pong para determinar com mais precisão se a aba ainda está ativa
     */
    pingTimer() {
        setTimeout(() => {
            this.postMessage({type: 'ping'});
            this.pingTimer();
        }, 500);
    }

    isAlive() {
        // Se a referência da aba já foi perdida, ou se a aba não responde ao ping há mais de 2 segundos, ela é considerada morta
        return ((!this.#worker && !!this.weakRef?.deref()) || (this.#worker) || (!this.#weakref && this.port)) && this.#online && Date.now() - this.#online < 2000;
    }

    postMessage(message) {
        if (this.#worker) {
            postMessage(message);
        } else {
            (this.#weakref ? this.weakRef.deref() : this.port)?.postMessage(message);
        }
    }

    addEventListener(event, handler) {
        if (this.#worker) {
            addEventListener(event, handler);
        } else {
            (this.#weakref ? this.weakRef.deref() : this.port)?.addEventListener(event, handler);
        }
    }

    removeEventListener(event, handler) {
        if (this.#worker) {
            removeEventListener(event, handler);
        } else {
            (this.#weakref ? this.weakRef.deref() : this.port)?.removeEventListener(event, handler);
        }
    }

    /**
     * Solicita a aba que envie o seu estado atual do StatusService
     * @returns {null}
     */
    getTabState() {
        if (!this.#tabStatePromise) {
            this.#tabStatePromise = new Promise((resolve, reject) => {
                this.#tabStatePromiseReturnObject = {resolve, reject};
                this.postMessage({type: 'getGlobalState'});
            });
        }
        return this.#tabStatePromise;
    }

    /**
     * Envia um evento para a aba, como se fosse um evento do socket
     * @param event
     * @param data
     */
    socketEvent(event, data = {}) {
        this.postMessage({type: 'socketMessage', data: {event, data}});
    }

    close() {
        if (!this.#worker) {
            (this.#weakref ? this.weakRef.deref() : this.port)?.close();
        }
    }

}

function handleTabRequests(tab) {

    tab.addEventListener('message', async (eventData) => {

        // this.log('Evento recebido: ' + eventData.data.type);

        const {type, data} = eventData.data;

        switch (type) {

            case 'isRegistered':
                return tab.postMessage({type, data: {id: data.id, registered}});

            case 'getGlobalState':
                for (const t of tabs) {
                    if (t.allObjects && t !== tab && t.isAlive()) {
                        const state = await t.getTabState();
                        if (state) {
                            tab.allObjects = true;
                        }
                        return tab.postMessage({type: "getGlobalStateResponse", data: {id: data.id, state}});
                    }
                }
                return tab.postMessage({type: "getGlobalStateResponse", data: {id: data.id, state: false}});

            case 'register':
                // Só envia um register a cada 1 segundo, evita que várias abas enviem ao mesmo tempo em caso de reconexão
                if (!registered && Date.now() - registerSent > 1000) {
                    registerData = data.data;
                    registerSent = Date.now();
                    socket.emit('register', registerData);
                    log('Register enviado.');
                    return tab.postMessage({type, data: {id: data.id}});
                } else if (!registered && Date.now() - registerSent <= 1000) {
                    log('Register já enviado recentemente. Ignorando novo pedido.');
                }
                break;

            case 'unregister':
                if (registered) {
                    socket.emit('unregister', data.data);
                }
                log('Unregister enviado.');
                setRegistered(false);
                socketEvent('unregister');
                break;

            case 'broadcast':
                for (const tab of tabs) {
                    tab.postMessage({type, data});
                }
                break;

            case 'sendToServer':
                if (socket?.connected) {
                    // Os controles abaixo evitam que um novo pedido seja enviado antes do retorno do anterior, já que o retorno vale para todas as abas
                    if (data.event === 'globalQuery' && data.data.type === 'allObjects') {
                        if (waitingObjects) {
                            log('Allobjects enviado ainda aguardando retorno. Ignorando novo pedido.');
                            return;
                        }
                        log('Enviando allobjects.');
                        waitingObjects = true;
                    }
                    if (data.event === 'query' && data.data.type === 'agentQueues') {
                        if (waitingQueues) {
                            log('agentQueues enviado ainda aguardando retorno. Ignorando novo pedido.');
                            return;
                        }
                        log('Enviando agentQueues.');
                        waitingQueues = true;
                    }
                    socket.emit(data.event, data.data);
                }
                break;

            case 'connect':
                // Toda vez que uma aba é inicializada, ela envia o evento de connect com o hostname da aba
                if (!BASE_IP && !socket?.connected) {
                    // Quando for a primeira aba, o BASE_IP ainda estará em branco, então é necessário inicializar o socket
                    BASE_IP = data.hostname;
                    BASE_PORT = data.hostport?.toString() || '';
                    SPECIAL_PORT = data.specialport;
                    initializeSocket();
                    tab.socketEvent('connect');
                } else if (socket?.connected) {
                    // Se já está inicializado e o socket já está conectado, somente envia o evento de conectado
                    tab.socketEvent('connect');
                }
                break;

            default:
                break;

        }

    });
}

function log(message) {
    // Loga a data e hora + o prefixo [WORKER] e a mensagem
    const finalMsg = `[${new Date()}] [WORKER] - ${message}`;
    console.log(finalMsg);
    for (const tab of tabs) {
        tab.postMessage({type: 'log', data: finalMsg});
    }
}

/**
 * Conecta ao socket do servidor
 * @returns {*}
 */
function initializeSocket() {

    if (socket) {
        try {
            socket.close();
            socket = null;
        } catch (e) {
            console.log(e);
        }
    }

    log('Inicializando socket.');

    socket = io(`${BASE_IP}:${BASE_PORT === '4201' ? 2054 : (SPECIAL_PORT ? 443 : 2053)}/`, {
        reconnectionDelay: 1000,
        reconnectionAttempts: 30,
        reconnectionDelayMax: 2000,
        timeout: 20000,
        transports: ["websocket", "polling"]
    });

    registerSocketEventsHandler();

}

/**
 * Envia um evento do socket para todas as abas
 * @param event
 * @param data
 */
function socketEvent(event, data = {}) {
    for (const tab of tabs) {
        tab.socketEvent(event, data);
    }
}

function ackEventId(data) {
    if (data?.eId) {
        socket?.emit('ackE', data.eId);
        delete data.eId;
    }
}

function registerSocketEventsHandler() {

    if (!socket) {
        log('Socket não inicializado.');
        return;
    }

    log('Registrando handler de eventos.');

    socket.on("connect", () => {
        lastSocketId = socket?.id?.toString() || '';
        log('Conectado com sucesso. Recovered: ' + socket.recovered);
        registerResponseReceived = socket.recovered;
        socketEvent('connect', {recovered: socket.recovered});
    });

    socket.on("fullReRegister", () => {
        log('Recebida solicitação de um fullReRegister.');
        socketEvent('fullReRegister');
    });

    socket.on('registerResponse', (data) => {

        log('Recebido socket response.');
        ackEventId(data);

        if (data.status === 200) {
            setRegistered(true);
        } else {
            setRegistered(false);
            log('Falha na autenticação do socket');
        }
        socketEvent('registerResponse', data);

    });

    socket.on('alreadyRegistered', (data) => {

        log('Recebido alreadyRegistered.');
        ackEventId(data);
        setRegistered(true);
        socketEvent('alreadyRegistered', data);

    });

    // Ordem do servidor para deslogar
    socket.on('logout', (data) => {
        ackEventId(data);
        registerResponseReceived = false;
        socketEvent('logout', data);
    });

    socket.on('disconnect', (reason) => {
        log(lastSocketId + ' - Socket desconectado. Motivo: ' + reason);
        if (registered) {
            lostSocketId = lastSocketId;
            lostRegisterData = registerData;
        }
        setRegistered(false);
        socketEvent('disconnect', {reason, socketId: lastSocketId, registerResponseReceived});
    });

    socket.on('connect_timeout', () => {
        setRegistered(false);
        log('Timeout na conexão.');
        socketEvent('connect_timeout');
    });

    socket.io.on("reconnect_attempt", (attempt) => {
        log('Tentando se reconectar. Tentativa ' + attempt);
    });

    socket.io.on("reconnect", (attempt) => {
        log('Reconectado com sucesso.');
        socketEvent('reconnect', attempt);
    });

    socket.io.on('reconnect_failed', () => {
        socketEvent('reconnect_failed');
        initializeSocket();
        log('Reconexão falhou.');
    });


    socket.on("reregister", () => {

        log('Servidor solicitou re registro do socket, possui dados: ' + !!registerData);

        if (registerData && registered) {
            socket.emit('register', registerData);
        }

    });

    // Evento com os dados de contato vinculados a uma chamada
    socket.on('callContact', (data) => {
        ackEventId(data);
        socketEvent('callContact', data);
    });

    // Evento informando que uma solicitação foi concluída
    socket.on('jobDone', (data) => {
        ackEventId(data);
        socketEvent('jobDone', data);
    });

    // Evento solicitando a exibição de uma notificação snack
    socket.on('showSnack', (data) => {
        ackEventId(data);
        socketEvent('showSnack', data);
    });

    // Evento recebido sempre que essa conexão é a única para o usuário registrado no servidor
    // Usada para controlar a inicialização da telefonia e monitoramento
    socket.on('singleConnection', (data) => {
        ackEventId(data);
        socketEvent('singleConnection', data);
    });

    socket.on('multipleConnections', (data) => {
        ackEventId(data);
        socketEvent('multipleConnections', data);
    });

    // Evento de resposta a uma query, substitui todos os elementos da memória pela resposta
    socket.on('response', (data) => {
        ackEventId(data);
        socketEvent('response', data);
    });

    // Evento para exibir formulário de coleta de dados para o agente
    socket.on('showForm', (data) => {
        ackEventId(data);
        socketEvent('showForm', data);
    });

    // Sinalização de que das etiquetas foram atualizadas
    socket.on('updateContactAndFaqTags', (data) => {
        ackEventId(data);
        socketEvent('updateContactAndFaqTags', data);
    });

    // Evento emitido quando não há nenhuma oportunidade disponível para um pipeline
    socket.on('noOpportunitiesFound', (data) => {
        socketEvent('noOpportunitiesFound', data);
    });

    socket.on('object', (data) => {
        ackEventId(data);
        socketEvent('object', data);
    });

    socket.on('updateQueueData', (data) => {
        ackEventId(data);
        socketEvent('updateQueueData', data);
    });

    socket.on('allObjects', (data) => {
        ackEventId(data);
        if (waitingObjects) {
            for (const tab of tabs) {
                tab.allObjects = true;
            }
        }
        waitingObjects = false;
        log('Retorno do allObjects recebido.');
        socketEvent('allObjects', data);
    });

    socket.on('addNotification', (data) => {
        ackEventId(data);
        socketEvent('addNotification', data);
    });

    socket.on('removeNotification', (data) => {
        ackEventId(data);
        socketEvent('removeNotification', data);
    });

    socket.on('addObjectItem', (data) => {
        ackEventId(data);
        socketEvent('addObjectItem', data);
    });

    socket.on('updateObjectItem', (data) => {
        ackEventId(data);
        socketEvent('updateObjectItem', data);
    });

    socket.on('removeObjectItem', (data) => {
        ackEventId(data);
        socketEvent('removeObjectItem', data);
    });

    socket.on('instancesList', (data) => {
        ackEventId(data);
        socketEvent('instancesList', data);
    });

    socket.on('updateInstance', (data) => {
        ackEventId(data);
        socketEvent('updateInstance', data);
    });

    // Evento para atualizar um objeto na memória
    socket.on('update', (data) => {
        ackEventId(data);
        socketEvent('update', data);
    });

    // Recebido quando há um novo evento de Live Session View
    socket.on('liveViewData', (data) => {
        socketEvent('liveViewData', data);
    });

    socket.on('append', (data) => {
        ackEventId(data);
        socketEvent('append', data);
    });

    socket.on('appendMsg', (data) => {
        ackEventId(data);
        socketEvent('appendMsg', data);
    });

    // Evento para adicionar um objeto na memória
    socket.on('add', (data) => {
        ackEventId(data);
        socketEvent('add', data);
    });

    socket.on('addQueues', (data) => {
        ackEventId(data);
        waitingQueues = false;
        socketEvent('addQueues', data);
    });

    socket.on('removeQueue', (data) => {
        ackEventId(data);
        socketEvent('removeQueue', data);
    });

    socket.on('updateQueue', (data) => {
        ackEventId(data);
        socketEvent('updateQueue', data);
    });

    socket.on('chatOrderChanged', (data) => {
        ackEventId(data);
        socketEvent('chatOrderChanged', data);
    });

    socket.on('pullIncludesOnWaitingListChanged', (data) => {
        ackEventId(data);
        socketEvent('pullIncludesOnWaitingListChanged', data);
    });

    socket.on('notifyMessagesChanged', (data) => {
        ackEventId(data);
        socketEvent('notifyMessagesChanged', data);
    });

    // Adiciona um novo chat ao usuário
    socket.on('requery', (data) => {
        socketEvent('requery', data);
    });

    // Adiciona um novo chat ao usuário
    socket.on('addChat', (data) => {
        ackEventId(data);
        socketEvent('addChat', data);
    });

    // Adiciona um novo chat ao usuário
    socket.on('addInternalChat', (data) => {
        ackEventId(data);
        socketEvent('addInternalChat', data);
    });

    // Remove um chat do usuário
    socket.on('removeChat', (data) => {
        ackEventId(data);
        socketEvent('removeChat', data);
    });

    // Adiciona uma nova mensagem ao chat do usuário
    socket.on('addMsgs', (data) => {
        ackEventId(data);
        socketEvent('addMsgs', data);
    });

    // Adiciona uma nova mensagem ao chat do usuário
    socket.on('addInternalMsg', (data) => {
        ackEventId(data);
        socketEvent('addInternalMsg', data);
    });

    // Remove um chat interno
    socket.on('removeInternalChat', (data) => {
        ackEventId(data);
        socketEvent('removeInternalChat', data);
    });

    // Adiciona uma nova mensagem ao chat do usuário
    socket.on('addOldMsgs', (data) => {
        ackEventId(data);
        socketEvent('addOldMsgs', data);
    });

    // Atualiza o status da mensagem no chat do usuário
    socket.on('updateMsg', (data) => {
        ackEventId(data);
        socketEvent('updateMsg', data);
    });

    // Atualiza o status da mensagem no chat do usuário
    socket.on('updateInternalMsg', (data) => {
        ackEventId(data);
        socketEvent('updateInternalMsg', data);
    });

    // Atualiza o status da mensagem no chat do usuário
    socket.on('updateInternalChatStatus', (data) => {
        ackEventId(data);
        socketEvent('updateInternalChatStatus', data);
    });

    // Evento para remover um objeto da memória
    socket.on('remove', (data) => {
        ackEventId(data);
        socketEvent('remove', data);
    });

    socket.on('actionResponse', (data) => {
        ackEventId(data);
        socketEvent('actionResponse', data);
    });

    socket.on('notification', (data) => {
        ackEventId(data);
        socketEvent('notification', data);
    });

    socket.on('notificationWithAction', (data) => {
        ackEventId(data);
        socketEvent('notificationWithAction', data);
    });

    socket.on('instanceCreationUpdate', (data) => {
        ackEventId(data);
        socketEvent('instanceCreationUpdate', data);
    });

}

async function initialize() {
    log('Inicializando worker.');
    if (isSharedWorkerContext()) {
        console.log('Executando dentro de um SharedWorker.');
        // Toda vez que uma aba se conectar, ela será adiciona a lista de abas com o sistema aberto
        addEventListener('connect', (event) => {
            console.log('Nova aba conectada.');
            const tab = new BrowserTabs(event.ports[0]);
            handleTabRequests(tab);
            tabs.push(tab);
        });
    } else if (isWorkerContext()) {
        console.log('Executando dentro de um Worker. Só haverá uma aba.');
        // Chrome no mobile não suporte SharedWorker, então é necessário estar
        // preparado para executar em um Worker
        const tab = new BrowserTabs(this, true);
        handleTabRequests(tab);
        tabs.push(tab);
    } else {
        console.log('Executando no contexto principal.');
    }
}

initialize();
// Processar localmente os eventos de atualização dos objetos e repassar a todas as abas para processamento local
// Ter uma função para entregar o estado do worker, com todos os objetos, para a aba solicitante
// Enviar sinalização de conexão perdida para todas as abas
// Enviar sinalização de conexão estabelecida para todas as abas
// Broker de eventos de atualização para que as demais abas atualizem certos objetos que ficam em localstorage (contatos, ações, etc..)
