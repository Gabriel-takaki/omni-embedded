import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClockInDialogComponent } from './clock-in-dialog.component';
import { ClockinlistComponent } from './clockinlist.component';
import { NgxMatDatetimePickerModule } from '@angular-material-components/datetime-picker';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxGaugeModule } from 'app/ngxGaugeModule/ngx-gauge.module';
import { PipesModule } from 'app/pipesModule/pipes.module';
import { ReusableModule } from 'app/reusable/reusable.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatTableModule } from '@angular/material/table';
import { ClockindashboardComponent } from './clockindashboard.component';
import { MatCardModule } from '@angular/material/card';
import { DxDataGridModule } from 'devextreme-angular';
import { ClockinMiniCardComponent } from './clockin-mini-card.component';
import { RegisterClockActionComponent } from './register-clock-action.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
@NgModule({
    declarations: [
        ClockInDialogComponent,
        ClockinlistComponent,
        ClockindashboardComponent,
        ClockinMiniCardComponent,
        RegisterClockActionComponent
    ],
    imports: [
        CommonModule, FormsModule, RouterModule, BrowserAnimationsModule, FontAwesomeModule,
                ReusableModule, MatTooltipModule, MatRippleModule, DragDropModule, MatFormFieldModule, MatSelectModule,
                MatInputModule, MatChipsModule, MatDatepickerModule, PipesModule, MatTabsModule, MatMenuModule,
                NgxGaugeModule, NgxMatSelectSearchModule, MatCheckboxModule, NgxMatDatetimePickerModule, MatAutocompleteModule, MatTableModule, ReactiveFormsModule, MatCardModule, DxDataGridModule, MatSlideToggleModule, MatDividerModule
    ],
    exports: [
        ClockInDialogComponent,
        ClockinMiniCardComponent,
        RegisterClockActionComponent
    ]
})
export class ClockinModule { }