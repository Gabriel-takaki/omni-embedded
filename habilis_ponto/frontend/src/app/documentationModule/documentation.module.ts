/**
 * Created by filipe on 18/09/16.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {ReusableModule} from "../reusable/reusable.module";
import {MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipModule} from "@angular/material/tooltip";
import {MatRippleModule} from "@angular/material/core";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {MatInputModule} from "@angular/material/input";
import {MatChipsModule} from "@angular/material/chips";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {PipesModule} from "../pipesModule/pipes.module";
import {MatTabsModule} from "@angular/material/tabs";
import {MonacoEditorModule} from "ngx-monaco-editor-v2";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatMenuModule} from "@angular/material/menu";
import {DxTooltipModule} from "devextreme-angular";
import {NgxMatDatetimePickerModule} from "@angular-material-components/datetime-picker";
import {NgxMatSelectSearchModule} from "ngx-mat-select-search";
import {AiRecordDocumentationComponent} from "./ai-record-documentation.component";
import {HeaderRecordingComponent} from "./header-recording.component";

@NgModule({
  imports: [CommonModule, FormsModule, RouterModule, FontAwesomeModule, MatCheckboxModule,
    ReusableModule, MatTooltipModule, MatRippleModule, DragDropModule, MatFormFieldModule, MatSelectModule,
    MatInputModule, MatChipsModule, MatDatepickerModule, PipesModule, MatTabsModule, MonacoEditorModule,
    MatMenuModule, DxTooltipModule, NgxMatDatetimePickerModule, NgxMatSelectSearchModule],
  exports: [AiRecordDocumentationComponent, HeaderRecordingComponent],
  declarations: [AiRecordDocumentationComponent, HeaderRecordingComponent],
  providers: [{provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: {disableTooltipInteractivity: true}}]
})
export class DocumentationModule {
}
