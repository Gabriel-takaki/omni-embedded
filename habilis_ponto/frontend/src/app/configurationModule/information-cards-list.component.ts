import {Component, ViewChild} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {StatusService} from "../services/status.service";
import {BASE_URL} from "../app.consts";
import {HttpClient} from "@angular/common/http";
import {ConfirmAction} from "../reusable/confirmaction.decorator";
import {MatDialog} from '@angular/material/dialog';
import * as _ from 'lodash';
import {Align, HorizontalAlign, InformationCard, InformationCardNodeType,} from "../definitions";
import {v4} from "uuid";
import {Router} from "@angular/router";
import {UtilitiesService} from "../services/utilities.service";

@Component({
    templateUrl: 'information-cards-list.component.html'
})
export class InformationCardsListComponent {

    public columns = [
        {caption: $localize`ID`, dataField: 'id', width: 60},
        {caption: $localize`Nome`, dataField: 'name', cssClass: 'pad5A'},
        {caption: $localize`Descrição`, dataField: 'description'},
        {
            caption: $localize`Funções`,
            dataField: 'id',
            encodeHtml: false,
            cellTemplate: 'functionsTemplate',
            cssClass: 'pad5A',
            width: 225, alignment: 'center'
        }];

    public cards = [];
    public visualgroups = [];
    @ViewChild('importDialog') importDialog;

    constructor(public service: StatusService, private notifications: NotificationsService, private http: HttpClient,
                public dialog: MatDialog, private router: Router, private utils: UtilitiesService) {

        this.loadData();
        this.loadVisualGroups();

    }

    copyData(e) {

        // Cria uma cópia do objeto para que o grid não atualize junto com o formulário
        const copy = JSON.parse(JSON.stringify(e.key));
        e.key.copy = copy;

        console.log(e);

    }

    async loadData() {
        await this.service.queryAllInformationCards();
        this.cards = _.cloneDeep(this.service.allInformationCards);
    }

    loadVisualGroups() {
        this.http.get(BASE_URL + '/visualgroup/?limit=500').subscribe((r: any[]) => {
            this.visualgroups = r;
        }, err => {
            this.notifications.error($localize`Erro`, $localize`Erro ao recuperar dados.`);
        });
    }

    @ConfirmAction('dialog', {
        text: $localize`Tem certeza que deseja criar um novo cartão de informações?`,
        title: $localize`Criar cartão de informações`,
        yesButtonText: $localize`Criar`,
        noButtonText: $localize`Cancelar`,
        yesButtonStyle: 'success'
    })
    add() {

        const u: InformationCard = {
            name: 'Novo cartão de informações',
            description: '',
            fk_visualgroup: 0,
            structure: [
                {
                    id: v4(),
                    name: 'Base',
                    type: InformationCardNodeType.lineBlock,
                    locked: true,
                    block: {
                        leftBorder: false,
                        rightBorder: false,
                        topBorder: false,
                        bottomBorder: false,
                        boldLine: false,
                        verticalAlign: Align.left,
                        horizontalAlign: HorizontalAlign.top,
                        weight: 1
                    },
                    children: []
                }
            ]
        };

        this.http.post(BASE_URL + '/informationcards/', u, {observe: "response"}).subscribe(r => {
            this.notifications.success($localize`Sucesso`, $localize`Novo cartão cadastrado com sucesso!`);
            this.loadData();
        }, err => {
            this.notifications.success($localize`Sucesso`, $localize`Erro ao cadastrar novo cartão!`);
        });

    }

    edit(card) {
        this.service.selectedCard = JSON.parse(JSON.stringify(card));
        this.router.navigate(['/base', 'config', 'cardeditor']);
    }

    @ConfirmAction('dialog', {
        text: $localize`Tem certeza que deseja excluir este cartão? Essa ação não poderá ser desfeita!`,
        title: $localize`Excluir cartão`,
        yesButtonText: $localize`Excluir`,
        noButtonText: $localize`Cancelar`
    })
    removeItem(card) {
        this.http.delete(BASE_URL + '/informationcards/' + card.id, {
            observe: "response"
        }).subscribe(res => {
            this.notifications.success($localize`Sucesso`, $localize`Cartão excluído com sucesso!`);
            this.loadData();
        }, err => {
            this.notifications.error($localize`Erro ao excluir cartão.`, err.statusText);
        });
    }


    async fileSelected(e = null) {

        if (!e?.target.files[0]) {
            return;
        }

        for (const file of e.target.files) {
            const reader = new FileReader();
            reader.onload = (event: any) => {
                try {
                    const newIvr = JSON.parse(decodeURIComponent(escape(window.atob(event.target.result))));
                    this.http.post(BASE_URL + '/informationcards/', newIvr, {
                        observe: "response"
                    }).subscribe(res => {
                        this.notifications.success($localize`Sucesso`, $localize`Item importado com sucesso!`);
                        this.loadData();
                    }, err => {
                        this.notifications.error($localize`Erro ao importar item.`, err.statusText);
                    });
                } catch (e) {
                    this.notifications.error($localize`Erro ao importar cartão`, 'O arquivo selecionado não é válido.');
                }
            };
            reader.readAsText(file);
        }

    }

    saveConfig(item) {

        const i = {
            name: item.copy.name,
            description: item.copy.description,
            fk_visualgroup: item.copy.fk_visualgroup,
            structure: item.structure
        };

        const sub = this.http.put(BASE_URL + '/informationcards/' + item.id, i, {
            observe: 'response'
        }).subscribe(r => {
            sub.unsubscribe();
            item.name = item.copy.name;
            this.service.queryAllInformationCards();
            this.notifications.success($localize`Sucesso`, $localize`Configurações salvas com sucesso!`);
        }, error => {
            this.notifications.error($localize`Erro ao salvar`, error.statusText);
        });

    }

    @ConfirmAction('dialog', {
        text: $localize`Tem certeza que deseja clonar este item?`,
        title: $localize`Clonar item`,
        yesButtonText: $localize`Clonar`,
        noButtonText: $localize`Cancelar`,
        yesButtonStyle: 'success'
    })
    cloneItem(item) {

        const i = {
            name: item.name + ' (Clone)',
            description: item.description,
            fk_visualgroup: item.fk_visualgroup,
            structure: item.structure
        };

        this.http.post(BASE_URL + '/informationcards/', i, {
            observe: "response"
        }).subscribe(res => {
            this.notifications.success($localize`Sucesso`, $localize`Item clonado com sucesso!`);
            this.loadData();
        }, err => {
            this.notifications.error($localize`Erro ao clonar item.`, err.statusText);
        });

    }

    copyStructure(item) {
        const str = JSON.stringify(item);
        this.utils.copyToClipboard(str);
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
            description: item.description,
            fk_visualgroup: item.fk_visualgroup,
            structure: JSON.stringify(item.structure)
        };

        const strIvr = JSON.stringify(i);
        const ivr = window.btoa(unescape(encodeURIComponent(strIvr)));
        const blob = new Blob([ivr], {type: 'plain/text'});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${item.name}.infocard`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    }

    import() {
        this.importDialog?.nativeElement?.click();
    }


}
