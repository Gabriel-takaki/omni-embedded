/**
 * Created by filipe on 18/09/16.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ApiComponent} from "./api.component";

@NgModule({
  imports: [CommonModule, FormsModule],
  exports: [ApiComponent],
  declarations: [ApiComponent],
  providers: []
})
export class SwaggerModule {
}
