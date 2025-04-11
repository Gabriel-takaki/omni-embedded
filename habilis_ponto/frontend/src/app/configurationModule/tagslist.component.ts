/**
 * Created by filipe on 25/09/16.
 */
import {Component, ViewChild} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {StatusService} from "../services/status.service";
import {BASE_URL} from "../app.consts";
import {HttpClient} from "@angular/common/http";
import {TagsFormComponent} from "./tagsform.component";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmAction} from "../reusable/confirmaction.decorator";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  templateUrl: 'tagslist.component.html'
})
export class TagsListComponent {

  @ViewChild('importDialog') importDialog;

  baseUrl = BASE_URL;

  public columns = [
    {caption: $localize`ID`, dataField: 'id', width: 60},
    {caption: $localize`Nome`, dataField: 'name', cellTemplate: 'tagTemplate', cssClass: 'pad5A'},
    {
      caption: $localize`Contatos`,
      dataField: 'contacttag',
      cellTemplate: 'yesNoTemplate',
      cssClass: 'pad5A',
      width: 75,
      alignment: 'center'
    },
    {
      caption: $localize`FAQs`,
      dataField: 'faqtag',
      cellTemplate: 'yesNoTemplate',
      cssClass: 'pad5A',
      width: 75,
      alignment: 'center'
    },
    {
      caption: $localize`Tarefas`,
      dataField: 'tasktag',
      cellTemplate: 'yesNoTemplate',
      cssClass: 'pad5A',
      width: 75,
      alignment: 'center'
    },
    ...(!this.service.disableCRM ? [{
      caption: $localize`CRM`,
      dataField: 'dealtag',
      cellTemplate: 'yesNoTemplate',
      cssClass: 'pad5A',
      width: 75,
      alignment: 'center'
    }] : []),
    {
      caption: $localize`Funções`,
      dataField: 'id',
      encodeHtml: false,
      cellTemplate: 'functionsTemplate',
      cssClass: 'pad5A',
      width: 140, alignment: 'center'
    }];

  public tags = [];

  constructor(public service: StatusService, private notifications: NotificationsService, private http: HttpClient,
              private dialog: MatDialog, private snackbar: MatSnackBar) {

    this.loadData();

  }

  copyData(e) {

    // Cria uma cópia do objeto para que o grid não atualize junto com o formulário
    const copy = JSON.parse(JSON.stringify(e.key));
    e.key.copy = copy;

  }

  loadData() {
    this.http.get(BASE_URL + '/tags/?limit=1000').subscribe((r: any[]) => {
      this.tags = r;
    }, err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao recuperar dados.`);
    });
  }

  add() {
    const newReason = this.dialog.open(TagsFormComponent);
    const sub = newReason.afterClosed().subscribe(r => {
      sub.unsubscribe();
      if (r) {
        this.loadData();
      }
    })
  }

  editItem(item) {
    const newReason = this.dialog.open(TagsFormComponent, {data: item});
    const sub = newReason.afterClosed().subscribe(r => {
      sub.unsubscribe();
      if (r) {
        this.loadData();
      }
    })
  }

  updateTag(item) {
    this.http.put(BASE_URL + '/tags/' + item.data.id, {[item.column.dataField]: item.value ? 1 : 0}, {
      observe: "response"
    }).subscribe(r => {
      this.snackbar.open('Etiqueta atualizada com sucesso!', 'OK', {duration: 1000});
      this.loadData();
    }, err => {
      this.notifications.error($localize`Erro ao salvar`, err.statusText);
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
      bgcolor: item.bgcolor,
      fgcolor: item.fgcolor,
      contacttag: item.contacttag ? 1 : 0,
      faqtag: item.faqtag ? 1 : 0,
      dealtag: item.dealtag ? 1 : 0,
      tasktag: item.tasktag ? 1 : 0
    };

    const strIvr = JSON.stringify(i);
    const ivr = window.btoa(unescape(encodeURIComponent(strIvr)));
    const blob = new Blob([ivr], {type: 'plain/text'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${item.name}.tag`;
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
          this.http.post(BASE_URL + '/tags/', newItem, {
            observe: "response"
          }).subscribe(res => {
            this.notifications.success($localize`Sucesso`, $localize`Item importado com sucesso!`);
            this.loadData();
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
  removeItem(reason) {
    this.http.delete(BASE_URL + '/tags/' + reason.id, {

      observe: "response"
    }).subscribe(res => {
      this.notifications.success($localize`Sucesso`, $localize`Etiqueta excluída com sucesso!`);
      this.loadData();
    }, err => {
      this.notifications.error($localize`Erro ao excluir etiqueta.`, err.statusText);
    });
  }


}
