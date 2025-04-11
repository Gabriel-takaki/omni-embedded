/**
 * Created by filipe on 17/09/16.
 */

import {Injectable} from "@angular/core";

@Injectable({providedIn: 'root'})
export class EventsService {

  public events = {};

  constructor() {
  }

  on(event, cb) {
    this.events[event] = this.events[event] || {};
    const key = this.guid();
    this.events[event][key] = cb;
    return key;
  }

  emit(event, data?) {
    this.events[event] = this.events[event] || {};
    Object.keys(this.events[event]).forEach(key => {
      this.events[event][key](data);
    });
  }

  unsubscribe(event, key) {
    delete this.events[event]?.[key];
  }

  guid() {

    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();

  }

}
