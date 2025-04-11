/**
 * Created by filipe on 18/09/16.
 */
import {Component, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {StatusService} from "../services/status.service";
import {ConfirmAction} from "./confirmaction.decorator";
import {MatDialog} from "@angular/material/dialog";
import {RecordAudioDialogComponent} from "./record-audio-dialog.component";
import {DomSanitizer} from "@angular/platform-browser";
import {MatSnackBar} from "@angular/material/snack-bar";
import {BASE_URL} from "../app.consts";
import {OpenFileComponent} from "./open-file.component";
import {FileDef} from "../definitions";

@Component({
  selector: 'ca-task-attachs',
  templateUrl: 'task-attachs.component.html',
  styleUrls: ['./task-attachs.component.scss'],
})
export class TaskAttachsComponent {

  @Input() list: FileDef[] = [];
  @Input() editable = true;
  @Input() noMaxHeight = false;
  @Input() allowAudio = true;
  @Input() caption = $localize`Anexos`;
  @Input() accept = '';
  @Output() changed = new EventEmitter();

  @ViewChild('filesDialog') filesDialog;
  counter = 0;
  baseUrl = BASE_URL;
  private maxSize = 10 * 1024 * 1024;
  maxFiles = 10;

  constructor(public status: StatusService, public dialog: MatDialog, private sanitizer: DomSanitizer,
              private snack: MatSnackBar) {

  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja remover todos os anexos?`,
    title: $localize`Limpar anexos`,
    yesButtonText: $localize`Limpar`,
    yesButtonStyle: 'warning'
  })
  clearList() {
    this.list.splice(0, this.list.length);
    this.changed.emit();
  }

  addFile(file: FileDef) {
    if (this.list.length < this.maxFiles) {
      this.list.push(file);
      this.changed.emit();
    } else {
      this.snack.open($localize`Limite de anexos atingido. Máximo de ${this.maxFiles} anexos.`, $localize`Fechar`, {duration: 3000});
    }
  }

  openFileDialog() {
    this.filesDialog.nativeElement.click();
  }

  async fileSelected(e = null) {

    for (const file of e.target.files) {

      if (file && file.size <= this.maxSize && !this.status.config.blockedextensions.includes(file.name.slice(-3))
        && !this.status.config.blockedextensions.includes(file.name.slice(-4))) {

        const item: FileDef = {
          id: 0,
          name: file.name,
          description: '',
          auth: '',
          mimetype: file.type || this.status.getMimetype(file.type.split('.').pop()),
          duration: 0,
          width: 0,
          height: 0,
          data: file,
          fileSrc: null
        };

        await new Promise((resolve, reject) => {
          if (['application/pdf'].includes(file.type) || file.type.includes('audio/') || (file.type.includes('video/') && file.type !== 'video/mp4')) {
            item.fileSrc = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(file));
            return resolve('');
          } else if (file.type === 'video/mp4') {
            const newVideo = document.createElement("video");
            item.fileSrc = window.URL.createObjectURL(file);
            newVideo.autoplay = true;
            newVideo.crossOrigin = 'Anonymous';
            newVideo.src = item.fileSrc;
            newVideo.oncanplay = () => {
              item.width = newVideo.videoWidth;
              item.height = newVideo.videoHeight;
              item.duration = newVideo.duration;
              return resolve('');
            };
          } else if (file.type.includes('image/')) {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            const url = window.URL.createObjectURL(file);
            img.src = url;
            item.fileSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
            img.onload = () => {
              img.crossOrigin = 'Anonymous';
              item.width = img.width;
              item.height = img.height;
              return resolve('');
            };
          }
          return resolve('');
        });

        this.addFile(item);

      } else if (file && file.size > this.maxSize) {
        this.snack.open($localize`O arquivo que você está tentando enviar é maior que o permitido. (Tamanho máx. ${Math.round(this.maxSize / 1024 / 1024)} MB)`, $localize`Fechar`, {
          panelClass: 'bg-warning'
        });
      } else if (file && (this.status.config.blockedextensions.includes(file.name.slice(-3))
        || this.status.config.blockedextensions.includes(file.name.slice(-4)))) {
        this.snack.open($localize`O formato do arquivo que você está tentando enviar não é permitido.`, $localize`Fechar`, {
          panelClass: 'bg-warning'
        });
      }
    }

  }

  openAudioRecordDialog() {
    const newReason = this.dialog.open(RecordAudioDialogComponent);
    const sub = newReason.afterClosed().subscribe(r => {
      sub.unsubscribe();
      if (r) {
        this.list.push(r);
        this.changed.emit();
      }
    });
  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja remover este anexo?`,
    title: $localize`Remover anexo`,
    yesButtonText: $localize`Remover`,
    yesButtonStyle: 'warning'
  })
  removeListItem(item) {
    if (!this.editable) {
      return;
    }
    const index = this.list.indexOf(item);
    if (index > -1) {
      this.list.splice(index, 1);
      this.changed.emit();
    }
  }

  updateDescription(text, item) {
    item.description = text;
  }

  downloadFile(item) {
    window.open(BASE_URL + `/${item.auth ? 'static' : 'api'}/downloadMedia?id=${item.id}&download=true&auth=${item.auth}`, '_blank');
  }

  viewFile(item) {
    this.dialog.open(OpenFileComponent, {data: {id: item.id, auth: item.auth, cdn: '', mime: item.mimetype}});
  }

  removeFocus(e: any) {
    // @ts-ignore
    e.target.blur();
    e.preventDefault();
    e.stopPropagation();
  }
}
