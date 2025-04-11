/**
 * Created by filipe on 19/09/16.
 */
import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {BASE_URL} from "../app.consts";
import {SocketService} from "../services/socket.service";
import {HttpClient} from "@angular/common/http";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ConfirmAction} from "../reusable/confirmaction.decorator";
import * as _ from 'lodash';
import * as uuid from 'uuid';
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {CustomFormFieldFormComponent} from "./custom-form-field-form.component";
import {CustomForm} from "../definitions";

@Component({
  templateUrl: 'custom-form-form.component.html',
  styleUrls: ['custom-form-form.component.scss']
})
export class CustomFormFormComponent implements AfterViewInit {

  public form: CustomForm = {
    name: '',
    description: '',
    fields: [],
    id: 0
  }

  @ViewChild('nameInput') nameInput: ElementRef<HTMLInputElement>;

  constructor(public socket: SocketService, private notifications: NotificationsService,
              private dialogRef: MatDialogRef<CustomFormFormComponent>, private http: HttpClient,
              @Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog) {

    if (data) {
      this.form = _.cloneDeep(data);
    }

  }

  ngAfterViewInit() {
    this.focusTimer();
  }

  addField(type: number) {
    this.form.fields.push({
      id: uuid.v1().split('-')[0],
      type: type,
      label: $localize`Novo campo`,
      required: false,
      lock: false,
      options: []
    });
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.form.fields, event.previousIndex, event.currentIndex);
  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja remover este campo?`,
    title: $localize`Remover campo`,
    yesButtonText: $localize`Remover`,
    noButtonText: $localize`Cancelar`,
    yesButtonStyle: 'warning'
  })
  removeField(field) {
    this.form.fields.splice(this.form.fields.indexOf(field), 1);
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

  editField(field) {
    const newReason = this.dialog.open(CustomFormFieldFormComponent, {data: field});
    const sub = newReason.afterClosed().subscribe(r => {
      if (r) {
        this.form.fields[this.form.fields.indexOf(field)] = r;
      }
      sub.unsubscribe();
    })
  }

  close() {
    this.dialogRef.close();
  }

  save() {

    if (this.form.name && this.form.fields.length) {
      if (!this.form.id) {
        this.http.post(BASE_URL + '/forms', this.form, {observe: "response"}).subscribe(r => {
          this.notifications.success($localize`Sucesso`, $localize`Novo formulário cadastrado com sucesso!`);
          this.dialogRef.close(true);
        }, err => {
          this.notifications.error($localize`Erro ao salvar`, err.statusText);
        });
      } else {
        this.http.put(BASE_URL + '/forms/' + this.form.id, this.form, {
          observe: "response"
        }).subscribe(r => {
          this.notifications.success($localize`Sucesso`, $localize`Formulário atualizado com sucesso!`);
          this.dialogRef.close(true);
        }, err => {
          this.notifications.error($localize`Erro ao salvar`, err.statusText);
        });
      }
    }

  }

}
