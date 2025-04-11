/**
 * Created by filipe on 17/09/16.
 */
import {Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {MatChipInputEvent} from "@angular/material/chips";
import {MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent} from "@angular/material/legacy-autocomplete";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {UntypedFormControl} from "@angular/forms";
import {Observable} from "rxjs/internal/Observable";
import {map, startWith} from "rxjs/operators";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";

@Component({
  selector: 'app-styled-tag-box',
  templateUrl: 'styled-tag-box.component.html',
  styleUrls: ['styled-tag-box.component.scss']
})
export class StyledTagBoxComponent implements OnChanges {

  separatorKeysCodes: number[] = [ENTER, COMMA];

  @Input() allowReordering = false;
  @Input() showPosition = false;
  @Input() disabled = false;
  @Input() items = [];
  @Input() colors = [];
  @Input() fgColors = [];
  @Input() label = '';
  @Input() placeholder = '';
  @Input() displayExpr = 'name';
  @Input() valueExpr = 'id';
  @Input() value = [];
  @Output() valueChange = new EventEmitter();

  selectedItems = [];
  filteredItems: Observable<any[]>;

  inputCtrl = new UntypedFormControl('');
  @ViewChild('itemInput') itemInput: ElementRef<HTMLInputElement>;

  constructor() {
    this.createTrigger();
    this.updateSelectedItems();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateSelectedItems();
  }

  updateSelectedItems() {
    this.selectedItems = [];
    for (const v of this.value) {
      for (const item of this.items) {
        // console.log(item, this.valueExpr, v);
        if (item[this.valueExpr] === v) {
          this.selectedItems.push(item);
        }
      }
    }
  }

  createTrigger() {
    if (this.items?.length) {
      this.filteredItems = this.inputCtrl.valueChanges.pipe(
        startWith(null),
        map((item: string | null) => (item ? this._filter(item) : this.items.slice()))
      );
      this.updateSelectedItems();
    } else {
      setTimeout(() => this.createTrigger(), 200);
    }
  }

  add(event: MatChipInputEvent): void {
    // console.log('add', event);
  }

  drop(event: CdkDragDrop<any[]>) {
    if (this.allowReordering) {
      moveItemInArray(this.selectedItems, event.previousIndex, event.currentIndex);
      this.updateValue();
    }
  }

  updateValue() {
    this.value = [];
    for (const item of this.selectedItems) {
      this.value.push(item[this.valueExpr]);
    }
    this.valueChange.emit(this.value);
  }

  remove(item: any): void {
    this.selectedItems.splice(this.selectedItems.indexOf(item), 1);
    this.updateValue();
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (!this.selectedItems.includes(event.option.value)) {
      this.selectedItems.push(event.option.value);
      this.updateValue();
    }
    this.inputCtrl.setValue(null);
    this.itemInput.nativeElement.value = '';
    this.itemInput.nativeElement.focus();
  }

  private _filter(value: string): any[] {
    if (typeof value === 'string') {
      const filterValue = value?.toLowerCase();
      return this.items.filter(item => item[this.displayExpr].toLowerCase().includes(filterValue));
    } else {
      return this.items;
    }
  }

}
