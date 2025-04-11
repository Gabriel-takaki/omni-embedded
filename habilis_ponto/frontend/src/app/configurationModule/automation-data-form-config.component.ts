/**
 * Created by filipe on 19/09/16.
 */
import {Component, Inject} from '@angular/core';
import {StatusService} from "../services/status.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatChipInputEvent} from "@angular/material/chips";
import {COMMA, ENTER} from "@angular/cdk/keycodes";

@Component({
  templateUrl: 'automation-data-form-config.component.html'
})
export class AutomationDataFormConfigComponent {

  public fields = [];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private dialogRef: MatDialogRef<AutomationDataFormConfigComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              public status: StatusService) {

    this.fields = data.fields || [];

  }

  addField() {
    this.fields.push({
      title: '',
      var: '',
      type: 0,
      required: false,
      options: []
    });
  }

  removeField(field) {
    this.fields.splice(this.fields.indexOf(field), 1);
  }


  addTag(event: MatChipInputEvent, tags): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removeTag(option, tags) {
    tags.splice(tags.indexOf(option), 1);
  }

  save() {
    this.dialogRef.close(this.fields);
  }

  close() {
    this.dialogRef.close();
  }

}
