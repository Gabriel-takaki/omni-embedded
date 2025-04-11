/**
 * Created by filipe on 18/09/16.
 */
import {Component, EventEmitter, Input, Output} from "@angular/core";
import {StatusService} from "../services/status.service";
import {ConfirmAction} from "./confirmaction.decorator";
import {MatDialog} from "@angular/material/dialog";
import {ModelsService} from "../services/models.service";
import {CheckListItem} from "../ivr.definitions";

@Component({
  selector: 'ca-task-checklist',
  templateUrl: 'task-checklist.component.html',
  styleUrls: ['task-checklist.component.scss'],
})
export class TaskChecklistComponent {

  @Input() list: CheckListItem[] = [];
  @Input() editable = true;
  @Output() changed = new EventEmitter();

  constructor(public status: StatusService, public dialog: MatDialog, private models: ModelsService) {

  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja limpar a lista? Essa ação não poderá ser desfeita.`,
    title: $localize`Limpar lista`,
    yesButtonText: $localize`Limpar`,
    yesButtonStyle: 'warning'
  })
  clearList() {
    this.list.splice(0, this.list.length);
    this.changed.emit();
  }

  addChecklistItem() {
    const item = this.models.checkListItem();
    this.list.push(item);
    this.changed.emit();
    setTimeout(() => {
      document.getElementById('checklist-item-' + item.id).focus();
    }, 250);
  }

  removeChecklistItem(item) {
    if (!this.editable) {
      return;
    }
    const index = this.list.indexOf(item);
    if (index > -1) {
      this.list.splice(index, 1);
      this.changed.emit();
    }
  }

  toogleChecklistItem(item) {
    if (!this.editable) {
      return;
    }
    item.checked = !item.checked;
    this.changed.emit();
  }

  updateTitle(e, item) {
    if (!this.editable) {
      return;
    }
    item.title = e.target.innerText;
    this.changed.emit();
  }

  removeFocus(e: KeyboardEvent, item, createNew = false) {
    // @ts-ignore
    if (!e.target.innerText && !item.checked) {
      this.removeChecklistItem(item);
    } else {
      // @ts-ignore
      e.target.blur();
      e.preventDefault();
      e.stopPropagation();
      this.removeIsNew(item);
      if (createNew) {
        this.addChecklistItem();
      }
    }
  }

  removeIsNew(item) {
    delete item.isNew;
  }

}
