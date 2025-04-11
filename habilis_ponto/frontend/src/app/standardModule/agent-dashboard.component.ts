/**
 * Created by filipe on 18/09/16.
 */
import {LoadingService} from "../loadingModule/loading.service";
import {Component} from "@angular/core";
import {StatusService} from "../services/status.service";
import {SocketService} from "../services/socket.service";
import {ConfirmAction} from "../reusable/confirmaction.decorator";
import {MatDialog} from "@angular/material/dialog";
import {texts} from '../app.texts';
import {MonitorService} from "../services/monitor.service";
import {BASE_URL} from "../app.consts";
import {HttpClient} from "@angular/common/http";
import {NotificationsService} from "angular2-notifications";
import {AgentPauseComponent} from "./agent-pause.component";
import {NewsDialogComponent} from "../reusable/news-dialog.component";
import { ClockInDialogComponent } from "app/clockinModule/clock-in-dialog.component";

@Component({
  selector: 'ca-agent-dashboard',
  templateUrl: 'agent-dashboard.component.html',
  styleUrls: ['agent-dashboard.component.scss']
})
export class AgentDashboardComponent {

  texts = texts;
  news = [];

  constructor(private loading: LoadingService, public status: StatusService, private http: HttpClient,
              public socket: SocketService, private notifications: NotificationsService,
              public dialog: MatDialog, public monitor: MonitorService) {

    loading.stop();
    this.loadNews();
  }

  openNews(n) {
    this.dialog.open(NewsDialogComponent, {data: {id: n.id}});
  }

  loadNews() {
    this.http.get(BASE_URL + '/news/getMyNews').subscribe((r: any[]) => {
      this.news = r;
    }, err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao recuperar dados.`);
    });
  }

  downloadInstaller(download) {
    if (download) {
      window.open(BASE_URL + `/static/downloadInstaller&v=0.2.0`, '_blank');
    }
  }

  openExtenDialog(force = false) {
    if (!this.status.mineExtenNumber || force) {
      this.status.getExten = true;
    }
  }

  toogleQueueLoggedState(queue) {
    if (queue.type === 0 && !this.status.myStatus.phoneAvailable) {
      return;
    }
    if (queue.logged) {
      this.logout(queue);
    } else {
      this.login(queue);
    }
  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja deslogar da fila?`,
    title: $localize`Confirmar`,
    yesButtonText: $localize`Deslogar`
  })
  logout(queue) {
    this.socket.logOutQueue(queue);
  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja logar na fila?`,
    title: $localize`Confirmar`,
    yesButtonText: $localize`Logar`,
    yesButtonStyle: 'success'
  })
  login(queue) {
    this.socket.logInQueue(queue);
  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja deslogar de todas as filas?`,
    title: $localize`Confirmar`,
    yesButtonText: $localize`Deslogar`
  })
  logoutAll() {
    this.socket.logOutAll();
  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja logar em todas as filas?`,
    title: $localize`Confirmar`,
    yesButtonText: $localize`Logar`,
    yesButtonStyle: 'success'
  })
  loginAll() {
    this.socket.logInAll();
  }

  pause() {
    if (this.status.pause.paused) {
      return this.unpause();
    }
    this.socket.socket.emit('query', {type: 'reasons'});
    this.dialog.open(AgentPauseComponent);
  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja encerrar pausa?`,
    title: $localize`Confirmar`,
    yesButtonText: $localize`Encerrar`,
    yesButtonStyle: 'success'
  })
  unpause() {
    this.socket.socket.emit('action', {type: 'pauseAgent', paused: false, reason: 0});
  }


  registerClockIn(){
    const dialogRef = this.dialog.open(ClockInDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        method: 'photo',
        registerClockout: false,
        // requiredPassword: 'photo' === 'password' ? '123456' : undefined
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result && result.sucess) {
        this.notifications.success('Entrada registrada', `Entrada registrada com sucesso as ${result.starttime}`)
        return
      }

    },
    err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao recuperar dados.`);
    }
  )
    
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result && result.success) {
    //     this.lastClockIn = result;
    //     console.log('Clock-in successful:', result);
    //     // In a real app, you would send this data to your backend
    //   }
    // });

    // this.http.post(BASE_URL + '/clockin/registerClockIn', {}).subscribe((r: any[]) => {
    //   console.log(r);
    // }, err => {
    //   this.notifications.error($localize`Erro`, $localize`Erro ao recuperar dados.`);
    // });
  }

  registerClockOut(){
    const dialogRef = this.dialog.open(ClockInDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        method: 'photo',
        registerClockout: true,
        // requiredPassword: 'photo' === 'password' ? '123456' : undefined
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result && result.sucess) {
        this.notifications.success('Saída registrada', `Saída registrada com sucesso as ${result.endtime}`)
        return
      }

    },
    err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao recuperar dados.`);
    }
  )
  }
}
