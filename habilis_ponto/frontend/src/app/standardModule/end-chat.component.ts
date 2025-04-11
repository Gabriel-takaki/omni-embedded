/**
 * Created by filipe on 19/09/16.
 */
import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from "@angular/common/http";
import { BASE_URL } from "../app.consts";
import { MatSelect } from "@angular/material/select";
import * as moment from "moment";
import { DatePipe } from "@angular/common";
import { MatCalendarCellClassFunction } from "@angular/material/datepicker";
import { StatusService } from "../services/status.service";

@Component({
  templateUrl: 'end-chat.component.html'
})

export class EndChatComponent {

  @ViewChild('yesButton') yesButton: ElementRef<HTMLButtonElement>;
  @ViewChild('noButton') noButton: ElementRef<HTMLButtonElement>;
  @ViewChild('reasonSelect') reasonSelect: MatSelect;

  noReason = $localize`Não especificado`;
  reason = this.noReason;
  reasonObs = '';

  clientId = '';
  starMouseOver = false;

  search = '';
  date = new Date();
  hour = 10;
  minute = 15;
  reopenReason = '';
  reopen = false;
  reopenAutomationId = 0;
  reopenTemplate = 0;
  dontSendAutoMsg = false;

  queueType = 1;
  queueId = 0;


  reasonId = '';

  reasons = [];
  opportunities = [];

  clientSchedules = [];
  filteredEndReasons = [];
  clientSchedulesLoaded = false;
  clientSchedulesText = '';
  agentSchedules = [];
  agentSchedulesCompare = new Set();
  agentSchedulesLoaded = false;
  agentSchedulesOnSelectedDate = '';

  favoriteReason = ''

  constructor(private dialogRef: MatDialogRef<EndChatComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient, private datePipe: DatePipe, public status: StatusService) {

    this.queueType = data.queueType ?? 1;
    this.queueId = data.queueId;
    this.clientId = data.clientId ?? '';
    this.opportunities = data.opportunities ?? [];
    this.getReasons(data.queueId);

  }

  loadScheduleData() {
    if (this.reopen) {
      if (!this.agentSchedulesLoaded) {
        this.loadAgentSchedules();
      }
      if (!this.clientSchedulesLoaded) {
        this.loadClientSchedules();
      }
    }
  }

  dateFilter = (d: Date | null): boolean => {
    const now = moment().startOf('day').toDate();
    return d >= now;
  };

  highlightDate: MatCalendarCellClassFunction<Date> = (cellDate: any, view) => {
    if (view === 'month' && cellDate) {
      const compareDate = cellDate.format('YYMMDD');
      return this.agentSchedulesCompare.has(compareDate) ? 'bg-orange-lighten-4' : '';
    }
    return '';
  };

  checkSelectedDate() {
    this.agentSchedulesOnSelectedDate = '';
    const agentSchedulesOnSelectedDateTmp = [];
    const tmp = {};
    for (const d of this.agentSchedules) {
      const formattedDate = moment(d.reopenat).format('YYMMDD');
      const formattedSelectedDate = moment(this.date).format('YYMMDD');
      if (formattedDate === formattedSelectedDate) {
        const key = this.datePipe.transform(moment(d.reopenat).toDate(), 'short');
        tmp[key] = tmp[key] || 0;
        tmp[key]++;
      }
    }
    for (const k of Object.keys(tmp)) {
      agentSchedulesOnSelectedDateTmp.push(k + ` (${tmp[k]})`);
    }
    this.agentSchedulesOnSelectedDate = agentSchedulesOnSelectedDateTmp.join(', ');
  }

  loadClientSchedules() {
    if (this.clientId) {
      this.http.post(BASE_URL + '/api/getClientReopenSchedules', { clientId: this.clientId }).subscribe((r: any[]) => {
        this.clientSchedules = r;
        if (this.clientSchedules) {
          this.clientSchedulesText = $localize`Agendamentos: `;
          for (const s of this.clientSchedules) {
            this.clientSchedulesText += this.datePipe.transform(moment(s.reopenat).toDate(), 'short') + ";  ";
          }
        }
      }, err => {

      });
    }
  }

  loadAgentSchedules() {
    this.http.get(BASE_URL + '/api/getAgentReopenSchedules').subscribe((r: any[]) => {
      if (r) {
        this.agentSchedules = r;
        for (const d of r) {
          this.agentSchedulesCompare.add(moment(d.reopenat).format('YYMMDD'));
        }
      }
    }, err => {

    });
  }

  handleArrows(e, button) {
    if (['ArrowLeft', 'ArrowRight'].includes(e.code)) {
      if (button === 'yesButton') {
        this.noButton.nativeElement.focus();
      } else {
        this.yesButton.nativeElement.focus();
      }
      e.stopPropagation();
      e.preventDefault();
    }
    if (['Tab'].includes(e.code)) {
      if (button === 'noButton') {
        this.reasonSelect.focus();
        e.stopPropagation();
        e.preventDefault();
      }
    }

  }

  async getReasons(queueId) {

    this.http.post(BASE_URL + '/queues/getEndReasons', { id: queueId }).subscribe((r: string[]) => {
      this.reasons = r;
      this.getFavoriteReason(queueId, r);
    }, err => {
      console.log(err);
    })

  }

  // Método para definir o motivo favorito
getFavoriteReason(queueId, reasons) {
  this.favoriteReason = this.status.endChatFavorite
    .filter(f => f.queueId === queueId)
    .map(f => f.reason)
    .join(', ');

  // Verifique se o motivo favorito está nos motivos e o selecione
  if (reasons.includes(this.favoriteReason)) {
    this.reason = this.favoriteReason;
  }

  // Inicialize o filtro sem critérios para garantir que todos os itens estejam visíveis
  this.filteredEndReasons = reasons;
  console.log(this.reason);
}

  setFavoriteReason(e) {
    e.preventDefault();
    e.stopPropagation();
  
    // Filtra para remover o item com o queueId atual e adiciona o novo favorito
    const updatedFavorites = this.status.endChatFavorite.filter((f: { queueId: number; reason: string }) => f.queueId !== this.queueId);
    updatedFavorites.push({ queueId: this.queueId, reason: this.reason });
    
    // Atualiza o LocalStorage com a nova lista de favoritos
    this.status.endChatFavorite = updatedFavorites;
  
    this.favoriteReason = this.reason;
  }

  filterOptions(text) {
    this.filteredEndReasons = [];

  if (!text) {
    this.filteredEndReasons = this.reasons;
    return;
  }

  // Garanta que o motivo favorito permaneça na lista filtrada
  for (const reason of this.reasons) {
    if (reason.toLowerCase().includes(text.toLowerCase().trim()) || reason === this.favoriteReason) {
      this.filteredEndReasons.push(reason);
    }}
  }


  keyp(e) {
    if (e.key === 'Enter') {
      this.result(true);
    }
  }

  toogle(o) {
    this[o] = !this[o];
    this.loadScheduleData();
  }

  result(r) {

    this.dialogRef.close(r ? {
      endReason: this.reason,
      endReasonObs: this.reasonObs,
      reopen: this.reopen,
      reopenReason: this.reopenReason,
      reopenAutomationId: this.reopenAutomationId,
      reopenTemplate: this.reopenTemplate,
      hour: this.hour,
      minute: this.minute,
      date: moment(this.date).format('YYYYMMDD'),
      dontSendAutoMsg: this.dontSendAutoMsg
    } : false);

  }

  markAsPreferred(e) {
    e.preventDefault();
    e.stopPropagation();
    const queueId = Number(this.reasonId.split('|||')[0]);
    if (queueId) {
      this.http.post(BASE_URL + '/users/changePreferredQueue', {
        id: queueId
      }).subscribe((ret: any) => {
        // this.notifications.success($localize`Sucesso`, $localize`Solicitação enviada com sucesso.`);
        this.status.user.preferredqueue = queueId;
      }, err => {
        // this.notifications.error($localize`Erro`, err.error.message);
      });
    }
  }

}
