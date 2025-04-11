/**
 * Created by filipe on 19/09/16.
 */
import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import * as _ from 'lodash';

@Component({
  templateUrl: 'selection-list.component.html',
  styleUrls: ['selection-list.component.scss']
})
export class SelectionListComponent {

  searchText = '';
  itens = [];
  title = '';

  onlySelected = false;
  allowMulti = false;
  selectedItem;
  selectedItens = [];

  firstField = 'name';
  secondField = '';
  valueField = '';

  searchFields = [];

  showLimit = 25;

  constructor(private dialogRef: MatDialogRef<SelectionListComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.itens = data && data.itens ? data.itens : [];
    this.title = data && data.title ? data.title : '';
    this.firstField = data && data.firstField ? data.firstField : 'name';
    this.secondField = data && data.secondField ? data.secondField : '';
    this.valueField = data && data.valueField ? data.valueField : '';
    if (this.firstField) {
      this.searchFields.push(this.firstField);
    }
    if (this.secondField) {
      this.searchFields.push(this.secondField);
    }
    this.selectedItem = data && data.selectedItem ? data.selectedItem : null;
    this.selectedItens = data && data.selectedItens ? [].concat(data.selectedItens) : [];
    this.allowMulti = data && data.hasOwnProperty('allowMulti') ? data.allowMulti : false;
  }

  scrolling(e) {
    // console.log(e);
    if (e.target.scrollTop + 600 >= e.target.scrollHeight) {
      this.showLimit += 25;
    }
  }

  selectItem(i, ignoreRemove = false) {
    const value = this.valueField ? i[this.valueField] : i;
    if (this.allowMulti) {
      if (this.selectedItens.includes(value) && !ignoreRemove) {
        _.remove(this.selectedItens, value);
      } else if (!this.selectedItens.includes(value)) {
        this.selectedItens.push(value);
      }
    } else {
      this.selectedItem = i === this.selectedItem ? null : i;
    }
  }

  keyPress(e, i) {
    if (e.code === 'Space') {
      this.selectItem(i);
    } else if (e.key === 'Enter') {
      this.selectItem(i, true);
      this.result(true);
    } else if (e.code === 'ArrowDown') {
      this.keytab(e, 1);
    } else if (e.code === 'ArrowUp') {
      this.keytab(e, -1);
    }
  }

  keytab(event, direction = 1) {
    const curIndex = event.target.tabIndex;
    const inputs = document.querySelectorAll('.selection-item');
    for (const i of Array.from(inputs)) {
      // @ts-ignore
      if (i.tabIndex === (curIndex + direction)) {
        // @ts-ignore
        i.focus();
        break;
      }
    }
  }

  result(r) {

    this.dialogRef.close(r ? (this.allowMulti ? this.selectedItens : this.selectedItem) : false);

  }

}
