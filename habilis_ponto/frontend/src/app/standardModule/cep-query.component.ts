/**
 * Created by filipe on 19/09/16.
 */
import {Component} from '@angular/core';
import {MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import cepquery from 'cep-promise';

@Component({
  templateUrl: 'cep-query.component.html'
})
export class CepQueryComponent {

  cep = '';
  loading = false;
  result = '';
  error = false;

  constructor(private dialogRef: MatDialogRef<CepQueryComponent>) {

  }

  keyp(e) {
    if (e.key === 'Enter' && this.cep) {
      this.query();
    }
  }

  query() {
    if (this.cep && this.cep.length === 8) {
      this.error = false;
      this.loading = true;
      cepquery(this.cep).then(r => {
        this.loading = false;
        this.result = `${r.street}, Bairro ${r.neighborhood}, ${r.city} / ${r.state}`;
      }).catch(e => {
        this.error = true;
        this.loading = false;
        console.log(e);
      })
    }
  }

  copyToClipboard() {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.result;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  close() {

    this.dialogRef.close();

  }

}
