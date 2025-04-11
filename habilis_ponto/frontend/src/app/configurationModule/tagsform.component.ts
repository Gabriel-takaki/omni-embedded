/**
 * Created by filipe on 19/09/16.
 */
import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {BASE_URL} from "../app.consts";
import {SocketService} from "../services/socket.service";
import {HttpClient} from "@angular/common/http";
import {StatusService} from "../services/status.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  templateUrl: 'tagsform.component.html'
})

export class TagsFormComponent implements AfterViewInit {

  id = 0;
  name = '';
  bgcolor = '#ff9399';
  fgcolor = '#fff';
  contactTag = true;
  faqTag = true;
  taskTag = true;
  dealTag = true;
  @ViewChild('nameInput') nameInput: ElementRef<HTMLInputElement>;

  bgColors = [
    "#fff1f0", "#ff9399", "#ff3b3b", "#8b0007",
    "#ffedf3", "#ff9dbb", "#ff3c78", "#ce007f",
    "#f8f0ff", "#d9bfff", "#9400d3", "#4b0097",
    "#edf7ff", "#bfe2ff", "#29bdff", "#1458ea",
    "#e8ffff", "#86f5f1", "#5bd1cd", "#25615f",
    "#dcffee", "#73feba", "#06c270", "#00752b",
    "#fff9e6", "#ffe79f", "#ffce3a", "#ce9b00",
    "#fff2e3", "#ffa486", "#ff784b", "#c63100",
    "#fff", "#333"];
  fgColors = ["#fff", "#333",
    "#fff1f0", "#ff9399", "#ff3b3b", "#8b0007",
    "#ffedf3", "#ff9dbb", "#ff3c78", "#ce007f",
    "#f8f0ff", "#d9bfff", "#9400d3", "#4b0097",
    "#edf7ff", "#bfe2ff", "#29bdff", "#1458ea",
    "#e8ffff", "#86f5f1", "#5bd1cd", "#25615f",
    "#dcffee", "#73feba", "#06c270", "#00752b",
    "#fff9e6", "#ffe79f", "#ffce3a", "#ce9b00",
    "#fff2e3", "#ffa486", "#ff784b", "#c63100"];

  constructor(public socket: SocketService, private notifications: NotificationsService, public status: StatusService,
              private dialog: MatDialogRef<TagsFormComponent>, private http: HttpClient,
              @Inject(MAT_DIALOG_DATA) public data: any) {

    this.id = data?.id || 0;
    this.name = data?.name || '';
    this.bgcolor = data?.bgcolor || '#ff9399';
    this.fgcolor = data?.fgcolor || '#fff';
    this.contactTag = data?.contacttag ?? true;
    this.faqTag = data?.faqtag ?? true;
    this.taskTag = data?.tasktag ?? true;
    this.dealTag = data?.dealtag ?? true;

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

  close() {
    this.dialog.close();
  }

  save() {

    const re = {
      name: this.name,
      bgcolor: this.bgcolor,
      fgcolor: this.fgcolor,
      contacttag: this.contactTag ? 1 : 0,
      faqtag: this.faqTag ? 1 : 0,
      dealtag: this.dealTag ? 1 : 0,
      tasktag: this.taskTag ? 1 : 0
    };

    if (this.id) {

      this.http.put(BASE_URL + '/tags/' + this.id, re, {
        observe: "response"
      }).subscribe(r => {
        this.notifications.success($localize`Sucesso`, $localize`Tag atualizada com sucesso!`);
        this.dialog.close(true);
      }, err => {
        this.notifications.error($localize`Erro ao salvar`, err.statusText);
      });

    } else {

      this.http.post(BASE_URL + '/tags/', re, {
        observe: "response"
      }).subscribe(r => {
        this.notifications.success($localize`Sucesso`, $localize`Nova tag cadastrada com sucesso!`);
        this.dialog.close(true);
      }, err => {
        this.notifications.error($localize`Erro ao salvar`, err.statusText);
      });

    }

  }

}
