/**
 * Created by filipe on 17/09/16.
 */
import {Component, OnInit} from '@angular/core';
import {AuthService} from "./services/auth.service";
import {ActivatedRoute} from "@angular/router";
import {NotificationsService} from "angular2-notifications";
import {HttpClient} from "@angular/common/http";
import {BASE_URL} from "./app.consts";
import {StatusService} from "./services/status.service";
import {ActionsService} from "./services/actions.service";

@Component({
  templateUrl: 'external-new-chat.component.html',
  styleUrls: ['./external-new-chat.component.scss']
})
export class ExternalNewChatComponent implements OnInit {

  public baseUrl = BASE_URL;
  erro = false;
  loading = false;
  resultMessage = '';


  constructor(private autenticador: AuthService, private http: HttpClient, private notifications: NotificationsService,
              private route: ActivatedRoute, public status: StatusService, private actions: ActionsService) {

  }

  async ngOnInit() {

    const params = this.route.snapshot.queryParams;

    if (!this.autenticador.jwtToken) {
      this.erro = true;
      this.resultMessage = $localize`Nenhum usuário logado.`;
      return;
    }

    if (!params.number || !params.queueId) {
      this.erro = true;
      this.resultMessage = $localize`Parâmetros obrigatórios faltando.`;
      return;
    }

    const country = params.country || 'BR';
    this.loading = true;

    const ret = await this.actions.openNewChatByNumber(params.queueId, params.number.replace(/\ /g, '').replace(/\+/g, ''), params.country, '', params.message)

    if (ret.result) {
      this.erro = false;
      this.loading = false;
      this.resultMessage = $localize`Solicitação enviada com sucesso! Você pode fechar essa janela.`
    } else {
      console.log(ret.error);
      this.erro = true;
      this.resultMessage = $localize`A requisição falhou. ${ret.error.message}`;
    }

  }

}
