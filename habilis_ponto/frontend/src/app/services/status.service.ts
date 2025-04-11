/**
 * Created by filipe on 08/10/16.
 */

import {EventEmitter, Injectable, Input} from "@angular/core";
import {BASE_URL, VERSION} from "../app.consts";
import * as _ from 'lodash';
import {NotificationsService} from "angular2-notifications";
import * as moment from 'moment';
import {FormatTimePipe} from "../pipesModule/formattime.pipe";
import {get, set} from 'idb-keyval';
import {HttpClient} from "@angular/common/http";
import {SafeHtml, Title} from "@angular/platform-browser";
import {EventsService} from "./events.service";
import {filesize} from "filesize";
import * as pako from 'pako';
import {HelpService} from "./help.service";
import {
    AgentAutomation, Assistant,
    Chat, Company,
    CustomForm, InformationCard,
    Ivr,
    Opportunity,
    PipeLine,
    PipeStage,
    Product,
    SimpleUser,
    Template,
    UserLoggedData
} from "../definitions";

@Injectable({providedIn: 'root'})
export class StatusService {

    advToolTipElement = '';
    advToolTipHelpData: { img: string, text: SafeHtml | string } = {img: '', text: ''};
    showDetailedTooltip = false;
    showDetailedTooltipTimerRef;

    public ivrHistory = [];
    public version = VERSION;

    public iaQueueTypes = [2, 3, 9, 10, 11, 12, 13, 17, 18, 19, 20];

    public videoMimes = ['video/mp4', 'video/mpg', 'video/mpeg', 'video/webm'];
    public imageMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    public audioMimes = ['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/ogg; codec=opus', 'audio/wav'];
    public spreadSheetsMimes = ['application/vnd.ms-excel', 'application/vnd.oasis.opendocument.spreadsheet', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    public documentsMimes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'application/vnd.oasis.opendocument.spreadsheet'];
    public presentationMimes = ['application/vnd.oasis.opendocument.presentation', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-powerpoint'];
    public compressMimes = ['application/zip'];
    public pdfMimes = ['application/pdf'];

    public docRecordingConfig = {
        title: '',
        description: '',
        type: 0,
        createNewAudio: false,
        includeVideo: false,
        faq_groups: [],
        tags: [],
        blob: null
    }

    public showCards = false;

    public versionUrl = {
        'Contacts': `${BASE_URL}/contacts/getVersion?t=${Date.now()}`,
        'Companys': `${BASE_URL}/companys/getVersion?t=${Date.now()}`,
        'PredefinedTexts': `${BASE_URL}/predefinedtexts/getTextsVersion?t=${Date.now()}`,
        'Gallerys': `${BASE_URL}/predefinedtexts/getGalleryVersion?t=${Date.now()}`,
        'Users': `${BASE_URL}/users/getVersion?t=${Date.now()}`,
        'Tags': `${BASE_URL}/chattags/getVersion?t=${Date.now()}`,
        'Pipelines': `${BASE_URL}/pipelines/getVersion?t=${Date.now()}`,
        'Pipestages': `${BASE_URL}/pipestages/getVersion?t=${Date.now()}`,
        'Forms': `${BASE_URL}/forms/getVersion?t=${Date.now()}`,
        'Origins': `${BASE_URL}/origins/getVersion?t=${Date.now()}`,
        'Ivrs': `${BASE_URL}/ivrs/getVersion?t=${Date.now()}`,
        'Actions': `${BASE_URL}/customactions/getVersion?t=${Date.now()}`,
        'Products': `${BASE_URL}/products/getVersion?t=${Date.now()}`,
        'Assistants': `${BASE_URL}/assistants/getVersion?t=${Date.now()}`,
        'InformationCards': `${BASE_URL}/informationcards/getVersion?t=${Date.now()}`,
    };

    public itemsUrl = {
        'Contacts': `${BASE_URL}/contacts/getContacts?t=${Date.now()}`,
        'Companys': `${BASE_URL}/companys/getItems?t=${Date.now()}`,
        'PredefinedTexts': `${BASE_URL}/predefinedtexts/textItens?t=${Date.now()}`,
        'Gallerys': `${BASE_URL}/predefinedtexts/galleryItens?t=${Date.now()}`,
        'Users': `${BASE_URL}/users/getUsers?t=${Date.now()}`,
        'Tags': `${BASE_URL}/chattags/getChatTags?t=${Date.now()}`,
        'Pipelines': `${BASE_URL}/pipelines/getPipelines?t=${Date.now()}`,
        'Pipestages': `${BASE_URL}/pipestages/getPipestages?t=${Date.now()}`,
        'Forms': `${BASE_URL}/forms/getItems?t=${Date.now()}`,
        'Origins': `${BASE_URL}/origins/getItems?t=${Date.now()}`,
        'Ivrs': `${BASE_URL}/ivrs/getResumedList?t=${Date.now()}`,
        'Actions': `${BASE_URL}/customactions/getItems?t=${Date.now()}`,
        'Products': `${BASE_URL}/products/getItems?compressed=true&t=${Date.now()}`,
        'Assistants': `${BASE_URL}/assistants/getItems?t=${Date.now()}`,
        'InformationCards': `${BASE_URL}/informationcards/getItems?compressed=true&t=${Date.now()}`,
    };

    public openAiKey = false;
    public googleAiStudioKey = false;
    public deepInfraKey = false;
    public awsBedRockKey = false;

    public supervisorIvrsQueried = false;
    public headerColor = '#9400D3';
    public primaryColor = '#9400D3';
    public gradientColor1 = '#9400D3';
    public gradientColor2 = '#9400D3';
    public gradientColor3 = '#9400D3';
    public headerAlertColor = '#FF3C78';
    public primaryBgColor = 'rgba(148, 0, 211,.1)';
    public primaryFgColor = '#9400D3';
    public secondaryColor = '#86F5F1';
    public headerFontColor = '#FFF';
    public chartColors = ["#7f09b6", "#1775b7", "#aedcf2", "#e1206b", "#54c5a4", "#f9b6a7"];

    public crmPermissions = {
        view: false,
        edit: false,
        delete: false,
        win: false,
        lose: false
    };

    public templateQueues = [10, 17, 18, 19]; // Tipos de fila que necessitam enviar template para iniciar o chat
    public canOpenNewChatQueues = [5, 10, 16, 17, 18, 19]; // Tipos de fila que permitem iniciar um novo atendimento ativo
    public waQueues = [5, 9, 10, 17, 18, 19]; // Tipos de fila de Whatsapp

    public enableAI = false;
    public enableAIPremium = false;

    public enablePremiumTicket = false;

    public disableAnimations = false;
    public disableWaveform = false;

    // Sinaliza se a conexão desse navegador com o servidor é única para o usuário autenticado
    // Usado para determinar se a telefonia será ou não inicializada, caso exista mais de um navegador com o mesmo
    // usuário autenticado, supõe-se que a telefonia já foi inicializada em outro navegador
    public singleConnection = false;

    // Indica que este usuário está conectado em mais de um dispositivo diferente
    public multipleConnections = false;

    public encryptKey = '';

    public quoteMessage = '';
    public quoteAuthor = '';
    public greetingMessage = '';
    public formattedTime = '';

    public taskCalls = {};
    public taskChats = {};

    public htmlTemplates = [];
    public htmlTemplatesRef = {};

    public iconPrefix = '';

    public selectedMenu = '';
    public selectedMenuText = '';

    public instances = [];
    public instancesObj = {};

    private loadingAllUsers = false;
    private loadingAllContacts = false;
    private loadingAllPredefinedTexts = false;
    private loadingAllGallerys = false;
    private loadingAllPipelines = false;
    private loadingAllPipestages = false;
    private loadingAllTags = false;
    private loadingAllAssistants = false;

    public allTagsMap = {};
    public allActionsMap = {};
    public allQueuesMap = {};
    public allChatsMap = {};
    public allAssistantsMap: {[id: number]: Assistant} = {};
    public allInformationCardsMap: { [id: number]: InformationCard } = {};
    public allTemplatesMap: { [id: number]: Template } = {};
    public allAgentsMap = {};
    public allUsersMap: { [id: number]: SimpleUser } = {};
    public allLoggedMap: { [id: number]: UserLoggedData } = {};
    public allContactsMap = {};
    public allCompanysMap: { [id: number]: Company } = {};
    public allIvrsMap: { [id: number]: Ivr } = {};
    public allTasksMap = {};
    public allTasksCounter = 0;
    public allPipelinesMap: { [id: number]: PipeLine } = {};
    public allPipestagesMap: { [id: number]: PipeStage } = {};
    public allOpportunitiesMap: { [id: number]: Opportunity } = {};
    public offlineOpportunitiesCache: { [id: number]: Opportunity } = {};
    public allOpportunitiesCounter = 0;
    public allProductsCounter = 0;

    public allTabsCounter = 0;

    public allGallerysMap = {};
    public allPredefinedTextsMap = {};
    public allFormsMap: { [id: number]: CustomForm } = {};

    public allProductsMap: { [id: number]: Product } = {};

    public allAccessGroupsMap = {};

    public allOriginsMap = {};
    public reasons = [];
    public reasonsObj = {};
    public chats: Chat[] = [];
    public chatsObj: { [id: number]: Chat } = {};
    public messageRef = {};
    public selectedChat: Chat;
    public savedSelectedChatId = null;
    public savedSelectedChatIdTime = null;
    public internalSelectedChat;
    public agentQueues = [];
    public agentQueuesObj = {};
    public internalChats = [];
    public internalChatsObj = {};
    public internalMessageRef = {};

    // Contador de eventos envolvendo tarefas, utilizando para forçar atualização do pipe da lista de tarefas
    public tasksEventsCounter = 0;

    public chatText = {
        undefined: '',
        null: ''
    };

    public aiChatControl: {[id: number|string]: {aiModified: boolean, oldText: string}} = {
        undefined: {aiModified: false, oldText: ''},
        null: {aiModified: false, oldText: ''}
    };

    public newInternalMsg = false;

    public _localState = 0;
    public _localStateTimestamp = 0;

    public newChats = false;

    public contacts = [];

    public dialers = [];
    public dialersObj = {};

    public loggedAgents = [];
    public loggedAgentsObj = {};

    public fileData: any = {};

    public _user = null;
    public _pushSub = {};

    public _config;

    public socketAuth = false;
    public socketConnected = false;

    public items = [];
    public filteredAgents = [];
    public orderedExtensions = [];
    public url = [];
    public order = 1;
    public imgSeq = 1;
    public loaded = false;

    public phoneLoaded = false;

    public playBackSpeed = 1;

    public automations: AgentAutomation[] = [];
    public automationsObj: { [id: number]: AgentAutomation } = {};

    public chatsAutomations: AgentAutomation[] = [];
    public chatsAutomationsObj: { [id: number]: AgentAutomation } = {};

    public msgsAutomations: AgentAutomation[] = [];
    public msgsAutomationsObj: { [id: number]: AgentAutomation } = {};

    public audioMsgsAutomations: AgentAutomation[] = [];
    public audioMsgsAutomationsObj: { [id: number]: AgentAutomation } = {};

    public videoMsgsAutomations: AgentAutomation[] = [];
    public videoMsgsAutomationsObj: { [id: number]: AgentAutomation } = {};

    public imageMsgsAutomations: AgentAutomation[] = [];
    public imageMsgsAutomationsObj: { [id: number]: AgentAutomation } = {};

    public pdfMsgsAutomations: AgentAutomation[] = [];
    public pdfMsgsAutomationsObj: { [id: number]: AgentAutomation } = {};

    public textMsgsAutomations: AgentAutomation[] = [];
    public textMsgsAutomationsObj: { [id: number]: AgentAutomation } = {};

    public locationMsgsAutomations: AgentAutomation[] = [];
    public locationMsgsAutomationsObj: { [id: number]: AgentAutomation } = {};

    public infoMsgsAutomations: AgentAutomation[] = [];
    public infoMsgsAutomationsObj: { [id: number]: AgentAutomation } = {};

    public opportunitiesAutomations: AgentAutomation[] = [];
    public opportunitiesAutomationsObj: { [id: number]: AgentAutomation } = {};

    public contactsAutomations: AgentAutomation[] = [];
    public contactsAutomationsObj: { [id: number]: AgentAutomation } = {};

    public pause = {
        paused: false,
        reason: '',
        reasonId: 0,
        beginTime: 0,
        maxTime: 0,
        action: 0,
        pauseTimeCount: 0,
        formattedTime: ''
    };

    public myStatus = {
        userPicVersion: 0,
        userPicAuth: '',
        phoneAvailable: false,
        opStatus: 0,
        ringing: false,
        busy: false,
        incall: false,
        inchat: false,
        available: false,
        callsToday: 0,
        maxChats: 0,
        taskInProgress: 0,
        recallsToday: 0,
        chatsToday: 0,
        surveyGradeToday: 0,
        surveyGradeMonth: 0,
        surveyGradeAllTime: 0,
        surveysToday: 0,
        surveysMonth: 0,
        surveysAllTime: 0,
        loggedTimeCount: 0, // Contagem do tempo em segundos logado em fila no dia de hoje
        pausedTimeCount: 0,
        incallTimeCount: 0,
        inchatTimeCount: 0
    };

    public contactTags = [];
    public contactTagsMap = {};
    public faqTags = [];
    public faqTagsMap = {};
    public taskTags = [];
    public taskTagsMap = {};
    public dealTags = [];
    public dealTagsMap = {};

    public adminTypes = [0, 1, 98, 99];
    public adminTypesNoSup = [0, 98, 99];

    public onChat = false;
    public inCall = false;
    public ringing = false;

    public isMobile = false;
    public isIOS = false;
    public isEmbedded = false;
    public hideLogoutButton = false;
    public hideChangePasswordButton = false;

    public showBugReport = false;
    public disableCRM = false;
    public notificationQueueId = 0;
    public contactAutomationQueueId = 0;
    public asteriskWssHost = '';
    public altwssphoneregister = 0; // Se deve utilizar um método alternativo de registro de telefone
    public asteriskWssPort = 2087;
    public surveyExtension = '';
    public disableTelephony = false;
    public disableAdvancedContacts = false;
    public webHookTest = false;
    public hideDeletedMessages = false;
    public enableManagerPanel = false;
    public taskManagerEnabled = false;
    public chatCenterEnabled = false;
    public disabledQueueTypes = {
        fb: false,
        tg: false,
        wa: false,
        ig: false,
        ol: false,
        we: false,
        in: false,
        em: false,
        gb: false
    };
    public limitIvr = false;
    public hideMobileUser = false;
    public hideSupervisorUser = false;
    public hideAdminUser = false;
    public hideClockInUser = false;
    public hideExternalBotUser = false;
    public hideContactImport = false;
    public disableInternalChat = false;
    public disableFAQs = false;
    public disabledAPI = false;

    public adminDefaultPassword = false;

    public supportChatEnabled = false;
    public supportChatDomain = '';
    public supportChatQueueId = 0;
    public supportChatLoaded = false;
    public supportChatNewMessages = false;

    public supportPhone = '';
    public supportMsg = '';
    public defaultCountry = '';
    public screenshotMaxWidth = 1280;
    public serverIp = '';
    public defaultTitle = '';
    public gatewayMode = false;

    public enableFormulaCerta = false;

    public enableWebChatHTMLRemoteAssistance = false;
    public enableWebChatDesktopRemoteAssistance = false;
    public enableWebChatLiveSessionView = false;
    public enableWebChatCall = false;

    public detailAgent;

    private itemsLoaded = [];

    public now;

    public mineExtenNumber = '';
    public getExten = false;

    public events = new EventEmitter();

    public chatAudio: HTMLAudioElement;
    public messageAudio: HTMLAudioElement;
    public ringingAudio: HTMLAudioElement;

    public socketUnstable = false;
    public recoveryFrom = '';

    public totalQueuesSize = 0;

    public statusInitialized = false;

    // Armazena a instância atual do player do rrweb
    public liveSessionPlayer = null;
    public liveSessionTabId = '';
    public remoteControlRequested = false;
    public remoteControlAccepted = false;
    public remoteControlRejected = false;

    public contactsExtraFields = [];

    public taskElementState = {
        'mine': {
            search: '',
            tags: [],
            filterBy: 0,
            orderBy: 0,
            startTodoDate: null,
            startDoneDate: null,
            endTodoDate: null,
            endDoneDate: null,
            tasks: [],
            userId: 0
        }
    };

    public selectedTask = null;
    public tasksDone = [];

    public agents = []
    public agentsObj = {};

    public showQueues = false;

    public allContactsVersion = -1;
    public allCompanysVersion = -1;
    public allUsersVersion = -1;
    public allTagsVersion = -1;
    public allPipelinesVersion = -1;
    public allPipestagesVersion = -1;
    public allPredefinedTextsVersion = -1;
    public allGallerysVersion = -1;
    public allFormsVersion = -1;
    public allProductsVersion = -1;
    public allOriginsVersion = -1;
    public allIvrsVersion = -1;
    public allAccessGroupsVersion = -1;

    public tasksUserId: number[] = [];
    public showTasks = false;

    public showSystemInfo = false;
    public isVisible = true;
    public showNewMessageTitleAlert = false;
    public showNewChatTitleAlert = false;

    public altDown = false;
    public ctrlDown = false;

    public queues = [];
    public queuesObj = {};

    public ivrs = [];
    public ivrsObj = {};

    public showNotifications = false;
    public notificationsDialogOffset = 0;
    public notifications = [];

    public agentsDashboardOrderBy = 'fullName';
    public chatsDashboardOrderBy = 'clientCompositeName';
    public agentsDashboardOrderByDirection: 'asc' | 'desc' = 'asc';
    public chatsDashboardOrderByDirection: 'asc' | 'desc' = 'asc';

    public emojis = ['🟣', '🟡', '🔵', '⚫', '🟠', '🟤', '⚪', '🟢', '🔴', '⭕', '🟥', '🟨',
        '🔄', '🚫', '💣', '🎁', '✨', '❤️', '🔥', '❓', '❗', '⚠️', '🚩',
        '😊', '🥲', '🙂', '😉', '😀', '😒', '😇', '🥰', '😭',
        '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
        '🤑', '💸', '💵',
        '🖨️', '📄', '🖋️',
        '🤡', '🧸', '⚽',
        '🐱', '🐶', '🐕', '🦴', '🐴',
        '🍇', '🍉', '🥔', '🥕', '🥦',
        '🍞', '🥖', '🍕', '🍔', '🍿', '🍨',
        '👽', '☃️', '🦺'];


    public instanceCreationStatus = {status: 0, msg: '', progress: 0};

    public selectedIvr = null;
    public selectedAssistant: Assistant = null;
    public selectedCard: InformationCard = null;

    public editorLines = {};

    public phoneRegistered = false;

    public clockinMethod = 0
    public clockinenabled = 0
    public inclockin = false


    get allActions(): any[] {
        return Object.values(this.allActionsMap) || [];
    }

    get allQueues(): any[] {
        return _.orderBy(Object.values(this.allQueuesMap) || [], ['order']);
    }

    get allChats(): any[] {
        return Object.values(this.allChatsMap) || [];
    }

    get allAssistants(): Assistant[] {
        return Object.values(this.allAssistantsMap) || [];
    }

    // public allTemplates: Array<any> = [];
    get allTemplates(): Template[] {
        return Object.values(this.allTemplatesMap) || [];
    }

    // public allAgents = [];
    get allAgents(): any[] {
        return Object.values(this.allAgentsMap) || [];
    }

    // public allUsers: SimpleUser[] = [];
    get allUsers(): SimpleUser[] {
        return Object.values(this.allUsersMap) || [];
    }

    // public allLogged: UserLoggedData[] = [];
    get allLogged(): UserLoggedData[] {
        return Object.values(this.allLoggedMap) || [];
    }

    // public allContacts = [];
    get allContacts(): any[] {
        return Object.values(this.allContactsMap) || [];
    }

    // public allContacts = [];
    get allCompanys(): any[] {
        return Object.values(this.allCompanysMap) || [];
    }

    // public allIvrs: Ivr[] = [];
    get allIvrs(): Ivr[] {
        return Object.values(this.allIvrsMap) || [];
    }

    // public allTasks = [];
    get allTasks(): any[] {
        return Object.values(this.allTasksMap) || [];
    }

    get allPipelines(): PipeLine[] {
        return Object.values(this.allPipelinesMap) || [];
    }

    get allPipestages(): PipeStage[] {
        return Object.values(this.allPipestagesMap) || [];
    }

    get allOpportunities(): Opportunity[] {
        return Object.values(this.allOpportunitiesMap) || [];
    }

    get allGallerys(): any[] {
        return Object.values(this.allGallerysMap) || [];
    }

    get allPredefinedTexts(): any[] {
        return Object.values(this.allPredefinedTextsMap) || [];
    }

    get allForms(): CustomForm[] {
        return Object.values(this.allFormsMap) || [];
    }

    get allInformationCards(): InformationCard[] {
        return Object.values(this.allInformationCardsMap) || [];
    }

    get allProducts(): Product[] {
        return Object.values(this.allProductsMap) || [];
    }

    // public allAccessGroups = [];
    get allAccessGroups(): any[] {
        return Object.values(this.allAccessGroupsMap) || [];
    }

    // public allOrigins = [];
    get allOrigins(): any[] {
        return Object.values(this.allOriginsMap) || [];
    }

    get mainTab() {
        return localStorage.getItem('mainTab');
    }

    set mainTab(v) {
        localStorage.setItem('mainTab', v);
    }

    get preMainTab() {
        return localStorage.getItem('preMainTab');
    }

    set preMainTab(v) {
        localStorage.setItem('preMainTab', v);
        this.preMainTabTime = moment().unix();
    }

    get mainTabTime() {
        return Number(localStorage.getItem('mainTabTime') || 0);
    }

    get endChatFavorite() {
        return JSON.parse(localStorage.getItem(`endChatFavoriteUser${this.user.id}`) || '[]');
    }

    set endChatFavorite(v) {
        localStorage.setItem(`endChatFavoriteUser${this.user.id}`, JSON.stringify(v));
    }

    set mainTabTime(v) {
        localStorage.setItem('mainTabTime', v.toString());
    }

    get preMainTabTime() {
        return Number(localStorage.getItem('preMainTabTime') || 0);
    }

    set preMainTabTime(v) {
        localStorage.setItem('preMainTabTime', v.toString());
    }

    /**
     * Gera um tabId único para a sessão do navegador
     * Usamos o tabId para saber se há mais de uma aba aberta, e eleger uma aba como sendo a principal
     * Somente a aba principal inicializa a conexão com o agente local e com a telefonia, por exemplo
     */
    generateTabId() {
        // Se a sessão já possui um tabId, carrega, senão, gera um novo
        // Sessões de abas duplicadas carregam o tabId da primeira aba aberta, por isso, gerimos o estado da aba tabStatus
        // para gerar um novo id quando uma aba foi duplicada
        const tabId = sessionStorage.tabId && sessionStorage.tabStatus !== 'open' ? sessionStorage.tabId : Math.round(Math.random() * 1000000).toString();
        sessionStorage.tabId = tabId;
        sessionStorage.tabStatus = 'open';
        // Carrega o tabId da aba principal
        this.mainTab = this.mainTab || this.tabId;
        if (this.mainTab === this.tabId) {
            // Se essa é a aba principal, adiciona o tempo de checagem de atividade
            this.mainTabTime = moment().unix();
        }
        this.checkMainTabIsAlive();
        window.addEventListener('beforeunload', () => {
            sessionStorage.tabStatus = 'closed';
            if (this.mainTab === this.tabId) {
                this.mainTab = '';
            }
        });
        window.addEventListener('unload', () => {
            sessionStorage.tabStatus = 'closed';
            if (this.mainTab === this.tabId) {
                this.mainTab = '';
            }
        });
        // Inicializa o timer de gestão de abas
        this.tabIdTimer();
    }

    checkMainTabIsAlive() {
        if (this.mainTab !== this.tabId) {
            const tabTime = this.mainTabTime || 0;
            // Se a aba principal já não atualiza o timer há mais de 5 segundos, a aba provavelmente foi fechada
            // Aplica a aba atual no preMainTab
            // O preMainTab é um controle de concorrência para eleger a aba principal
            if (tabTime + 5 < moment().unix()) {
                if (this.preMainTab === this.tabId) {
                    this.mainTab = this.tabId;
                    this.preMainTab = '';
                    this.mainTabTime = moment().unix();
                    this.eventsService.emit('isMainTab');
                } else if (this.preMainTabTime + 2 < moment().unix()) {
                    this.preMainTab = this.tabId;
                }
            }
        }
    }

    loadAutomations() {
        this.clearAutomations();
        this.http.get(BASE_URL + '/ivrs/getAgentAvailableAutomation').subscribe((r: AgentAutomation[]) => {
            this.automations = r;
            for (const a of r) {
                this.automationsObj[a.id] = a;
                if (a.allowagentstart) {
                    this.chatsAutomations.push(a);
                    this.chatsAutomationsObj[a.id] = a;
                }
                if (a.allowmsgexecution) {
                    this.msgsAutomations.push(a);
                    this.msgsAutomationsObj[a.id] = a;
                    if (a.audiomsg || a.allmsgs) {
                        this.audioMsgsAutomations.push(a);
                        this.audioMsgsAutomationsObj[a.id] = a;
                    }
                    if (a.videomsg || a.allmsgs) {
                        this.videoMsgsAutomations.push(a);
                        this.videoMsgsAutomationsObj[a.id] = a;
                    }
                    if (a.imagemsg || a.allmsgs) {
                        this.imageMsgsAutomations.push(a);
                        this.imageMsgsAutomationsObj[a.id] = a;
                    }
                    if (a.pdfmsg || a.allmsgs) {
                        this.pdfMsgsAutomations.push(a);
                        this.pdfMsgsAutomationsObj[a.id] = a;
                    }
                    if (a.locationmsg || a.allmsgs) {
                        this.locationMsgsAutomations.push(a);
                        this.locationMsgsAutomationsObj[a.id] = a;
                    }
                    if (a.textmsg || a.allmsgs) {
                        this.textMsgsAutomations.push(a);
                        this.textMsgsAutomationsObj[a.id] = a;
                    }
                    if (a.informationmsg || a.allmsgs) {
                        this.infoMsgsAutomations.push(a);
                        this.infoMsgsAutomationsObj[a.id] = a;
                    }
                }
                if (a.allowopportunity) {
                    this.opportunitiesAutomations.push(a);
                    this.opportunitiesAutomationsObj[a.id] = a;
                }
                if (a.allowcontactexecution) {
                    this.contactsAutomations.push(a);
                    this.contactsAutomationsObj[a.id] = a;
                }
            }
            this.events.emit('shortcutMenuItemUpdated');
        });
    }

    tabIdTimer() {
        setTimeout(() => {
            if (this.mainTab === this.tabId) {
                this.mainTabTime = moment().unix();
            }
            this.checkMainTabIsAlive();
            this.tabIdTimer();
        }, 1000);
    }

    get tabId() {
        return sessionStorage.tabId;
    }

    get isMainTab() {
        return this.mainTab === this.tabId;
    }

    // public allTags = [];
    get allTags(): any[] {
        return Object.values(this.allTagsMap) || [];
    }

    //
    // get selectedChat() {
    //   return this.chatsObj[this._selectedChat];
    // }
    //
    // set selectedChat(v) {
    //   if (v?.id !== this._selectedChat) {
    //     this._selectedChat = v?.id;
    //     // this.persistData('_selectedChat');
    //   }
    // }
    //
    // get internalSelectedChat() {
    //   return this.internalChatsObj[this._internalSelectedChat];
    // }
    //
    // set internalSelectedChat(v) {
    //   if (v?.id !== this._internalSelectedChat) {
    //     this._internalSelectedChat = v?.id;
    //     // this.persistData('_internalSelectedChat');
    //   }
    // }

    get showShortcuts(): boolean {
        return this.altDown && this.ctrlDown;
    }

    get user(): any {
        return this._user;
    }

    set user(v) {
        this._user = v;
        // this.persistData('_user');
    }

    get config(): any {
        return this._config;
    }

    set config(v) {
        this._config = v;
        // this.persistData('_config');
    }

    get pushSub(): any {
        return this._pushSub;
    }

    set pushSub(v) {
        this._pushSub = v;
        this.persistData('_pushSub');
    }

    get localState() {
        return this._localState;
    }

    set localState(v) {
        if (v !== this._localState) {
            // console.log('Alterando a versão do estado local para ' + v);
            this._localState = v;
            // this.persistData('_localState');
        }
    }

    get localStateTimestamp() {
        return this._localStateTimestamp;
    }

    set localStateTimestamp(v) {
        if (v !== this._localStateTimestamp) {
            this._localStateTimestamp = v;
            // this.persistData('_localStateTimestamp');
        }
    }

    get offLineChatQueues() {
        let ret = false;

        if (this.allQueues?.length) {
            for (const q of this.allQueues) {
                if ([1, 3, 5, 11].includes(q.type) && (q.enabled && !q.socketConnected)) {
                    ret = true;
                }
            }
        }

        // Verifica se há alguma fila habilitada que o socket esteja desconectado
        for (const q of this.agentQueues) {
            if (q.enabled && !q.socketConnected) {
                ret = true;
            }
        }
        return ret;
    }

    get offLineChatQueuesNames() {
        const ret = [];

        if (this.allQueues?.length) {
            for (const q of this.allQueues) {
                if ([1, 3, 5, 11].includes(q.type) && (q.enabled && !q.socketConnected)) {
                    ret.push(q.name);
                }
            }
        }

        // Verifica se há alguma fila habilitada que o socket esteja desconectado
        for (const q of this.agentQueues) {
            if (q.enabled && !q.socketConnected) {
                ret.push(q.name);
            }
        }
        return ret;
    }

    get phoneDisconnectedChatQueues() {
        let ret = false;
        if (this.allQueues) {
            for (const q of this.allQueues) {
                if (q.type === 1 && (q.enabled && !q.phoneConnected)) {
                    ret = true;
                }
            }
        }
        if (this.agentQueues) {
            // Verifica se há alguma fila habilitada que o telefone esteja desconectado
            for (const q of this.agentQueues) {
                if (q.enabled && !q.phoneConnected) {
                    ret = true;
                }
            }
        }
        return ret;
    }

    get phoneDisconnectedChatQueuesNames() {
        const ret = [];
        for (const q of this.allQueues) {
            if (q.type === 1 && (q.enabled && !q.phoneConnected)) {
                ret.push(q.name);
            }
        }
        // Verifica se há alguma fila habilitada que o telefone esteja desconectado
        for (const q of this.agentQueues) {
            if (q.enabled && !q.phoneConnected) {
                ret.push(q.name);
            }
        }
        return ret;
    }

    get agentLoggedQueues() {
        const loggedQueues = _.filter(this.agentQueues, {logged: true});
        return loggedQueues.length;
    }

    set offLineChatQueues(n) {

    }

    constructor(private notification: NotificationsService, private http: HttpClient, private formatTime: FormatTimePipe,
                private titleService: Title, private eventsService: EventsService, private helpService: HelpService) {

        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(navigator.userAgent)
            || window.document.body.offsetWidth < 500) {
            this.isMobile = true;
        }

        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            this.isIOS = true;
        }

        this.timer();
        this.titleTimer();

        this.url['agents'] = BASE_URL + '/users/';
        this.url['queues'] = BASE_URL + '/queues/';
        this.url['reasons'] = BASE_URL + '/reasons/';
        this.url['abandonadas'] = BASE_URL + '/abandonadas/';
        this.url['usersqueues'] = BASE_URL + '/usersqueues/';
        this.url['contacts'] = BASE_URL + '/contacts/';
        this.url['cdr'] = BASE_URL + '/cdr/';
        this.url['config'] = BASE_URL + '/config/';

        this.items['agents'] = [];
        this.items['queues'] = [];
        this.items['reasons'] = [];
        this.items['usersqueues'] = [];
        this.items['contacts'] = [];

        this.itemsLoaded['agents'] = false;
        this.itemsLoaded['pbxs'] = false;
        this.itemsLoaded['queues'] = false;
        this.itemsLoaded['reasons'] = false;
        this.itemsLoaded['contacts'] = false;

        if (!("Notification" in window)) {
            console.log('O navegador não suporta notificações');
        } else if (Notification.permission !== 'granted') {
            Notification.requestPermission(function (permission) {
            });
        }

        this.statusInitialized = true;

    }

    showAdvancedTooltip(area = '', helpRef = '', time = 500) {
        if (this.showDetailedTooltipTimerRef) {
            clearTimeout(this.showDetailedTooltipTimerRef);
        }
        // Se não possui o # que indica ID nem o . que indica classe, adiciona # presumindo ID
        this.advToolTipElement = area.startsWith('#') || area.startsWith('.') ? area : `#${area}`;
        // Se não foi passado o helpRef, presume que é o mesmo que o area
        this.advToolTipHelpData = this.helpService.getHelp(helpRef || area);
        this.showDetailedTooltipTimerRef = setTimeout(() => {
            this.showDetailedTooltip = true;
        }, time);
    }

    hideAdvancedTooltip() {
        this.showDetailedTooltip = false;
        this.advToolTipElement = '';
        this.advToolTipHelpData = {img: '', text: ''};
        if (this.showDetailedTooltipTimerRef) {
            clearTimeout(this.showDetailedTooltipTimerRef);
        }
    }

    saveConfig() {
        window.localStorage.setItem(`globalConfig-disableAnimations`, this.disableAnimations ? '1' : '0');
        window.localStorage.setItem(`globalConfig-disableWaveform`, this.disableWaveform ? '1' : '0');
    }

    loadConfig() {
        this.disableAnimations = window.localStorage.getItem(`globalConfig-disableAnimations`) === '1';
        this.disableWaveform = window.localStorage.getItem(`globalConfig-disableWaveform`) === '1';
    }

    generateGreetingsMessage() {
        this.formattedTime = moment().format('HH:mm');
        const saudation = moment().hour() < 12 ? $localize`Bom dia` : moment().hour() < 18 ? $localize`Boa tarde` : $localize`Boa noite`;
        this.greetingMessage = `${saudation} ${this.user?.fullname.split(' ')[0] || ''}!`;
    }

    trackById(index, item) {
        return item.id;
    }

    async persistData(key) {
        if (this.isMobile && this.hasOwnProperty(key)) {
            await set(key, this[key]);
        }
    }

    loadContactsExtraFields() {
        this.http.get(BASE_URL + '/contactsextrafields/getExtraFields?t=' + Date.now()).subscribe((r: any[]) => {
            this.contactsExtraFields = r;
        }, err => {

        });
    }

    toogleSystemInfo() {
        this.showSystemInfo = !this.showSystemInfo;
    }

    reconstructObjectRefs() {

        this.chatsObj = {};
        for (const c of this.chats) {
            this.chatsObj[c.id] = c;
        }

        this.queuesObj = {};
        for (const c of this.queues) {
            this.queuesObj[c.id] = c;
        }

        this.internalChatsObj = {};
        for (const c of this.internalChats) {
            c.uploads = c.uploads || [];
            this.internalChatsObj[c.id] = c;
        }

        this.agentQueuesObj = {};
        for (const c of this.agentQueues) {
            this.agentQueuesObj[c.id] = c;
        }

        this.messageRef = {};
        this.internalMessageRef = {};

        for (const c of this.chats) {
            this.messageRef[c.id] = this.messageRef[c.id] || {};
            for (const m of c.messages) {
                this.messageRef[c.id][m.messageid] = m;
                this.prepareMsg(m);
            }
        }

        for (const c of this.internalChats) {
            this.internalMessageRef[c.id] = this.internalMessageRef[c.id] || {};
            for (const m of c.messages) {
                this.internalMessageRef[c.id][m.messageid] = m;
                this.prepareMsg(m);
            }
        }

        for (const a of this.allAgents) {
            this.updateAgentsAlertStatus(a);
            this.updateAgentQueuesMap(a);
        }

        this.tasksEventsCounter++;

    }

    prepareProductObj(t, value = false, recurrentvalue = false, maxdiscount = false, commission = false, maxrecurrentdiscount = false) {
        if (!t) {
            return;
        }
        t.processing = false;
        t.files = t.files || [];
        t.photos = t.photos || [];
        t.queues = t.queues || [];
        t.hasUrl = t.hasUrl ?? false;
        if (value) {
            // O valor é decimal, mas é armazenado como inteiro no banco de dados
            t.value = (t.value || 0) / 100;
        }
        if (recurrentvalue) {
            // O valor é decimal, mas é armazenado como inteiro no banco de dados
            t.recurrentvalue = (t.recurrentvalue || 0) / 100;
        }
        if (maxdiscount) {
            // O valor é decimal, mas é armazenado como inteiro no banco de dados
            t.maxdiscount = (t.maxdiscount || 0) / 100;
        }
        if (maxrecurrentdiscount) {
            // O valor é decimal, mas é armazenado como inteiro no banco de dados
            t.maxrecurrentdiscount = (t.maxrecurrentdiscount || 0) / 100;
        }
        if (commission) {
            // O valor é decimal, mas é armazenado como inteiro no banco de dados
            t.commission = (t.commission || 0) / 100;
        }
    }

    prepareTemplateObj(t) {
        t.language = t.language || '';
        t.headertext = t.headertext || '';
        t.header_file = t.header_file || '';
        t.status = t.status || '';
        t.text = t.text || '';
        t.category = t.category || '';
        t.footertext = t.footertext || '';
        t.headertype = t.headertype || 0;
        t.queueid = t.queueid || 0;
        t.params = t.params || [];
        t.headerparams = t.headerparams || [];
        t.buttons = t.buttons || [];
        t.buttonsparams = t.buttonsparams || [];
    }

    prepareOpportunityObj(t, value = false, recurrentvalue = false) {
        if (!t) {
            return;
        }
        t.processing = false;
        t.expectedclosedate = t.expectedclosedate && typeof t.expectedclosedate === 'number' ? moment(t.expectedclosedate * 1000).endOf('day') : t.expectedclosedate ? t.expectedclosedate : null;
        t.frozenuntil = t.frozenuntil && typeof t.frozenuntil === 'number' ? moment(t.frozenuntil * 1000).endOf('day') : t.frozenuntil ? t.frozenuntil : null;
        t.createdAt = t.createdAt && typeof t.createdAt === 'number' ? moment(t.createdAt * 1000) : t.createdAt ? t.createdAt : null;
        t.closedat = t.closedat && typeof t.closedat === 'number' ? moment(t.closedat * 1000) : t.closedat ? t.closedat : null;
        t.files = t.files || [];
        t.followers = t.followers || [];
        if (value) {
            // O valor é decimal, mas é armazenado como inteiro no banco de dados
            t.value = (t.value || 0) / 100;
            t.closevalue = (t.closevalue || 0) / 100;
        }
        if (recurrentvalue) {
            // O valor é decimal, mas é armazenado como inteiro no banco de dados
            t.recurrentvalue = (t.recurrentvalue || 0) / 100;
            t.closerecurrentvalue = (t.closerecurrentvalue || 0) / 100;
        }
        t.contacts = t.contacts || [];
        t.tags = t.tags || [];
        t.formsdata = t.formsdata ? typeof t.formsdata === 'string' ? JSON.parse(t.formsdata) : t.formsdata : {};
        t.formsdatacheck = t.formsdatacheck ? typeof t.formsdatacheck === 'string' ? JSON.parse(t.formsdatacheck) : t.formsdatacheck : {};
        t.description = t.description || '';
    }

    prepareChatTabsObj(chat) {
        if (!chat) {
            return;
        }
        chat.tabsObj = {};
        for (const tab of (chat.tabs || [])) {
            chat.tabsObj[tab.tabId] = tab;
        }
    }

    prepareTaskObj(t) {
        if (!t) {
            return;
        }
        t.duedate = t.duedate && typeof t.duedate === 'number' ? moment(t.duedate * 1000) : t.duedate;
        t.finishdate = t.finishdate && typeof t.finishdate !== 'object' ? moment(t.finishdate * 1000) : null;
        t.schedulebegin = t.schedulebegin && typeof t.schedulebegin !== 'object' ? moment(t.schedulebegin * 1000) : null;
        t.scheduleend = t.scheduleend && typeof t.scheduleend !== 'object' ? moment(t.scheduleend * 1000) : null;
        t.files = t.files || [];
        t.users = t.users || [];
        t.contacts = t.contacts || [];
        t.tags = t.tags || [];
        t.watchers = t.watchers || [];
        t.checklist = t.checklist || [];
        t.alerts = t.alerts || [];
        t.action = t.action || 0;
        t.actiondata = t.actiondata || '';
    }


    sortInternalChats() {
        for (const ic of this.internalChats) {
            ic.lastMessageTimestamp = ic.lastMessageTimestamp || 0;
        }
        this.internalChats = _.orderBy(this.internalChats, ['lastMessageTimestamp'], ['desc']);
    }

    sortChats() {

        switch (this.user?.chatOrder) {

            case 0:
                this.chats = _.orderBy(this.chats, ['arriveTimestamp'], ['asc']);
                break;

            case 1:
                this.chats = _.orderBy(this.chats, ['beginTime'], ['asc']);
                break;

            case 2:
                this.chats = _.orderBy(this.chats, ['beginTime'], ['desc']);
                break;

            case 3:
                this.chats = _.orderBy(this.chats, ['lastMessageTimestamp'], ['desc']);
                break;

            case 4:
                this.chats = _.orderBy(this.chats, ['arriveTimestamp'], ['desc']);
                break;

            case 5:
                this.chats = _.orderBy(this.chats, ['newMsgCount'], ['desc']);
                break;

            case 6:
                this.chats = _.orderBy(this.chats, ['priority', 'markerId'], ['desc', 'asc']);
                break;

        }

    }

    getMimetype(extension) {

        switch (extension) {
            case '3gp':
                return 'video/3gpp, audio/3gpp';

            case '3g2':
                return 'video/3gpp2, audio/3gpp2';

            case '7z':
                return 'application/x-7z-compressed';

            case 'aac':
                return 'audio/aac';

            case 'abw':
                return 'application/x-abiword';

            case 'ai':
                return 'application/illustrator';

            case 'arc':
                return 'application/x-freearc';

            case 'avi':
                return 'video/x-msvideo';

            case 'azw':
                return 'application/vnd.amazon.ebook';

            case 'bin':
                return 'application/octet-stream';

            case 'bmp':
                return 'image/bmp';

            case 'bz':
                return 'application/x-bzip';

            case 'bz2':
                return 'application/x-bzip2';

            case 'csh':
                return 'application/x-csh';

            case 'css':
                return 'text/css';

            case 'csv':
                return 'text/csv';

            case 'doc':
                return 'application/msword';

            case 'docx':
                return 'application/vnd.openxmlformats officedocument.wordprocessingml.document';

            case 'eot':
                return 'application/vnd.ms-fontobject';

            case 'epub':
                return 'application/epub+zip';

            case 'eps':
                return 'image/x-eps';

            case 'gif':
                return 'image/gif';

            case 'htm':
                return 'text/html';

            case 'html':
                return 'text/html';

            case 'ico':
                return 'image/vnd.microsoft.icon';

            case 'ics':
                return 'text/calendar';

            case 'jar':
                return 'application/java-archive';

            case 'jpg':
                return 'image/jpeg';

            case 'jpeg':
                return 'image/jpeg';

            case 'js':
                return 'text/javascript';

            case 'json':
                return 'application/json';

            case 'mid':
                return 'audio/midi';

            case 'midi':
                return 'audio/midi';

            case 'mjs':
                return 'text/javascript';

            case 'mp3':
                return 'audio/mpeg';

            case 'mpeg':
                return 'video/mpeg';

            case 'mpkg':
                return 'application/vnd.apple.installer+xml';

            case 'odp':
                return 'application/vnd.oasis.opendocument.presentation';

            case 'ods':
                return 'application/vnd.oasis.opendocument.spreadsheet';

            case 'odt':
                return 'application/vnd.oasis.opendocument.text';

            case 'oga':
                return 'audio/ogg';

            case 'ogv':
                return 'video/ogg';

            case 'ogx':
                return 'application/ogg';

            case 'otf':
                return 'font/otf';

            case 'png':
                return 'image/png';

            case 'pdf':
                return 'application/pdf';

            case 'ppt':
                return 'application/vnd.ms-powerpoint';

            case 'pptx':
                return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

            case 'rar':
                return 'application/x-rar-compressed';

            case 'rtf':
                return 'application/rtf';

            case 'sh':
                return 'application/x-sh';

            case 'svg':
                return 'image/svg+xml';

            case 'swf':
                return 'application/x-shockwave-flash';

            case 'tar':
                return 'application/x-tar';

            case 'tif':
                return 'image/tiff';

            case 'tiff':
                return 'image/tiff';

            case 'ttf':
                return 'font/ttf';

            case 'txt':
                return 'text/plain';

            case 'vsd':
                return 'application/vnd.visio';

            case 'wav':
                return 'audio/wav';

            case 'weba':
                return 'audio/webm';

            case 'webm':
                return 'video/webm';

            case 'webp':
                return 'image/webm';

            case 'woff':
                return 'font/woff';

            case 'woff2':
                return 'font/woff2';

            case 'xhtml':
                return 'application/xhtml+xml';

            case 'xls':
                return 'application/vnd.ms-excel';

            case 'xlsx':
                return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

            case 'xml':
                return 'application/xml, text/xml';

            case 'xul':
                return 'application/vnd.mozilla.xul+xml';

            case 'zip':
                return 'application/zip';

            default:
                return 'application/unknown';

        }

    }

    prepareMsg(m) {

        m.attachments = m.attachments || [];
        m.reaction = m.reaction || '';
        m.oldText = m.oldText || '';
        m.user = m.user || '';
        m.error = m.error || '';
        m.transcription = m.transcription || '';
        m.analyzing = m.analyzing || false;
        m.featuresextracted = m.featuresextracted || [];
        m.insultdetected = m.insultdetected || 0;
        m.userId = m.userId || 0;
        m.fk_file = m.fk_file || 0;
        m.readed = m.readed || false;
        m.deleted = m.deleted || false;
        m.rewritedbyai = m.rewritedbyai || 0;
        m.failed = m.failed || false;
        m.hasPath = m.hasPath || false;
        m.readedby = m.readedby || [];

        m.cardstructure = m.cardstructure || {};
        try {
            m.cardstructure = m.cardstructure && typeof m.cardstructure === 'string' ? JSON.parse(m.cardstructure) : m.cardstructure || {};
        } catch (e) {
            m.cardstructure = {};
        }

        m.formattedTime = m.timestamp ? moment(m.timestamp * 1000).format('DD/MM/YYYY · HH:mm:ss') : m.messagetimestamp ? moment(m.messagetimestamp * 1000).format('DD/MM/YYYY · HH:mm:ss') : '';
        if (m.file_length) {
            m.file_readableSize = filesize(m.file_length, {base: 2, standard: "jedec"});
        }
        if (m.file_waveform) {
            m.file_waveform = m.file_waveform && typeof m.file_waveform === 'string' ? this._base64ToArray(m.file_waveform) : (m.file_waveform || []);
        }

    }

    _base64ToArray(base64) {
        const binary_string = window.atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return Array.from(bytes);
    }

    clearItems() {

        this.items['agents'] = [];
        this.items['pbxs'] = [];
        this.items['queues'] = [];
        this.items['reasons'] = [];
        this.items['usersqueues'] = [];
        this.items['contacts'] = [];
        this.items['trunks'] = [];
        this.items['ringgroups'] = [];
        this.items['extensions'] = [];

        this.itemsLoaded['agents'] = false;
        this.itemsLoaded['pbxs'] = false;
        this.itemsLoaded['queues'] = false;
        this.itemsLoaded['reasons'] = false;
        this.itemsLoaded['contacts'] = false;

    }

    loadTags() {

        this.http.get(BASE_URL + '/tags/').subscribe((r: any[]) => {
            this.faqTags = [];
            this.contactTags = [];
            this.taskTags = [];
            this.dealTags = [];
            this.faqTagsMap = {};
            this.contactTagsMap = {};
            this.dealTagsMap = {};
            this.taskTagsMap = {};
            for (const t of r) {
                if (t.contacttag) {
                    this.contactTags.push(t);
                    this.contactTagsMap[t.id] = t;
                }
                if (t.faqtag) {
                    this.faqTags.push(t);
                    this.faqTagsMap[t.id] = t;
                }
                if (t.tasktag) {
                    this.taskTags.push(t);
                    this.taskTagsMap[t.id] = t;
                }
                if (t.dealtag) {
                    this.dealTags.push(t);
                    this.dealTagsMap[t.id] = t;
                }
            }
        }, err => {
            console.log(err);
        });

    }

    playChatAlert(chatId, clientName) {
        if (this.chatAudio && this.user?.notifyMessages) {
            this.chatAudio.currentTime = 0;
            this.chatAudio.play();
        }
        window.focus();

        if (!this.isVisible) {
            this.showNewChatTitleAlert = true;
        }
        if (!("Notification" in window)) {
            console.log('O navegador não suporta notificações');
        } else if (Notification.permission === "granted") {
            if (this.isMobile) {
                navigator.serviceWorker.getRegistration().then((reg) => {
                    reg?.showNotification(clientName || $localize`Novo atendimento`, {
                        body: $localize`Há um novo atendimento para você!`,
                        icon: 'api/getProfilePic?id=' + chatId,
                        vibrate: [100, 50, 100],
                        data: {
                            dateOfArrival: Date.now(),
                            primaryKey: 1
                        },
                        // actions: [
                        //   {
                        //     action: 'close', title: 'Fechar'
                        //   },
                        // ]
                    });
                });
            } else {
                const notification = new Notification(clientName || $localize`Novo atendimento`, {
                    body: $localize`Há um novo atendimento para você!`,
                    icon: 'api/getProfilePic?id=' + chatId,
                    vibrate: [100, 50, 100],
                    data: {
                        dateOfArrival: Date.now(),
                        primaryKey: 1
                    },
                    // actions: [
                    //   {
                    //     action: 'close', title: 'Fechar'
                    //   },
                    // ]
                });
            }
        } else {
            Notification.requestPermission(function (permission) {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    const notification = new Notification($localize`Novo chat!`);
                }
            });
        }
    }

    titleTimer() {
        setTimeout(() => {
            this.titleTimer();
            if (!this.isVisible) {
                const newMessageTitle = $localize`💬 Nova mensagem`;
                const newChatTitle = $localize`👋 Novo atendimento`;
                if (this.showNewChatTitleAlert && this.titleService.getTitle() !== newChatTitle) {
                    this.titleService.setTitle(newChatTitle);
                    return;
                }
                if (this.showNewMessageTitleAlert && this.titleService.getTitle() !== newMessageTitle) {
                    this.titleService.setTitle(newMessageTitle);
                    return;
                }
            }
            this.titleService.setTitle(this.defaultTitle);
        }, 1500);
    }

    playMessageAlert(chatId, clientName, text, internal = false) {

        const selectedChat = internal ? this.internalSelectedChat : this.selectedChat;

        if (this.messageAudio && this.user?.notifyMessages && (selectedChat?.id !== chatId || !this.isVisible)) {
            this.messageAudio.currentTime = 0;
            this.messageAudio.play();
        }

        if (!this.isVisible) {
            this.showNewMessageTitleAlert = true;
            if (!("Notification" in window)) {
                console.log('O navegador não suporta notificações');
            } else if (Notification.permission === "granted") {
                if (this.isMobile) {
                    navigator.serviceWorker.getRegistration().then((reg) => {
                        reg.showNotification(clientName || $localize`Nova mensagem`, {
                            body: text,
                            icon: internal ? 'media/getUserProfilePic?id=' + chatId : 'api/getProfilePic?id=' + chatId,
                            vibrate: [100, 50, 100],
                            data: {
                                dateOfArrival: Date.now(),
                                primaryKey: 1
                            },
                            // actions: [
                            //   {
                            //     action: 'close', title: 'Fechar'
                            //   },
                            // ]
                        });
                    });
                } else {
                    const notification = new Notification(clientName || $localize`Nova mensagem`, {
                        body: text,
                        icon: internal ? 'media/getUserProfilePic?id=' + chatId : 'api/getProfilePic?id=' + chatId,
                        vibrate: [100, 50, 100],
                        data: {
                            dateOfArrival: Date.now(),
                            primaryKey: 1
                        },
                        // actions: [
                        //   {
                        //     action: 'close', title: 'Fechar'
                        //   },
                        // ]
                    });
                }
            } else {
                Notification.requestPermission(function (permission) {
                    // If the user accepts, let's create a notification
                    if (permission === "granted") {
                        const notification = new Notification($localize`Novo chat!`);
                    }
                });
            }
        }
    }

    timer() {

        setTimeout(() => {

            this.timer();

            this.now = moment().unix();
            this.generateGreetingsMessage();

            for (const a of this.allAgents) {
                if (a.queueLogged) {
                    a.loggedTimeCount++;
                }
                if (a.paused) {
                    a.pausedTimeCount++;
                }
                if (a.incall && a.queueLogged) {
                    a.incallTimeCount++;
                }

                for (const c of a.calls || []) {
                    if (c.answered) {
                        c.counter++;
                    }
                }

                for (const q of Object.keys(a.queuesObj)) {
                    const queue = a.queuesObj[q];
                    if (queue.logged) {
                        queue.loggedTimeCount++;
                    }
                }
            }

            for (const q of this.allQueues) {
                for (const c of q.calls || []) {
                    c.wait++;
                }
            }

            for (const task of this.allTasks) {
                if (task.status === 1) {
                    task.tmpspenttime = task.spenttime + (moment().unix() - task.laststarttime);
                }
            }

            if (this.pause.paused && this.pause.beginTime) {
                this.pause.formattedTime = this.formatTime.transform(moment().unix() - (this.pause.beginTime / 1000));
            } else {
                this.pause.formattedTime = '';
            }

        }, 1000);

    }

    clearAutomations() {
        this.automations = [];
        this.automationsObj = {};
        this.chatsAutomations = [];
        this.chatsAutomationsObj = {};
        this.msgsAutomations = [];
        this.msgsAutomationsObj = {};
        this.audioMsgsAutomations = [];
        this.audioMsgsAutomationsObj = {};
        this.videoMsgsAutomations = [];
        this.videoMsgsAutomationsObj = {};
        this.imageMsgsAutomations = [];
        this.imageMsgsAutomationsObj = {};
        this.pdfMsgsAutomations = [];
        this.pdfMsgsAutomationsObj = {};
        this.textMsgsAutomations = [];
        this.textMsgsAutomationsObj = {};
        this.locationMsgsAutomations = [];
        this.locationMsgsAutomationsObj = {};
        this.infoMsgsAutomations = [];
        this.infoMsgsAutomationsObj = {};
        this.opportunitiesAutomations = [];
        this.opportunitiesAutomationsObj = {};
        this.contactsAutomations = [];
        this.contactsAutomationsObj = {};
    }

    resetStates() {

        this.allContactsMap = {};

        this.allPipestagesMap = {};
        this.allGallerysMap = {};
        this.allPredefinedTextsMap = {};
        this.allFormsMap = {};
        this.allProductsMap = {};
        this.allAccessGroupsMap = {};
        this.allOriginsMap = {};
        this.allTemplatesMap = {};
        this.allAssistantsMap = {};

        this.clearAutomations();

        this.phoneRegistered = false;
        this.supervisorIvrsQueried = false;

        this.taskElementState = {
            'mine': {
                search: '',
                tags: [],
                filterBy: 1,
                orderBy: 0,
                startTodoDate: null,
                startDoneDate: null,
                endTodoDate: null,
                endDoneDate: null,
                tasks: [],
                userId: 0
            }
        };

        this.selectedTask = null;
        this.showTasks = false;
        this.disableCRM = false;
        this.enableAI = false;
        this.enableAIPremium = false;
        this.enablePremiumTicket = false;
        this.adminDefaultPassword = false;
        this.showBugReport = false;

        this.notifications = [];

        // Os contatos devem ser baixados em todos os logins porque mudam de acordo com o agente logado
        this.allContactsVersion = -1;

        this.tasksUserId = [];

        this.taskCalls = {};
        this.taskChats = {};

        this.newChats = false;
        this.localState = 0;
        this.localStateTimestamp = 0;
        this.getExten = false;
        this.mineExtenNumber = '';
        this.newInternalMsg = false;
        this.supportChatLoaded = false;
        this.supportChatEnabled = false;
        this.supportChatQueueId = 0;
        this.supportChatDomain = '';
        this.supportChatNewMessages = false;
        this.singleConnection = false;
        this.multipleConnections = false;
        this.recoveryFrom = '';

        this.clearStateItems();

        // @ts-ignore
        if (window.kwChat) {
            // @ts-ignore
            const kwChat: any = window.kwChat;
            kwChat.destroy();
            kwChat.onloaded = null;
            kwChat.onnewmessages = null;
        }


    }

    clearStateItems() {

        this.allOpportunitiesMap = {};
        this.offlineOpportunitiesCache = {};
        this.allTagsMap = {};
        this.allChatsMap = {};
        this.allQueuesMap = {};
        this.allAgentsMap = {};
        this.allUsersMap = {};
        this.allLoggedMap = {};
        this.allTasksMap = {};
        this.allPipelinesMap = {};

        this.myStatus = {
            userPicVersion: 0,
            userPicAuth: '',
            phoneAvailable: false,
            opStatus: 0,
            ringing: false,
            busy: false,
            incall: false,
            inchat: false,
            available: false,
            taskInProgress: 0,
            callsToday: 0,
            maxChats: 0,
            recallsToday: 0,
            chatsToday: 0,
            surveyGradeToday: 0,
            surveyGradeMonth: 0,
            surveyGradeAllTime: 0,
            surveysToday: 0,
            surveysMonth: 0,
            surveysAllTime: 0,
            loggedTimeCount: 0, // Contagem do tempo em segundos logado em fila no dia de hoje
            pausedTimeCount: 0,
            incallTimeCount: 0,
            inchatTimeCount: 0
        };

        this.pause = {
            paused: false,
            reason: '',
            reasonId: 0,
            beginTime: 0,
            maxTime: 0,
            action: 0,
            pauseTimeCount: 0,
            formattedTime: ''
        };

        this.agentQueues.splice(0, this.agentQueues.length);
        this.agentQueuesObj = {};
        this.queues.splice(0, this.queues.length);
        this.queuesObj = {};
        this.chats.splice(0, this.chats.length);
        this.chatsObj = {};
        this.internalChatsObj = {};
        this.internalChats.splice(0, this.internalChats.length);
        this.internalMessageRef = {};
        this.agents.splice(0, this.agents.length);
        this.agentsObj = {};
        this.selectedChat = null;
        this.internalSelectedChat = null;
        this.messageRef = {};

    }

    prepareAgentQueueObj(q) {
        q.number = q.number || '';
        q.pauseReason = q.pauseReason || '';
        q.paused = q.paused || false;
        q.logged = q.logged || false;
        q.enabled = q.enabled || false;
        q.phoneConnected = q.phoneConnected || false;
        q.socketConnected = q.socketConnected || false;
        q.pauseReasonId = q.pauseReasonId || 0;
        q.pauseMaxTime = q.pauseMaxTime || 0;
        q.loggedTimeCount = q.loggedTimeCount || 0;
        q.limitChatTransferToQueueAgents = q.limitChatTransferToQueueAgents || false;
        q.templates = q.templates || [];
    }

    prepareAgentChat(data) {
        data.oldMsgCount = 0;
        data.newMsgCount = 0;
        data.scrollNewMsgCount = 0;
        data.lastViewedId = '';
        data.firstNotRead = '';
        data.clientName = data.clientName || '';
        data.clientEmail = data.clientEmail || '';
        data.clientProfileName = data.clientProfileName || '';
        data.clientUsername = data.clientUsername || '';
        data.clientNumber = data.clientNumber || '';
        data.clientDocument = data.clientDocument || '';
        data.preMessage = data.preMessage || '';
        data.protocol = data.protocol || '';
        data.clientPicMimeType = data.clientPicMimeType || '';
        data.clientPicAuth = data.clientPicAuth || '';
        data.markerId = data.markerId || 0;
        data.contactId = data.contactId || 0;
        data.onWaitingList = data.onWaitingList || 0;
        data.lockUserId = data.lockUserId || 0;
        data.lockDuration = data.lockDuration || 0;
        data.lockTime = data.lockTime || 0;
        data.onIvr = data.onIvr || false;
        data.locked = data.locked || false;
        data.queueRequireReason = data.queueRequireReason || false;

        data.distributionFilter = data.distributionFilter || [];
        data.contactTags = data.contactTags || [];
        data.queueTransferTags = data.queueTransferTags || [];
        data.oldMessages = data.oldMessages || [];
        data.uploads = data.uploads || [];
        data.opportunities = data.opportunities || [];

        data.extraData = data.extraData || {};
        try {
            data.extraData = data.extraData && typeof data.extraData === 'string' ? JSON.parse(data.extraData) : data.extraData || {};
        } catch (e) {
            data.extraData = {};
        }

        data.cardvars = data.cardvars || {};
        try {
            data.cardvars = data.cardvars && typeof data.cardvars === 'string' ? JSON.parse(data.cardvars) : data.cardvars || {};
        } catch (e) {
            data.cardvars = {};
        }

        data.cards = data.cards || {};
        try {
            data.cards = data.cards && typeof data.cards === 'string' ? JSON.parse(data.cards) : data.cards || {};
        } catch (e) {
            data.cards = {};
        }

        data.varsChangeCounter = data.varsChangeCounter || 0;
        data.messagesRequested = false;
        data.messages = _.sortBy(data.messages || [], ['timestamp']);
        for (const m of data.messages) {
            this.prepareMsg(m);
        }
        data.oldMessages = _.sortBy(data.oldMessages || [], ['timestamp']);
        for (const m of data.oldMessages) {
            this.prepareMsg(m);
        }
        data.arriveTimestamp = moment().unix();

    }

    loadState(state) {
    

        console.log('Carregando estado', state);

        this.internalMessageRef = {};
        this.messageRef = {};

        this.allOpportunitiesMap = state.allOpportunitiesMap;
        for (const o of Object.values(this.allOpportunitiesMap)) {
            this.prepareOpportunityObj(o, true, true);
        }

        this.offlineOpportunitiesCache = state.offlineOpportunitiesCache;
        for (const o of Object.values(this.offlineOpportunitiesCache)) {
            this.prepareOpportunityObj(o, true, true);
        }

        this.allChatsMap = state.allChatsMap;
        this.allQueuesMap = state.allQueuesMap;
        this.allAgentsMap = state.allAgentsMap;
        this.allLoggedMap = state.allLoggedMap;

        this.allTasksMap = state.allTasksMap;
        for (const t of Object.values(this.allTasksMap)) {
            this.prepareTaskObj(t);
        }

        this.allPipelinesMap = state.allPipelinesMap;
        this.myStatus = state.myStatus;
        this.pause = state.pause;

        this.agentQueues = [];
        this.agentQueuesObj = state.agentQueuesObj;
        for (const q of Object.values(this.agentQueuesObj)) {
            this.prepareAgentQueueObj(q);
            this.agentQueues.push(q);
        }

        this.queuesObj = state.queuesObj;

        this.chats = [];
        this.chatsObj = state.chatsObj;
        for (const c of Object.values(this.chatsObj)) {
            this.messageRef[c.id] = this.messageRef[c.id] || {};
            this.prepareAgentChat(c);
            this.chats.push(c);
            for (const m of c.messages) {
                this.messageRef[c.id][m.messageid] = m;
                this.prepareMsg(m);
            }
        }

        this.internalChats = [];
        this.internalChatsObj = state.internalChatsObj;
        for (const c of Object.values(this.internalChatsObj)) {
            // @ts-ignore
            this.internalMessageRef[c.id] = this.internalMessageRef[c.id] || {};
            this.internalChats.push(c);
            // @ts-ignore
            for (const m of c.messages) {
                // @ts-ignore
                this.internalMessageRef[c.id][m.messageid] = m;
                this.prepareMsg(m);
            }
        }

        this.agentsObj = state.agentsObj;

        this.tasksEventsCounter++;

        this.updateAllAgentsQueuesMap();
        this.updateAllAgentsAlertStatus();

        this.sortChats();
        this.sortInternalChats();
        this.sortItems();

        if (this.savedSelectedChatId && this.chatsObj[this.savedSelectedChatId] && moment().unix() - this.savedSelectedChatIdTime < 4) {
            this.savedSelectedChatIdTime = 0;
            this.savedSelectedChatId = 0;
            this.eventsService.emit('selectChat', this.chatsObj[this.savedSelectedChatId]);
        }

    }

    queryAllForms() {
        return this.queryAllItems('Forms');
    }

    queryAllProducts() {
        return this.queryAllItems('Products');
    }

    queryAllOrigins() {
        return this.queryAllItems('Origins');
    }

    queryAllIvrs() {
        return this.queryAllItems('Ivrs');
    }

    queryAllAssistants() {
        return this.queryAllItems('Assistants');
    }

    async getAutomationResumedList() {
        await this.queryAllIvrs();
        const resumedList = [];
        for (const i of this.allIvrs) {
            if (i.type === 2) {
                resumedList.push(i);
            }
        }
        return resumedList;
    }

    async getIvrResumedList() {
        await this.queryAllIvrs();
        const resumedList = [];
        for (const i of this.allIvrs) {
            if (i.type === 1 || i.type === 0) {
                resumedList.push(i);
            }
        }
        return resumedList;
    }

    queryAllItems(type) {
        // Previne que mais de uma requisição seja feita ao mesmo tempo
        if (this[`loadingAll${type}`]) {
            return;
        }
        this[`loadingAll${type}`] = true;
        return new Promise(async (res, rej) => {
            const remoteVersion = await new Promise<number>((resolve, reject) => {
                this.http.get(this.versionUrl[type]).subscribe((r: number) => {
                    return resolve(Number(r) || 0);
                });
            });

            const localStoredVersion = localStorage.getItem(`all${type}Version`);
            // Se o localStorage possui alguma versão local, carrega do localStorage
            if (this[`all${type}Version`] === -1 && localStoredVersion) {
                await this.loadItemsFromLocalStorage(type);
            }
            // console.log(`Carregando ${type}, versão remota ${remoteVersion}, versão local ${localStoredVersion}, cache ${this[`all${type}`]?.length} itens`);
            // Se o carregamento do localstorage falhou, ou não possui a versão mais recente, carrega do servidor
            if (!this[`all${type}`]?.length || remoteVersion !== this[`all${type}Version`]) {

                await new Promise((resolve, reject) => {
                    this.http.get(this.itemsUrl[type]).subscribe(async (r: any) => {

                        // console.log('Baixando ' + type);
                        if (this.encryptKey) {
                            try {
                                // Se possui uma chave de criptografia, salva os contatos no localStorage
                                const compressed = pako.deflate(this.utfToArr(JSON.stringify(r)));
                                const encrypted = await this.encrypt(compressed, this.encryptKey);
                                localStorage.setItem(`all${type}`, encrypted);
                                localStorage.setItem(`all${type}Version`, remoteVersion.toString());
                            } catch (e) {
                                console.log('Erro ao salvar contatos no localStorage');
                            }
                        }

                        this[`all${type}Map`] = {};

                        for (const c of r) {
                            this[`all${type}Map`][c.id || c.i] = c;
                        }

                        this.processMapItems(type);

                        this[`all${type}Version`] = remoteVersion;
                        this[`loadingAll${type}`] = false;
                        return res('');

                    }, (err) => {
                        return res('');
                    });
                });

            }

            this[`loadingAll${type}`] = false;
            return res('');

        });

    }

    processMapItems(type) {

        for (const k of Object.keys(this[`all${type}Map`])) {
            const c = this[`all${type}Map`][k];
            if (type === 'Contacts') {
                c.email = c.e || '';
                c.document = c.d || '';
                c.number = c.nu || '';
                c.name = c.n || '';
                c.instagram = c.ins || '';
                c.fk_company = c.fc || '';
                c.preferredagents = c.p || [];
                c.tagsIds = c.ti || [];
            }
            if (type === 'Products') {
                c.name = c.n || '';
                c.hasUrl = c.hu ? true : false;
                c.description = c.d || '';
                c.internalcode = c.i || '';
                c.gtin = c.g || '';
                c.value = c.v || 0;
                c.maxdiscount = c.m || 0;
                c.maxrecurrentdiscount = c.mr || 0;
                c.measurementunit = c.mu || '';
                c.available = c.av || 0;
                c.commission = c.c || 0;
                c.recurrentvalue = c.rv || 0;
                c.photos = c.p || [];
                c.queues = c.q || [];
                c.associatedforms = c.af || [];
                c.hiddenfromclients = c.h || 0;
                this.prepareProductObj(c, true, true, true, true, true);
            }
        }

        if (type === 'Users') {
            this.updateAllAgentsQueuesMap();
        }

        if (type === 'Tags') {
            this.updateAllAgentsAlertStatus();
        }

    }

    queryAllPredefinedTexts() {
        return this.queryAllItems('PredefinedTexts');
    }

    queryAllGallerys() {
        return this.queryAllItems('Gallerys');
    }

    queryAllUsers() {
        return this.queryAllItems('Users');
    }

    queryAllTags() {
        return this.queryAllItems('Tags');
    }

    queryAllActions() {
        return this.queryAllItems('Actions');
    }

    queryAllPipelines() {
        return this.queryAllItems('Pipelines');
    }

    queryAllPipestages() {
        return this.queryAllItems('Pipestages');
    }

    queryAllInformationCards() {
        return this.queryAllItems('InformationCards');
    }

    updateAgentWithSpecificChatAlertStatus(id) {
        for (const agent of this.allAgents) {
            if (agent.chats?.includes(id)) {
                this.updateAgentsAlertStatus(agent);
            }
        }
    }

    updateAllAgentsAlertStatus() {
        for (const agent of this.allAgents) {
            this.updateAgentsAlertStatus(agent);
        }
    }

    updateAllAgentsQueuesMap() {
        for (const agent of this.allAgents) {
            agent.fullName = this.allUsersMap[agent.id]?.fullName || '';
            this.updateAgentQueuesMap(agent);
        }
    }

    updateAgentQueuesMap(agent) {
        agent.queuesObj = {};
        if (agent.queues) {
            // Atualiza o alerta de painel do agente com base no alerta máximo dos atendimentos que ele possui
            for (const queue of agent.queues) {
                agent.queuesObj[queue.id] = queue;
            }
        }
    }

    updateAgentsAlertStatus(agent) {
        agent.panelAlertLevel = 0;
        // Atualiza o alerta de painel do agente com base no alerta máximo dos atendimentos que ele possui
        if (agent.chats) {
            for (const cId of agent.chats) {
                const chat = this.allChatsMap[cId];
                if (chat?.markerId && this.allTagsMap[chat.markerId]) {
                    agent.panelAlertLevel = Math.max(agent.panelAlertLevel, this.allTagsMap[chat.markerId].alertonpanel);
                }
            }
        }
    }


    utfToArr(str) {
        return new TextEncoder().encode(str)
    }

    arrToUtf(arr) {
        return new TextDecoder().decode(arr)
    }

    strToArr(str) {
        return new Uint8Array(str.split("").map(function (c) {
            return c.charCodeAt(0);
        }));
    }

    arrToStr(arr) {
        return new Uint8Array(arr).reduce(function (data, byte) {
            return data + String.fromCharCode(byte);
        }, '');
    }

    salt() {
        const vector = new Uint8Array(16)
        crypto.getRandomValues(vector)
        return vector;
    }

    encrypt(arrToEncrypt: Uint8Array, passKey: string): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                const vector = this.salt();
                crypto.subtle.digest({name: 'SHA-256'}, this.strToArr(passKey)).then((res) => {
                    crypto.subtle.importKey('raw', res, {name: 'AES-CBC'}, false, ['encrypt', 'decrypt']).then((key) => {
                        crypto.subtle.encrypt({name: 'AES-CBC', iv: vector}, key, arrToEncrypt).then((res2) => {
                            return resolve(JSON.stringify({
                                data: btoa(this.arrToStr(res2)),
                                salt: btoa(this.arrToStr(vector))
                            }));
                        }, (e) => {
                            return reject(e);
                        })
                    })
                });
            } catch (e) {
                return reject(e);
            }
        });
    }

    decrypt(strToDecrypt: string, passKey: string): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            try {
                const obj = JSON.parse(strToDecrypt);
                const data = this.strToArr(atob(obj.data));
                const vector = this.strToArr(atob(obj.salt));
                crypto.subtle.digest({name: 'SHA-256'}, this.strToArr(passKey)).then((res) => {
                    crypto.subtle.importKey('raw', res, {name: 'AES-CBC'}, false, ['encrypt', 'decrypt']).then((key) => {
                        crypto.subtle.decrypt({name: 'AES-CBC', iv: vector}, key, data).then((res2) => {
                            return resolve(res2);
                        }, (e) => {
                            return reject(e);
                        })
                    })
                })
            } catch (e) {
                return reject(e);
            }
        });
    }

    async loadItemsFromLocalStorage(type) {
        const items = localStorage.getItem(`all${type}`);
        const localVersion = localStorage.getItem(`all${type}Version`);
        if (items && localVersion && this.encryptKey) {
            try {
                const decrypted = await this.decrypt(items, this.encryptKey);
                const decompressed = pako.inflate(decrypted);
                const tmp = JSON.parse(this.arrToUtf(decompressed));
                this[`all${type}Map`] = {};
                for (const c of tmp) {
                    this[`all${type}Map`][c.id] = c;
                }
                this[`all${type}Version`] = Number(localVersion);
                this.processMapItems(type);
            } catch (e) {
                console.log(`Erro ao carregar ${type} do localStorage`, e);
                return;
            }
        }
    }

    isSupervisorOrAdmin() {
        return [0, 1, 98, 99].includes(this.user?.type) || false;
    }

    isAdmin() {
        return [0, 98, 99].includes(this.user?.type) || false;
    }

    getItems(id: string = "", type = "agents", renew: boolean = false) {

        if (type === 'abandonadas') {
            return
        }

        if (renew) {

            return new Promise((resolve, reject) => {
                const extra = (type === 'agents' && id === '') ? 'getSupervisorAgents' : (type === 'queues' && id === '') ? 'getSupervisorQueues' : '';

                this.http.get(this.url[type] + extra + (id !== "" ? '?id=' + id : ''))
                    .toPromise()
                    .then((res: any) => {
                        const resp = res.json();
                        if (Array.isArray(resp) || resp.id) {
                            if (id === '') {
                                this.items[type] = _.filter(resp, {status: 1});
                                if (type === 'agents' || type === 'queues') {
                                    for (const i of this.items[type]) {
                                        if (type === 'agents') {
                                            i.avaiable = false;
                                            i.paused = false;
                                            i.logged = false;
                                            i.view = i.view ? i.view : 0;
                                            i.opStatus = 0;
                                            i.time = i.time ? i.time : 0;
                                            i.loggedtime = i.loggedtime ? i.loggedtime : 0;
                                            i.pausedtime = i.pausedtime ? i.pausedtime : 0;
                                            i.avaiabletime = i.avaiabletime ? i.avaiabletime : 0;
                                            i.callernumber = '';
                                            i.calls = [];
                                            i.incall = false;
                                        } else if (type === 'queues') {
                                            i.callers = [];
                                            i.holdtime = 0;
                                            i.talktime = 0;
                                            i.abandonedcount = 0;
                                            i.callscount = 0;
                                            i.answeredcount = 0;
                                        }
                                    }
                                }
                                this.itemsLoaded[type] = true;
                                resolve(this.items[type]);
                            } else {
                                resolve(resp)
                            }
                        } else {
                            reject(resp);
                        }
                    })
                    .catch(err => {
                        reject(err);
                    });
            });
        } else {
            if (!this.itemsLoaded[type]) {
                return this.getItems(id, type, true);
            } else {
                return new Promise((resolve, reject) => {
                    const resp: any | any[] = id === '' ? this.items[type] : _.find(this.items[type], {id: Number(id)});
                    resolve(resp);
                });
            }
        }

    }

    updateAgentsStatus() {

        return new Promise((resolve, reject) => {
            this.http.get(this.url['agents'] + 'getAllUsersStatus').toPromise().then((res) => {

                for (const a of this.items['agents']) {
                    if (this.items['agents'].queues) {

                        for (const q of this.items['agents'].queues) {
                            q.logged = false;
                        }

                    } else {

                        this.items['agents'].queues = [];

                    }
                }

                for (const q of this.items['queues']) {
                    this.http.post(this.url['agents'] + 'getUserQueueStatus', {
                        queuenumber: q.number
                    }).toPromise().then(re => {

                    });
                }

                resolve(true);

            });
        });
    }

    createItem(item: any, type = "agents") {

        return new Promise((resolve, reject) => {
            delete item.id;
            this.http.post(this.url[type], item)
                .toPromise()
                .then((res: any) => {
                    const resp = res.json();
                    if (resp.id) {
                        this.getItems('', type, true);
                        resolve(resp);
                    } else {
                        reject(resp);
                    }
                })
                .catch(err => {
                    reject(err);
                });
        });

    }

    updateItem(item: any, type = "") {

        return new Promise((resolve, reject) => {
            this.http.put(this.url[type] + item.id, item)
                .toPromise()
                .then((res: any) => {
                    const resp = res.json();
                    if (resp.id) {
                        this.getItems('', type, true).then((r: any) => {
                            resolve(resp);
                        });
                    } else {
                        reject(resp);
                    }
                })
                .catch(err => {
                    reject(err);
                });
        });

    }

    deleteItem(id: string, type) {

        return new Promise((resolve, reject) => {
            this.http.post(this.url[type] + 'disable', {id})
                .toPromise()
                .then((res: any) => {
                    const resp = res.json();
                    if (resp.message === 'success') {
                        this.getItems('', type, true).then((r: any) => {
                            if (type === 'agents') {
                                this.updateAgentsStatus();
                            }
                        });
                        resolve(true);
                    } else {
                        reject(resp);
                    }
                })
                .catch(err => {
                    reject(err);
                });
        });

    }

    genericReturn(res) {
        if (res.message && res.message === 'success') {
            this.notification.success($localize`Sucesso`, $localize`Requisição enviada com sucesso`);
        } else {
            this.notification.error($localize`Falha`, $localize`Falha ao enviar requisição.`);
        }
    }

    getSupervisorQueues(userid: number) {
        return new Promise((resolve, reject) => {
            this.http.post(this.url['agents'] + 'getSupervisorQueues', {userid})
                .toPromise()
                .then((res: any) => {
                    const resp = res.json();
                    resolve(resp);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    getReasonsQueues(reasonid: any) {
        return new Promise((resolve, reject) => {
            this.http.post(this.url['reasons'] + 'getReasonsQueues', {reasonid})
                .toPromise()
                .then((res: any) => {
                    resolve(res.json());
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    setReasonsQueues(reasonid: number, queues: number[]) {
        return new Promise((resolve, reject) => {
            this.http.post(this.url['reasons'] + 'setReasonsQueues', {reasonid, queues})
                .toPromise()
                .then((res: any) => {
                    const resp = res.json();
                    if (resp.message === 'success') {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    setQueue(userid: number, queueid: number) {
        return new Promise((resolve, reject) => {
            this.http.post(this.url['agents'] + 'setQueue', {userid, queueid})
                .toPromise()
                .then((res: any) => {
                    const resp = res.json();
                    if (resp.message === 'success') {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    setQueues(userid: number, queues: number[]) {
        return new Promise((resolve, reject) => {
            this.http.post(this.url['agents'] + 'setQueues', {userid, queues})
                .toPromise()
                .then((res: any) => {
                    const resp = res.json();
                    if (resp.message === 'success') {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    getAgentsTimers() {
        return new Promise((resolve, reject) => {
            this.http.get(this.url['agents'] + 'getAgentsTimers')
                .toPromise()
                .then((res: any) => {
                    resolve(true);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    getQueuesStats() {
        return new Promise((resolve, reject) => {
            this.http.get(this.url['queues'] + 'getQueuesStats')
                .toPromise()
                .then((res: any) => {
                    resolve(true);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    getAgentStats(userid: number, period: any) {
        return new Promise((resolve, reject) => {
            this.http.post(this.url['agents'] + 'getAgentStats', {
                userid,
                startDate: period.startDate,
                endDate: period.endDate
            })
                .toPromise()
                .then((res: any) => {
                    resolve(res.json()[0]);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    getAgentsStats(period: any) {
        return new Promise((resolve, reject) => {
            this.http.post(this.url['agents'] + 'getAgentsStats', {
                startDate: period.startDate,
                endDate: period.endDate
            })
                .toPromise()
                .then((res: any) => {
                    resolve(res.json());
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    getAgentEvents(userid: number, period: any) {
        return new Promise((resolve, reject) => {
            this.http.post(this.url['agents'] + 'getAgentEvents', {
                userid,
                startDate: period.startDate,
                endDate: period.endDate
            })
                .toPromise()
                .then((res: any) => {
                    resolve(res.json());
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    getAbandoned(period: any) {
        return new Promise((resolve, reject) => {
            this.http.post(BASE_URL + '/asterisk/getAbandonedCalls', {
                startDate: period.startDate,
                endDate: period.endDate
            })
                .toPromise()
                .then((res: any) => {
                    const resp = res.json();
                    resolve(resp);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    getGenericData(url: string, data: any = {}) {
        return new Promise((resolve, reject) => {
            this.http.post(BASE_URL + url, data)
                .toPromise()
                .then((res: any) => {
                    resolve(res.json());
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    uploadFile(url, formData, progress?) {
        return new Promise((resolve, reject) => {
            const xhr: XMLHttpRequest = new XMLHttpRequest();

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        this.imgSeq++;
                        resolve(JSON.parse(xhr.response));
                    } else {
                        reject(xhr.response);
                    }
                }
            };

            xhr.upload.onprogress = (event) => {
                if (progress) {
                    progress.progress = Math.round(event.loaded / event.total * 100);
                }
            };

            xhr.open('POST', BASE_URL + url, true);
            xhr.withCredentials = true;
            xhr.send(formData);

        });
    }

    getAgentsPausedTimes(period: any) {
        return new Promise((resolve, reject) => {
            this.http.post(this.url['agents'] + 'getAgentsPausedTimes', {
                startDate: period.startDate,
                endDate: period.endDate
            })
                .toPromise()
                .then((res: any) => {
                    const resp = res.json();
                    resolve(resp);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    updateConfig(item) {

        return new Promise((resolve, reject) => {
            const sendItem = JSON.parse(JSON.stringify(item));
            sendItem.blockedextensions = JSON.stringify(sendItem.blockedextensions)
            this.http.put(BASE_URL + '/config/1', sendItem)
                .toPromise()
                .then((res: any) => {
                    this.getConfig();
                    this.imgSeq++;
                    resolve(true);
                })
                .catch(err => {
                    reject(err);
                });
        });

    }

    getConfig() {

        return new Promise((resolve, reject) => {
            this.http.get(BASE_URL + '/config/1')
                .toPromise()
                .then((res: any) => {
                    this.config = res.json();
                    try {
                        this.config.blockedextensions = JSON.parse(this.config.blockedextensions);
                    } catch (e) {
                        this.config.blockedextensions = [];
                    }
                    resolve(true);
                })
                .catch(err => {
                    reject(err);
                });
        });

    }

    sortItems() {

        const ord = this.order === 1 ? ['prime', 'available', 'description'] : ['prime', 'avaiable', 'exten'];
        this.filteredAgents = _.orderBy(this.items['agents'], ['available', 'locked', 'logged', 'paused', 'fullname'], ['desc', 'desc', 'desc', 'desc', 'asc']);
        // this.filteredAgents = _.filter(this.filteredAgents, {type: 1});
        this.orderedExtensions = _.orderBy(this.items['extensions'], ord, ['desc', 'desc', 'asc']);

    }

    loadAll(force = false, loadFpbx = true, supervisor = false) {

        return new Promise((resolve, reject) => {

            if (!this.loaded && !force) {

                this.loaded = true;

                const promisses = [];

                if (supervisor) {
                    promisses.push(this.getItems('', 'agents'));
                    promisses.push(this.getItems('', 'reasons'));
                    promisses.push(this.getItems('', 'queues'));
                }

                promisses.push(this.getItems('', 'contacts'));
                promisses.push(this.getItems('', 'pbxs'));
                promisses.push(this.getConfig());

                // Load main itens
                Promise.all(promisses).then(async res => {

                    this.getGenericData('/users/requestBroadCastAgent');

                    resolve(true);

                }).catch(err => {
                    reject(err);
                });

            } else {
                resolve(true);
            }

        });
    }

    guid() {

        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();

    }

}
