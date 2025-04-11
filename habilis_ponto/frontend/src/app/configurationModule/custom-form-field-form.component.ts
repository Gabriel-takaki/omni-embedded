import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {SocketService} from "../services/socket.service";
import {HttpClient} from "@angular/common/http";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import * as _ from 'lodash';
import {MatChipInputEvent} from "@angular/material/chips";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {CustomField} from "../definitions";

@Component({
  templateUrl: 'custom-form-field-form.component.html',
  styleUrls: ['custom-form-field-form.component.scss']
})
export class CustomFormFieldFormComponent implements AfterViewInit {

  public field: CustomField = {
    label: '',
    type: 0,
    options: [],
    required: false,
    lock: false,
    id: ''
  };
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('labelInput') labelInput: ElementRef<HTMLInputElement>;

  constructor(public socket: SocketService, private notifications: NotificationsService,
              private dialogRef: MatDialogRef<CustomFormFieldFormComponent>, private http: HttpClient,
              @Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog) {

    if (data) {
      this.field = _.cloneDeep(data);
    }

  }

  ngAfterViewInit() {
    this.focusTimer();
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

  focusTimer() {
    setTimeout(() => {
      if (this.labelInput) {
        this.labelInput.nativeElement.focus();
      } else {
        this.focusTimer();
      }
    }, 50)
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.field);
  }

}
