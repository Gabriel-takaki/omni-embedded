/**
 * Created by filipe on 18/09/16.
 */
import {Component, EventEmitter, Input, Output} from "@angular/core";

@Component({
  selector: 'app-alerts-selection',
  templateUrl: './alerts-selection.component.html',
  styleUrls: ['./alerts-selection.component.scss'],
})
export class AlertsSelectionComponent {

  @Input() selected: any = [];
  @Output() selectionChange: EventEmitter<any> = new EventEmitter();
  @Input() fontSize: any = 12;
  @Input() editable = false;

  constructor() {

  }

  toogleSelection(item, e: MouseEvent) {
    if (!this.selected?.includes(item)) {
      this.selected.push(item);
    } else if (this.selected) {
      this.selected.splice(this.selected.indexOf(item), 1);
    }
    this.change();
    e?.preventDefault();
    e?.stopPropagation();
  }

  change() {
    this.selectionChange.emit();
  }

}
