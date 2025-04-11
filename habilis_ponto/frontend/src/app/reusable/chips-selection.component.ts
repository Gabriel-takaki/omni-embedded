/**
 * Created by filipe on 17/09/16.
 */
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {SelectionListComponent} from './selection-list.component';

@Component({
  selector: 'app-chips-selection',
  templateUrl: 'chips-selection.component.html',
  styleUrls: ['chips-selection.component.scss']
})
export class ChipsSelectionComponent {

  @Input() items: any[] = [];
  @Input() value: any[] = [];
  @Input() valueField = '';
  @Input() chipColor = '';
  @Input() maxDisplay = 2;
  @Input() label = '';
  @Input() firstField = 'name';
  @Input() secondField = '';

  @Output() selectionChanged = new EventEmitter();
  @Output() valueChanged = new EventEmitter<any[]>();

  constructor(private dialog: MatDialog) {

  }

  openSelectionDialog() {
    this.dialog.open(SelectionListComponent, {
      data: {
        title: this.label,
        itens: this.items,
        selectedItens: this.value,
        firstField: this.firstField,
        secondField: this.secondField,
        valueField: this.valueField,
        allowMulti: true
      }
    }).afterClosed().subscribe(r => {
      if (r) {
        this.value = r;
        this.selectionChanged.emit();
        this.valueChanged.emit(this.value);
      }
    });
  }

}
