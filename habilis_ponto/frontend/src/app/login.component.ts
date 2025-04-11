/**
 * Created by filipe on 17/09/16.
 */
import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthService} from "./services/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationsService} from "angular2-notifications";
import {LoadingService} from "./loadingModule/loading.service";
import * as moment from 'moment';
import {HttpClient} from "@angular/common/http";
import {BASE_URL, agentType} from "./app.consts";
import {ActionsService} from "./services/actions.service";
import {StatusService} from "./services/status.service";
import {StyleService} from "./services/style.service";
import {AudioService} from "./services/audio.service";

@Component({
  templateUrl: 'login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit, AfterViewInit {

  public year = moment().format('YYYY');
  public username = '';
  public password = '';
  public baseUrl = BASE_URL;
  public logingIn = false;
  @ViewChild('user') userInput: ElementRef<HTMLInputElement>;

  constructor(private autenticador: AuthService, private router: Router, private http: HttpClient,
              private notifications: NotificationsService, private loading: LoadingService,
              private action: ActionsService, private route: ActivatedRoute, public status: StatusService,
              private style: StyleService, private audio: AudioService) {

    style.initialize();

  }

  ngAfterViewInit() {
    this.focusTimer();
  }

  focusTimer() {
    setTimeout(() => {
      if (this.userInput) {
        this.userInput.nativeElement.focus();
      } else {
        this.focusTimer();
      }
    }, 50)
  }

  keyup(e) {
    if (e.keyCode === 13 && this.username && this.password) {
      // this.onSubmit();
    }
  }

  onSubmit() {
    this.loading.start();
    this.logingIn = true;
    this.autenticador.login(this.username, this.password).then((r: any) => {
      if (r.enableSoftphone) {
        this.audio.initialize();
      }
      console.log('aqui passou')
      this.router.navigate([agentType.agent, agentType.mobile].includes(r.type) ? ['/base', 'agentdashboard'] : ['/base', 'clockindashboard']);
    }).catch(err => {
      this.password = '';
      this.notifications.error($localize`Falha`, err?.error?.message === 'duplicate' ? $localize`O limite de conexões para esse usuário foi atingido.` :
        err?.error?.message === 'off hour' ? $localize`Você não está autorizado a entrar nesse horário.` :
          $localize`A autenticação falhou. Por favor, verifique os dados digitados e tente novamente.`);
      this.loading.stop();
      this.logingIn = false;
    });
  }

  ngOnInit() {
    this.action.getStyle();
    const params = this.route.snapshot.queryParams;
    if (Object.keys(params).length && params.openchat) {
      return this.router.navigate(['/externalnewchat'], {queryParamsHandling: 'merge'});
    }
    this.autenticador.isLogged().then((res: any) => {
      if (res) {
        console.log('ta logado')
        this.logingIn = true;
        this.router.navigate([agentType.agent, agentType.mobile, agentType.clockinuser].includes(res.type) ? ['/base', 'agentdashboard'] : ['/base', 'clockindashboard']);
      } else {
        this.route.queryParams.subscribe(async r => {
          await new Promise(async (resolve, reject) => {
            while (!this.status.socketConnected) {
              await new Promise((resolveT, reject) => {
                setTimeout(resolveT, 50);
              });
            }
            resolve('');
          });
          if (r && r.username && r.authkey) {
            this.logingIn = true;
            this.autenticador.login(r.username, '', r.authkey).then((r: any) => {
              this.router.navigate([agentType.agent, agentType.mobile].includes(r.type) ? ['/base', 'agentdashboard'] : ['/base', 'reports', 'kpidashboard']);
            }).catch(err => {
              this.notifications.error($localize`Falha`, err?.error?.message === 'duplicate' ? $localize`Já existe um usuário logado com esta conta atualmente.` :
                err?.error?.message === 'notMobile' ? $localize`Esse tipo de usuário não pode se autenticar em dispositivos móveis.` :
                  err?.error?.message === 'mobileUser' ? $localize`Esse usuário é exclusivo para dispositivos móveis.` :
                    err?.error?.message === 'off hour' ? $localize`Você não está autorizado a entrar nesse horário.` :
                      $localize`A autenticação falhou. Por favor, verifique os dados fornecidos e tente novamente.`);
              this.logingIn = false;
              this.loading.stop();
            });
          }
        });
      }
    }).catch(err => {
      console.log(err);
    });
  }

}
