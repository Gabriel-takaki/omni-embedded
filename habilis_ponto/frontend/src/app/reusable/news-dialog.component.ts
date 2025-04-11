/**
 * Created by filipe on 17/09/16.
 */
import {Component, Inject} from '@angular/core';
import {StatusService} from "../services/status.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {BASE_URL} from "../app.consts";
import {HttpClient} from "@angular/common/http";
import {DomSanitizer} from "@angular/platform-browser";
import * as moment from "moment";

@Component({
  templateUrl: 'news-dialog.component.html',
  styleUrls: ['news-dialog.component.scss']
})
export class NewsDialogComponent {

  id;
  newData;

  constructor(private dialogRef: MatDialogRef<NewsDialogComponent>, public status: StatusService,
              @Inject(MAT_DIALOG_DATA) public data: any, private http: HttpClient, private sanitizer: DomSanitizer) {

    this.id = data.id;
    this.loadNews();

  }

  loadNews() {

    this.http.get(BASE_URL + '/news/getNews?id=' + this.id).subscribe((r: any[]) => {
      this.newData = r;
      this.newData.date = moment(this.newData.validafter).toDate();
      this.newData.content = this.sanitizer.bypassSecurityTrustHtml(this.newData.content);
    }, err => {
      console.log(err);
    });

  }

}
