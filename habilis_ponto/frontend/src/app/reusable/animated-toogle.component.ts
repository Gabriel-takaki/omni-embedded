/**
 * Created by filipe on 17/09/16.
 */
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {animate, state, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-animated-toogle',
  templateUrl: 'animated-toogle.component.html',
  styleUrls: ['animated-toogle.component.scss'],
  animations: [
    trigger('backState', [
      state('enabled', style({
        'left': '25px',
        opacity: 1,
        transform: 'rotate(0)'
      }), {params: {op1Color: ''}}),
      state('disabled', style({
        'left': '3px',
        opacity: 0,
        transform: 'rotate(-360deg)'
      })),
      transition('enabled <=> disabled', [
        animate('0.3s ease-in-out')
      ])
    ]),
    trigger('backState2', [
      state('enabled', style({
        'left': '3px',
        opacity: 1,
        transform: 'rotate(0)'
      }), {params: {op1Color: ''}}),
      state('disabled', style({
        'left': '25px',
        opacity: 0,
        transform: 'rotate(360deg)'
      })),
      transition('enabled <=> disabled', [
        animate('0.3s ease-in-out')
      ])
    ]),
  ]
})
export class AnimatedToogleComponent {

  @Input() value: boolean|number = false;
  @Input() title = '';
  @Input() bgColor = '#eee';
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<boolean|number>();
  @Output() changed = new EventEmitter<boolean|number>();

  constructor() {

  }

  toggle() {
    if (this.disabled) {
      return;
    }
    this.value = !this.value;
    this.valueChange.emit(this.value);
    this.changed.emit();
  }

}
