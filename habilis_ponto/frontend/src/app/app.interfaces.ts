/**
 * Created by filipe on 21/09/16.
 */


export interface ObjectCallStatus {
    avaiable?: boolean,
    paused?: boolean,
    incall?: boolean,
    ringing?: boolean,
    opStatus?: number,
    direction?: string,
    callernumber?: string,
    channel?: string,
    busy?: boolean
}

export interface QueueStatus {
    id: number,
    name: string,
    number: number,
    logged: boolean
}

export interface User extends ObjectCallStatus {
    username: string,
    sipuser: string,
    sippass: string,
    fullname: string,
    type: number,
    status: number,
    supervisorid: number,
    worktime: number,
    changepassword: number,
    autoanswer: number,
    passworddate: Date,
    ip: string,
    fk_asterisk: any,
    id?: number,
    createdAt?: Date,
    updatedAt?: Date,
    logged?: boolean,
    locked: number,
    password?: string,
    reasonid?: number,
    reasontext?: string,
    view?: number,
    time?: number,
    loggedtime?: number,
    pausedtime?: number,
    avaiabletime?: number,
    socketaccess?: string,
    queues?: QueueStatus[],
    extenfilter?: string[],
    extenexception?: string[],
    extenpriority?: string[],
    canlisten?: number,
    canrecord?: number,
    canwhisper?: number,
    canpickup?: number,
    cansetfollowme?: number,
    candnd?: number,
    canaccesscdr?: number,
    canaccessquality?: number,
    canaccessevaluations?: number,
    canaccessabandoned?: number,
    canaccesspivot?: number,
    canaccessgeneral?: number,
    candeleterecord?: number,
    candropqueuecall?: number,
    canchangeexten?: number,
    forcesurvey: number,
    showscoreondashboard: number,
    autologin: number,
    locklogout: number,
    channel?: string,
    destchannel?: string
}

export class UserConstructor implements User {

    constructor(public username = "", public fullname = "", public type = 1, public status = 1,
                public supervisorid = 0, public worktime = 0, public sippass = "", public sipuser = "",
                public changepassword = 0, public autoanswer = 1, public passworddate = new Date(),
                public ip = "", public fk_asterisk = 1, public logged = false, public locked = 0, public view = 0,
                public id = null, public extenfilter = [], public extenexception = [], public extenpriority = [],
                public canlisten = 1, public canrecord = 1, public canwhisper = 1, public canpickup = 1,
                public cansetfollowme = 1, public candnd = 1, public canaccesscdr = 1, public canaccessquality = 1, public canaccessevaluations = 1,
                public canaccessabandoned = 1, public canaccesspivot = 1, public canaccessgeneral = 1, public candeleterecord = 1,
                public candropqueuecall = 1, public canchangeexten = 1, public forcesurvey = 0, public showscoreondashboard = 0,
                public autologin = 0, public locklogout = 0) {

    }

}

export interface Caller {
    calleridnum: number,
    position: number,
    time: Date,
    holdTime: string
}

export interface Queue {
    id?: number,
    number: number,
    name: string,
    minagents: number,
    status: number,
    abandonedsla: number,
    timesla: number,
    recallsla: number,
    notesla: number,
    callsinsla: number,
    holdtime?: number,
    talktime?: number,
    recall?: number,
    sla?: number,
    nsla?: number,
    maxhold?: number,
    abandonedcount?: number,
    answeredcount?: number,
    callscount?: number,
    callers?: Caller[]
}

export class QueueConstructor implements Queue {
    constructor(public number = 0, public name = '', public minagents = 0, public status = 1, public abandonedsla = 0,
                public timesla = 0, public recallsla = 0, public notesla = 0, public callsinsla = 0, public callers = []) {
    }
}

export interface Reason {
    id?: number,
    text: string,
    maxtime: number,
    timesperday: number,
    status: number,
    action: number
}

export class ReasonConstructor implements Reason {
    constructor(public text = '', public maxtime = 10, public timesperday = 2, public status = 1, public action = 0) {
    }
}

export interface Pbx {
    id?: number,
    host: string,
    wsport: string,
    amiuser: string,
    amipass: string,
    amiport: string,
    ariuser: string,
    aripass: string,
    status: number
}

export class PbxConstructor implements Pbx {
    constructor(public host = '', public wsport = '8088', public amiuser = '', public amipass = '', public amiport = '5038',
                public ariuser = '', public aripass = '', public status = 1) {
    }
}

export interface GeneralConfig {
    maxfilesize: number,
    abandonedsla: number,
    recallsla: number,
    notesla: number,
    callsinsla: number,
    customlogo: number,
    passwordpolicy: number,
    headercolor: string,
    customlogodata?: any,
    apikey: string,
    bgapikey: string,
    bgprojectid: string,
    bgdataset: string,
    bgstatus?: number,
    bgdeleteold: number,
    bglastsync?: string,
    bglastsyncresult?: number,
    disablequotes?: number,
    housekeepingfrequency: number,
    housekeepingdays: number,
    reduceimgquality?: number,
    enablecommission?: number,
    blockedextensions: string[],
    license: boolean,
    maxAgents: number,
    maxAdms: number,
    kentro_version: string,
    notificationqueueid: number,
    contactautomationqueueid: number,
    instanceautomationqueue?: number,
    instanceofflineautomation?: number,
    instancecreatedautomation?: number,
    instancedeletionrequestedautomation?: number,
    instancereactivationautomation?: number,
    instanceupdatedautomation?: number,
    asteriskamihost: string,
    asteriskamiport: number,
    asteriskamiuser: string,
    asteriskamipass: string,
    asteriskwsshost: string,
    asteriskwssport: number,
    enabletelephony: number,
    altwssphoneregister: number,
    language?: string,
    languagecode?: string,
    defaultcountry?: string,
    aistudiokey?: string,
    openaikey?: string,
    anthropickey?: string,
    bedrockkey?: string,
    deepinfrakey?: string,
    enablecopilot?: number,
    copilotmodel?: number,
    monthlyusedtokens?: number,
    tokenslimit?: number,
    lasttokensreset?: number,
    lasttokensresetdate?: Date,
    blockduplicatecontact?: number,
    debug?: boolean
}

export class GeneralConfigConstructor implements GeneralConfig {

    constructor(public maxfilesize = 3000000, public abandonedsla = 0, public recallsla = 0,
                public notesla = 0, public callsinsla = 0, public customlogo = 0,
                public passwordpolicy = 0, public maxAdms = 0,
                public headercolor = '#2196f3', public apikey = '', public housekeepingfrequency = 0,
                public housekeepingdays = 180, reduceimgquality = 0, enablecommission = 0,
                public blockedextensions: string[] = [], public bgapikey = '', public bgdataset = '', public bgprojectid = '',
                public kentro_version = '', public maxAgents = 0, public license = false,
                public notificationqueueid = 0, public blockduplicatecontact = 0, public contactautomationqueueid = 0, public bgdeleteold = 0,
                disablequotes = 0, public debug = false, public enabletelephony = 0, public altwssphoneregister = 0,
                public asteriskamihost = '', public asteriskamiport = 0, public asteriskamiuser = '', public asteriskamipass = '',
                public asteriskwsshost = '', public asteriskwssport = 0, public language = '', public languagecode = '',
                public defaultcountry = '') {
    }

}

export interface Trunk {
    trunkid: number,
    name: string,
    tech: string,
    outcid: string,
    keepcid: string,
    maxchans: string,
    failscript: string,
    dialoutprefix: string,
    channelid: string,
    usercontext: string,
    provider: string,
    disabled: string,
    continue: string,
    channel: string,
    channelLength: number,
    calls?: Call[]
}

export interface Extension extends ObjectCallStatus {
    exten: string,
    description: string,
    dnd: boolean,
    tech: string,
    status: number,
    calls: Call[],
    ip: string,
    lag: string,
    onHold?: boolean,
    spying: boolean,
    spyedchannel: string,
    spyed: boolean,
    spyeechannel: string,
    mailbox: boolean,
    mailboxcount: number,
    mine: boolean,
    prime: boolean,
    isAgentApp: boolean,
    wucCalls: string[]
}

export class ExtensionConstructor implements Extension {
    constructor(public exten = '',
                public description = '',
                public dnd = false,
                public tech = '',
                public status = 0,
                public channel = '',
                public calls = [],
                public ip = '',
                public lag = '',
                public avaiable = false,
                public incall = false,
                public ringing = false,
                public busy = false,
                public onHold = false,
                public opStatus = 0,
                public direction = '',
                public callernumber = '',
                public spying = false,
                public spyedchannel = '',
                public spyed = false,
                public spyeechannel = '',
                public mailbox = false,
                public mailboxcount = 0,
                public mine = false,
                public prime = false,
                public isAgentApp = false,
                public wucCalls = []) {
    }
}

export interface Call {
    number: string,
    name: string,
    destnumber?: string,
    destname?: string,
    uniqueid: string,
    dialstring: string,
    channel: string,
    destchannel: string,
    onhold: boolean,
    direction: string,
    ringing: boolean,
    answered: boolean,
    recording: boolean,
    timer: number,
    exten?: Extension,
    agent?: any
}

export class CallConstructor implements Call {

    constructor(public number = '', public name = '', public destnumber = '', public destname = '', public uniqueid = '',
                public dialstring = '', public channel = '', public onhold = false, public direction = '', public ringing = true,
                public answered = false, public recording = false, public timer = 0, public destchannel = '') {
    }

}

export interface Ringgroup {
    grpnum: string,
    grplist: string,
    description: string
}
