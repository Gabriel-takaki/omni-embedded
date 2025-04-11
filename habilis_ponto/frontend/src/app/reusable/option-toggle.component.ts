/**
 * Created by filipe on 17/09/16.
 */
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-option-toggle',
  templateUrl: 'option-toggle.component.html',
  styleUrls: ['option-toggle.component.scss'],
  animations: [
    trigger('backState', [
      state('option1', style({
        width: '{{op1Width}}px',
        'background-color': 'var(--primary-color)',
        left: 0
      }), {params: {op1Color: '#1ad174', op1Width: 100}}),
      state('option2', style({
        width: '{{op2Width}}px',
        'background-color': 'var(--primary-color)',
        left: '{{op2Left}}px'
      }), {params: {op2Color: '#1ad174', op2Width: 100, op2Left: 50}}),
      transition('option1 <=> option2', [
        animate('0.3s ease-in-out')
      ])
    ]),
    trigger('checkState', [
      state('checked', style({
        color: '{{color}}'
      }), {params: {color: '#fff'}}),
      state('clear', style({
        color: '{{clearColor}}'
      }), {params: {clearColor: '#333'}}),
      transition('clear <=> checked', [
        animate('0.3s ease-in-out')
      ])
    ])
  ]
})
export class OptionToggleComponent {

  @Input() bgColor = '#eee';
  @Input() color = '#333';

  @Input() option1Color = '#ffffff';
  @Input() option1BgColor = '#1ad174';
  @Input() option1Text = $localize`Opção 1`;
  @Input() option1Value: any;

  @Input() option2Color = '#ffffff';
  @Input() option2BgColor = '#1ad174';
  @Input() option2Text = $localize`Opção 2`;
  @Input() option2Value: any;

  @Input() disabled = false;

  @Input() value: any;
  @Input() height: any = 32;
  @Input() width: any = 120;
  @Input() fontSize: any;
  @Output() valueChange = new EventEmitter<any>();

  constructor() {

  }

  toggle() {
    this.value = this.value === this.option1Value ? this.option2Value : this.option1Value;
    this.valueChange.emit(this.value);
  }

}
