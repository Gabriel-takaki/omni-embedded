/**
 * Created by filipe on 19/09/16.
 */
import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {StatusService} from "../services/status.service";
import {HttpClient} from "@angular/common/http";
import {BASE_URL} from "../app.consts";
import * as moment from 'moment';

@Component({
  templateUrl: 'message-details.component.html',
  styleUrls: ['./message-details.component.scss']
})

export class MessageDetailsComponent {

  public message;
  public chat;

  public clientRcvd;
  public serverRcvd;
  public clientReaded;

  constructor(private dialogRef: MatDialogRef<MessageDetailsComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              public status: StatusService, private http: HttpClient) {

    this.message = data.message;
    this.chat = status.chatsObj[this.message.chatId];

    if (!this.chat) {
      dialogRef.close();
    }

    this.loadMessageDetails();

  }

  loadMessageDetails() {

    this.http.post(BASE_URL + '/api/getMessageDetails', {
      queueId: this.chat.queueId,
      messageId: this.message.messageid,
      clientId: this.chat.clientId
    }).subscribe((ret: any) => {
      this.clientRcvd = moment(ret.clientRcvdTime);
      this.serverRcvd = moment(ret.serverRcvdTime);
      this.clientReaded = moment(ret.clientReadedTime);
    }, err => {
      console.log(err);
    });

  }

  result(r) {

    this.dialogRef.close(r);

  }

}
