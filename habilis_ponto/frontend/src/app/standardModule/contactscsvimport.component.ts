/**
 * Created by filipe on 19/09/16.
 */
import {Component, ElementRef, ViewChild} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {BASE_URL} from "../app.consts";
import {HttpClient} from "@angular/common/http";
import {MatDialogRef} from "@angular/material/dialog";
import * as momentjs from 'moment'
import * as papa from 'papaparse';
import {animate, state, style, transition, trigger} from "@angular/animations";

@Component({
  templateUrl: 'contactscsvimport.component.html',
  styleUrls: ['contactscsvimport.component.scss'],
  animations: [
    trigger('visibilityChanged', [
      state('shown', style({
        "height": "auto"
      })),
      transition('void => shown',
        [style({height: '0px'}), animate('0.25s')]
      ),
      transition('shown => void',
        [style({height: 'auto'}), animate('0.25s', style({height: '0px'}))]
      )
    ])
  ]
})

export class ContactsCsvImportComponent {

  @ViewChild('csvDialog') csvDialog: ElementRef<HTMLInputElement>;
  @ViewChild('contactsList') contactsList: ElementRef<HTMLDivElement>;

  moment = momentjs;
  step = 0;
  file;
  contacts = [];

  keyColumn = 0;
  dupAction = 0;
  parseError = false;

  importing = false;
  imported = false;
  pauseImport = false;
  regId = 0;

  showHidden = false;

  scrollMax = 100;
  resetScrollMaxTimer;

  baseUrl = BASE_URL;

  constructor(private notifications: NotificationsService,
              private dialog: MatDialogRef<ContactsCsvImportComponent>, private http: HttpClient) {

  }

  scrollEvent() {
    if (this.contactsList.nativeElement.scrollTop > this.contactsList.nativeElement.scrollHeight - this.contactsList.nativeElement.offsetHeight - 200) {
      this.scrollMax = this.scrollMax + 15 >= this.contacts.length ? this.contacts.length : this.scrollMax + 15;
    }
    if (this.resetScrollMaxTimer) {
      clearTimeout(this.resetScrollMaxTimer);
    }
    if (this.contactsList.nativeElement.scrollTop < 150) {
      this.resetScrollMaxTimer = setTimeout(() => {
        this.resetScrollMaxTimer = null;
        this.scrollMax = 100;
      }, 1000);
    }
  }


  close() {
    this.dialog.close(this.imported);
  }

  openFileSelection() {
    this.csvDialog.nativeElement.click();
  }

  fileSelected(e = null) {

    this.file = e.target?.files?.[0];

    if (!this.file) {
      return;
    }

    this.clear();

    papa.parse(this.file, {
      worker: true,
      header: true,
      encoding: "utf8",
      complete: (result) => {
        this.parseError = false;
        if (result.data.length > 1) {
          for (let x = 0; x < result.data.length; x++) {
            const reg = result.data[x];
            const extradata = {};
            for (const k of Object.keys(reg)) {
              if (k.includes('extradata')) {
                extradata[k.split('.')[1]] = reg[k];
              }
            }
            this.contacts.push({
              id: (reg.id || reg.id) || null,
              name: (reg.name || reg.nome)?.slice(0, 255) || '',
              number: (reg.number || reg.numero)?.slice(0, 30) || '',
              instagram: (reg.instagram)?.slice(0, 100) || '',
              facebook: (reg.facebook)?.slice(0, 100) || '',
              email: (reg.email || reg['e-mail'])?.slice(0, 155) || '',
              document: (reg.document || reg.documento)?.slice(0, 40).replace(/\./g, '').replace(/\//g, '').replace(/-/g, '') || '',
              free1: (reg.free1 || reg.livre1)?.slice(0, 100) || '',
              free2: (reg.free2 || reg.livre2)?.slice(0, 100) || '',
              birthdate: (reg.birthdate || reg.nascimento) || null,
              groups: (reg.grupos || reg.groups)?.split(',') || [],
              preferredagents: (reg.preferredagents || reg.preferenciais)?.split(',') || [],
              postalcode: (reg.postalcode || reg.cep)?.slice(0, 15) || '',
              country: (reg.country || reg['país'])?.slice(0, 50) || '',
              state: (reg.state || reg.estado)?.slice(0, 100) || '',
              city: (reg.city || reg.cidade)?.slice(0, 100) || '',
              neighborhood: (reg.neighborhood || reg.bairro)?.slice(0, 100) || '',
              address: (reg.address || reg['endereço'])?.slice(0, 255) || '',
              housenumber: (reg.housenumber || reg.numeroendereco)?.slice(0, 10) || '',
              addresscomp: (reg.addresscomp || reg.complemento)?.slice(0, 50) || '',
              comments: (reg.comments || reg.comentarios) || '',
              tags: (reg.tags || reg.etiquetas)?.split(',') || [],
              donotdisturb: reg.donotdisturb || reg.naoperturbe || 0,
              extradata: extradata,
              loading: false,
              show: true,
              result: 0 // 0 - não processado, 1 - inserido, 2 - atualizado, 3 - ignorado, 4 - erro
            });
          }
          if (!this.contacts.length) {
            this.parseError = true;
          }
        } else {
          this.parseError = true;
        }
      },
      error: (err) => {
        console.log(err);
        this.parseError = true;
      },
    });

  }

  clear() {
    this.contacts = [];
  }

  hideTimer(contact) {
    setTimeout(() => {
      contact.show = false;
    }, 1000)
  }

  async save() {

    this.importing = true;
    this.imported = true;
    this.pauseImport = false;

    for (let x = this.regId; x < this.contacts.length; x++) {

      if (this.pauseImport) {
        break;
      }

      this.regId++;

      const contact = this.contacts[x];
      if (!contact.name || (!contact.number && !contact.instagram) || (!Array.isArray(contact.tags) ||
        !Array.isArray(contact.groups) || !Array.isArray(contact.preferredagents))) {
        contact.result = 4;
        continue;
      }

      let error = false;

      const tags = [];
      const groups = [];
      const preferredagents = [];

      for (const tag of contact.tags) {
        if (isNaN(Number(tag))) {
          contact.result = 4;
          error = true;
          break;
        }
        if (Number(tag) > 0) tags.push(Number(tag));
      }

      for (const group of contact.groups) {
        if (isNaN(Number(group))) {
          contact.result = 4;
          error = true;
          break;
        }
        if (Number(group) > 0) groups.push(Number(group));
      }

      for (const agent of contact.preferredagents) {
        if (isNaN(Number(agent))) {
          contact.result = 4;
          error = true;
          break;
        }
        if (Number(agent) > 0) preferredagents.push(Number(agent));
      }

      if (error) {
        continue;
      }

      contact.tags = tags;
      contact.groups = groups;
      contact.preferredagents = preferredagents;

      await new Promise((resolve, reject) => {

        this.http.post(BASE_URL + '/contacts/importNewContact', {
          dupAction: this.dupAction,
          keyColumn: this.keyColumn, ...contact
        }, {
          withCredentials: true
        }).subscribe(r => {
          contact.result = Number(r);
          this.hideTimer(contact);
          return resolve(null);
        }, err => {
          contact.result = 4;
          return resolve(null);
        });

      });

    }

    this.importing = false;

  }

  pause() {
    this.pauseImport = true;
  }

}
