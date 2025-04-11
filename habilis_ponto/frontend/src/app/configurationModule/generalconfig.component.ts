/**
 * Created by filipe on 19/09/16.
 */
import {ChangeDetectorRef, Component} from '@angular/core';
import {Router} from "@angular/router";
import {GeneralConfig, GeneralConfigConstructor} from "../app.interfaces";
import {NotificationsService} from "angular2-notifications";
import {LoadingService} from "../loadingModule/loading.service";
import {StatusService} from "../services/status.service";
import {BASE_URL} from "../app.consts";
import {HttpClient} from "@angular/common/http";
import {texts} from "../app.texts";
import {ConfirmAction} from "../reusable/confirmaction.decorator";
import {MatDialog} from "@angular/material/dialog";
import * as filesize from 'filesize';
import {DownloadMarkedChatsComponent} from "./download-marked-chats.component";
import {DownloadChatsByIdComponent} from "./download-chats-by-id.component";
import {copyArrayItem} from "@angular/cdk/drag-drop";
import {MatSnackBar} from "@angular/material/snack-bar";
import * as uuid from 'uuid';
import {countrysList} from './countryslist.class';
import * as moment from 'moment';

@Component({
    templateUrl: 'generalconfig.component.html'
})

export class GeneralConfigComponent {

    texts = texts;
    public localItem: GeneralConfig = new GeneralConfigConstructor();
    public file: File;
    public headerFile: File;
    public progress = {progress: 0};
    public headerProgress = {progress: 0};
    public base = BASE_URL;
    assistants = [];

    public extensions = ['.exe', '.vbs', '.vb', '.vbe', '.bat', '.cmd', '.js', '.jse', '.ws', '.wsf', '.wsc',
        '.wsh', '.ps1', '.ps2', '.psc1', '.psc2', '.ps1xml', '.ps2xml', '.msh', '.msh1', '.msh2', '.mshxml',
        '.msh1xml', '.msh2xml', '.msi', '.com', '.scr', '.hta', '.cpl', '.pif', '.application', '.gadget',
        '.msp', '.msc', '.jar', '.scf', '.lnk', '.inf', '.reg', '.docm', '.dotm', '.xlsm', '.xltm', '.xlam',
        '.pptm', '.potm', '.ppam', '.ppsm', '.sldm', '.zip', '.7z', '.rar'];

    updateLoading = false;
    sweepLoading = false;
    optimizeLoading = false;
    selectedTimezone = '';
    diskData;

    public timezones = ["Africa/Abidjan", "Africa/Accra", "Africa/Addis_Ababa", "Africa/Algiers", "Africa/Asmara", "Africa/Asmera", "Africa/Bamako", "Africa/Bangui", "Africa/Banjul", "Africa/Bissau", "Africa/Blantyre", "Africa/Brazzaville", "Africa/Bujumbura", "Africa/Cairo", "Africa/Casablanca", "Africa/Ceuta", "Africa/Conakry", "Africa/Dakar", "Africa/Dar_es_Salaam", "Africa/Djibouti", "Africa/Douala", "Africa/El_Aaiun", "Africa/Freetown", "Africa/Gaborone", "Africa/Harare", "Africa/Johannesburg", "Africa/Juba", "Africa/Kampala", "Africa/Khartoum", "Africa/Abidjan", "Africa/Accra", "Africa/Addis_Ababa", "Africa/Algiers", "Africa/Asmara", "Africa/Asmera", "Africa/Bamako", "Africa/Bangui", "Africa/Banjul", "Africa/Bissau", "Africa/Blantyre", "Africa/Brazzaville", "Africa/Bujumbura", "Africa/Cairo", "Africa/Casablanca", "Africa/Ceuta", "Africa/Conakry", "Africa/Dakar", "Africa/Dar_es_Salaam", "Africa/Djibouti", "Africa/Douala", "Africa/El_Aaiun", "Africa/Freetown", "Africa/Gaborone", "Africa/Harare", "Africa/Johannesburg", "Africa/Juba", "Africa/Kampala", "Africa/Khartoum", "Africa/Kigali", "Africa/Kinshasa", "Africa/Lagos", "Africa/Libreville", "Africa/Lome", "Africa/Luanda", "Africa/Lubumbashi", "Africa/Lusaka", "Africa/Malabo", "Africa/Maputo", "Africa/Maseru", "Africa/Mbabane", "Africa/Mogadishu", "Africa/Monrovia", "Africa/Nairobi", "Africa/Ndjamena", "Africa/Niamey", "Africa/Nouakchott", "Africa/Ouagadougou", "Africa/Porto-Novo", "Africa/Sao_Tome", "Africa/Timbuktu", "Africa/Tripoli", "Africa/Tunis", "Africa/Windhoek", "America/Adak", "America/Anchorage", "America/Anguilla", "America/Antigua", "America/Araguaina", "America/Argentina/Buenos_Aires", "America/Argentina/Catamarca", "America/Argentina/ComodRivadavia", "America/Argentina/Cordoba", "America/Argentina/Jujuy", "America/Argentina/La_Rioja", "America/Argentina/Mendoza", "America/Argentina/Rio_Gallegos", "America/Argentina/Salta", "America/Argentina/San_Juan", "America/Argentina/San_Luis", "America/Argentina/Tucuman", "America/Argentina/Ushuaia", "America/Aruba", "America/Asuncion", "America/Atikokan", "America/Atka", "America/Bahia", "America/Bahia_Banderas", "Africa/Abidjan", "Africa/Accra", "Africa/Addis_Ababa", "Africa/Algiers", "Africa/Asmara", "Africa/Asmera", "Africa/Bamako", "Africa/Bangui", "Africa/Banjul", "Africa/Bissau", "Africa/Blantyre", "Africa/Brazzaville", "Africa/Bujumbura", "Africa/Cairo", "Africa/Casablanca", "Africa/Ceuta", "Africa/Conakry", "Africa/Dakar", "Africa/Dar_es_Salaam", "Africa/Djibouti", "Africa/Douala", "Africa/El_Aaiun", "Africa/Freetown", "Africa/Gaborone", "Africa/Harare", "Africa/Johannesburg", "Africa/Juba", "Africa/Kampala", "Africa/Khartoum", "Africa/Kigali", "Africa/Kinshasa", "Africa/Lagos", "Africa/Libreville", "Africa/Lome", "Africa/Luanda", "Africa/Lubumbashi", "Africa/Lusaka", "Africa/Malabo", "Africa/Maputo", "Africa/Maseru", "Africa/Mbabane", "Africa/Mogadishu", "Africa/Monrovia", "Africa/Nairobi", "Africa/Ndjamena", "Africa/Niamey", "Africa/Nouakchott", "Africa/Ouagadougou", "Africa/Porto-Novo", "Africa/Sao_Tome", "Africa/Timbuktu", "Africa/Tripoli", "Africa/Tunis", "Africa/Windhoek", "America/Adak", "America/Anchorage", "America/Anguilla", "America/Antigua", "America/Araguaina", "America/Argentina/Buenos_Aires", "America/Argentina/Catamarca", "America/Argentina/ComodRivadavia", "America/Argentina/Cordoba", "America/Argentina/Jujuy", "America/Argentina/La_Rioja", "America/Argentina/Mendoza", "America/Argentina/Rio_Gallegos", "America/Argentina/Salta", "America/Argentina/San_Juan", "America/Argentina/San_Luis", "America/Argentina/Tucuman", "America/Argentina/Ushuaia", "America/Aruba", "America/Asuncion", "America/Atikokan", "America/Atka", "America/Bahia", "America/Bahia_Banderas", "America/Barbados", "America/Belem", "America/Belize", "America/Blanc-Sablon", "America/Boa_Vista", "America/Bogota", "America/Boise", "America/Buenos_Aires", "America/Cambridge_Bay", "America/Campo_Grande", "America/Cancun", "America/Caracas", "America/Catamarca", "America/Cayenne", "America/Cayman", "America/Chicago", "America/Chihuahua", "America/Ciudad_Juarez", "America/Coral_Harbour", "America/Cordoba", "America/Costa_Rica", "America/Creston", "America/Cuiaba", "America/Curacao", "America/Danmarkshavn", "America/Dawson", "America/Dawson_Creek", "America/Denver", "America/Detroit", "America/Dominica", "America/Edmonton", "America/Eirunepe", "America/El_Salvador", "America/Ensenada", "America/Fort_Nelson", "America/Fort_Wayne", "America/Fortaleza", "America/Glace_Bay", "America/Godthab", "America/Goose_Bay", "America/Grand_Turk", "America/Grenada", "America/Guadeloupe", "America/Guatemala", "America/Guayaquil", "America/Guyana", "America/Halifax", "America/Havana", "America/Hermosillo", "America/Indiana/Indianapolis", "America/Indiana/Knox", "America/Indiana/Marengo", "America/Indiana/Petersburg", "America/Indiana/Tell_City", "America/Indiana/Vevay", "America/Indiana/Vincennes", "America/Indiana/Winamac", "America/Indianapolis", "America/Inuvik", "America/Iqaluit", "America/Jamaica", "America/Jujuy", "America/Juneau", "America/Kentucky/Louisville", "America/Kentucky/Monticello", "America/Knox_IN", "America/Kralendijk", "America/La_Paz", "America/Lima", "America/Los_Angeles", "America/Louisville", "America/Lower_Princes", "America/Maceio", "America/Managua", "America/Manaus", "America/Marigot", "America/Martinique", "America/Matamoros", "America/Mazatlan", "America/Mendoza", "America/Menominee", "America/Merida", "America/Metlakatla", "America/Mexico_City", "America/Miquelon", "America/Moncton", "America/Monterrey", "America/Montevideo", "America/Montreal", "America/Montserrat", "America/Nassau", "America/New_York", "America/Nipigon", "America/Nome", "America/Noronha", "America/North_Dakota/Beulah", "America/North_Dakota/Center", "America/North_Dakota/New_Salem", "America/Nuuk", "America/Ojinaga", "America/Panama", "America/Pangnirtung", "America/Paramaribo", "America/Phoenix", "America/Port-au-Prince", "America/Port_of_Spain", "America/Porto_Acre", "America/Porto_Velho", "America/Puerto_Rico", "America/Punta_Arenas", "America/Rainy_River", "America/Rankin_Inlet", "America/Recife", "America/Regina", "America/Resolute", "America/Rio_Branco", "America/Rosario", "America/Santa_Isabel", "America/Santarem", "America/Santiago", "America/Santo_Domingo", "America/Sao_Paulo", "America/Scoresbysund", "America/Shiprock", "America/Sitka", "America/St_Barthelemy", "America/St_Johns", "America/St_Kitts", "America/St_Lucia", "America/St_Thomas", "America/St_Vincent", "America/Swift_Current", "America/Tegucigalpa", "America/Thule", "America/Thunder_Bay", "America/Tijuana", "America/Toronto", "America/Tortola", "America/Vancouver", "America/Virgin", "America/Whitehorse", "America/Winnipeg", "America/Yakutat", "America/Yellowknife", "Antarctica/Casey", "Antarctica/Davis", "Antarctica/DumontDUrville", "Antarctica/Macquarie", "Antarctica/Mawson", "Antarctica/McMurdo", "Antarctica/Palmer", "Antarctica/Rothera", "Antarctica/South_Pole", "Antarctica/Syowa", "Antarctica/Troll", "Antarctica/Vostok", "Arctic/Longyearbyen", "Asia/Aden", "Asia/Almaty", "Asia/Amman", "Asia/Anadyr", "Asia/Aqtau", "Asia/Aqtobe", "Asia/Ashgabat", "Asia/Ashkhabad", "Asia/Atyrau", "Asia/Baghdad", "Asia/Bahrain", "Asia/Baku", "Asia/Bangkok", "Asia/Barnaul", "Asia/Beirut", "Asia/Bishkek", "Asia/Brunei", "Asia/Calcutta", "Asia/Chita", "Asia/Choibalsan", "Asia/Chongqing", "Asia/Chungking", "Asia/Colombo", "Asia/Dacca", "Asia/Damascus", "Asia/Dhaka", "Asia/Dili", "Asia/Dubai", "Asia/Dushanbe", "Asia/Famagusta", "Asia/Gaza", "Asia/Harbin", "Asia/Hebron", "Asia/Ho_Chi_Minh", "Asia/Hong_Kong", "Asia/Hovd", "Asia/Irkutsk", "Asia/Istanbul", "Asia/Jakarta", "Asia/Jayapura", "Asia/Jerusalem", "Asia/Kabul", "Asia/Kamchatka", "Asia/Karachi", "Asia/Kashgar", "Asia/Kathmandu", "Asia/Katmandu", "Asia/Khandyga", "Asia/Kolkata", "Asia/Krasnoyarsk", "Asia/Kuala_Lumpur", "Asia/Kuching", "Asia/Kuwait", "Asia/Macao", "Asia/Macau", "Asia/Magadan", "Asia/Makassar", "Asia/Manila", "Asia/Muscat", "Asia/Nicosia", "Asia/Novokuznetsk", "Asia/Novosibirsk", "Asia/Omsk", "Asia/Oral", "Asia/Phnom_Penh", "Asia/Pontianak", "Asia/Pyongyang", "Asia/Qatar", "Asia/Qostanay", "Asia/Qyzylorda", "Asia/Rangoon", "Asia/Riyadh", "Asia/Saigon", "Asia/Sakhalin", "Asia/Samarkand", "Asia/Seoul", "Asia/Shanghai", "Asia/Singapore", "Asia/Srednekolymsk", "Asia/Taipei", "Asia/Tashkent", "Asia/Tbilisi", "Asia/Tehran", "Asia/Tel_Aviv", "Asia/Thimbu", "Asia/Thimphu", "Asia/Tokyo", "Asia/Tomsk", "Asia/Ujung_Pandang", "Asia/Ulaanbaatar", "Asia/Ulan_Bator", "Asia/Urumqi", "Asia/Ust-Nera", "Asia/Vientiane", "Asia/Vladivostok", "Asia/Yakutsk", "Asia/Yangon", "Asia/Yekaterinburg", "Asia/Yerevan", "Atlantic/Azores", "Atlantic/Bermuda", "Atlantic/Canary", "Atlantic/Cape_Verde", "Atlantic/Faeroe", "Atlantic/Faroe", "Atlantic/Jan_Mayen", "Atlantic/Madeira", "Atlantic/Reykjavik", "Atlantic/South_Georgia", "Atlantic/St_Helena", "Atlantic/Stanley", "Australia/ACT", "Australia/Adelaide", "Australia/Brisbane", "Australia/Broken_Hill", "Australia/Canberra", "Australia/Currie", "Australia/Darwin", "Australia/Eucla", "Australia/Hobart", "Australia/LHI", "Australia/Lindeman", "Australia/Lord_Howe", "Australia/Melbourne", "Australia/NSW", "Australia/North", "Australia/Perth", "Australia/Queensland", "Australia/South", "Australia/Sydney", "Australia/Tasmania", "Australia/Victoria", "Australia/West", "Australia/Yancowinna"];

    public countrys = countrysList;

    public filteredTimezones = this.timezones;

    // const languages = ['pt-pt', 'fr-fr', 'en-us', 'en-gb', 'es-es', 'es-ar', 'de-de', 'nl-be', 'ca-ca', 'et-et', 'it-it'];

    public languages = [{code: 'pt-BR', name: 'Português Brasileiro'},
        {code: 'en-US', name: 'English (US)'},
        {code: 'en-GB', name: 'English (UK)'},
        {code: 'es-ES', name: 'Español (España)'},
        {code: 'es-AR', name: 'Español (Argentina)'},
        {code: 'fr-FR', name: 'Français (France)'},
        {code: 'de-DE', name: 'Deutsch (Deutschland)'},
        {code: 'nl-BE', name: 'Nederlands (België)'},
        {code: 'ca-CA', name: 'Català (Catalunya)'},
        {code: 'et-ET', name: 'Eesti (Eesti)'},
        {code: 'it-IT', name: 'Italiano (Italia)'},
        {code: 'pt-PT', name: 'Português (Portugal)'},
    ]

    // public languages = ['Portugês Brasileiro', 'English (US)', 'English (UK)', 'Español (España)', 'Español (Argentina)', 'Français (France)', 'Deutsch (Deutschland)', 'Nederlands (België)', 'Català (Catalunya)', 'Eesti (Eesti)', 'Italiano (Italia)'];

    public filteredLanguages = this.languages;
    public languageSelected: any = {};
    public filteredCountrys = this.countrys

    constructor(private router: Router, public items: StatusService, private http: HttpClient,
                public dialog: MatDialog, private changeDetector: ChangeDetectorRef, private snack: MatSnackBar,
                private notifications: NotificationsService, private loading: LoadingService) {

        this.getConfig();
        this.getTimezone();
        this.getDiskData();
        this.loadAssistants();

    }

    loadAssistants() {
        this.http.post(BASE_URL + '/assistants/getItems', {full: true}, {
            observe: "response"
        }).subscribe((res: any) => {
            this.assistants = res.body;
        });
    }

    filterCountryOptions(text) {
        // this.filteredTimezones = [];
        // if (!text) {
        //   this.filteredTimezones = this.timezones;
        //   return;
        // }
        // for (const timezone of this.timezones) {
        //   if (timezone.toLowerCase().trim().includes(text.toLowerCase().trim())) {
        //     this.filteredTimezones.push(timezone);
        //   }
        // }
        // replique esse código mas para um array de objetos com essa estrutura ex
        // {
        // "ordem": 21,
        // "nome": "Bangladesh",
        // "sigla2": "BD",
        // "sigla3": "BGD",
        // "codigo": "050"
        // },

        this.filteredCountrys = [];
        if (!text) {
            this.filteredCountrys = this.countrys;
            return;
        }
        for (const country of this.countrys) {
            if (country.nome.toLowerCase().trim().includes(text.toLowerCase().trim())) {
                this.filteredCountrys.push(country);
            }
        }

    }

    filterOptions(text) {
        this.filteredTimezones = [];
        if (!text) {
            this.filteredTimezones = this.timezones;
            return;
        }
        for (const timezone of this.timezones) {
            if (timezone.toLowerCase().trim().includes(text.toLowerCase().trim())) {
                this.filteredTimezones.push(timezone);
            }
        }
    }

    filterLanguageOptions(text) {
        this.filteredLanguages = [];
        if (!text) {
            this.filteredLanguages = this.languages;
            return;
        }
        for (const language of this.languages) {
            if (language.name.toLowerCase().trim().includes(text.toLowerCase().trim())) {
                this.filteredLanguages.push(language);
            }
        }
    }

    getConfig() {
        this.http.get(BASE_URL + '/config/getConfig').subscribe((r: any) => {
            console.log(r)
            this.localItem = r;
            this.languageSelected = this.languages.find(l => l.code === this.localItem.languagecode);
            this.localItem.notificationqueueid = this.localItem.notificationqueueid || 0;
            this.localItem.instanceautomationqueue = this.localItem.instanceautomationqueue || 0;
            this.localItem.instanceofflineautomation = this.localItem.instanceofflineautomation || 0;
            this.localItem.instancecreatedautomation = this.localItem.instancecreatedautomation || 0;
            this.localItem.instancedeletionrequestedautomation = this.localItem.instancedeletionrequestedautomation || 0;
            this.localItem.instanceupdatedautomation = this.localItem.instanceupdatedautomation || 0;
            this.localItem.instancereactivationautomation = this.localItem.instancereactivationautomation || 0;
            this.localItem.lasttokensresetdate = moment(this.localItem.lasttokensreset * 1000).toDate();
            try {
                this.localItem.blockedextensions = r.blockedextensions;
            } catch (e) {
                this.localItem.blockedextensions = [];
            }
        }, err => {
            console.log(err);
        });
    }

    getTimezone() {
        this.http.get(BASE_URL + '/config/getTimezone').subscribe((r: any) => {
            this.selectedTimezone = r.timezone;
        }, err => {
            console.log(err);
        });
    }

    setTimezone() {
        this.http.post(BASE_URL + '/config/setTimezone', {timezone: this.selectedTimezone}).subscribe((r: any) => {
            this.notifications.success($localize`Sucesso`, $localize`Fuso horário atualizado com sucesso. É necessário reiniciar a instância para que a mudança faça efeito.`);
        }, err => {
            console.log(err);
            this.notifications.error($localize`Error`, $localize`Erro ao atualizar fuso horário!`);
        });
    }

    @ConfirmAction('dialog', {
        text: $localize`Tem certeza que deseja solicitar o início da sincronização agora? A execução de sincronização durante a operação pode impactar o desempenho do sistema.`,
        title: $localize`Iniciar sincronização`,
        yesButtonText: $localize`Iniciar`,
        yesButtonStyle: 'warning',
        noButtonText: $localize`Cancelar`
    })
    startBiSync() {
        this.http.get(BASE_URL + '/config/startBiSync').subscribe((r: any) => {
            this.notifications.success($localize`Sucesso`, $localize`Sincronização solicitada com sucesso.`);
        }, err => {
            console.log(err);
            this.notifications.error($localize`Error`, $localize`Erro ao iniciar sincronização!`);
        });
    }

    @ConfirmAction('dialog', {
        text: $localize`Tem certeza que deseja solicitar a limpeza de todos os dados de sincronização? Essa ação não poderá ser desfeita.`,
        title: $localize`Limpar dados de sincronizaçaõ`,
        yesButtonText: $localize`Limpar`,
        yesButtonStyle: 'danger',
        noButtonText: $localize`Cancelar`
    })
    clearBiSync() {
        this.http.get(BASE_URL + '/config/clearBiSync').subscribe((r: any) => {
            this.notifications.success($localize`Sucesso`, $localize`Limpeza solicitada com sucesso.`);
        }, err => {
            console.log(err);
            this.notifications.error($localize`Error`, $localize`Erro ao solicitar limpeza!`);
        });
    }

    getDiskData() {
        this.http.get(BASE_URL + '/api/checkDisk').subscribe((r: any) => {
            const size = filesize.partial({base: 2});
            this.diskData = {};
            this.diskData.size = size(r.dbSize);
            this.diskData.quota = size(r.quota);
            this.diskData.gallerySize = size(r.gallerySize);
            this.diskData.filesSize = size(r.filesSize);
            this.diskData.chatsCount = r.chatsCount;
            this.diskData.markForSweep = r.markForSweep;
            this.diskData.cutId = r.cutId;
            this.diskData.minId = r.minId;
            this.diskData.cutIdDate = r.cutIdDate;
            this.diskData.cutDate = r.cutDate;
            // this.diskData.free = Math.round((this.diskData.free / 1024 / 1024 / 1024) * 100) / 100
            // console.log(r);
        }, err => {
            console.log(err);
        });
    }

    doBackup() {
        // window.open(BASE_URL + `/api/backup`, '_blank');
    }


    @ConfirmAction('dialog', {
        text: $localize`Tem certeza que deseja gerar uma nova chave de api? Se vocêm gerar uma nova chave, a antiga perderá o valor e não poderá mais ser utilizada. Essa modificação só é aplicada após você salvar as configurações no botão ao final do formulário.`,
        title: $localize`Gerar chave`,
        yesButtonText: $localize`Gerar`,
        yesButtonStyle: 'warning',
        noButtonText: $localize`Cancelar`
    })
    genApiKey() {
        this.localItem.apikey = uuid.v4().replace(/-/g, '');
    }

    copyApiKey() {
        navigator.clipboard.writeText(this.localItem.apikey);
        this.snack.open($localize`Copiado!`, '', {duration: 700});
    }

    downloadMarkedChats() {
        this.dialog.open(DownloadMarkedChatsComponent, {
            data: {
                cutId: this.diskData?.cutId,
                minId: this.diskData?.minId
            }
        });
    }

    @ConfirmAction('dialog', {
        text: $localize`Tem certeza que deseja realizar a limpeza do servidor agora?`,
        title: $localize`Limpar agora`,
        yesButtonText: $localize`Limpar`,
        noButtonText: $localize`Cancelar`
    })
    sweepNow() {
        this.sweepLoading = true;
        this.http.get(BASE_URL + '/api/sweepNow').subscribe((r: any) => {
            this.getDiskData();
            this.sweepLoading = false;
            this.notifications.success($localize`Sucesso`, $localize`Solicitação de atualização enviada com sucesso.`);
        }, err => {
            console.log(err);
            this.notifications.error($localize`Error`, $localize`Erro ao atualizar dados!`);
        });
    }

    @ConfirmAction('dialog', {
        text: $localize`Tem certeza que deseja realizar a otimização do servidor agora?`,
        title: $localize`Otimizar agora`,
        yesButtonText: $localize`Otimizar`,
        noButtonText: $localize`Cancelar`
    })
    optimizeNow() {
        this.optimizeLoading = true;
        this.http.get(BASE_URL + '/api/optimizeNow').subscribe((r: any) => {
            this.optimizeLoading = false;
            this.notifications.success($localize`Sucesso`, $localize`Solicitação de otimização enviada com sucesso.`);
        }, err => {
            console.log(err);
            this.notifications.error($localize`Error`, $localize`Erro ao atualizar dados!`);
        });
    }


    downloadChatsByIdInterval() {
        this.dialog.open(DownloadChatsByIdComponent, {data: {minId: this.diskData?.minId}});
    }

    updateDBSize() {
        this.updateLoading = true;
        this.http.get(BASE_URL + '/api/updateDiskStats').subscribe((r: any) => {
            this.getDiskData();
            this.updateLoading = false;
            this.notifications.success($localize`Sucesso`, $localize`Solicitação de atualização enviada com sucesso.`);
        }, err => {
            console.log(err);
            this.updateLoading = false;
            this.notifications.error($localize`Error`, $localize`Erro ao atualizar dados!`);
        });
    }

    save() {

        const sendItem = JSON.parse(JSON.stringify(this.localItem));
        // sendItem.languagecode = this.languagesMap.find(l => l.name === sendItem.language).code;
        sendItem.language = this.languageSelected.name || '';
        sendItem.languagecode = this.languageSelected.code || '';
        sendItem.blockedextensions = JSON.stringify(sendItem.blockedextensions);
        sendItem.pagseguroenabled = sendItem.pagseguroenabled ? 1 : 0;
        sendItem.enablecopilot = sendItem.enablecopilot ? 1 : 0;
        sendItem.enabletelephony = sendItem.enabletelephony ? 1 : 0;
        sendItem.bgdeleteold = sendItem.bgdeleteold ? 1 : 0;
        delete sendItem.bglastsync;
        delete sendItem.bglastsyncresult;
        this.loading.start();
        this.http.put(BASE_URL + '/config/1', sendItem, {
            observe: "response"
        }).subscribe((r: any) => {
            this.loading.stop();
            this.notifications.success($localize`Sucesso`, $localize`Configuração atualizada com sucesso!`);
        }, err => {
            this.loading.stop();
            console.log(err);
        });

    }

    @ConfirmAction('dialog', {
        text: $localize`Deseja executar um teste para verificar se a chave inserida é válida? Você deve salvar a chave antes de executar o teste.`,
        title: $localize`Executar teste`,
        yesButtonText: $localize`Executar`,
        noButtonText: $localize`Cancelar`
    })
    testOpenAIKey() {
        this.http.post(BASE_URL + '/api/testOpenAiKey', {
            observe: "response"
        }).subscribe((r: any) => {
            this.loading.stop();
            if (r?.response) {
                this.notifications.success($localize`Sucesso`, $localize`Chave validada com sucesso!`);
            } else {
                this.notifications.error($localize`Falha`, $localize`Não foi possível validar a chave. Verifica a chave digitada e certifique-se que a salvou antes de testar.`);
            }
        }, err => {
            this.loading.stop();
            this.notifications.error($localize`Falha`, $localize`Não foi possível validar a chave. Verifica a chave digitada e certifique-se que a salvou antes de testar.`);
            console.log(err);
        });
    }

    @ConfirmAction('dialog', {
        text: $localize`Deseja executar um teste para verificar se a chave inserida é válida? Você deve salvar a chave antes de executar o teste.`,
        title: $localize`Executar teste`,
        yesButtonText: $localize`Executar`,
        noButtonText: $localize`Cancelar`
    })
    testGeminiKey() {
        this.http.post(BASE_URL + '/api/testGeminiKey', {
            observe: "response"
        }).subscribe((r: any) => {
            this.loading.stop();
            if (r?.response) {
                this.notifications.success($localize`Sucesso`, $localize`Chave validada com sucesso!`);
            } else {
                this.notifications.error($localize`Falha`, $localize`Não foi possível validar a chave. Verifica a chave digitada e certifique-se que a salvou antes de testar.`);
            }
        }, err => {
            this.loading.stop();
            this.notifications.error($localize`Falha`, $localize`Não foi possível validar a chave. Verifica a chave digitada e certifique-se que a salvou antes de testar.`);
            console.log(err);
        });
    }

    @ConfirmAction('dialog', {
        text: $localize`Deseja zerar o contador de tokens utilizados?`,
        title: $localize`Zerar contador`,
        yesButtonText: $localize`Zerar`,
        noButtonText: $localize`Cancelar`
    })
    clearTokensLimit() {
        this.http.post(BASE_URL + '/config/clearAILimits', {
            observe: "response"
        }).subscribe((r: any) => {
            this.loading.stop();
            this.notifications.success($localize`Sucesso`, $localize`Solicitação enviada com sucesso!`);
        }, err => {
            this.loading.stop();
            this.notifications.error($localize`Falha`, $localize`Não foi possível validar a chave. Verifica a chave digitada e certifique-se que a salvou antes de testar.`);
            console.log(err);
        });
    }

    getFile(event, header = false) {
        if (header) {
            this.headerFile = event.target.files[0];
        } else {
            this.file = event.target.files[0];
        }

    }

    requestLicenseUpdate() {
        this.http.get(BASE_URL + '/config/updateLicense').subscribe((r: any) => {
            this.notifications.success($localize`Successo`, $localize`Atualização de licença solicitada com sucesso!`);
            this.getConfig();
        }, err => {
            console.log(err);
        });
    }


    @ConfirmAction('dialog', {
        text: $localize`Tem certeza que deseja reiniciar o servidor? Ele ficará indisponível por alguns instantes.`,
        title: $localize`Reiniciar servidor`,
        yesButtonText: $localize`Reiniciar`,
        noButtonText: $localize`Cancelar`
    })
    restartServer() {
        this.http.get(BASE_URL + '/config/restartServer').subscribe((r: any) => {
            this.notifications.success($localize`Successo`, $localize`Reinício solicitado com sucesso!`);
        }, err => {
            console.log(err);
        });
    }

    @ConfirmAction('dialog', {
        text: $localize`Tem certeza que deseja realizar um dump de memória? O serviço pode ficar indisponível por vários minutos.`,
        title: $localize`Dump de memória`,
        yesButtonText: $localize`Realizar dump`,
        noButtonText: $localize`Cancelar`
    })
    memoryDump() {
        this.http.get(BASE_URL + '/config/memoryDump').subscribe((r: any) => {
            this.notifications.success($localize`Successo`, $localize`Dump solicitado com sucesso!`);
        }, err => {
            console.log(err);
        });
    }

    @ConfirmAction('dialog', {
        text: $localize`Tem certeza que deseja iniciar a sincronização com o BI agora?`,
        title: $localize`Sincronizar BI`,
        yesButtonText: $localize`Sincronizar`,
        noButtonText: $localize`Cancelar`
    })
    syncBI() {
        this.http.get(BASE_URL + '/config/startBiSync').subscribe((r: any) => {
            this.notifications.success($localize`Successo`, $localize`Sincronização solicitada com sucesso!`);
        }, err => {
            console.log(err);
        });
    }

    @ConfirmAction('dialog', {
        text: $localize`Tem certeza que deseja limpar todos os registros de sincronização do BI? Isso só deve ser feito se o objetivo for realizar uma nova sincronização, em uma nova base.`,
        title: $localize`Limpar registros de sincronização`,
        yesButtonText: $localize`Limpar`,
        noButtonText: $localize`Cancelar`
    })
    clearSyncBI() {
        this.http.get(BASE_URL + '/config/clearBiSyncData').subscribe((r: any) => {
            this.notifications.success($localize`Successo`, $localize`Limpeza solicitada com sucesso!`);
        }, err => {
            console.log(err);
        });
    }

    @ConfirmAction('dialog', {
        text: $localize`Tem certeza que deseja limpar os caches locais? Você precisará recarregar a página após essa ação.`,
        title: $localize`Limpar cache`,
        yesButtonText: $localize`Limpar`,
        noButtonText: $localize`Cancelar`
    })
    clearCaches() {
        for (const k of Object.keys(this.items.itemsUrl)) {
            localStorage.removeItem(`all${k}Version`);
            localStorage.removeItem(`all${k}`);
        }
    }

    @ConfirmAction('dialog', {
        text: $localize`Essa ação irá excluir todos os contatos cadastrados e oportunidades associadas. Tem certeza que deseja prosseguir? Os atendimentos dos contatos não serão excluídos. Essa ação não poderá ser desfeita!`,
        title: $localize`Apagar contatos`,
        yesButtonText: $localize`Apagar contatos`,
        noButtonText: $localize`Cancelar`
    })
    clearContacts() {
        this.http.get(BASE_URL + '/contacts/clearContacts').subscribe((r: any) => {
            this.notifications.success($localize`Successo`, $localize`Contatos apagados com sucesso!`);
        }, err => {
            console.log(err);
        });
    }

    toogleReduceImgQuality() {
        this.localItem.reduceimgquality = this.localItem.reduceimgquality ? 0 : 1;
        this.changeDetector.detectChanges();
    }

    toogleCommission() {
        this.localItem.enablecommission = this.localItem.enablecommission ? 0 : 1;
        this.changeDetector.detectChanges();
    }

    toogleGlobalDebug() {
        this.localItem.debug = !this.localItem.debug;
        this.changeDetector.detectChanges();
    }

    togglePasswordPolicy() {
        this.localItem.passwordpolicy = this.localItem.passwordpolicy ? 0 : 1;
        this.changeDetector.detectChanges();
    }

    toggleblockduplicatecontact() {
        this.localItem.blockduplicatecontact = this.localItem.blockduplicatecontact ? 0 : 1;
        this.changeDetector.detectChanges();
    }

    toggleQuotes() {
        this.localItem.disablequotes = this.localItem.disablequotes ? 0 : 1;
        this.changeDetector.detectChanges();
    }

    toggleOption(extension) {
        if (this.localItem.blockedextensions.includes(extension)) {
            this.localItem.blockedextensions.splice(this.localItem.blockedextensions.indexOf(extension), 1);
        } else {
            this.localItem.blockedextensions.push(extension);
        }
        this.changeDetector.detectChanges();
    }

    upload(header = false) {
        const formData: FormData = new FormData();
        formData.append(header ? 'logoHeaderImg' : 'logoImg', header ? this.headerFile : this.file, header ? this.headerFile.name : this.file.name);
        this.items.uploadFile('/config/uploadLogo', formData, header ? this.headerProgress : this.progress).then(res => {
            this.notifications.success($localize`Successo`, $localize`Imagem carregada com sucesso!`);
        });
    }

    protected readonly copyArrayItem = copyArrayItem;
}
