/**
 * Created by filipe on 18/09/16.
 */
import {Component, Input, OnChanges, OnInit} from "@angular/core";
import {Template} from "../definitions";

@Component({
  selector: 'ca-template-message',
  templateUrl: 'template-message.component.html',
  styleUrls: ['./template-message.component.scss'],
})
export class TemplateMessageComponent implements OnChanges, OnInit {

  @Input() template: Template;
  @Input() formData: string[];
  @Input() counter = 0;

  public headerData = [];
  public bodyData = [];

  constructor() {

  }

  ngOnChanges() {
    this.separateData();
  }

  ngOnInit() {
    this.separateData();
  }

  separateData() {
    this.headerData = [];
    this.bodyData = [];
    if (this.template) {
      for (let x = 0; x < this.template.headerparams.length; x++) {
        this.headerData.push(this.formData[x]);
      }
      for (let x = 0; x < this.template.params.length; x++) {
        this.bodyData.push(this.formData[x + this.template.headerparams.length]);
      }
    }
  }

}
