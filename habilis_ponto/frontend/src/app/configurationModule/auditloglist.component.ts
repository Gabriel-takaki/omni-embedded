/**
 * Created by filipe on 25/09/16.
 */
import {Component} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {HttpClient} from "@angular/common/http";
import {BASE_URL} from "../app.consts";

@Component({
  templateUrl: 'auditloglist.component.html'
})
export class AuditLogListComponent {

  public columns = [
    {caption: $localize`Data`, dataField: 'createdAt', width: 200, dataType: 'datetime', alignment: 'center'},
    {caption: $localize`Operação`, dataField: 'operation', width: 100, alignment: 'center'},
    {caption: $localize`Descrição`, dataField: 'description'}
  ];

  public logs = [];


  constructor(private notifications: NotificationsService, private http: HttpClient) {

    this.loadLogs();

  }

  loadLogs() {
    this.http.get(BASE_URL + '/audit/getLogs').subscribe((r: any[]) => {
      this.logs = r;
    }, err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao recuperar dados.`);
    });
  }

}
