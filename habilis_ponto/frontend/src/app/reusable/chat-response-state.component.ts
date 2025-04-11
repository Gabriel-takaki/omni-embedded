/**
 * Created by filipe on 17/09/16.
 */
import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';

@Component({
  selector: 'chat-response-state',
  templateUrl: 'chat-response-state.component.html',
  styleUrls: ['chat-response-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatResponseStateComponent implements OnChanges {

  @Input() id: number;
  @Input() agentResponse = false;
  @Input() anyResponse = false;
  @Input() sessionLocked = false;
  @Input() fontSize = 14;

  /**
   * 0 - Não respondido
   * 1 - Respondido por alguém
   * 2 - Respondido pelo agente atual
   * 3 - Sessão bloqueada por janela
   */
  state = 0;
  toolTipText = '';

  constructor() {

  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateState();
  }

  updateState() {

    if (this.sessionLocked) {
      this.state = 3;
      this.toolTipText = $localize`Sessão bloqueada pelo encerramento da janela de atendimento`;
      return;
    }

    if (this.agentResponse) {
      this.state = 2;
      this.toolTipText = $localize`Já respondido pelo agente atual`;
      return;
    }

    if (this.anyResponse) {
      this.state = 1;
      this.toolTipText = $localize`Já respondido, porém ainda não respondido pelo agente atual`;
      return;
    }

    this.state = 0;
    this.toolTipText = $localize`Atendimento sem resposta`;

  }

}
