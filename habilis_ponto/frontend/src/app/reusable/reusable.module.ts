/**
 * Created by filipe on 18/09/16.
 */
import {NgModule} from '@angular/core';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {WeekCalendarComponent} from './week-calendar.component';
import {CommonModule} from '@angular/common';
import {ActionListComponent} from './action-list.component';
import {ClickOutsideModule} from 'ng-click-outside';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SearchItensPipe} from './search-itens.pipe';
import {FilterItensPipe} from './filter-itens.pipe';
import {YesNoComponent} from './yes-no.component';
import {ToggleComponent} from './toggle.component';
import {PopupMessageComponent} from './popup-message.component';
import {ImageCropperModule} from 'ngx-image-cropper';
import {ImageCropperComponent} from './image-cropper.component';
import {SelectionListComponent} from './selection-list.component';
import {MatRippleModule} from '@angular/material/core';
import {MatDialogModule} from '@angular/material/dialog';
import {CommentsBoxComponent} from './comments-box.component';
import {MatInputModule} from '@angular/material/input';
import {OptionToggleComponent} from './option-toggle.component';
import {ChipsSelectionComponent} from './chips-selection.component';
import {MatChipsModule} from '@angular/material/chips';
import {EmojiTextAreaComponent} from "./emoji-text-area.component";
import {PickerModule} from "@ctrl/ngx-emoji-mart";
import {MessagesComponent} from "./messages.component";
import {MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipModule} from "@angular/material/tooltip";
import {MessageComponent} from "./message.component";
import {MatMenuModule} from "@angular/material/menu";
import {ImageSelectionListComponent} from "./image-selection-list.component";
import {ColorPickerComponent} from "./color-picker.component";
import {ColorPickerModule} from "@iplab/ngx-color-picker";
import {PipesModule} from "../pipesModule/pipes.module";
import {OpenFileComponent} from "./open-file.component";
import {MobileChatListItemComponent} from "./mobile-chat-list-item.component";
import {CustomAudioComponent} from "./custom-audio.component";
import {PasswordStrengthComponent} from "./password-strength.component";
import {ClientProfilePicComponent} from "./client-profile-pic.component";
import {UserProfilePicComponent} from "./user-profile-pic.component";
import {AnimatedToogleComponent} from "./animated-toogle.component";
import {ButtonWithLoadingComponent} from "./button-with-loading.component";
import {SelectButtonComponent} from "./select-button.component";
import {ShortcutDisplayComponent} from "./shortcut-display.component";
import {ClientListItemComponent} from "./client-list-item.component";
import {ClientListItemPhotoComponent} from "./client-list-item-photo.component";
import {ClientListItemClockComponent} from "./client-list-item-clock.component";
import {ProgramListItemTitleComponent} from "./program-list-item-title.component";
import {ProgramEventsListItemTitleComponent} from "./program-events-list-item-title.component";
import {TagBoxComponent} from "./tag-box.component";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {KpiLineBlockComponent} from "./kpi-line-block.component";
import {StyledTagBoxComponent} from "./styled-tag-box.component";
import {UserQueueStateComponent} from "./user-queue-state.component";
import {DialogCloseButtonComponent} from "./dialog-close-button.component";
import {NewsCardComponent} from "./news-card.component";
import {NewsDialogComponent} from "./news-dialog.component";
import {DxDataGridModule, DxTooltipModule} from "devextreme-angular";
import {ClientListItemFaceComponent} from "./client-list-item-face.component";
import {ChatResponseStateComponent} from "./chat-response-state.component";
import {WaveformBarsComponent} from "./waveform-bars.component";
import {WaveformViewerComponent} from "./waveform-viewer.component";
import {MessageShareComponent} from "./message-share.component";
import {AttachmentsBoxComponent} from "./attachments-box.component";
import {DateRangeSelectionComponent} from "./date-range-selection.component";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {TaskAttachsComponent} from "./task-attachs.component";
import {RecordAudioDialogComponent} from "./record-audio-dialog.component";
import {FileViewerDialogComponent} from "./file-viewer-dialog.component";
import {TaskChecklistComponent} from "./task-checklist.component";
import {MicroHtmlEditorComponent} from "./micro-html-editor.component";
import {TaskDuedateComponent} from "./task-duedate.component";
import {AlertsSelectionComponent} from "./alerts-selection.component";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {NgxMatDatetimePickerModule} from "@angular-material-components/datetime-picker";
import {NgxMatMomentModule} from "@angular-material-components/moment-adapter";
import {TaskActionSelectionComponent} from "./task-action-selection.component";
import {OpportunityDuedateComponent} from "./opportunity-duedate.component";
import {SelectLocationComponent} from "./select-location.component";
import {SelectLocationDialogComponent} from "./select-location-dialog.component";
import {GeoapifyGeocoderAutocompleteModule} from "@geoapify/angular-geocoder-autocomplete";
import {GroupMembersListComponent} from "./group-members-list.component";
import {CallRecordListenDialogComponent} from "./call-record-listen-dialog.component";
import {FunnelChartComponent} from "./funnel-chart.component";
import {AlertDialogComponent} from "./alert-dialog.component";
import {CdkContextMenuTrigger, CdkMenu, CdkMenuItem} from "@angular/cdk/menu";
import {MatSelectModule} from "@angular/material/select";
import {NgxMatSelectSearchModule} from "ngx-mat-select-search";
import {ListSelectionComponent} from "./list-selection.component";
import {MessageDetailsComponent} from "./message-details.component";
import {PhotosAttachsComponent} from "./photos-attachs.component";
import {TemplateMessageComponent} from "./template-message.component";
import {LiveSessionDialogComponent} from "./live-session-dialog.component";
import {
    DxoColumnChooserModule,
    DxoExportModule,
    DxoFilterPanelModule,
    DxoFilterRowModule, DxoPagingModule, DxoScrollingModule, DxoSearchPanelModule
} from "devextreme-angular/ui/nested";
import {TemplateSelectionComponent} from "./template-selection.component";
import {ConfirmationWithTypingComponent} from "./confirmation-with-typing.component";
import { ConcludeTaskComponent } from './conclude-task.component';
import {WarningDialogComponent} from "./warning-dialog.component";
import {ShortcutsDialogComponent} from "./shortcuts-dialog.component";
import {AiModelSelectionComponent} from "./ai-model-selection.component";

@NgModule({
    imports: [
        FontAwesomeModule, FormsModule, CommonModule, ClickOutsideModule, MatRippleModule, MatDialogModule,
        ImageCropperModule, MatInputModule, MatChipsModule, PickerModule, MatTooltipModule, DxTooltipModule,
        MatMenuModule, ColorPickerModule, PipesModule, MatAutocompleteModule, ReactiveFormsModule, DragDropModule,
        MatDatepickerModule, MatCheckboxModule, NgxMatDatetimePickerModule, NgxMatMomentModule,
        CdkContextMenuTrigger, CdkMenu, CdkMenuItem,
        GeoapifyGeocoderAutocompleteModule.withConfig('87ebe63fd598486b8c38417fe8d98ac0'), MatSelectModule,
        NgxMatSelectSearchModule, DxDataGridModule, DxoColumnChooserModule, DxoExportModule, DxoFilterPanelModule,
        DxoFilterRowModule, DxoPagingModule, DxoScrollingModule, DxoSearchPanelModule],
    declarations: [WeekCalendarComponent, ActionListComponent, SearchItensPipe, FilterItensPipe, YesNoComponent,
        ToggleComponent, PopupMessageComponent, ImageCropperComponent, SelectionListComponent, MessagesComponent,
        CommentsBoxComponent, OptionToggleComponent, ChipsSelectionComponent, EmojiTextAreaComponent,
        MessageComponent, ImageSelectionListComponent, ColorPickerComponent, OpenFileComponent, MobileChatListItemComponent,
        CustomAudioComponent, PasswordStrengthComponent, ClientProfilePicComponent, UserProfilePicComponent,
        AnimatedToogleComponent, ButtonWithLoadingComponent, SelectButtonComponent, ShortcutDisplayComponent,
        ClientListItemComponent, ClientListItemPhotoComponent, ClientListItemClockComponent, ClientListItemFaceComponent,
         ProgramListItemTitleComponent, ProgramEventsListItemTitleComponent, NewsCardComponent,
        TagBoxComponent, KpiLineBlockComponent, StyledTagBoxComponent, UserQueueStateComponent, DialogCloseButtonComponent,
        NewsDialogComponent, ChatResponseStateComponent, AttachmentsBoxComponent,
        WaveformBarsComponent, WaveformViewerComponent, MessageShareComponent, DateRangeSelectionComponent,
        TaskAttachsComponent, RecordAudioDialogComponent, FileViewerDialogComponent, TaskChecklistComponent,
        MicroHtmlEditorComponent, TaskDuedateComponent, AlertsSelectionComponent, TaskActionSelectionComponent,
        OpportunityDuedateComponent, SelectLocationComponent, SelectLocationDialogComponent,
        GroupMembersListComponent,  CallRecordListenDialogComponent,
        FunnelChartComponent, AlertDialogComponent, ListSelectionComponent,
        MessageDetailsComponent, PhotosAttachsComponent
         , TemplateMessageComponent,  LiveSessionDialogComponent,
         TemplateSelectionComponent, ConfirmationWithTypingComponent, ConcludeTaskComponent,
         WarningDialogComponent, ShortcutsDialogComponent, AiModelSelectionComponent],
    exports: [WeekCalendarComponent, ActionListComponent, SearchItensPipe, FilterItensPipe, YesNoComponent,
        ToggleComponent, PopupMessageComponent, ImageCropperComponent, SelectionListComponent, MessagesComponent,
        CommentsBoxComponent, OptionToggleComponent, ChipsSelectionComponent, EmojiTextAreaComponent, MessageComponent,
        ImageSelectionListComponent, ColorPickerComponent, MobileChatListItemComponent, CustomAudioComponent,
        PasswordStrengthComponent, ClientProfilePicComponent, UserProfilePicComponent, AnimatedToogleComponent,
        ButtonWithLoadingComponent, SelectButtonComponent, ShortcutDisplayComponent, ClientListItemComponent,
        ClientListItemPhotoComponent, ProgramListItemTitleComponent, TagBoxComponent,
        ProgramEventsListItemTitleComponent, KpiLineBlockComponent, StyledTagBoxComponent, UserQueueStateComponent,
        DialogCloseButtonComponent, NewsCardComponent, NewsDialogComponent,
        ChatResponseStateComponent, WaveformBarsComponent, WaveformViewerComponent, MessageShareComponent,
        AttachmentsBoxComponent, DateRangeSelectionComponent, RecordAudioDialogComponent,
      TaskAttachsComponent,
        FileViewerDialogComponent, TaskChecklistComponent, MicroHtmlEditorComponent, TaskDuedateComponent,
        AlertsSelectionComponent, TaskActionSelectionComponent, OpportunityDuedateComponent,
        SelectLocationComponent, GroupMembersListComponent,
        CallRecordListenDialogComponent, FunnelChartComponent, AlertDialogComponent,
        ListSelectionComponent, MessageDetailsComponent, PhotosAttachsComponent, TemplateMessageComponent,
        TemplateSelectionComponent, ConfirmationWithTypingComponent,  WarningDialogComponent,
        ShortcutsDialogComponent, AiModelSelectionComponent],
    providers: [{provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: {disableTooltipInteractivity: true}}]
})
export class ReusableModule {

    constructor() {

    }

}
