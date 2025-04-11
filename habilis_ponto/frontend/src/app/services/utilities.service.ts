/**
 * Created by filipe on 08/10/16.
 */

import {Injectable} from "@angular/core";
import {StatusService} from "./status.service";
import {Title} from "@angular/platform-browser";
import * as moment from "moment";
import {BASE_URL} from "../app.consts";
import {HttpClient, HttpEventType} from "@angular/common/http";
import {NotificationsService} from "angular2-notifications";
import {MatDialog} from "@angular/material/dialog";
import {filesize} from "filesize";
import {FileDef} from "../definitions";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ConfirmAction} from "../reusable/confirmaction.decorator";

@Injectable({providedIn: 'root'})
export class UtilitiesService {

    constructor(private status: StatusService, private titleService: Title, private http: HttpClient,
                private notifications: NotificationsService, public dialog: MatDialog,
                private snack: MatSnackBar) {
    }

    generateSubstitutionTable() {
        const substitutionTable = {};

        const hora = moment().hour();
        substitutionTable['!nome!'] = this.status.user.fullname.split(' ')[0];
        substitutionTable['!name!'] = this.status.user.fullname.split(' ')[0];
        substitutionTable['!nombre!'] = this.status.user.fullname.split(' ')[0];

        substitutionTable['!Saudacao!'] = hora >= 18 ? $localize`Boa noite` : hora >= 12 ? $localize`Boa tarde` :
            hora >= 0 ? $localize`Bom dia` : $localize`Boa noite`;
        substitutionTable['!saudacao!'] = hora >= 18 ? $localize`boa noite` : hora >= 12 ? $localize`boa tarde` :
            hora >= 0 ? $localize`bom dia` : $localize`boa noite`;

        substitutionTable['!Greetings!'] = substitutionTable['!Saudacao!'];
        substitutionTable['!greetings!'] = substitutionTable['!saudacao!'];

        substitutionTable['!Saludos!'] = substitutionTable['!Saudacao!'];
        substitutionTable['!saludos!'] = substitutionTable['!saudacao!'];

        return substitutionTable;

    }

    allowOnlyNumbersOnInputKeyPress(event): void {
        const pattern = /[0-9+\- ]/;
        if (!pattern.test(event.key)) {
            event.preventDefault();
        }
    }

    download(path, filename) {
        const anchor = document.createElement('a');
        anchor.href = path;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    };

    /**
     * Retorna se existe interseção entre o conteúdo de dois arrays
     * @param array1
     * @param array2
     * @return boolean
     */
    hasIntersection(array1: any[], array2: any[]): boolean {
        return array1.some(item => array2.includes(item));
    }

    /**
     * Calcula o SHA256, codificado em base64, a partir de um blob
     * @param blob
     */
    async calculateSHA256(blob) {
        // Lê o blob como ArrayBuffer
        const arrayBuffer = await blob.arrayBuffer();

        // Calcula o hash
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);

        // Converte o resultado para uma string base64
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashBase64 = btoa(String.fromCharCode.apply(null, hashArray));

        return hashBase64;
    }

    saveFile(file: FileDef, chat = null): Promise<number> {

        return new Promise(async (resolve, reject) => {

            const data = file.data instanceof Blob ? file.data : new Blob([file.data]);
            const hash = await this.calculateSHA256(data);

            const fileId: number = await new Promise((res, rej) => {
                this.http.post(BASE_URL + '/api/getFileIdByHash', {hash}, {
                    observe: "response"
                }).subscribe((r: any) => {
                    return res(r.body?.id);
                }, err => {
                    return res(0);
                });
            });

            if (fileId) {
                return resolve(fileId);
            }

            const reader = new FileReader();
            reader.onload = (event: any) => {

                const byteString = event.target.result;

                const re = {
                    data: btoa(byteString),
                    mimetype: file.mimetype,
                    filename: file.name,
                    ...(file.thumbnail ? {thumbnail: file.thumbnail} : {}),
                    ...(file.waveform ? {waveform: file.waveform} : {}),
                    ...(file.width ? {width: file.width} : {}),
                    ...(file.height ? {height: file.height} : {}),
                    ...(file.duration ? {duration: file.duration} : {})
                };

                const uploadProgress = {
                    name: file.name,
                    progress: 0,
                    mime: file.mimetype,
                    size: filesize(data.size, {base: 2, standard: "jedec"})
                };

                if (chat) {
                    chat.uploads = chat.uploads || [];
                    chat.uploads.push(uploadProgress);
                }

                this.http.post(BASE_URL + '/api/saveFile', re, {
                    observe: "events"
                }).subscribe((r: any) => {

                    switch (r.type) {

                        case HttpEventType.Sent:
                            break;

                        case HttpEventType.UploadProgress:
                            if (chat) {
                                uploadProgress.progress = r.total ? Math.round(100 * (r.loaded / r.total)) : 0;
                            }
                            break;

                        case HttpEventType.Response:
                            if (chat) {
                                uploadProgress.progress = 100;
                                // Espera um pouco antes de remover o progresso
                                setTimeout(() => {
                                    chat.uploads.splice(chat.uploads.indexOf(uploadProgress), 1);
                                    chat.uploadsCounter = chat.uploadsCounter || 0;
                                    chat.uploadsCounter++;
                                }, 1000);
                            }
                            return resolve(r.body?.id);

                    }
                }, err => {
                    return resolve(0);
                    this.notifications.error($localize`Erro ao salvar`, err.statusText);
                });

            };

            reader.readAsBinaryString(data);

        });

    }

    // Espera por até 5 segundos para encontrar o elemento com o id passado
    async getElementById(id) {
        return new Promise((resolve) => {
            let counter = 0;
            const limit = 50;
            const interval = setInterval(() => {
                const el = document.getElementById(id);
                if (el) {
                    clearInterval(interval);
                    resolve(el);
                }
                counter++;
                if (counter > limit) {
                    clearInterval(interval);
                    resolve(null);
                }
            }, 100);
        });
    }

    base64ToArrayBuffer(base64) {
        const binary_string = window.atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    base64toBlob(base64, type = 'application/octet-stream'): Promise<Blob> {
        return new Promise((resolve, reject) => {
            fetch(`data:${type};base64,${base64}`).then(res => {
                return resolve(res.blob());
            }).catch(err => {
                return resolve(null);
            });
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    @ConfirmAction('dialog', {
        text: $localize`Ao clicar nesse link, você será direcionado para uma página externa ao sistema. Por favor, verifique se o link é seguro e vem de uma fonte confiável antes de prosseguir.`,
        title: $localize`Abrir link`,
        yesButtonText: $localize`Prosseguir`,
        yesButtonStyle: 'warning',
        noButtonText: $localize`Cancelar`
    })
    openLink(url) {
        window.open(url, '_blank');
    }

    copyToClipboard(text) {
        const selBox = document.createElement('textarea');
        selBox.style.position = 'fixed';
        selBox.style.left = '0';
        selBox.style.top = '0';
        selBox.style.opacity = '0';
        selBox.value = text;
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);
        this.snack.open($localize`Copiado!`, $localize`Fechar`, {duration: 1000});
    }

    replaceVars(text = '', chat = null) {

        if (text && typeof text === 'string') {
            const vars = [...text?.matchAll(/{{(.*?)}}/g)].map(a => a[1]);

            for (const v of vars) {
                const items = v.split('||');
                let result = '';
                for (const item of items) {
                    result = this.resolveVar(item, chat?.cardvars);
                    result = result ?? '';
                    result = result === '' ? (chat?.cardvars.hasOwnProperty(item.trim()) ? chat?.cardvars[item.trim()] : '') : result;
                    const replacedConst = this.replaceConsts(`{{${item.trim()}}}`, chat);
                    result = (!result && !['number', 'boolean'].includes(typeof result)) && replacedConst && replacedConst !== `{{${item.trim()}}}` ? replacedConst : result;
                    if (result) {
                        break;
                    }
                }
                text = text.replace(`{{${v}}}`, result);
            }
        }

        return text;

    }

    /**
     * Acessa a propriedade de um objeto com base em um texto
     * @param key
     * @param obj
     * @returns {string|string|any}
     */
    resolveVar(key, obj) {
        // Como utilizamos eval, remove os caracteres perigosos que permitiriam a um atacante construir ou executar uma função no nome da variável.
        const keys = key.replace(/;/g, '').replace(/{/g, '').replace(/}/g, '').replace(/\(/g, '').replace(/\)/g, '').replace(/\[/g, '.').replace(/]/g, '.').split('.');
        let finalKey = `obj`;
        for (const k of keys) {
            if (!k) {
                continue;
            }
            finalKey += `["${k}"]`;
        }
        try {
            let result = eval(finalKey);
            result = !result || !['string', 'number', 'boolean'].includes(typeof result) ? (result ? JSON.stringify(result) : result) : result;
            return result;
        } catch (e) {
            console.log('Erro na resolução de variável', e);
            return '';
        }
    }

    replaceConsts(text = '', chat = null) {

        if (!text) {
            return '';
        }

        const hour = moment().hour();
        const saudacao = hour > 18 || hour < 5 ? 'Boa noite' : hour > 12 ? 'Boa tarde' : 'Bom dia';
        const now = moment().unix();

        let resp = text.replace(/{{Saudacao}}/g, saudacao);
        resp = resp.replace(/{{saudacao}}/g, saudacao.toLowerCase());
        resp = resp.replace(/{{now}}/g, new Date().toISOString());
        resp = resp.replace(/{{time1}}/g, now.toString());
        resp = resp.replace(/{{time2}}/g, moment().format('HHmmss'));
        resp = resp.replace(/{{date1}}/g, moment().format('YYYYMMDD'));
        resp = resp.replace(/{{date2}}/g, moment().format('YYMMDD'));
        resp = resp.replace(/{{YYYY}}/g, moment().format('YYYY'));
        resp = resp.replace(/{{YY}}/g, moment().format('YY'));
        resp = resp.replace(/{{MM}}/g, moment().format('MM'));
        resp = resp.replace(/{{DD}}/g, moment().format('DD'));

        if (chat) {
            resp = resp.replace(/{{chatId}}/g, chat.id);
            resp = resp.replace(/{{pageId}}/g, chat.pageId);
            resp = resp.replace(/{{pageName}}/g, chat.pageName);
            resp = resp.replace(/{{lastExtData}}/g, chat.lastExtData);
            resp = resp.replace(/{{lastNotRepliedExtData}}/g, chat.lastNotRepliedExtData);
            resp = resp.replace(/{{lastExtFlag}}/g, chat.lastExtFlag);
            resp = resp.replace(/{{lastNotRepliedExtFlag}}/g, chat.lastNotRepliedExtFlag);
            resp = resp.replace(/{{clientName}}/g, chat.clientName);
            resp = resp.replace(/{{clientData}}/g, chat.clientData);
            resp = resp.replace(/{{clientProfileName}}/g, chat.clientProfileName);
            resp = resp.replace(/{{clientNumber}}/g, chat?.clientNumber);
            resp = resp.replace(/{{clientDocument}}/g, chat?.clientDocument);
            resp = resp.replace(/{{telefone}}/g, chat?.clientNumber);
            resp = resp.replace(/{{remoteId}}/g, chat?.clientId);
            resp = resp.replace(/{{clientId}}/g, chat?.clientId);
            resp = resp.replace(/{{protocol}}/g, chat?.protocol);
            resp = resp.replace(/{{clientEmail}}/g, chat.clientEmail);
            resp = resp.replace(/{{fkContact}}/g, chat.contactId);
            resp = resp.replace(/{{contactId}}/g, chat.contactId);
            resp = resp.replace(/{{contactName}}/g, chat.clientName);
            resp = resp.replace(/{{contactEmail}}/g, chat.clientName);
            resp = resp.replace(/{{contactDocument}}/g, chat.clientDocument);
            resp = resp.replace(/{{contactTags}}/g, chat.contactTags);
        }

        return resp;

    }

}
