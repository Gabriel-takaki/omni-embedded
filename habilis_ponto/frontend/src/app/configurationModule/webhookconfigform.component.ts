/**
 * Created by filipe on 19/09/16.
 */
import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  templateUrl: 'webhookconfigform.component.html',
  styleUrls: ['webhookconfigform.component.scss']
})
export class WebhookConfigFormComponent {

  helpTexts = {};

  public hookConfig = {
    url: '',
    method: 'post',
    dataType: 'urlencoded',
    headers: {},
    data: {}
  };

  public dataToSend = [];
  public headers = [];

  hookName = '';

  constructor(private dialogRef: MatDialogRef<WebhookConfigFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {

    this.hookName = data.hook;
    if (typeof data.config === 'string') {
      this.hookConfig.url = data.config;
    } else {
      this.hookConfig = data.config;
    }

    // Transforma os objetos em arrays
    for (const k of Object.keys(this.hookConfig.headers)) {
      this.handleObjPropertie(this.hookConfig.headers[k], k, this.headers);
    }

    for (const k of Object.keys(this.hookConfig.data)) {
      this.handleObjPropertie(this.hookConfig.data[k], k, this.dataToSend);
    }

  }

  /**
   * Lê o objeto com as configurações e transforma num array de chave - valor
   * @param obj
   * @param key
   * @param array
   * @param preStr
   */
  handleObjPropertie(obj, key, array, preStr = '') {
    if (typeof obj === 'object') {
      for (const k of Object.keys(obj)) {
        this.handleObjPropertie(obj[k], k, array, preStr + key + '.');
      }
    } else {
      array.push({key: preStr + key, value: obj});
    }
  }

  removeItem(item, array) {
    array.splice(array.indexOf(item), 1);
  }

  addData() {
    this.dataToSend.push({key: '', value: ''});
  }

  addHeader() {
    this.headers.push({key: '', value: ''});
  }

  save() {

    this.hookConfig.data = {};
    this.hookConfig.headers = {};

    for (const h of this.headers) {
      if (h.key) {
        const itens = h.key.split('.');
        if (itens.length > 1) {
          let lastObj = {};
          for (let x = 0; x < itens.length; x++) {
            if (x === itens.length - 1) {
              lastObj[itens[x]] = h.value;
            } else if (x === 0) {
              this.hookConfig.headers[itens[0]] = this.hookConfig.headers[itens[0]] || lastObj;
              lastObj = this.hookConfig.headers[itens[0]];
            } else {
              const tmp = {};
              lastObj[itens[x]] = lastObj[itens[x]] || tmp;
              lastObj = lastObj[itens[x]];
            }
          }
        } else {
          this.hookConfig.headers[h.key] = h.value;
        }
      }
    }

    for (const h of this.dataToSend) {
      if (h.key) {
        const itens = h.key.split('.');
        if (itens.length > 1) {
          let lastObj = {};
          for (let x = 0; x < itens.length; x++) {
            if (x === itens.length - 1) {
              lastObj[itens[x]] = h.value;
            } else if (x === 0) {
              this.hookConfig.data[itens[0]] = this.hookConfig.data[itens[0]] || lastObj;
              lastObj = this.hookConfig.data[itens[0]];
            } else {
              const tmp = {};
              lastObj[itens[x]] = lastObj[itens[x]] || tmp;
              lastObj = lastObj[itens[x]];
            }
          }
        } else {
          this.hookConfig.data[h.key] = h.value;
        }
      }
    }

    // console.log('configuração final do hook', this.hookConfig);

    this.dialogRef.close(this.hookConfig);

  }

  close() {

    this.dialogRef.close(false);

  }

}
