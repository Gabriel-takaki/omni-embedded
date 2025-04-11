import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BASE_URL} from "../app.consts";
import {NotificationsService} from "angular2-notifications";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
    templateUrl: 'faqgroupform.component.html',
    styleUrls: ['faqgroupform.component.scss']
})

export class FaqGroupFormComponent implements AfterViewInit {

    public id = 0;
    public name = '';
    @ViewChild('firstInput') firstInput: ElementRef<HTMLInputElement>;

    constructor(private http: HttpClient, private dialog: MatDialogRef<FaqGroupFormComponent>,
                private notifications: NotificationsService, @Inject(MAT_DIALOG_DATA) public data: any) {

        if (data) {
            this.id = data.id;
            this.name = data.name;
        }

    }

    ngAfterViewInit() {
        this.focusTimer();
    }

    focusTimer() {
        setTimeout(() => {
            if (this.firstInput) {
                this.firstInput.nativeElement.focus();
            } else {
                this.focusTimer();
            }
        }, 50)
    }

    save() {

        if (this.name) {

            const q = {
                name: this.name
            };

            if (this.id) {
                // Se já possui ID, está atualizando um grupo existente
                this.http.put(BASE_URL + '/faqgroups/' + this.id, q, {observe: "response"}).subscribe(r => {
                    this.notifications.success($localize`Sucesso`, $localize`Grupo atualizado com sucesso!`);
                    this.dialog.close(true);
                }, err => {
                    this.notifications.error($localize`Erro ao salvar`, err.statusText);
                });
            } else {
                this.http.post(BASE_URL + '/faqgroups', q, {observe: "response"}).subscribe(r => {
                    this.notifications.success($localize`Sucesso`, $localize`Novo grupo criado com sucesso!`);
                    this.dialog.close(true);
                }, err => {
                    if (err.error === 'Limite excedido') {
                        this.notifications.error($localize`Erro ao salvar`, $localize`O limite de grupos foi atingido.`);
                    } else {
                        this.notifications.error($localize`Erro ao salvar`, err.statusText);
                    }
                });
            }

        }

    }

    close() {
        this.dialog.close();
    }

}
