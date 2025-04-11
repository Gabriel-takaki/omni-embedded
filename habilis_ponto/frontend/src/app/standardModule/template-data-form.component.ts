/**
 * Created by filipe on 19/09/16.
 */
import {Component, Inject} from '@angular/core';
import {StatusService} from "../services/status.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Template} from "../definitions";

@Component({
  templateUrl: 'template-data-form.component.html',
  styleUrls: ['template-data-form.component.scss']
})

export class TemplateDataFormComponent {

  fields = [];
  formData = [];
  selectedTemplate = 0;
  selectedQueueId = 0;
  counter = 0;
  queue;

  constructor(public status: StatusService,
              private dialog: MatDialogRef<TemplateDataFormComponent>, @Inject(MAT_DIALOG_DATA) data) {

    this.selectedQueueId = data.queueId;
    this.queue = [0, 1, 98, 99].includes(status.user.type) ? status.allQueuesMap[this.selectedQueueId] : status.agentQueuesObj[this.selectedQueueId];

    if (!this.queue) {
      dialog.close();
    }

  }

  getTemplateData() {
    this.fields = [];
    this.formData = [];
    const template: Template = this.status.allTemplatesMap[this.selectedTemplate];
    if (template) {
      this.fields = [];
      for (const param of template.headerparams || []) {
        const newParam = JSON.parse(JSON.stringify(param));
        newParam.name = $localize`Cabeçalho: ` + param.name;
        this.fields.push(newParam);
      }
      for (const param of template.params || []) {
        const newParam = JSON.parse(JSON.stringify(param));
        newParam.name = $localize`Corpo: ` + param.name;
        this.fields.push(newParam);
      }
      for (const param of template.buttonsparams || []) {
        const newParam = JSON.parse(JSON.stringify(param));
        newParam.name = $localize`Botão: ` + param.name;
        this.fields.push(newParam);
      }
      for (const param of this.fields) {
        this.formData.push(param.default);
      }
    }
  }

  incrementCounter() {
    this.counter++;
  }

  save() {
    this.dialog.close({templateId: this.selectedTemplate, data: this.formData});
  }

  close() {
    this.dialog.close();
  }

}
