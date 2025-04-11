/**
 * Created by filipe on 17/09/16.
 */
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output, SimpleChanges,
  ViewChild
} from '@angular/core';
import {MatChipInputEvent} from "@angular/material/chips";
import {
  MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent
} from "@angular/material/legacy-autocomplete";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {UntypedFormControl} from "@angular/forms";
import {Observable} from "rxjs/internal/Observable";
import {map, startWith} from "rxjs/operators";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {MatDialog} from "@angular/material/dialog";
import {GroupMembersListComponent} from "./group-members-list.component";

@Component({
  selector: 'app-tag-box',
  templateUrl: 'tag-box.component.html',
  styleUrls: ['tag-box.component.scss']
})
export class TagBoxComponent implements OnChanges {

  separatorKeysCodes: number[] = [ENTER, COMMA];

  @Input() allowReordering = false;
  @Input() allowAdd = false;
  @Input() showPosition = false;
  @Input() showGroupMembersBtn = false;
  @Input() disabled = false;
  @Input() items: Array<object> = [];
  @Input() itemsMap = {};
  @Input() colors = [];
  @Input() fgColors = [];
  @Input() label = '';
  @Input() placeholder = '';
  @Input() displayExpr = 'name';
  @Input() valueExpr = 'id';
  @Input() value: Array<any> = [];
  valueClone = [];
  @Output() valueChange = new EventEmitter();
  @Output() changed = new EventEmitter();

  selectedItems = [];
  filteredItems: Observable<any[]>;

  inputCtrl = new UntypedFormControl('');
  @ViewChild('itemInput') itemInput: ElementRef<HTMLInputElement>;

  constructor(private dialog: MatDialog) {
    this.createTrigger();
    this.updateItemsMap();
    this.cloneValue();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('items')) {
      this.updateItemsMap();
    }
    if (changes.hasOwnProperty('value') && this.value !== this.valueClone) {
      this.cloneValue();
    }
  }

  updateItemsMap() {
    for (const item of this.items) {
      this.itemsMap[item[this.valueExpr]] = item;
    }
  }

  cloneValue() {
    try {
      this.valueClone = JSON.parse(JSON.stringify(this.value)) || [];
    } catch (e) {
      this.valueClone = [];
    }
    this.emitChange();
  }

  createTrigger() {
    if (this.items?.length) {
      this.filteredItems = this.inputCtrl.valueChanges.pipe(
        startWith(null),
        map((item: string | null) => (item ? this._filter(item) : this.items.slice()))
      );
    } else {
      setTimeout(() => this.createTrigger(), 200);
    }
  }

  add(event: MatChipInputEvent): void {

  }

  drop(event: CdkDragDrop<any[]>) {
    if (this.allowReordering) {
      moveItemInArray(this.valueClone, event.previousIndex, event.currentIndex);
    }
  }

  emitChange() {
    this.valueChange.emit(this.valueClone);
  }

  remove(item: any): void {
    this.valueClone.splice(this.valueClone.indexOf(item), 1);
    this.changed.emit();
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (!this.valueClone?.includes(event.option.value[this.valueExpr])) {
      this.valueClone.push(event.option.value[this.valueExpr]);
    }
    this.inputCtrl.setValue(null);
    this.itemInput.nativeElement.value = '';
    this.itemInput.nativeElement.focus();
    this.changed.emit();
  }

  private _filter(value: string): any[] {
    if (typeof value === 'string') {
      const filterValue = value?.toLowerCase();
      return this.items.filter(item => item[this.displayExpr].toLowerCase().includes(filterValue));
    } else {
      return this.items;
    }
  }

  showGroupMembersDialog(groupId) {
    this.dialog.open(GroupMembersListComponent, {
      data: {
        groupId
      }
    });
  }

}
