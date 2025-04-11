/**
 * Created by filipe on 17/09/16.
 */
import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-button-with-loading',
  templateUrl: 'button-with-loading.component.html',
  styleUrls: ['button-with-loading.component.scss']
})
export class ButtonWithLoadingComponent {

  @Input() caption = '';
  @Input() toolTip = '';
  @Input() loading = '';
  @Input() style = 'white';
  @Input() slim = false;
  @Input() disabled = false;
  @Output() click = new EventEmitter();

  constructor() {

  }

  buttonClicked() {
    this.click.emit();
  }

}
