/**
 * Created by filipe on 19/09/16.
 */
import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {BASE_URL} from "../app.consts";
import {SocketService} from "../services/socket.service";
import {HttpClient} from "@angular/common/http";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatChipInputEvent} from "@angular/material/chips";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {StatusService} from "../services/status.service";

@Component({
  templateUrl: 'newsform.component.html'
})
export class NewsformComponent implements AfterViewInit {

  public id;
  public title = '';
  public description = '';
  public keywords = [];
  public selectedTags = [];
  public tags = [];
  public queues = [];
  public content = '';
  public mainimage = '';
  public validafter;
  public type = 0;
  @ViewChild('titleInput') titleInput: ElementRef<HTMLInputElement>;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(public socket: SocketService, private notifications: NotificationsService, public service: StatusService,
              private dialogRef: MatDialogRef<NewsformComponent>, private http: HttpClient,
              @Inject(MAT_DIALOG_DATA) public data: any, private snack: MatSnackBar) {

    this.tags = service.faqTags;

    if (data) {
      this.title = data.title || '';
      this.description = data.description || '';
      this.mainimage = data.mainimage || '';
      this.content = data.content || '';
      this.type = data.type || 0;
      this.validafter = data.validafter || null;
      this.keywords = data.keywords || [];
      this.selectedTags = data.tags;
      this.queues = data.queues;
      this.id = data.id;
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

  copyTag(tag) {
    navigator.clipboard.writeText(tag + "\n");
    this.snack.open($localize`Copiado!`, '', {duration: 700});
  }

  pasteEvent(e, a) {
    const data = e.clipboardData.getData('text').split("\n");
    if (data.length) {
      for (const i of data) {
        if (i) {
          a.push(i);
        }
      }
    }
    e.preventDefault();
  }

  copyAllTags(a) {
    navigator.clipboard.writeText(a.join("\n"));
    this.snack.open($localize`Copiado!`, '', {duration: 700});
  }

  removeTag(option, tags) {
    tags.splice(tags.indexOf(option), 1);
  }

  focusTimer() {
    setTimeout(() => {
      if (this.titleInput) {
        this.titleInput.nativeElement.focus();
      } else {
        this.focusTimer();
      }
    }, 50)
  }

  close() {
    this.dialogRef.close();
  }

  save() {

    if (this.title && this.content) {

      const re = {
        title: this.title,
        description: this.description,
        content: this.content,
        keywords: this.keywords,
        mainimage: this.mainimage,
        type: this.type,
        validafter: this.validafter,
        tags: this.selectedTags,
        queues: this.queues
      };

      if (!this.id) {

        this.http.post(BASE_URL + '/news', re, { observe: "response"}).subscribe(r => {
          this.notifications.success($localize`Sucesso`, $localize`Nova Novidade cadastrada com sucesso!`);
          this.dialogRef.close(true);
        }, err => {
          this.notifications.error($localize`Erro ao salvar`, err.statusText);
        });

      } else {

        this.http.put(BASE_URL + '/news/' + this.id, re, {

          observe: "response"
        }).subscribe(r => {
          this.notifications.success($localize`Sucesso`, $localize`Novidade atualizada com sucesso!`);
          this.dialogRef.close(true);
        }, err => {
          this.notifications.error($localize`Erro ao salvar`, err.statusText);
        });

      }
    }

  }

}
