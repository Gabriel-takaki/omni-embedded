/**
 * Created by filipe on 18/09/16.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from "@angular/forms";
import {DxColorBoxModule, DxDataGridModule, DxFilterBuilderModule, DxHtmlEditorModule} from "devextreme-angular";
import {RouterModule} from "@angular/router";
import {ReasonsListComponent} from "./reasonslist.component";
import {UserFormComponent} from "./userform.component";
import {UsersListComponent} from "./userslist.component";
import {ReasonFormComponent} from "./reasonform.component";
import {GeneralConfigComponent} from "./generalconfig.component";
import {ChangePassComponent} from "./changepass.component";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {TimeTableFormComponent} from "./timetableform.component";
import {MatButtonModule} from "@angular/material/button";
import {MatSelectModule} from "@angular/material/select";
import {MatInputModule} from "@angular/material/input";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipModule} from "@angular/material/tooltip";
import {MatRippleModule} from "@angular/material/core";
import {NgxQRCodeModule} from "@techiediaries/ngx-qrcode";
import {MatChipsModule} from "@angular/material/chips";
import {TextFormComponent} from "./textform.component";
import {TextsListComponent} from "./textslist.component";
import {GallerylistComponent} from "./gallerylist.component";
import {GalleryFormComponent} from "./galleryform.component";
import {TagsListComponent} from "./tagslist.component";
import {TagsFormComponent} from "./tagsform.component";
import {ReusableModule} from "../reusable/reusable.module";
import {InternalGroupsListComponent} from "./internalgroupslist.component";
import {InternalGroupFormComponent} from "./internalgroupform.component";
import {WebhookFormComponent} from "./webhookform.component";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatTabsModule} from "@angular/material/tabs";
import {WebhookConfigFormComponent} from "./webhookconfigform.component";
import {PipesModule} from "../pipesModule/pipes.module";
import {ChatTagsListComponent} from "./chattagslist.component";
import {TriggersListComponent} from "./triggerslist.component";
import {NgxMatIntlTelInputModule} from "../matIntlTelInputModule/ngx-mat-intl-tel-input.module";
import {ContactGroupsListComponent} from "./contactgroupslist.component";
import {ContactGroupFormComponent} from "./contactgroupform.component";
import {DownloadMarkedChatsComponent} from "./download-marked-chats.component";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FaqformComponent} from "./faqform.component";
import {SwaggerModule} from "../swaggerModule/swagger.module";
import {MonacoEditorModule} from "ngx-monaco-editor-v2";
import {NewslistComponent} from "./newslist.component";
import {NewsformComponent} from "./newsform.component";
import {NewsPreviewComponent} from "./news-preview.component";
import {KeywordstriggerslistComponent} from "./keywordstriggerslist.component";
import {AutomationDataFormConfigComponent} from "./automation-data-form-config.component";
import {TemplateListComponent} from "./templatelist.component";
import {ContactsExtraFieldsComponent} from "./contacts-extra-fields.component";
import {ContactExtraFieldsFormComponent} from "./contact-extra-fields-form.component";
import {MatMomentDateModule} from "@angular/material-moment-adapter";
import {WebhookCaptureListComponent} from "./webhook-capture-list.component";
import {AuditLogListComponent} from "./auditloglist.component";
import {VisualGroupListComponent} from "./visualgrouplist.component";
import {MatMenuModule} from "@angular/material/menu";
import {RecordAudioFormComponent} from "./recordaudioform.component";
import {HtmlTemplateListComponent} from "./htmltemplatelist.component";
import {HtmlTemplateFormComponent} from "./htmltemplateform.component";
import {UserTimeTableFormComponent} from "./usertimetableform.component";
import {NgxMatSelectSearchModule} from "ngx-mat-select-search";
import {CustomFormsListComponent} from "./custom-forms-list.component";
import {CustomFormFormComponent} from "./custom-form-form.component";
import {CustomFormFieldFormComponent} from "./custom-form-field-form.component";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {DownloadChatsByIdComponent} from "./download-chats-by-id.component";
import {MatStepperModule} from "@angular/material/stepper";
import {MatRadioModule} from "@angular/material/radio";
import {NGX_MAT_DATE_FORMATS, NgxMatDatetimePickerModule} from "@angular-material-components/datetime-picker";
import {NgxMatMomentModule} from "@angular-material-components/moment-adapter";
import {InformationCardsListComponent} from "./information-cards-list.component";
import { TelephonyConfigComponent } from './telephony-config.component';
import {AssistantslistComponent} from "./assistantslist.component";
import {FaqGroupFormComponent} from "./faqgroupform.component";

@NgModule({
  imports: [CommonModule, FormsModule, DxDataGridModule, DxFilterBuilderModule,
    NgxQRCodeModule, FontAwesomeModule, MatButtonModule, MatMomentDateModule, MatMenuModule,
    MatTooltipModule, MatCheckboxModule, MatInputModule, MatSelectModule, SwaggerModule,
    MatRippleModule, MatChipsModule, ReusableModule, MatDatepickerModule, MatTabsModule, PipesModule,
    NgxMatIntlTelInputModule, MatFormFieldModule, MonacoEditorModule.forRoot(), DxHtmlEditorModule,
    NgxMatSelectSearchModule, DragDropModule, DxColorBoxModule, MatStepperModule, MatRadioModule,
    NgxMatDatetimePickerModule, NgxMatMomentModule, ],
  declarations: [UserFormComponent, UsersListComponent, ReasonsListComponent, ReasonFormComponent, GeneralConfigComponent, TemplateListComponent,
    ChangePassComponent, TimeTableFormComponent, NewslistComponent, AutomationDataFormConfigComponent, TextFormComponent, NewsformComponent,
    TextsListComponent, GallerylistComponent, GalleryFormComponent, TagsListComponent, TagsFormComponent,
    InternalGroupsListComponent, InternalGroupFormComponent, WebhookFormComponent, NewsPreviewComponent,
    WebhookConfigFormComponent, ChatTagsListComponent, TriggersListComponent, ContactGroupsListComponent,
    ContactGroupFormComponent, DownloadMarkedChatsComponent, FaqformComponent, KeywordstriggerslistComponent,
    ContactsExtraFieldsComponent, ContactExtraFieldsFormComponent,
    WebhookCaptureListComponent, AuditLogListComponent, VisualGroupListComponent,
    RecordAudioFormComponent, HtmlTemplateListComponent, HtmlTemplateFormComponent, UserTimeTableFormComponent,
    CustomFormsListComponent, CustomFormFormComponent, CustomFormFieldFormComponent, DownloadChatsByIdComponent, InformationCardsListComponent, TelephonyConfigComponent,
    AssistantslistComponent, FaqGroupFormComponent],
  exports: [UsersListComponent, ReasonsListComponent, TemplateListComponent,
    GeneralConfigComponent, ChangePassComponent, TextsListComponent, GallerylistComponent, AuditLogListComponent,
    TagsListComponent, TagsFormComponent, InternalGroupsListComponent, InternalGroupFormComponent,
    WebhookConfigFormComponent, ChatTagsListComponent, TriggersListComponent, ContactGroupsListComponent, RouterModule, SwaggerModule, NewslistComponent, KeywordstriggerslistComponent,
    VisualGroupListComponent, HtmlTemplateListComponent, CustomFormsListComponent ,InformationCardsListComponent, AssistantslistComponent],
  providers: [
    {provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: {disableTooltipInteractivity: true}},
    {provide: NGX_MAT_DATE_FORMATS, useValue: {
        display: {
          dateInput: "DD/MM/YYYY HH:mm"
        }
      }},
  ]
})
export class ConfigurationModule {
}
