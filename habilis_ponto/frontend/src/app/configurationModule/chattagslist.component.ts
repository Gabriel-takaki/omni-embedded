/**
 * Created by filipe on 25/09/16.
 */
import {Component, ViewChild} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {StatusService} from "../services/status.service";
import {SocketService} from "../services/socket.service";
import {HttpClient} from "@angular/common/http";
import {BASE_URL} from "../app.consts";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {ConfirmAction} from "../reusable/confirmaction.decorator";
import {MatDialog} from "@angular/material/dialog";

@Component({
  templateUrl: 'chattagslist.component.html',
  styleUrls: ['chattagslist.component.scss'],
})
export class ChatTagsListComponent {

  @ViewChild('importDialog') importDialog;

  public columns = [
    {caption: $localize`ID`, dataField: 'id', cssClass: 'pad5A', alignment: 'center', width: 60},
    {
      caption: $localize`Etiqueta`, dataField: 'marker', cssClass: 'pad5A', cellTemplate: 'markerTemplate',
      calculateCellValue: this.calculateNameValue.bind(this)
    },
    {
      caption: $localize`Prioridade`, dataField: 'priority', cssClass: 'pad5A', cellTemplate: 'priorityTemplate',
      width: 150,
      alignment: 'center'
    },
    {
      caption: $localize`Alertar`,
      dataField: 'alertonpanel',
      cssClass: 'pad5A',
      cellTemplate: 'alertTemplate',
      width: 150,
      alignment: 'center'
    },
    {
      caption: $localize`Bloquear`,
      dataField: 'locktag',
      cssClass: 'pad5A',
      cellTemplate: 'yesNoTemplate',
      width: 75,
      alignment: 'center'
    },
    {
      caption: $localize`Oculta`,
      dataField: 'hidefromagents',
      cssClass: 'pad5A',
      cellTemplate: 'yesNoTemplate',
      width: 75,
      alignment: 'center'
    },
    {
      caption: $localize`Funções`,
      dataField: 'id',
      encodeHtml: false,
      cellTemplate: 'functionsTemplate',
      width: 90,
      cssClass: 'pad5A'
    }
  ];

  colors = [
    '#480097-#FFF-#480097', '#9400D3-#FFF-#9400D3', '#D98FFF-#333-#D98FFF', '#F8F0FF-#333-#D98FFF',
    '#1458EA-#FFF-#1458EA', '#29BDFF-#FFF-#29BDFF', '#BFE2FF-#333-#BFE2FF', '#EDF7FF-#333-#BFE2FF',
    '#CE007F-#FFF-#CE007F', '#FF3C78-#FFF-#FF3C78', '#FF9DBB-#333-#FF9DBB', '#FFEDF3-#333-#FF9DBB',
    '#8B0007-#FFF-#8B0007', '#FF3B3B-#FFF-#FF3B3B', '#FF9399-#333-#FF9399', '#FFF1F0-#333-#FF9399',
    '#C63100-#FFF-#C63100', '#FF784B-#FFF-#FF784B', '#FFA486-#333-#FFA486', '#FFF2E3-#333-#FFA486',
    '#CE9B00-#FFF-#CE9B00', '#FFCE3A-#FFF-#FFCE3A', '#FFE79F-#333-#FFE79F', '#FFF9E6-#333-#FFE79F',
    '#00752B-#FFF-#00752B', '#06C270-#FFF-#06C270', '#73FEBA-#333-#73FEBA', '#DCFFEE-#333-#73FEBA',
    '#25615F-#FFF-#25615F', '#5BD1CD-#FFF-#5BD1CD', '#86F5F1-#333-#86F5F1', '#E8FFFF-#333-#86F5F1',
    '#565656-#FFF-#565656', '#8E8E8E-#FFF-#8E8E8E', '#D2D2D2-#333-#D2D2D2', '#E9E9E9-#333-#D2D2D2',

    '#A071F2-#FFF-#956CE0', '#F44C8C-#FFF-#E04B85', '#FC331C-#FFF-#E7351F', '#FDAA07-#FFF-#E89F0D',
    '#FED629-#FFF-#E9C62B', '#99DF0F-#FFF-#8FCF14', '#48D03E-#FFF-#45C13E', '#3BDBD9-#FFF-#3ACBCA', '#1BA7FF-#FFF-#1B9DEC',
    '#FFFFFF-#3D474D-#EAEBEC', '#969696-#FFF-#8C8D8E', '#3D474D-#FFF-#3C464C', '#FFFFFF-#3D474D-#956CE0',
    '#FFFFFF-#3D474D-#E04B85', '#FFFFFF-#3D474D-#E7351F', '#FFFFFF-#3D474D-#E89F0D', '#FFFFFF-#3D474D-#E9C62B',
    '#FFFFFF-#3D474D-#8FCF14', '#FFFFFF-#3D474D-#45C13E', '#FFFFFF-#3D474D-#3ACBCA', '#FFFFFF-#3D474D-#1B9DEC'];

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  public tags = [];
  ivrs = [];
  contactsgroups = [];

  constructor(public service: StatusService, private notifications: NotificationsService,
              public dialog: MatDialog, private socket: SocketService, private http: HttpClient) {

    this.loadTags();
    this.loadIvrs();
    this.loadContactGroups();

  }


  loadContactGroups() {
    this.http.get(BASE_URL + '/contactsgroups/getGroups').subscribe((r: any[]) => {
      this.contactsgroups = r;
    }, err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao recuperar dados.`);
    });
  }


  calculateNameValue(data) {
    return `${data?.marker} ${data?.name} - ${data?.description}` || '';
  }

  copyData(e) {

    // Cria uma cópia do objeto para que o grid não atualize junto com o formulário
    const copy = JSON.parse(JSON.stringify(e.key));
    e.key.copy = copy;

  }

  async loadIvrs() {
    this.ivrs = await this.service.getAutomationResumedList();
  }

  async loadTags() {
    await this.service.queryAllTags();
    this.tags = this.service.allTags;
  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja criar uma nova etiqueta?`,
    title: $localize`Criar etiqueta`,
    yesButtonText: $localize`Criar`,
    noButtonText: $localize`Cancelar`,
    yesButtonStyle: 'success'
  })
  addTag() {

    const u = {
      name: 'Nova etiqueta',
      color: '#3d474d-#fff-#3c464c',
      priority: 0,
      fk_automation: 0,
      description: 'Sem descrição',
      marker: '💵'
    };

    this.http.post(BASE_URL + '/chattags/', u, {observe: "response"}).subscribe(async (r) => {
      await this.loadTags();
      this.notifications.success($localize`Sucesso`, $localize`Nova etiqueta cadastrada com sucesso!`);
    }, err => {
      this.notifications.success($localize`Sucesso`, $localize`Erro ao cadastrar nova etiqueta!`);
    });

  }

  saveConfig(tag) {

    const g = {
      name: tag.copy.name,
      color: tag.copy.color,
      description: tag.copy.description,
      marker: tag.copy.marker,
      priority: tag.copy.priority,
      hidefromagents: tag.copy.hidefromagents,
      fk_automation: tag.copy.fk_automation,
      locktag: tag.copy.locktag,
      queuesfilter: tag.copy.queuesfilter,
      accessgroups: tag.copy.accessgroups,
      alertonpanel: tag.copy.alertonpanel
    };

    const sub = this.http.put(BASE_URL + '/chattags/' + tag.id, g, {
      observe: 'response'
    }).subscribe(r => {
      sub.unsubscribe();
      this.notifications.success($localize`Sucesso`, $localize`Configurações salvas com sucesso!`);
      tag.name = tag.copy.name;
      tag.color = tag.copy.color;
      tag.description = tag.copy.description;
      tag.marker = tag.copy.marker;
      tag.priority = tag.copy.priority;
    }, error => {
      this.notifications.error($localize`Erro ao salvar`, error.statusText);
    });

  }


  @ConfirmAction('dialog', {
    text: $localize`Deseja exportar este item?`,
    title: $localize`Exportar item`,
    yesButtonText: $localize`Exportar`,
    noButtonText: $localize`Cancelar`,
    yesButtonStyle: 'success'
  })
  exportItem(item) {

    const i = {
      name: item.name,
      color: item.color,
      description: item.description,
      marker: item.marker,
      priority: item.priority,
      hidefromagents: item.hidefromagents,
      fk_automation: item.fk_automation,
      locktag: item.locktag,
      queuesfilter: [],
      accessgroups: [],
      alertonpanel: item.alertonpanel
    };

    const strIvr = JSON.stringify(i);
    const ivr = window.btoa(unescape(encodeURIComponent(strIvr)));
    const blob = new Blob([ivr], {type: 'plain/text'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${item.name}.chattag`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

  }

  import() {
    this.importDialog?.nativeElement?.click();
  }

  async fileSelected(e = null) {

    if (!e?.target.files[0]) {
      return;
    }

    for (const file of e.target.files) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        try {
          const newItem = JSON.parse(decodeURIComponent(escape(window.atob(event.target.result))));
          this.http.post(BASE_URL + '/chattags/', newItem, {
            observe: "response"
          }).subscribe(async (res) => {
            await this.loadTags();
            this.notifications.success($localize`Sucesso`, $localize`Item importado com sucesso!`);
          }, err => {
            this.notifications.error($localize`Erro ao importar item.`, err.statusText);
          });
        } catch (e) {
          this.notifications.error($localize`Erro ao importar item`, 'O arquivo selecionado não é válido.');
        }
      };
      reader.readAsText(file);
    }

  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja excluir esta etiqueta?`,
    title: $localize`Excluir etiqueta`,
    yesButtonText: $localize`Excluir`,
    noButtonText: $localize`Cancelar`
  })
  removeItem(tag) {
    this.http.delete(BASE_URL + '/chattags/' + tag.id, {
      observe: "response"
    }).subscribe(async (res) => {
      await this.loadTags();
      this.notifications.success($localize`Sucesso`, $localize`Etiqueta removida com sucesso!`);
    }, err => {
      this.notifications.error($localize`Erro ao excluir etiqueta.`, err.statusText);
    });
  }

}
