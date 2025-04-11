import {Component} from '@angular/core';
import {LoadingService} from "../loadingModule/loading.service";
import {NotificationsService} from "angular2-notifications";
import {StatusService} from "../services/status.service";
import {SocketService} from "../services/socket.service";
import {HttpClient} from "@angular/common/http";
import {BASE_URL} from "../app.consts";
import {Router} from "@angular/router";
import {ConfirmAction} from "../reusable/confirmaction.decorator";
import {MatDialog} from "@angular/material/dialog";

@Component({
    templateUrl: 'assistantslist.component.html'
})
export class AssistantslistComponent {

    public yesName = $localize`Sim`;
    public noName = $localize`Não`;

    public columns = [
        {
            caption: $localize`ID`,
            dataField: 'id',
            width: 80
        }, {
            caption: $localize`Tipo`,
            dataField: 'type',
            cssClass: 'pad5A',
            calculateCellValue: this.calculateTypeValue.bind(this),
            width: 240,
            alignment: 'left'
        },
        {caption: $localize`Nome`, dataField: 'name', cssClass: 'pad5A', alignment: 'left'},
        {
            caption: $localize`Funções`,
            dataField: 'id',
            encodeHtml: false,
            cellTemplate: 'functionsTemplate',
            cssClass: 'pad5A',
            allowFiltering: false,
            width: 180,
            alignment: 'center'
        }];

    assistants = [];

    constructor(public status: StatusService, private loading: LoadingService, private notifications: NotificationsService,
                private socket: SocketService, private http: HttpClient,
                public dialog: MatDialog, private router: Router) {
        this.loadAssistants();
    }

    calculateTypeValue(data) {
        return data?.type === 0 ? $localize`Gemini Flash 1.5 8B` : data?.type === 1 ? $localize`Gemini Flash 1.5` :
            data?.type === 2 ? $localize`gpt4o-mini` : data?.type === 3 ? $localize`Gemini Pro 1.5` : $localize`gpt4o`;
    }

    loadAssistants() {
        this.http.post(BASE_URL + '/assistants/getItems', {full: true}, {
            observe: "response"
        }).subscribe((res: any) => {
            this.assistants = res.body;
        });
    }

    @ConfirmAction('dialog', {
        text: $localize`Tem certeza que deseja criar um novo assistente?`,
        title: $localize`Criar assistente`,
        yesButtonText: $localize`Criar`,
        noButtonText: $localize`Cancelar`,
        yesButtonStyle: 'success'
    })
    addItem() {
        const u = {
            name: $localize`Novo assistente`
        };
        this.http.post(BASE_URL + '/assistants/createItem', u, {observe: "response"}).subscribe(r => {
            this.notifications.success($localize`Sucesso`, $localize`Novo assistente cadastrado com sucesso!`);
            this.status.queryAllAssistants();
            this.loadAssistants();
        }, err => {
            this.notifications.success($localize`Sucesso`, $localize`Erro ao cadastrar novo assistente!`);
        });
    }

    @ConfirmAction('dialog', {
        text: $localize`Tem certeza que deseja excluir este item?`,
        title: $localize`Excluir item`,
        yesButtonText: $localize`Excluir`,
        noButtonText: $localize`Cancelar`
    })
    removeItem(id) {
        this.http.post(BASE_URL + '/assistants/removeItem', {id}, {
            observe: "response"
        }).subscribe(res => {
            this.loadAssistants();
            this.notifications.success($localize`Sucesso`, $localize`Assistente excluído com sucesso!`);
        }, err => {
            this.notifications.error($localize`Erro ao excluir assistente.`, err.statusText);
        });
    }

    openAssistantConfig(item) {
        this.status.selectedAssistant = JSON.parse(JSON.stringify(item));
        this.router.navigate(['/base', 'config', 'assistanteditor']);
    }

}
