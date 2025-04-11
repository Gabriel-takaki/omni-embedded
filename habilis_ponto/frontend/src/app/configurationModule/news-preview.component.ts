/**
 * Created by filipe on 19/09/16.
 */
import {Component, Inject} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {BASE_URL} from "../app.consts";
import {HttpClient} from "@angular/common/http";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {StatusService} from "../services/status.service";

@Component({
  templateUrl: 'news-preview.component.html',
  styleUrls: ['./news-preview.component.scss']
})
export class NewsPreviewComponent {

  public newData;

  constructor(private notifications: NotificationsService, public service: StatusService,
              private dialogRef: MatDialogRef<NewsPreviewComponent>, private http: HttpClient,
              @Inject(MAT_DIALOG_DATA) public data: any, private snack: MatSnackBar) {

    this.loadNew(data.id);

  }

  loadNew(id) {

    this.http.get(BASE_URL + '/news/getNews?id=' + id).subscribe((r: any[]) => {
      this.newData = r;
      this.newData.tagsObj = this.newData.tags;
      this.newData.tags = [];
      for (const t of this.newData.tagsObj) {
        this.newData.tags.push(t.id);
      }
    }, err => {
      console.log(err);
    })

  }

  close() {
    this.dialogRef.close();
  }

}
