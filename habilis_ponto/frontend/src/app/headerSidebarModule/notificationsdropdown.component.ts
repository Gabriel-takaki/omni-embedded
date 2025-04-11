/**
 * Created by filipe on 18/09/16.
 */
// import {trigger, state, transition, animate, style} from '@angular/animations';
import {Component} from "@angular/core";

@Component({
  selector: 'ca-notificationsdropdown',
  templateUrl: 'notificationsdropdown.component.html',
  // animations: [
  //   trigger('visibilityChanged', [
  //     state('shown', style({
  //       "max-height": 500,
  //       "overflow-y": "visible",
  //       "box-shadow": "0 1px 7px 2px rgba(135, 158, 171, 0.2)"
  //     })),
  //     state('hidden', style({
  //       "max-height": 0,
  //       margin: 0,
  //       padding: 0,
  //       "overflow-y": "hidden",
  //       "box-shadow": "0 0px 0px 0px"
  //     })),
  //     transition('* => *',
  //       animate('0.3s'))
  //   ])
  // ]
})

export class NotificationsDropDownComponent {

  visibility = 'hidden';
  public messages = {unreadedItems: []};

  constructor() {

  }

  dropDown(close = false) {
    this.visibility = close ? 'hidden' : (this.visibility === 'shown') ? 'hidden' : 'shown';
  }

}
