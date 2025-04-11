/**
 * Created by filipe on 17/09/16.
 */
import {Component} from '@angular/core';
import {loadMessages, locale} from 'devextreme/localization';
import config from 'devextreme/core/config';
// import messagesPt from 'devextreme/localization/messages/pt.json';
import {StatusService} from "./services/status.service";
import {EmbeddedService} from "./services/embedded.service";

@Component({
  selector: 'ca-sp',
  template: `
    <ca-loading-screen></ca-loading-screen>
    <simple-notifications [options]="options"></simple-notifications>
    <router-outlet></router-outlet>`,
  animations: [

  ]
})

export class RootComponent {

  public options = {
    timeOut: 7000
  };

  constructor(private status: StatusService, private embedded: EmbeddedService) {
    // loadMessages(messagesPt);
    locale(navigator.language);
    config({defaultCurrency: 'BRL'});
    status.generateTabId();
    embedded.initialize();
  }

}
