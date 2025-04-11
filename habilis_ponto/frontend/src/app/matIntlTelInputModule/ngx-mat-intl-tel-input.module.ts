import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgxMatIntlTelInputComponent} from './ngx-mat-intl-tel-input.component';
import {SearchPipe} from './search.pipe';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyMenuModule as MatMenuModule} from '@angular/material/legacy-menu';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatDividerModule} from '@angular/material/divider';
import {MatRippleModule} from "@angular/material/core";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {PipesModule} from "../pipesModule/pipes.module";

@NgModule({
  declarations: [
    NgxMatIntlTelInputComponent,
    SearchPipe,
  ],
  imports: [
    FontAwesomeModule,
    CommonModule,
    FormsModule,
    MatInputModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    ReactiveFormsModule,
    MatRippleModule,
    PipesModule
  ],
  exports: [NgxMatIntlTelInputComponent]
})
export class NgxMatIntlTelInputModule {
}
