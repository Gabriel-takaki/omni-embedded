/**
 * Created by filipe on 17/09/16.
 */
import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LoginComponent} from "./login.component";
import {BaseComponent} from "./base.component";
import {ErrorComponent} from "./error.component";
import {IsLoggedGuard} from "./guards/islogged.guard";
import {baseRoutes} from "./base.routing";
import {ExternalNewChatComponent} from "./external-new-chat.component";
import {AlreadyLoggedComponent} from "./already-logged.component";

const appRoutes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'externalnewchat',
    component: ExternalNewChatComponent
  },
  {
    path: 'alreadyLogged',
    component: AlreadyLoggedComponent
  },
  {
    path: 'base',
    component: BaseComponent,
    canActivate: [IsLoggedGuard]
  },
  {
    path: 'base',
    component: BaseComponent,
    canActivate: [IsLoggedGuard],
    children: baseRoutes
  },
  {
    path: 'error',
    component: ErrorComponent
  },
  {
    path: '**',
    redirectTo: '/error',
    pathMatch: 'full'
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forRoot(appRoutes);
