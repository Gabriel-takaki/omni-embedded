/**
 * Created by filipe on 19/09/16.
 */
import {Component, Inject, OnDestroy} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {StatusService} from "../services/status.service";
import {BASE_URL} from "../app.consts";
import {HttpClient} from "@angular/common/http";

@Component({
  templateUrl: 'download-chats-by-id.component.html'
})

export class DownloadChatsByIdComponent implements OnDestroy {

  startAt = 0;
  endAt = 0;
  processStarted = false;
  processing = false;
  downloaded = 0;
  total = 0;
  minId = 0;
  cutId = 0;

  baseUrl = BASE_URL;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];


  constructor(private dialogRef: MatDialogRef<DownloadChatsByIdComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              public status: StatusService, private http: HttpClient) {

    this.startAt = data.minId;
    this.endAt = data.minId;
    this.minId = data.minId;
    this.total = 1;

  }

  ngOnDestroy() {
    this.processStarted = false;
  }

  recalc() {
    this.startAt = Math.max(this.minId, this.startAt);
    this.endAt = Math.max(this.startAt, this.endAt);
    this.total = this.endAt - this.startAt + 1;
    this.downloaded = 0;
  }

  process() {
    if (!this.processStarted) {
      this.processStarted = true;
      this.downloaded = 0;
      this.startProcess();
    }
  }

  downloadCsv() {
    this.http.post(BASE_URL + '/api/downloadIntervalIndex', {
      minId: this.startAt,
      maxId: this.endAt
    }, {responseType: "blob"}).subscribe(r => {
      const url = URL.createObjectURL(r);
      this.download(url, `index-${this.startAt}-${this.endAt}.csv`);
    }, err => {

    });
  };

  download(path, filename) {
    const anchor = document.createElement('a');
    anchor.href = path;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  async startProcess() {

    this.processing = true;

    for (let x = this.startAt; x <= this.endAt; x++) {

      if (!this.processStarted) {
        break;
      }

      await new Promise((resolve, reject) => {
        this.http.get(BASE_URL + '/api/downloadChat?id=' + x, {responseType: "blob"}).subscribe(r => {
          const url = URL.createObjectURL(r);
          this.downloaded++;
          this.download(url, `${x}.zip`);
          return resolve(null);
        }, err => {
          this.downloaded++;
          return resolve(null);
        });
      });

    }

    this.processing = false;
    this.processStarted = false;

  }

  keyp(e) {
    if (e.key === 'Enter') {
      this.result(true);
    }
  }

  stop() {
    this.processStarted = false;
  }

  result(r) {

    this.dialogRef.close();

  }

}
