/**
 * Created by filipe on 17/09/16.
 */
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-toggle',
  templateUrl: 'toggle.component.html',
  styleUrls: ['toggle.component.scss'],
  animations: [
    trigger('checkiconState', [
      state('clear', style({
        width: '0%'
      })),
      state('checked', style({
        width: '100%'
      })),
    ]),
    trigger('checkmarkState', [
      state('markclear', style({
        transform: 'translateX(0)',
        'background-color': '#fff'
      })),
      state('markchecked', style({
        transform: 'translateX(1.4rem)',
        'background-color': '{{color}}'
      }), {params: {color: '#1ad174'}}),
      transition('markclear <=> markchecked', [
        animate('0.20s ease-in-out')
      ])
    ])
  ]
})
export class ToggleComponent {

  @Input() value = false;
  @Input() label = '';
  @Input() selectedColor = '#1ad174';
  @Output() valueChange = new EventEmitter<boolean>();

  constructor() {

  }

  toggle() {
    this.value = !this.value;
    this.valueChange.emit(this.value);
  }

}
