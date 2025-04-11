/**
 * Created by filipe on 17/09/16.
 */
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {animate, state, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-shortcut-display',
  templateUrl: 'shortcut-display.component.html',
  styleUrls: ['shortcut-display.component.scss'],
  animations: [
    trigger('backState', [
      state('void', style({
        opacity: 0
      }), {params: {op1Color: ''}}),
      state('enabled', style({
        opacity: 0.92
      })),
      transition('void <=> enabled', [
        animate('0.4s ease-in-out')
      ])
    ])
  ]
})
export class ShortcutDisplayComponent {

  @Input() show = false;
  @Input() shortcut = [];
  @Input() mini = false;
  @Input() vertical = false;

  constructor() {

  }

}
