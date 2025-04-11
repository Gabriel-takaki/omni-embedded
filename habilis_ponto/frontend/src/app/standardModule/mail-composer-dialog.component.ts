/**
 * Created by filipe on 19/09/16.
 */
import {Component, Inject} from '@angular/core';
import {StatusService} from "../services/status.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {HttpClient} from "@angular/common/http";
import {BASE_URL} from "../app.consts";

@Component({
  templateUrl: 'mail-composer-dialog.component.html',
  styleUrls: ['mail-composer-dialog.component.scss']
})

export class MailComposerDialogComponent {

  attachments = [];
  selectedTemplate = 0;
  selectedQueueId = 0;
  content = '';
  subject = '';
  queue;

  constructor(public status: StatusService, private http: HttpClient,
              private dialog: MatDialogRef<MailComposerDialogComponent>, @Inject(MAT_DIALOG_DATA) data) {

    this.selectedQueueId = data.queueId;
    this.queue = [0, 1, 98, 99].includes(status.user.type) ? status.allQueuesMap[this.selectedQueueId] : status.agentQueuesObj[this.selectedQueueId];

    if (!this.queue) {
      dialog.close();
    }

  }

  getTemplateData() {
    if (!this.status.htmlTemplatesRef[this.selectedTemplate]) {
      this.http.post(BASE_URL + '/htmltemplates/getTemplate', {id: this.selectedTemplate}).subscribe((r: any) => {
        this.status.htmlTemplatesRef[this.selectedTemplate] = r;
        this.content = r.template;
        this.attachments = r.attachments;
        this.subject = r.subject;
      }, err => {

      });
    } else {
      const template = this.status.htmlTemplatesRef[this.selectedTemplate];
      this.content = template.template;
      this.attachments = template.attachments;
      this.subject = template.subject;
    }
  }

  save() {
    this.dialog.close({
      attachments: this.attachments,
      text: this.content,
      subject: this.subject
    });
  }

  close() {
    this.dialog.close();
  }

}
