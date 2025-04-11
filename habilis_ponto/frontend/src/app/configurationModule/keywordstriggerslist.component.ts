/**
 * Created by filipe on 25/09/16.
 */
import {Component} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {StatusService} from "../services/status.service";
import {SocketService} from "../services/socket.service";
import {HttpClient} from "@angular/common/http";
import {BASE_URL} from "../app.consts";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {ConfirmAction} from "../reusable/confirmaction.decorator";
import {MatDialog} from "@angular/material/dialog";
import {MatChipInputEvent} from "@angular/material/chips";
import {MatSnackBar} from "@angular/material/snack-bar";


@Component({
  templateUrl: 'keywordstriggerslist.component.html',
  styleUrls: ['keywordstriggerslist.component.scss'],
})
export class KeywordstriggerslistComponent {

  public columns = [
    {caption: $localize`Nome`, dataField: 'name', cssClass: 'pad5A'},
    {
      caption: $localize`Palavras chave`,
      dataField: 'name',
      cssClass: 'pad5A',
      cellTemplate: 'triggersTemplate',
      width: 200
    },
    {
      caption: $localize`Funções`,
      dataField: 'id',
      encodeHtml: false,
      cellTemplate: 'functionsTemplate',
      width: 50,
      cssClass: 'pad5A'
    }
  ];

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  public triggers = [];
  public ivrs = [];


  constructor(public service: StatusService, private notifications: NotificationsService,
              public dialog: MatDialog, private socket: SocketService, private http: HttpClient,
              private snack: MatSnackBar) {

    this.loadTriggers();

  }

  copyData(e) {

    // Cria uma cópia do objeto para que o grid não atualize junto com o formulário
    const copy = JSON.parse(JSON.stringify(e.key));
    e.key.copy = copy;

  }

  loadTriggers() {
    this.http.get(BASE_URL + '/keywordtriggers/getTriggers').subscribe((r: any[]) => {
      this.triggers = r;
      for (const t of this.triggers) {
        if (typeof t.keywords === 'string') {
          try {
            t.keywords = JSON.parse(t.keywords);
          } catch (e) {
          }
        }
      }
    }, err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao recuperar dados.`);
    });
  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja criar um novo gatilho de mensagem?`,
    title: $localize`Criar gatilho de mensagem`,
    yesButtonText: $localize`Criar`,
    noButtonText: $localize`Cancelar`,
    yesButtonStyle: 'success'
  })
  addTrigger() {

    const u = {
      name: $localize`Novo gatilho de mensagem`,
      type: 2,
      fk_ivr: 0,
      keywords: []
    };

    this.http.post(BASE_URL + '/keywordtriggers/', u, {observe: "response"}).subscribe(r => {
      this.notifications.success($localize`Sucesso`, $localize`Novo gatilho cadastrado com sucesso!`);
      this.loadTriggers();
    }, err => {
      this.notifications.success($localize`Sucesso`, $localize`Erro ao cadastrar novo gatilho!`);
    });

  }

  saveConfig(trigger) {

    const g = {
      name: trigger.copy.name,
      type: trigger.copy.type,
      fk_ivr: trigger.copy.fk_ivr,
      keywords: trigger.copy.keywords
    };

    const sub = this.http.put(BASE_URL + '/keywordtriggers/' + trigger.id, g, {
      observe: 'response'
    }).subscribe(r => {
      sub.unsubscribe();
      this.notifications.success($localize`Sucesso`, $localize`Configurações salvas com sucesso!`);
      trigger.name = trigger.copy.name;
      trigger.type = trigger.copy.type;
      trigger.fk_ivr = trigger.copy.fk_ivr;
      trigger.keywords = trigger.copy.keywords;
    }, error => {
      this.notifications.error($localize`Erro ao salvar`, error.statusText);
    });

  }

  copyTag(tag) {
    navigator.clipboard.writeText(tag + "\n");
    this.snack.open($localize`Copiado!`, '', {duration: 700});
  }

  pasteEvent(e, a) {
    const data = e.clipboardData.getData('text').split("\n");
    if (data.length) {
      for (const i of data) {
        if (i) {
          a.push(i);
        }
      }
    }
    e.preventDefault();
  }

  copyAllTags(a) {
    navigator.clipboard.writeText(a.join("\n"));
    this.snack.open($localize`Copiado!`, '', {duration: 700});
  }

  addTag(event: MatChipInputEvent, tags): void {
    const input = event.input;
    const value = (event.value || '').trim();

    if (value && !tags.includes(value) && tags.length < 500) {
      tags.push(value.trim());
    } else if (tags.includes(value)) {
      this.snack.open($localize`Palavra chave já está presenta na lista!`, '', {duration: 700});
    } else if (tags.length >= 500) {
      this.snack.open($localize`Limite de palavras da lista alcançado.`, '', {duration: 700});
    }

    if (input) {
      input.value = '';
    }
  }

  removeTag(option, tags) {
    tags.splice(tags.indexOf(option), 1);
  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja excluir este gatilho?`,
    title: $localize`Excluir gatilho`,
    yesButtonText: $localize`Excluir`,
    noButtonText: $localize`Cancelar`
  })
  removeItem(tag) {
    this.http.delete(BASE_URL + '/keywordtriggers/' + tag.id, {
      observe: "response"
    }).subscribe(res => {
      this.notifications.success($localize`Sucesso`, $localize`Conjunto removido com sucesso!`);
      this.loadTriggers();
    }, err => {
      this.notifications.error($localize`Erro ao excluir conjunto.`, err.statusText);
    });
  }

}
