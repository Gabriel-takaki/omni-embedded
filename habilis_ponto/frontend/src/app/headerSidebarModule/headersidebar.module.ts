/**
 * Created by filipe on 18/09/16.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {UserDropDownComponent} from './userdropdown.component';
import {NotificationsDropDownComponent} from './notificationsdropdown.component';
import {RouterModule} from '@angular/router';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {ReusableModule} from "../reusable/reusable.module";
import {MatTooltipModule} from "@angular/material/tooltip";
import {HelpDropDownComponent} from "./helpdropdown.component";
import {MatRippleModule} from "@angular/material/core";
import {MatMenuModule} from "@angular/material/menu";
import {HeaderMenuItemComponent} from "./header-menu-item.component";
import {MatCheckboxModule} from "@angular/material/checkbox";

@NgModule({
    imports: [CommonModule, FormsModule, RouterModule, FontAwesomeModule, ReusableModule, MatTooltipModule,
        MatRippleModule, MatMenuModule, MatCheckboxModule],
  exports: [UserDropDownComponent, NotificationsDropDownComponent, HelpDropDownComponent, HeaderMenuItemComponent],
  declarations: [UserDropDownComponent, NotificationsDropDownComponent, HelpDropDownComponent, HeaderMenuItemComponent]
})
export class HeaderSideBarModule {
}
