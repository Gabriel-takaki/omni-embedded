/**
 * Created by filipe on 17/09/16.
 */
import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';

@Component({
  selector: 'user-queue-state',
  templateUrl: 'user-queue-state.component.html',
  styleUrls: ['user-queue-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserQueueStateComponent implements OnChanges {

  @Input() id: number;
  @Input() logged = false;
  @Input() paused = false;
  @Input() pauseMaxTime = 0;
  @Input() pauseReason = '';
  @Input() unstable = false;
  @Input() onCall = false;
  @Input() ringing = false;
  @Input() blocked = false;
  @Input() offline = false;
  @Input() fontSize = 14;

  /**
   * 0 - Não logado
   * 1 - Logado
   * 2 - Em pausa
   * 3 - Em chamada
   * 4 - Chamando
   * 5 - Bloqueado
   * 6 - Offline
   * 7 - Instável
   */
  state = 0;
  toolTipText = '';

  constructor() {

  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateState();
  }

  updateState() {

    if (this.offline) {
      this.state = 6;
      this.toolTipText = $localize`Indisponível`;
      return;
    }

    if (this.unstable) {
      this.state = 7;
      this.toolTipText = $localize`Conexão instável`;
      return;
    }

    if (this.blocked) {
      this.state = 5;
      this.toolTipText = $localize`Bloqueado`;
      return;
    }

    if (this.ringing) {
      this.state = 4;
      this.toolTipText = $localize`Chamando`;
      return;
    }

    if (this.onCall) {
      this.state = 3;
      this.toolTipText = $localize`Em chamada`;
      return;
    }

    if (this.paused) {
      this.state = 2;
      const motive = this.pauseReason ? $localize`Motivo: ${this.pauseReason}` : ``;
      const maxTime = this.pauseReason ? this.pauseMaxTime ? $localize`Tempo máximo: ${this.pauseMaxTime} min.` : '' : '';
      const onPause = $localize`Em pausa`;
      this.toolTipText = `${onPause}${motive ? ' - ' + motive : ''}${maxTime ? ' - ' + maxTime : ''}`;
      return;
    }

    if (this.logged) {
      this.state = 1;
      this.toolTipText = $localize`Logado e disponível`;
      return;
    }

    this.state = 0;
    this.toolTipText = $localize`Deslogado`;

  }

}
