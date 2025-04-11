import {Component, EventEmitter, Input, Output} from '@angular/core';
import {StatusService} from "../services/status.service";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-template-selection',
  templateUrl: 'template-selection.component.html',
  styleUrls: ['template-selection.component.scss']
})
export class TemplateSelectionComponent {

  @Input() value = 0;
  @Input() editable = true;
  @Input() caption = '';
  @Input() queueId = 0;
  @Output() valueChange = new EventEmitter<number>();
  @Output() changed = new EventEmitter<number>();

  public search = '';

  constructor(public status: StatusService, private dialog: MatDialog) {

  }

}
