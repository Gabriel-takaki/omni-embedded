/**
 * Created by filipe on 17/09/16.
 */
import {Routes} from '@angular/router';
import {IsLoggedGuard} from "./guards/islogged.guard";
import {AboutComponent} from "./standardModule/about.component";
import {IsLoggedAndAdminGuard} from "./guards/isloggedandadmin.guard";
import {IsLoggedAndSupervisorGuard} from "./guards/is-logged-and-supervisor-guard.service";
import {AgentDashboardComponent} from "./standardModule/agent-dashboard.component";
import {InternalChatComponent} from "./standardModule/internal-chat.component";
import {IsloggedAndHavePanelAccessGuard} from "./guards/isloggedandhavepanelaccess.guard";
import {TagsListComponent} from "./configurationModule/tagslist.component";
import {GallerylistComponent} from "./configurationModule/gallerylist.component";
import {AuditLogListComponent} from "./configurationModule/auditloglist.component";
import {UsersListComponent} from "./configurationModule/userslist.component";
import {ReasonsListComponent} from "./configurationModule/reasonslist.component";
import {TextsListComponent} from "./configurationModule/textslist.component";
import {NewslistComponent} from "./configurationModule/newslist.component";
import {GeneralConfigComponent} from "./configurationModule/generalconfig.component";
import {InternalGroupsListComponent} from "./configurationModule/internalgroupslist.component";
import {ChatTagsListComponent} from "./configurationModule/chattagslist.component";
import {TriggersListComponent} from "./configurationModule/triggerslist.component";
import {TemplateListComponent} from "./configurationModule/templatelist.component";
import {KeywordstriggerslistComponent} from "./configurationModule/keywordstriggerslist.component";
import {ContactGroupsListComponent} from "./configurationModule/contactgroupslist.component";
import {ContactsExtraFieldsComponent} from "./configurationModule/contacts-extra-fields.component";
import {ApiComponent} from "./swaggerModule/api.component";
import {WebhookCaptureListComponent} from "./configurationModule/webhook-capture-list.component";
import {VisualGroupListComponent} from "./configurationModule/visualgrouplist.component";
import {HtmlTemplateListComponent} from "./configurationModule/htmltemplatelist.component";
import {CustomFormsListComponent} from "./configurationModule/custom-forms-list.component";
import {CanReopenChatGuard} from "./guards/can-reopen-chat.guard";
import {IsTaskMonitorActiveGuard} from "./guards/istaskmonitoractive.guard";
import {InformationCardsListComponent} from "./configurationModule/information-cards-list.component";
import {AssistantslistComponent} from "./configurationModule/assistantslist.component";
import { ClockinlistComponent } from './clockinModule/clockinlist.component';
import { ClockindashboardComponent } from './clockinModule/clockindashboard.component';

const configRoutes: Routes = [
  {
    path: 'tagslist',
    component: TagsListComponent,
    canActivate: [IsLoggedAndAdminGuard]
  },
  {
    path: 'galerylist',
    component: GallerylistComponent,
    canActivate: [IsLoggedAndSupervisorGuard]
  },
  {
    path: 'auditlog',
    component: AuditLogListComponent,
    canActivate: [IsLoggedAndAdminGuard]
  },
  {
    path: 'userslist',
    component: UsersListComponent,
    canActivate: [IsLoggedAndAdminGuard]
  },

  {
    path: 'assistantslist',
    component: AssistantslistComponent,
    canActivate: [IsLoggedAndAdminGuard]
  },
  {
    path: 'reasonslist',
    component: ReasonsListComponent,
    canActivate: [IsLoggedAndAdminGuard]
  },
  {
    path: 'predefinedtextslist',
    component: TextsListComponent,
    canActivate: [IsLoggedAndSupervisorGuard]
  },

  {
    path: 'newslist',
    component: NewslistComponent,
    canActivate: [IsLoggedAndSupervisorGuard]
  },
  {
    path: 'generalconfig',
    component: GeneralConfigComponent,
    canActivate: [IsLoggedAndAdminGuard]
  },
  {
    path: 'internalgroupslist',
    component: InternalGroupsListComponent,
    canActivate: [IsLoggedAndAdminGuard]
  },
  {
    path: 'chattagslist',
    component: ChatTagsListComponent,
    canActivate: [IsLoggedAndAdminGuard]
  },
  {
    path: 'triggerslist',
    component: TriggersListComponent,
    canActivate: [IsLoggedAndAdminGuard]
  },
  {
    path: 'templatelist',
    component: TemplateListComponent,
    canActivate: [IsLoggedAndSupervisorGuard]
  },
  {
    path: 'keywordstriggerslist',
    component: KeywordstriggerslistComponent,
    canActivate: [IsLoggedAndAdminGuard]
  },
  {
    path: 'contactgroupslist',
    component: ContactGroupsListComponent,
    canActivate: [IsLoggedAndAdminGuard]
  },
  {
    path: 'contactextrafieldlist',
    component: ContactsExtraFieldsComponent,
    canActivate: [IsLoggedAndAdminGuard]
  },

  {
    path: 'apidoc',
    component: ApiComponent,
    canActivate: [IsLoggedAndAdminGuard]
  },
  {
    path: 'webhookcapturelist',
    component: WebhookCaptureListComponent,
    canActivate: [IsLoggedAndAdminGuard]
  },
  {
    path: 'visualgrouplist',
    component: VisualGroupListComponent,
    canActivate: [IsLoggedAndAdminGuard]
  },
  {
    path: 'htmltemplatelist',
    component: HtmlTemplateListComponent,
    canActivate: [IsLoggedAndSupervisorGuard]
  },
  {
    path: 'customformslist',
    component: CustomFormsListComponent,
    canActivate: [IsLoggedAndAdminGuard]
  },
  {
    path: 'informationcardslist',
    component: InformationCardsListComponent,
    canActivate: [IsLoggedAndAdminGuard]
  },

  {
    path: 'clockinlist',
    component: ClockinlistComponent,
    canActivate: [IsLoggedAndSupervisorGuard]
  }
];

const reportsRoutes: Routes = [

  {
    path: 'clockindashboard',
    component: ClockinlistComponent,
    canActivate: [IsLoggedAndSupervisorGuard]
  },
 
  {
    path: 'clockinreports',
    component: ClockinlistComponent,
    canActivate: [IsLoggedAndSupervisorGuard]
  }
]

export const baseRoutes: Routes = [
  {
    path: 'config',
    canActivate: [IsLoggedAndSupervisorGuard],
    children: configRoutes
  },
  {
    path: 'reports',
    children: reportsRoutes
  },

  {
    path: 'clockindashboard',
    component: ClockindashboardComponent,
    canActivate: [IsLoggedAndSupervisorGuard]
  },
  {
    path: 'agentdashboard',
    component: AgentDashboardComponent,
    // canActivate: [IsLoggedGuard]
  },
  {
    path: 'internalchat',
    component: InternalChatComponent,
    canActivate: [IsLoggedGuard]
  },
  {
    path: 'about',
    component: AboutComponent,
    canActivate: [IsLoggedGuard]
  },

];
