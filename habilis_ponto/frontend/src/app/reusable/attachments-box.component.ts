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
import {StatusService} from "../services/status.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {BASE_URL} from "../app.consts";

@Component({
  selector: 'app-attachments-box',
  templateUrl: 'attachments-box.component.html',
  styleUrls: ['attachments-box.component.scss']
})
export class AttachmentsBoxComponent implements OnChanges {

  separatorKeysCodes: number[] = [ENTER, COMMA];

  @Input() disabled = false;
  @Input() showFromComputer = false;
  @Input() items: Array<any> = [];
  @Input() itemsMap = {};
  @Input() label = '';
  @Input() placeholder = '';
  @Input() value: Array<any> = [];
  valueClone = [];
  @Output() valueChange = new EventEmitter();
  @ViewChild('filesDialog') filesDialog;

  selectedItems = [];
  filteredItems: Observable<any[]>;

  inputCtrl = new UntypedFormControl('');
  @ViewChild('itemInput') itemInput: ElementRef<HTMLInputElement>;

  constructor(public status: StatusService, private snack: MatSnackBar) {
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
      this.itemsMap[item.fk_file] = item;
    }
  }

  openFile() {
    this.filesDialog.nativeElement.click();
  }

  fileSelected(e = null) {

    if (e && e.target.files.length) {
      for (const file of e.target.files) {
        if (file && file.size <= this.status.config.maxfilesize && !this.status.config.blockedextensions.includes(file.name.slice(-3))
          && !this.status.config.blockedextensions.includes(file.name.slice(-4))) {

          const fileReader = new FileReader();
          fileReader.onload = (event: any) => {

            const byteString = event.target.result;
            this.valueClone.push({
              id: 0,
              filename: file.name,
              mimetype: file.type,
              hash: '',
              content: btoa(byteString)
            });

          };
          fileReader.readAsBinaryString(file);

        } else if (file && file.size > this.status.config.maxfilesize) {
          this.snack.open($localize`O arquivo que você está tentando salvar é maior que o permitido. (Tamanho máx. ${Math.round(this.status.config.maxfilesize / 1024)} KB)`,
            $localize`Fechar`, {
              panelClass: 'bg-warning'
            });
        } else if (file && (this.status.config.blockedextensions.includes(file.name.slice(-3))
          || this.status.config.blockedextensions.includes(file.name.slice(-4)))) {
          this.snack.open($localize`O formato do arquivo que você está tentando salvar não é permitido.`, $localize`Fechar`, {
            panelClass: 'bg-warning'
          });
        }
      }
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

  emitChange() {
    this.valueChange.emit(this.valueClone);
  }

  remove(item: any): void {
    this.valueClone.splice(this.valueClone.indexOf(item), 1);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    let hasItem = false;
    for (const i of this.valueClone) {
      if (i.id === event.option.value.fk_file) {
        hasItem = true;
        break;
      }
    }
    if (event.option.value.id === 'from-pc') {
      this.openFile();
    } else if (!hasItem) {
      this.valueClone.push({
        id: event.option.value.fk_file,
        filename: event.option.value.file_name,
        mimetype: event.option.value.file_mimetype,
        hash: event.option.value.file_auth
      });
    }
    this.inputCtrl.setValue(null);
    this.itemInput.nativeElement.value = '';
    this.itemInput.nativeElement.focus();
  }

  private _filter(value: string): any[] {
    if (typeof value === 'string') {
      const filterValue = value?.toLowerCase();
      return this.items.filter(item => item.title.toLowerCase().includes(filterValue));
    } else {
      return this.items;
    }
  }

}
