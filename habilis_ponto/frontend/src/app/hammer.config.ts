import {HammerGestureConfig} from '@angular/platform-browser';
import {Injectable} from '@angular/core';

declare var Hammer: any;

@Injectable()
export class MyHammerConfig extends HammerGestureConfig {

  buildHammer(element: HTMLElement) {
    let rec = [];
    if (element && element.hasOwnProperty('getAttribute') && element.getAttribute('id') === 'listDiv') {
      rec = [
        [Hammer.Pan, {direction: 24, threshold: 0, inputClass: Hammer.TouchInput}],
      ];
    } else {
      rec = [
        [Hammer.Pan, {direction: 6, inputClass: Hammer.TouchInput}],
        [Hammer.Swipe, {direction: 6, inputClass: Hammer.TouchInput}],
        [Hammer.Press, {inputClass: Hammer.TouchInput}],
        [Hammer.Tap, {taps: 2, inputClass: Hammer.TouchInput}],
      ];
    }
    delete Hammer.defaults.cssProps.userSelect;
    const mc = new Hammer.Manager(element, {
      recognizers: rec, inputClass: Hammer.TouchInput
    });
    return mc;
  }
}
