/**
 * Created by filipe on 19/09/16.
 */
import {Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import * as _ from 'lodash';
import {BASE_URL} from "../app.consts";
import {ConfirmAction} from "./confirmaction.decorator";
import {StatusService} from "../services/status.service";
import {UtilitiesService} from "../services/utilities.service";
import {SearchItensPipe} from "./search-itens.pipe";

@Component({
  templateUrl: 'image-selection-list.component.html',
  styleUrls: ['image-selection-list.component.scss']
})
export class ImageSelectionListComponent {

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

  queueType = 1;
  searchFields = [];

  baseUrl = BASE_URL;

  resetScrollMaxTimer = null;
  scrollMax = 30;
  searchItensPipe = new SearchItensPipe();
  @ViewChild('itensList') itensList: ElementRef<HTMLDivElement>;

  constructor(private dialogRef: MatDialogRef<ImageSelectionListComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private dialog: MatDialog, public service: StatusService, private utils: UtilitiesService) {
    this.itens = data && data.itens ? data.itens : [];
    this.title = data && data.title ? data.title : '';
    this.queueType = data.queueType ?? 1;
    this.selectedItem = data && data.selectedItem ? data.selectedItem : null;
    this.selectedItens = data && data.selectedItens ? [].concat(data.selectedItens) : [];
    this.allowMulti = data && data.hasOwnProperty('allowMulti') ? data.allowMulti : false;
  }

  async scrollEvent() {
    // Espera a lista de chats ser carregada
    while (!this.itensList) {
      await this.utils.sleep(100);
    }
    const itensCount = this.searchText ? this.searchItensPipe.transform(this.itens, true, this.searchText, ['title']).length : this.itens.length;
    if (this.itensList.nativeElement.scrollTop > this.itensList.nativeElement.scrollHeight - this.itensList.nativeElement.offsetHeight - 160) {
      this.scrollMax = this.scrollMax + 30 >= itensCount ? itensCount : this.scrollMax + 30;
    }
    if (this.resetScrollMaxTimer) {
      clearTimeout(this.resetScrollMaxTimer);
    }
    if (this.itensList.nativeElement.scrollTop < 140) {
      this.resetScrollMaxTimer = setTimeout(() => {
        this.resetScrollMaxTimer = null;
        this.scrollMax = 30;
      }, 1000);
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

  close() {
    this.dialogRef.close(false);
  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja enviar esse arquivo?`,
    title: $localize`Enviar arquivo`,
    yesButtonText: $localize`Enviar`,
    yesButtonStyle: 'success'
  })
  result(r) {

    this.dialogRef.close(r ? (this.allowMulti ? this.selectedItens : this.selectedItem) : false);

  }

}
