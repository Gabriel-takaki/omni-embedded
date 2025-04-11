/**
 * Created by filipe on 19/09/16.
 */
import {Component, Inject} from '@angular/core';
import {StatusService} from "../services/status.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  templateUrl: 'automation-data-form.component.html',
  styleUrls: ['automation-data-form.component.scss']
})

export class AutomationDataFormComponent {

  fields = [];
  formData = {};
  showType = 0;
  name = '';
  description = '';

  constructor(public status: StatusService, 
              private dialog: MatDialogRef<AutomationDataFormComponent>, @Inject(MAT_DIALOG_DATA) data) {

    for (const field of data.fields) {
      this.formData[data.showType === 1 ? field.id : field.var] = null;
    }

    this.name = data.name;
    this.description = data.description;

    this.showType = data.showType;
    this.fields = data.fields;

  }

  save() {
    this.dialog.close(this.formData);
  }

  close() {
    this.dialog.close();
  }

}
