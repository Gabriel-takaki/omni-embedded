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
import {ImageCropperComponent} from "./image-cropper.component";
import {UtilitiesService} from "../services/utilities.service";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";

@Component({
  selector: 'ca-photos-attachs',
  templateUrl: 'photos-attachs.component.html',
  styleUrls: ['./photos-attachs.component.scss'],
})
export class PhotosAttachsComponent {

  @Input() list: {
    id: number,
    name: string,
    description: string,
    auth: string,
    mimetype: string,
    width?: number,
    height?: number,
    thumbnail?: { width: number, height: number, data: string },
    data?: any, // Recebe o blob do arquivo
    preview?: any, // Recebe o blob do arquivo
    fileSrc?: any // Recebe o resourceUrl para exibição da mídia
  }[] = [];
  @Input() editable = true;
  @Input() noMaxHeight = false;
  @Input() caption = $localize`Fotos`;
  @Output() changed = new EventEmitter();

  @ViewChild('filesDialog') filesDialog;
  @ViewChild('canvasEl') canvas;
  @ViewChild('canvasThumbEl') thumbnail;

  counter = 0;
  baseUrl = BASE_URL;
  private maxSize = 10 * 1024 * 1024;
  maxFiles = 10;

  constructor(public status: StatusService, public dialog: MatDialog, private sanitizer: DomSanitizer,
              private snack: MatSnackBar, private utils: UtilitiesService) {

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

  addFile(file) {
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

        const item:{
          id: number,
          name: string,
          description: string,
          auth: string,
          mimetype: string,
          width?: number,
          height?: number,
          data?: any, // Recebe o blob do arquivo
          preview?: any, // Recebe o blob do arquivo
          fileSrc?: any // Recebe o resourceUrl para exibição da mídia
        } = {
          id: 0,
          name: file.name,
          description: '',
          auth: '',
          mimetype: file.type || this.status.getMimetype(file.type.split('.').pop()),
          width: 0,
          height: 0,
          data: null,
          preview: null
        };

        await new Promise((resolve, reject) => {
          if (file.type.includes('image/')) {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            const url = window.URL.createObjectURL(file);
            img.src = url;
            img.onload = () => {
              img.crossOrigin = 'Anonymous';
              if (img.width !== img.height) {
                this.dialog.open(ImageCropperComponent, {
                  data: {
                    imageFile: file,
                    resizeToHeight: 800,
                    caption: $localize`Cortar imagem`,
                    description: $localize`As imagens de produto devem ser quadradas. Selecione a área da imagem que deseja manter.`
                  }
                }).afterClosed().subscribe(r => {
                  if (r) {
                    item.preview = this.sanitizer.bypassSecurityTrustResourceUrl(r);
                    item.data = this.utils.base64ToArrayBuffer(r.split('base64,')[1]);
                    return resolve('');
                  }
                });
              } else {
                const scale = 800 / img.height;
                item.width = scale < 1 ? Math.round(img.width * scale) : img.width;
                item.height = scale < 1 ? Math.round(img.height * scale) : img.height;
                this.canvas.nativeElement.width = item.width;
                this.canvas.nativeElement.height = item.height;
                this.canvas.nativeElement.getContext('2d').drawImage(img, 0, 0, item.width, item.height);
                const url = this.canvas.nativeElement.toDataURL('image/jpeg', 0.9);
                item.data = this.utils.base64ToArrayBuffer(url.split('base64,')[1]);
                item.preview = this.sanitizer.bypassSecurityTrustResourceUrl(url);
                return resolve('');
              }
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

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.list, event.previousIndex, event.currentIndex);
  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja remover esta imagem?`,
    title: $localize`Remover imagem`,
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
