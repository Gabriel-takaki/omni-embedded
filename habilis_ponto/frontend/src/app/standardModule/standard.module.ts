/**
 * Created by filipe on 18/09/16.
 */
import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {PipesModule} from '../pipesModule/pipes.module';
import {AboutComponent} from "./about.component";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {AgentDetailComponent} from "./agentdetail.component";
import {MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipModule} from "@angular/material/tooltip";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {AgentDashboardComponent} from "./agent-dashboard.component";
import {ReusableModule} from "../reusable/reusable.module";
import {MatRippleModule} from "@angular/material/core";
import {MatDialogModule} from "@angular/material/dialog";
import {MatListModule} from "@angular/material/list";
import {SendMediaComponent} from "./send-media.component";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatMenuModule} from "@angular/material/menu";
import {AgentTransferComponent} from "./agent-transfer.component";
import {CepQueryComponent} from "./cep-query.component";
import {EndChatComponent} from "./end-chat.component";
import {MatSelectModule} from "@angular/material/select";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {ReopenScheduleComponent} from "./reopen-schedule.component";
import {InfoMessageComponent} from "./info-message.component";
import {InternalChatComponent} from "./internal-chat.component";
import {NgxMatIntlTelInputModule} from "../matIntlTelInputModule/ngx-mat-intl-tel-input.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ChatAltComponent} from "./chat-alt.component";
import {MatTabsModule} from "@angular/material/tabs";
import {MatMomentDateModule} from "@angular/material-moment-adapter";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {ContactsCsvImportComponent} from "./contactscsvimport.component";
import {DxDataGridModule, DxHtmlEditorModule, DxTooltipModule} from "devextreme-angular";
import {AgentPauseComponent} from "./agent-pause.component";
import {AutomationDataFormComponent} from "./automation-data-form.component";
import {TemplateDataFormComponent} from "./template-data-form.component";
import {MailComposerDialogComponent} from "./mail-composer-dialog.component";
import {
  DxiItemModule,
  DxoFilterPanelModule, DxoFilterRowModule,
  DxoMediaResizingModule, DxoPagingModule, DxoScrollingModule, DxoSearchPanelModule,
  DxoToolbarModule
} from "devextreme-angular/ui/nested";
import {HeaderSideBarModule} from "../headerSidebarModule/headersidebar.module";
import {MatSliderModule} from "@angular/material/slider";
import {EditMessageComponent} from "./edit-message.component";
import {CallTransferComponent} from "./call-transfer.component";
import {NgxMatSelectSearchModule} from "ngx-mat-select-search";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {NgxMatDatetimePickerModule} from "@angular-material-components/datetime-picker";
import {MessageSearchComponent} from "./message-search.component";
import {MidiaSearchComponent} from "./midia-search.component";
import {ClickOutsideModule} from "ng-click-outside";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {CdkContextMenuTrigger, CdkMenu, CdkMenuItem} from "@angular/cdk/menu";
import {InfoCardsDialogComponent} from "./info-cards-dialog.component";
import { OpportunitiescsvimportComponent } from './opportunitiescsvimport.component';
import { ClockinModule } from "../clockinModule/clockin.module";

@NgModule({
    imports: [CommonModule, FormsModule, PipesModule, FontAwesomeModule, MatTooltipModule,
    MatFormFieldModule, MatInputModule, ReusableModule, MatRippleModule, MatDialogModule,
    MatListModule, MatProgressSpinnerModule, MatMenuModule, MatSelectModule, DxTooltipModule,
    MatAutocompleteModule, MatDatepickerModule, NgxMatIntlTelInputModule, BrowserAnimationsModule,
    MatTabsModule, MatMomentDateModule, DragDropModule, DxHtmlEditorModule, DxiItemModule,
    DxoMediaResizingModule, DxoToolbarModule, HeaderSideBarModule, MatSliderModule,
    NgxMatSelectSearchModule, MatCheckboxModule, NgxMatDatetimePickerModule, ClickOutsideModule, MatButtonToggleModule,
    DxDataGridModule, DxoFilterPanelModule, DxoFilterRowModule, DxoPagingModule, DxoScrollingModule,
    DxoSearchPanelModule, CdkMenu, CdkMenuItem, CdkContextMenuTrigger, ClockinModule],
  exports: [ AboutComponent, AgentDetailComponent,
    AgentDashboardComponent, InternalChatComponent, TemplateDataFormComponent,
    ChatAltComponent , MailComposerDialogComponent, CallTransferComponent,  InfoCardsDialogComponent],
  declarations: [ AboutComponent, AgentDetailComponent,
    AgentDashboardComponent, SendMediaComponent, AutomationDataFormComponent,
    AgentTransferComponent, CepQueryComponent, EndChatComponent, TemplateDataFormComponent,
    ReopenScheduleComponent, InfoMessageComponent, InternalChatComponent,
    ChatAltComponent, ContactsCsvImportComponent, AgentPauseComponent,
    MailComposerDialogComponent, EditMessageComponent, CallTransferComponent,
    MessageSearchComponent, MidiaSearchComponent,  InfoCardsDialogComponent, OpportunitiescsvimportComponent],
  providers: [DatePipe, {provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: {disableTooltipInteractivity: true}}]
})

export class StandardModule {
}
