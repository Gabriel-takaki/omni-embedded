/**
 * Created by filipe on 17/09/16.
 */
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {StatusService} from "../services/status.service";

@Component({
  selector: 'app-list-selection',
  templateUrl: 'list-selection.component.html',
  styleUrls: ['list-selection.component.scss']
})
export class ListSelectionComponent {

  @Input() value: number = 0;
  @Input() editable = true;
  @Input() items = [];
  @Input() nameField = '';
  @Input() valueField = '';
  @Input() label = '';
  @Input() toolTip = '';
  @Input() required = false;
  @Output() valueChange = new EventEmitter<number>();
  @Output() changed = new EventEmitter<number>();

  public textSearch = '';

  constructor(public status: StatusService) {

  }

}
