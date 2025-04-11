/**
 * Created by filipe on 19/09/16.
 */
import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {BASE_URL} from "../app.consts";
import {SocketService} from "../services/socket.service";
import {HttpClient} from "@angular/common/http";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
    templateUrl: 'textform.component.html'
})
export class TextFormComponent implements AfterViewInit {

    public id;
    public title = '';
    public text = '';
    public accessgroups = [];
    @ViewChild('titleInput') titleInput: ElementRef<HTMLInputElement>;
    contactsgroups = [];

    constructor(public socket: SocketService, private notifications: NotificationsService,
                private dialogRef: MatDialogRef<TextFormComponent>, private http: HttpClient,
                @Inject(MAT_DIALOG_DATA) public data: any) {

        this.loadContactGroups();

        if (data) {
            this.title = data.title || '';
            this.text = data.text || '';
            this.accessgroups = data.accessgroups || [];
            this.id = data.id;
        }

    }

    loadContactGroups() {
        this.http.get(BASE_URL + '/contactsgroups/getGroups').subscribe((r: any[]) => {
            this.contactsgroups = r;
        }, err => {
            this.notifications.error($localize`Erro`, $localize`Erro ao recuperar dados.`);
        });
    }

    ngAfterViewInit() {
        this.focusTimer();
    }

    focusTimer() {
        setTimeout(() => {
            if (this.titleInput) {
                this.titleInput.nativeElement.focus();
            } else {
                this.focusTimer();
            }
        }, 50)
    }

    close() {
        this.dialogRef.close();
    }

    save() {

        if (this.text) {
            if (!this.id) {
                const re = {
                    title: this.title,
                    accessgroups: this.accessgroups,
                    text: this.text
                };

                this.http.post(BASE_URL + '/predefinedtexts', re, {observe: "response"}).subscribe(r => {
                    this.notifications.success($localize`Sucesso`, $localize`Nova resposta cadastrada com sucesso!`);
                    this.dialogRef.close(true);
                }, err => {
                    this.notifications.error($localize`Erro ao salvar`, err.statusText);
                });
            } else {
                const re = {
                    title: this.title,
                    accessgroups: this.accessgroups,
                    text: this.text
                };

                this.http.put(BASE_URL + '/predefinedtexts/' + this.id, re, {

                    observe: "response"
                }).subscribe(r => {
                    this.notifications.success($localize`Sucesso`, $localize`Resposta atualizada com sucesso!`);
                    this.dialogRef.close(true);
                }, err => {
                    this.notifications.error($localize`Erro ao salvar`, err.statusText);
                });
            }
        }

    }

}
