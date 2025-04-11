import * as moment from 'moment';
import {CheckListItem} from "./ivr.definitions";

export interface Instance {
    id: number,
    name: string,
    document?: string,
    contactName1?: string,
    phone1?: string,
    mail1?: string,
    contactName2?: string,
    phone2?: string,
    mail2?: string,
    plan?: { id: number, name: string, price: number },
    active: number,
    deleted: number,
    locked: number,
    usedAgents: number,
    waQueues: number,
}

export interface Task {
    id?: number,
    title: string,
    tags: number[],
    fkOpportunity: number,
    description: string,
    duedate: moment.Moment | null,
    status: number,
    finishdate: moment.Moment | null,
    progress: number,
    owner: number,
    schedulebegin: moment.Moment | null,
    scheduleend: moment.Moment | null,
    order?: number,
    priority?: number,
    checklist?: CheckListItem[],
    files?: any[],
    contacts?: number[],
    watchers?: number[],
    alerts?: number[],
    spenttime?: number,
    users?: number[],
    closedby?: number,
    totaltime?: number,
    action?: number,
    actiondata?: string,
    tmpspenttime?: number,
    laststarttime?: number
}

export interface Opportunity {
    id: number,
    clientid: string,
    title: string,
    mainphone: string,
    mainmail: string,
    contactsCount: number,
    filesCount: number,
    stagebegintime: number,
    value: number,
    recurrentvalue: number,
    origin: number,
    formattedlocation: string,
    country: string,
    city: string,
    countrycode: string,
    locationtype: string,
    state: string,
    address1: string,
    address2: string,
    postalcode: string,
    lat: number,
    lon: number,
    probability: number,
    description: '',
    fkPipeline: number,
    fkCompany: number,
    fkStage: number,
    expectedclosedate: moment.Moment | null,
    frozenuntil: moment.Moment | null,
    visibility: number,
    createdby: number,
    responsableid: number,
    status: number,
    closedat: moment.Moment | null,
    closedby: number,
    contacts: number[],
    parentopportunity?: number[],
    tags: number[],
    files: any[],
    products: any[],
    notes: any[],
    history: any[],
    interactions: any[],
    tasks: Task[],
    formsdata: any,
    followers: number[],
    chatId?: number,
    queueId?: number,
    processing?: boolean
}

export interface Chat {
    id: number,
    clientId: string,
    pageId?: string,
    pageName?: string,
    opportunities?: Opportunity[],
    hasMoreOldMessages: boolean,
    isNew: boolean,
    tabs?: any[],
    sending?: boolean, // Variável local, indica se há uma mensagem em processo de envio
    executingAutomation?: boolean, // Variável local, indica se há uma automação sendo executada no atendimento. Indica somente automações iniciadas pelo agente usando os atalhos
    executingAutomationName?: string, // Variável local, nome da automação em execução
    messagesRequested?: boolean, // Variável local, indica se as mensagens desse atendimento já foram solicitadas
    messagesLoading?: boolean, // Variável local, indica se as mensagens desse atendimento estão sendo carretagadas
    messagesInitialLoading?: boolean, // Variável local, indica se o carregamento inicial de mensagens desse atendimento está sendo processado
    lastSeenMessageId?: string, // Variável local, indica o ID da última mensagem recebida lida pelo agente
    showLastSeenBanner?: boolean, // Variável local, indica se o banner de última mensagem lida deve ser exibido
    webChat?: any,
    desktopChat?: any,
    extraData?: any,
    clientName?: string,
    clientProfileName?: string,
    clientEmail?: string,
    clientUsername?: string,
    clientNumber?: string,
    clientDocument?: string,
    markerId?: number,
    preMessage?: string,
    contactId?: number,
    contactTags?: number[],
    protocol?: string,
    onIvr?: boolean,
    queueRequireReason?: boolean,
    initiatedBy: number,
    priority: number,
    queueId: number,
    queueType: number,
    queueName: string,
    lastSentMsgTime: number,
    lastSntMsgTime: number,
    lastMessageTimestamp: number,
    renovationTime?: number,
    sessionLocked?: boolean,
    responded: boolean,
    userResponded: boolean,
    locked?: boolean,
    lockUserId?: number,
    lockDuration?: number,
    lockTime?: number,
    distributionFilter?: string[],
    typingTime: number,
    firstResponseTime: number,
    desigBeginTime: number,
    lastRcvMsgTime: number,
    clientPicMimeType?: string,
    clientPicAuth?: string,
    beginTime: number,
    firstMsgTime: number,
    messages: any[],
    agentsOnQueue: number,
    newMsgCount?: number,
    oldMessages?: any[],
    msgChangeCounter?: number,
    lastViewedId?: string,
    new?: boolean,
    queueTransferTags?: string[]
}

export interface Product {
    id?: number,
    name: string,
    description: string,
    url: string,
    internalcode: string,
    gtin: string,
    measurementunit: string,
    value: number,
    recurrentvalue: number,
    maxdiscount: number,
    maxrecurrentdiscount: number,
    commission: number,
    queuedata?: any,
    queues?: number[],
    files?: any[],
    photos?: any[],
    associatedforms: number[],
    addtoqueues?: number,
    available?: number,
    aiindexed?: number,
    extrasLoaded?: boolean,
    hasUrl?: boolean,
    hiddenfromclients?: number
}

export interface CustomForm {
    id?: number,
    description: string,
    fieldscount?: number,
    fields: CustomField[],
    name: string
}

export interface Assistant {
    id?: number,
    name: string,
    signaturename: string,
    type: number,
    description: string,
    kbdescription: string,
    condenseddescription: string,
    condensedkbdescription: string,
    preautomation: number,
    postautomation: number,
    msgslimit: number,
    functions: AssistantFunction[],
    faqs: any[],
    exittags: any[],
    files: any[],
    lookinproducts: number,
    usebuttons: number,
    waitfornewmsgs: number,
    optimizedescription: number
}

export interface AssistantFunction {
    id?: string,
    name: string,
    description: string,
    automation: number,
    attrs: AssistantFunctionAttr[]
}

export interface AssistantFunctionAttr {
    key: string,
    description: string,
    type: number,
    required: boolean
}

export interface InformationCard {
    id?: number | string,
    description: string,
    fk_visualgroup: number,
    structure: InformationCardNode[],
    name: string
}

export interface InformationCardNode {
    id: string,
    name: string,
    type: InformationCardNodeType,
    locked: boolean,
    text?: InformationCardTextNode,
    block?: InformationCardBlockNode,
    label?: InformationCardLabelNode,
    button?: InformationCardButtonNode,
    children: InformationCardNode[]
}

export interface InformationCardBlockNode {
    leftBorder: boolean,
    rightBorder: boolean,
    topBorder: boolean,
    bottomBorder: boolean,
    boldLine: boolean,
    verticalAlign: Align,
    horizontalAlign: HorizontalAlign,
    weight: number
}

export interface InformationCardTextNode {
    content: string,
    fontWeight: "light" | "regular" | "medium" | "bold",
    marginTop: number,
    marginLeft: number,
    marginRight: number,
    marginBottom: number,
    fontSize: number,
    verticalAlign: Align,
    horizontalAlign: HorizontalAlign,
    fontColor: string
}

export interface InformationCardLabelNode {
    content: string,
    tooltip: string,
    marginTop: number,
    marginLeft: number,
    marginRight: number,
    marginBottom: number,
    style: "default" | "info" | "warning" | "danger" | "success" | "primary",
    size: "small" | "medium" | "large"
}

export interface InformationCardButtonNode {
    content: string,
    style: "default" | "info" | "alert" | "warning" | "danger" | "success" | "primary" | "green-lighten-1" | "green-lighten-2" | "green-darken-1"
        | "blue-lighten-1" | "blue-lighten-2" | "blue-darken-1" | "red-lighten-1" | "red-lighten-2" | "red-darken-1"
        | "orange-lighten-1" | "orange-lighten-2" | "orange-darken-1" | "black-lighten-1" | "black-lighten-2" | "black-lighten-3" | "black-lighten-4"
        | "yellow-lighten-1" | "yellow-lighten-2" | "yellow-darken-1",
    action: InformationCardButtonNodeActionType,
    actionData: string | number,
    automationData: string,
    marginTop: number,
    marginLeft: number,
    marginRight: number,
    marginBottom: number,
    icon: string,
    tooltip: string,
    loading?: boolean,
    size: "small" | "medium" | "large"
}

export enum Align {
    left,
    center,
    right
}

export enum HorizontalAlign {
    top,
    center,
    bottom
}

export enum InformationCardNodeType {
    lineBlock,
    columnBlock,
    text,
    label,
    button
}

export enum InformationCardButtonNodeActionType {
    url,
    copyData,
    makeCall,
    openTask,
    openOpportunity,
    openContact,
    openCompany,
    openProduct,
    executeAutomation
}

export interface CustomField {
    label: string,
    type: number,
    options: string[],
    required: boolean,
    lock: boolean,
    id: string
}

export interface PipeLine {
    id: number,
    name: string,
    description: string,
    stageorders: number[],
    lockoncartvalue: number,
    winautomation: number,
    loseautomation: number,
    duedateautomation: number,
    automationqueue: number,
    maxdaysonpipeline: number,
    forms: number[],
    visibility: number,
    permissions: any,
    lossreasons: string[],
    opportunitiesautomation: number[],
    opportunitiesLoaded?: boolean,
    opportunitiesLoading?: boolean,
    groups: number[],
    createdby: number
}

export interface PipeStage {
    id: number,
    name: string,
    fk_pipeline: number,
    description: string,
    intid: string,
    enterautomation: number,
    leaveautomation: number,
    stagnationautomation: number,
    cancreate: number,
    canwin: number,
    color: string,
    winprobability: number,
    requiredforms: number[],
    stagnationalert: number,
    createdby: number
}

export interface SimpleUser {
    id: number,
    fullName: string,
    userName: string,
    type: number,
    userPicVersion: number,
    userPicAuth: string,
    contactsGroups: number[]
}

export interface UserLoggedData {
    id: number,
    socketConnected: boolean,
    queueLogged: boolean,
    paused: boolean
}

export interface Ivr {
    id: number,
    name: string,
    description: string,
    type: number,
    allowagentstart: number,
    allowcontactexecution: number,
    allowopportunity: number,
    allowmsgexecution: number,
    audiomsg: number,
    videomsg: number,
    locationmsg: number,
    textmsg: number,
    pdfmsg: number,
    informationmsg: number,
    imagemsg: number,
    allmsgs: number
}

export interface AgentAutomation {
    id: number,
    title: string,
    text: string,
    automation: boolean,
    buttons: any[],
    requestdataform: number,
    allowagentstart: number,
    executionwithoutconfirmation: number,
    allowcontactexecution: number,
    allowopportunity: number,
    allowmsgexecution: number,
    audiomsg: number,
    videomsg: number,
    locationmsg: number,
    textmsg: number,
    pdfmsg: number,
    informationmsg: number,
    imagemsg: number,
    allmsgs: number
}

export interface Company {
    id: number,
    name: string,
    email: string,
    website: string,
    document: string,
    phone: string,
    ceo: string
}

export interface TemplateParam {
    name: string,
    type: number,
    default: string,
    options: string[],
    currencyCode: string
}

export interface Template {
    id: number,
    name: string,
    type: number,
    templatename: string,
    text: string,
    params: TemplateParam[],
    headertext: string,
    headertype: number,
    header_file: string,
    headerparams: TemplateParam[],
    footertext: string,
    queueid?: number,
    buttons: { text: string, type: string, url?: string }[],
    buttonsparams: TemplateParam[]
}

export interface FileDef {
    id?: number,
    name: string,
    description?: string,
    auth?: string,
    data: Blob | ArrayBuffer,
    mimetype: string,
    thumbnail?: string | { width: number, height: number, data: string },
    waveform?: number[],
    width?: number,
    height?: number,
    duration?: number,
    fileSrc?: any
}

export interface TemplateObjectFormData {
    templateId: number,
    data: string[]
}

export interface SendTemplateObject {
    queueid: number, // Id a fila
    number: string, // Número para o qual se deseja enviar o template
    country?: string, // Código ISO do país selecionado, ex. BR
    checkForOpen?: boolean, // Se deve verificar se já existe um chat aberto com o número antes de enviar o template
    openNewChat?: boolean, // Se deve abrir um novo chat com o número após o envio do template
    transfer?: boolean, // Case já exista um atendimento aberto, se deve transferir o atendimento para o agente atual, se possível
    markerId?: number, // Número da etiqueta de chat que será associada ao novo chat aberto
    filters?: string, // Filtros de distribuição, separagos por vírgula, associados ao novo chat aberto
    formData: TemplateObjectFormData // Dados do template que será enviado
}
