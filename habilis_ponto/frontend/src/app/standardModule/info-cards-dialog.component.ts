/**
 * Created by filipe on 19/09/16.
 */
import {Component, ElementRef, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {HttpClient} from "@angular/common/http";
import {BASE_URL} from "../app.consts";
import * as moment from "moment";
import {DatePipe} from "@angular/common";
import {MatCalendarCellClassFunction} from "@angular/material/datepicker";
import {StatusService} from "../services/status.service";

@Component({
  templateUrl: 'info-cards-dialog.component.html'
})

export class InfoCardsDialogComponent {

  chat;
  public ObjectPass = Object;

  constructor(private dialogRef: MatDialogRef<InfoCardsDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private http: HttpClient, private datePipe: DatePipe, public status: StatusService) {

    this.chat = data;
    this.selectFirstSession()

  }


  selectFirstSession() {
    // Quando o sidebar é exibido, caso não haja uma sessão selecionada, a primeira é selecionada
    if (this.chat && (!this.chat.selectedSession || !this.chat?.cards[this.chat?.selectedSession])) {
      this.chat.selectedSession = Object.keys(this.chat.cards)[0];
    }
  }

    close() {
        this.dialogRef.close();
    }

}
