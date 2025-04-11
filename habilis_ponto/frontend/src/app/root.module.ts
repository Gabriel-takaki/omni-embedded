/**
 * Created by filipe on 17/09/16.
 */
import {DEFAULT_CURRENCY_CODE, LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule, HAMMER_GESTURE_CONFIG, HammerModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {routing} from './app.routing';
import {LoginComponent} from './login.component';
import {RootComponent} from './root.component';
import {BaseComponent} from './base.component';
import {AuthService} from './services/auth.service';
import {SimpleNotificationsModule, NotificationsService} from 'angular2-notifications';
import {ErrorComponent} from './error.component';
import {LoadingModule} from './loadingModule/loading.module';
import {LoadingService} from './loadingModule/loading.service';
import {HeaderSideBarModule} from './headerSidebarModule/headersidebar.module';
import {IsLoggedGuard} from './guards/islogged.guard';
import {StandardModule} from './standardModule/standard.module';
import {StatusService} from './services/status.service';
import {SocketService} from './services/socket.service';
import localePt from '@angular/common/locales/pt';
import localePtPt from '@angular/common/locales/pt-PT';
import localePtAo from '@angular/common/locales/pt-AO';
import localePtMz from '@angular/common/locales/pt-MZ';
import localeEs from '@angular/common/locales/es';
import localeEsAr from '@angular/common/locales/es-AR';
import localeEsCl from '@angular/common/locales/es-CL';
import localeEsCr from '@angular/common/locales/es-CR';
import localeEsCo from '@angular/common/locales/es-CO';
import localeEsMx from '@angular/common/locales/es-MX';
import localeEsGt from '@angular/common/locales/es-GT';
import localeEsHn from '@angular/common/locales/es-HN';
import localeEsNi from '@angular/common/locales/es-NI';
import localeEsPa from '@angular/common/locales/es-PA';
import localeEsPy from '@angular/common/locales/es-PY';
import localeEsPe from '@angular/common/locales/es-PE';
import localeEsDo from '@angular/common/locales/es-DO';
import localeEsUy from '@angular/common/locales/es-UY';
import localeEnJm from '@angular/common/locales/en-JM';
import localeEnBw from '@angular/common/locales/en-BW';
import localeEnNa from '@angular/common/locales/en-NA';
import localeEnTt from '@angular/common/locales/en-TT';
import localeEnZm from '@angular/common/locales/en-ZM';
import localeEnZw from '@angular/common/locales/en-ZW';
import localeEn from '@angular/common/locales/en';
import localeEnGb from '@angular/common/locales/en-GB';
import localeEnCa from '@angular/common/locales/en-CA';
import localeFr from '@angular/common/locales/fr';
import localeDe from '@angular/common/locales/de';
import localeIt from '@angular/common/locales/it';
import localeNl from '@angular/common/locales/nl';
import localeEt from '@angular/common/locales/et';
import localeCa from '@angular/common/locales/ca';

import localePtExtra from '@angular/common/locales/extra/pt';
import localePtPtExtra from '@angular/common/locales/extra/pt-PT';
import localePtAoExtra from '@angular/common/locales/extra/pt-AO';
import localePtMzExtra from '@angular/common/locales/extra/pt-MZ';
import localeEsExtra from '@angular/common/locales/extra/es';
import localeEsArExtra from '@angular/common/locales/extra/es-AR';
import localeEsClExtra from '@angular/common/locales/extra/es-CL';
import localeEsCrExtra from '@angular/common/locales/extra/es-CR';
import localeEsCoExtra from '@angular/common/locales/extra/es-CO';
import localeEsMxExtra from '@angular/common/locales/extra/es-MX';
import localeEsGtExtra from '@angular/common/locales/extra/es-GT';
import localeEsHnExtra from '@angular/common/locales/extra/es-HN';
import localeEsNiExtra from '@angular/common/locales/extra/es-NI';
import localeEsPaExtra from '@angular/common/locales/extra/es-PA';
import localeEsPyExtra from '@angular/common/locales/extra/es-PY';
import localeEsPeExtra from '@angular/common/locales/extra/es-PE';
import localeEsDoExtra from '@angular/common/locales/extra/es-DO';
import localeEsUyExtra from '@angular/common/locales/extra/es-UY';
import localeEnJmExtra from '@angular/common/locales/extra/en-JM';
import localeEnBwExtra from '@angular/common/locales/extra/en-BW';
import localeEnNaExtra from '@angular/common/locales/extra/en-NA';
import localeEnTtExtra from '@angular/common/locales/extra/en-TT';
import localeEnZmExtra from '@angular/common/locales/extra/en-ZM';
import localeEnZwExtra from '@angular/common/locales/extra/en-ZW';
import localeEnExtra from '@angular/common/locales/extra/en';
import localeEnGbExtra from '@angular/common/locales/extra/en-GB';
import localeEnCaExtra from '@angular/common/locales/extra/en-CA';
import localeFrExtra from '@angular/common/locales/extra/fr';
import localeDeExtra from '@angular/common/locales/extra/de';
import localeItExtra from '@angular/common/locales/extra/it';
import localeNlExtra from '@angular/common/locales/extra/nl';
import localeEtExtra from '@angular/common/locales/extra/et';
import localeCaExtra from '@angular/common/locales/extra/ca';


import {EventsService} from "./services/events.service";
import {IsLoggedAndAdminGuard} from "./guards/isloggedandadmin.guard";
import {PipesModule} from "./pipesModule/pipes.module";
import {HttpClientModule, HTTP_INTERCEPTORS} from "@angular/common/http";
import {FaIconLibrary, FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {DATE_PIPE_DEFAULT_OPTIONS, registerLocaleData} from "@angular/common";
import {FormatTimePipe} from "./pipesModule/formattime.pipe";
import {MatInputModule} from "@angular/material/input";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {fab} from "@fortawesome/free-brands-svg-icons";
import {fad} from "./../modules/fortawesome-pro-duotone-svg-icons/package";
import {far} from "./../modules/fortawesome-pro-regular-svg-icons/package";
import {fal} from "./../modules/fortawesome-pro-light-svg-icons/package";
import {fas} from "./../modules/fortawesome-pro-solid-svg-icons/package";
import {IsLoggedAndSupervisorGuard} from "./guards/is-logged-and-supervisor-guard.service";
import {NgxMaskModule} from "ngx-mask";
import {CanReopenChatGuard} from "./guards/can-reopen-chat.guard";
import {KeyboardShortcutsModule} from "ng-keyboard-shortcuts";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MAT_DATE_LOCALE, MatRippleModule} from "@angular/material/core";
import {loadMessages, locale} from "devextreme/localization";
import config from "devextreme/core/config";
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {MyHammerConfig} from './hammer.config';
import {IsTaskMonitorActiveGuard} from "./guards/istaskmonitoractive.guard";
import {MatMenuModule} from "@angular/material/menu";
import {JwtInterceptor} from "./jwt.interceptor";
import {StyleService} from "./services/style.service";
import {ExternalNewChatComponent} from "./external-new-chat.component";
import {AlreadyLoggedComponent} from "./already-logged.component";
import {DxTooltipModule} from "devextreme-angular";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {IsloggedAndHavePanelAccessGuard} from "./guards/isloggedandhavepanelaccess.guard";
import {BASE_URL} from "./app.consts";
import {ConfigurationModule} from "./configurationModule/configuration.module";
import {DocumentationModule} from "./documentationModule/documentation.module";
import { ClockinModule } from './clockinModule/clockin.module';

/**
 * Angola - AO - pt-AO
 * Argentina - AR - es-AR
 * Brasil - BR - pt-BR
 * Botswana - BW - en-BR
 * Chile - CL - es-CL
 * Colombia - CO - es-CO
 * Costa Rica - CR - es-CR
 * Guatemala - GT - es-GT
 * Honduras - HN - es-HN
 * Jamaica - JM - en-JM
 * México - MX - es-MX
 * Moçambique - MZ - pt-MZ
 * Namíbia - NA - en-NA
 * Nicaragua - NI - es-NI
 * Panama - PA - es-PA
 * Paraguay - PY - es-PY
 * Peru - PE - es-PE
 * República Dominicana - DO - es-DO
 * Trindade e Tobago - TT - en-TT
 * Uruguay - UY - es-UY
 * Zambia - ZM - en-ZM
 * Zimbábue - ZW - en-ZW
 */

const messagesPt = require('devextreme/localization/messages/pt.json');
const messagesEs = require('devextreme/localization/messages/es.json');
const messagesEn = require('devextreme/localization/messages/en.json');

loadMessages(messagesPt);
loadMessages(messagesEs);
loadMessages(messagesEn);
locale(navigator.language);
config({defaultCurrency: 'BRL'});


// Português
registerLocaleData(localePt, 'pt', localePtExtra);
registerLocaleData(localePtPt, 'pt-PT', localePtPtExtra);
registerLocaleData(localePtAo, 'pt-AO', localePtAoExtra);
registerLocaleData(localePtMz, 'pt-MZ', localePtMzExtra);

// Espanhol
registerLocaleData(localeEs, 'es', localeEsExtra);
registerLocaleData(localeEsCr, 'es-CR', localeEsCrExtra);
registerLocaleData(localeEsPa, 'es-PA', localeEsPaExtra);
registerLocaleData(localeEsAr, 'es-AR', localeEsArExtra);
registerLocaleData(localeEsCl, 'es-CL', localeEsClExtra);
registerLocaleData(localeEsCo, 'es-CO', localeEsCoExtra);
registerLocaleData(localeEsMx, 'es-MX', localeEsMxExtra);
registerLocaleData(localeEsGt, 'es-GT', localeEsGtExtra);
registerLocaleData(localeEsHn, 'es-HN', localeEsHnExtra);
registerLocaleData(localeEsNi, 'es-NI', localeEsNiExtra);
registerLocaleData(localeEsPy, 'es-PY', localeEsPyExtra);
registerLocaleData(localeEsPe, 'es-PE', localeEsPeExtra);
registerLocaleData(localeEsDo, 'es-DO', localeEsDoExtra);
registerLocaleData(localeEsUy, 'es-UY', localeEsUyExtra);

// Inglês
registerLocaleData(localeEn, 'en', localeEnExtra);
registerLocaleData(localeEnCa, 'en-CA', localeEnCaExtra);
registerLocaleData(localeEnGb, 'en-GB', localeEnGbExtra);
registerLocaleData(localeEnJm, 'en-JM', localeEnJmExtra);
registerLocaleData(localeEnBw, 'en-BW', localeEnBwExtra);
registerLocaleData(localeEnNa, 'en-NA', localeEnNaExtra);
registerLocaleData(localeEnTt, 'en-TT', localeEnTtExtra);
registerLocaleData(localeEnZm, 'en-ZM', localeEnZmExtra);
registerLocaleData(localeEnZw, 'en-ZW', localeEnZwExtra);


registerLocaleData(localeFr, 'fr', localeFrExtra);
registerLocaleData(localeDe, 'de', localeDeExtra);
registerLocaleData(localeIt, 'it', localeItExtra);
registerLocaleData(localeNl, 'nl', localeNlExtra);
registerLocaleData(localeEt, 'et', localeEtExtra);
registerLocaleData(localeCa, 'ca', localeCaExtra);

const currencyCodes = {
    'pt-BR': 'BRL',
    'pt-PT': 'EUR',
    'pt-AO': 'AOA',
    'pt-MZ': 'MZN',
    'es-ES': 'EUR',
    'es-CR': 'CRC',
    'es-PA': 'PAB',
    'es-AR': 'ARS',
    'es-CL': 'CLP',
    'es-CO': 'COP',
    'es-MX': 'MXN',
    'es-GT': 'GTQ',
    'es-HN': 'HNL',
    'es-NI': 'NIO',
    'es-PY': 'PYG',
    'es-PE': 'PEN',
    'es-DO': 'DOP',
    'es-UY': 'UYU',
    'en-US': 'USD',
    'en-CA': 'CAD',
    'en-GB': 'GBP',
    'en-JM': 'JMD',
    'en-BW': 'BWP',
    'en-NA': 'NAD',
    'en-TT': 'TTD',
    'en-ZM': 'ZMW',
    'en-ZW': 'ZWL'
};

@NgModule({
    imports: [BrowserModule, BrowserAnimationsModule.withConfig({
        disableAnimations: window.localStorage.getItem(`globalConfig-disableAnimations`) === '1'
    }),
        FormsModule, HttpClientModule, routing, SimpleNotificationsModule.forRoot(), ConfigurationModule,
     LoadingModule, HeaderSideBarModule, StandardModule, PipesModule,
        MatInputModule, FontAwesomeModule, MatSnackBarModule, NgxMaskModule.forRoot(), DocumentationModule,
        KeyboardShortcutsModule.forRoot(), MatTooltipModule, HammerModule, MatMenuModule,
        ServiceWorkerModule.register(BASE_URL + '/ngsw-worker.js', {
            enabled: environment.production,
            // Register the ServiceWorker as soon as the application is stable
            // or after 30 seconds (whichever comes first).
            registrationStrategy: 'registerWhenStable:30000'
        }), MatRippleModule, DxTooltipModule, ClockinModule],
    declarations: [RootComponent, LoginComponent, BaseComponent, ErrorComponent, ExternalNewChatComponent,
        AlreadyLoggedComponent],
    providers: [AuthService, StatusService, NotificationsService, LoadingService, IsLoggedGuard, IsTaskMonitorActiveGuard,
        IsLoggedAndAdminGuard, IsLoggedAndSupervisorGuard, SocketService, EventsService, FormatTimePipe,
        CanReopenChatGuard, StyleService, IsloggedAndHavePanelAccessGuard,
        {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
        {provide: MAT_DATE_LOCALE, useValue: navigator.language},
        {provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: {locale: navigator.language}},
        {provide: DEFAULT_CURRENCY_CODE, useValue: currencyCodes[navigator.language] || 'USD'},
        {provide: LOCALE_ID, useValue: navigator.language},
        {provide: HAMMER_GESTURE_CONFIG, useClass: MyHammerConfig}],
    bootstrap: [RootComponent]
})
export class RootModule {

    constructor(library: FaIconLibrary) {

        // TODO: Temporário, remover deixar apenas as referências necessárias para redução de tamanho
        library.addIconPacks(fad, fas, far, fal, fab);

        // library.addIcons(faPlus, faUser, faAngleDown, faEdit, faUserCircle, faCog, faPrint, faUsers, faSitemap, faBath, faWheelchair);
        // library.addIcons(faTv, faCogs, faTicket, faChartBar, faList, faPowerOff, faWalking, faWrench, faTimes, faCheck, faSave, faSyncAlt);
        // library.addIcons(faShower, faPowerOff, faTachometer, faEye, faLock, faTint, faAlarmClock, faBarcodeAlt, faCheckCircle, faClock);
        // library.addIcons(faExclamationTriangle, faInfoCircle);
    }

}
