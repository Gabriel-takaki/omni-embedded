/**
 * Created by filipe on 17/09/16.
 */
import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-select-button',
  templateUrl: 'select-button.component.html',
  styleUrls: ['select-button.component.scss']
})
export class SelectButtonComponent {

  @Input() value;
  @Output() valueChange = new EventEmitter<any>();

  @Input() selectionValue;
  @Input() icon = 'list';
  @Input() iconFamily = 'far';
  @Input() color = '#f8D';
  @Input() text = 'Botão de seleção';

  constructor() {

  }

  click() {

    this.valueChange.emit(this.selectionValue);

  }

}
