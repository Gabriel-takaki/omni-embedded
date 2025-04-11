/**
 * Created by filipe on 19/09/16.
 */
import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {BASE_URL} from "../app.consts";
import {SocketService} from "../services/socket.service";
import {HttpClient} from "@angular/common/http";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatChipInputEvent} from "@angular/material/chips";
import {COMMA, ENTER} from "@angular/cdk/keycodes";

@Component({
  templateUrl: 'contact-extra-fields-form.component.html'
})
export class ContactExtraFieldsFormComponent implements AfterViewInit {

  public name = '';
  public description = '';
  public type = 0;
  public lock = false;
  public options = [];
  @ViewChild('nameInput') nameInput: ElementRef<HTMLInputElement>;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(public socket: SocketService, private notifications: NotificationsService,
              private dialogRef: MatDialogRef<ContactExtraFieldsFormComponent>, private http: HttpClient) {

  }

  ngAfterViewInit() {
    this.focusTimer();
  }

  focusTimer() {
    setTimeout(() => {
      if (this.nameInput) {
        this.nameInput.nativeElement.focus();
      } else {
        this.focusTimer();
      }
    }, 50)
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

  close() {
    this.dialogRef.close();
  }

  save() {

    if (this.name) {
      const re = {
        name: this.name,
        description: this.description,
        type: this.type,
        lock: this.lock ? 1 : 0,
        options: this.options
      };

      this.http.post(BASE_URL + '/contactsextrafields', re, {
        observe: "response"
      }).subscribe(r => {
        this.notifications.success($localize`Sucesso`, $localize`Nova resposta cadastrada com sucesso!`);
        this.dialogRef.close(true);
      }, err => {
        this.notifications.error($localize`Erro ao salvar`, err.statusText);
      });
    }
  }

}
