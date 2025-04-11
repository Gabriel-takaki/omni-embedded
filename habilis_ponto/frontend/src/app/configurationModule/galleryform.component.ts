/**
 * Created by filipe on 19/09/16.
 */
import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {BASE_URL} from "../app.consts";
import {SocketService} from "../services/socket.service";
import {HttpClient} from "@angular/common/http";
import {StatusService} from "../services/status.service";
import {DomSanitizer} from "@angular/platform-browser";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  templateUrl: 'galleryform.component.html',
  styleUrls: ['./galleryform.component.scss']
})

export class GalleryFormComponent implements AfterViewInit {

  title = '';
  file;
  fileSrc;
  @ViewChild('imagesDialog') imagesDialog;
  @ViewChild('canvasEl') canvas;
  @ViewChild('canvasThumbEl') thumbnail;
  @ViewChild('titleInput') titleInput: ElementRef<HTMLInputElement>;
  @ViewChild('videoEl') video;

  private duration = 0;
  private width;
  private height;

  showError = false;
  showSticker = false;
  saveAsSticker = false;

  constructor(public socket: SocketService, private notifications: NotificationsService, private status: StatusService,
              private dialogRef: MatDialogRef<GalleryFormComponent>, private http: HttpClient,
              private sanitizer: DomSanitizer, private snack: MatSnackBar) {

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

  openFile() {
    this.imagesDialog.nativeElement.click();
  }

  fileSelected(e = null) {

    if (e) {
      this.file = e.target.files[0];
    }

    if (this.file && this.file.size <= this.status.config.maxfilesize && !this.status.config.blockedextensions.includes(this.file.name.slice(-3))
      && !this.status.config.blockedextensions.includes(this.file.name.slice(-4))) {


      if (['application/pdf'].includes(this.file.type) || this.file.type.includes('audio/') || (this.file.type.includes('video/') && this.file.type !== 'video/mp4')) {
        this.fileSrc = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(this.file));
      } else if (this.file.type === 'video/mp4') {
        this.fileSrc = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(this.file));
        this.video.nativeElement.oncanplay = () => {
          this.width = this.video.nativeElement.videoWidth;
          this.height = this.video.nativeElement.videoHeight;
          this.duration = this.video.nativeElement.duration;
          const scale = 100 / this.width;
          this.thumbnail.nativeElement.width = Math.round(this.width * scale);
          this.thumbnail.nativeElement.height = Math.round(this.height * scale);
          this.thumbnail.nativeElement.getContext('2d').drawImage(this.video.nativeElement, 0, 0, Math.round(this.width * scale), Math.round(this.height * scale));
        };
      } else if (this.file.type.includes('image/')) {
        this.showSticker = true;
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        const url = window.URL.createObjectURL(this.file);
        img.src = url;
        img.onload = () => {
          img.crossOrigin = 'Anonymous';
          this.width = img.width;
          this.height = img.height;
          const scale = 100 / img.width;
          this.canvas.nativeElement.width = img.width;
          this.canvas.nativeElement.height = img.height;
          this.canvas.nativeElement.getContext('2d').drawImage(img, 0, 0);
          this.thumbnail.nativeElement.width = Math.round(this.width * scale);
          this.thumbnail.nativeElement.height = Math.round(this.height * scale);
          this.thumbnail.nativeElement.getContext('2d').drawImage(img, 0, 0, Math.round(this.width * scale), Math.round(this.height * scale));
        };
        this.fileSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      } else {
        this.fileSrc = null;
      }

    } else if (this.file && this.file.size > this.status.config.maxfilesize) {
      this.snack.open($localize`O arquivo que você está tentando salvar é maior que o permitido. (Tamanho máx. ${Math.round(this.status.config.maxfilesize / 1024)} KB)`,
        $localize`Fechar`, {
          panelClass: 'bg-warning'
        });
      this.dialogRef.close();
    } else if (this.file && (this.status.config.blockedextensions.includes(this.file.name.slice(-3))
      || this.status.config.blockedextensions.includes(this.file.name.slice(-4)))) {
      this.snack.open($localize`O formato do arquivo que você está tentando salvar não é permitido.`, $localize`Fechar`, {
        panelClass: 'bg-warning'
      });
      this.dialogRef.close();
    }

  }

  save() {

    if (this.file && this.title) {

      if (this.status.imageMimes.includes(this.file.type) && !this.saveAsSticker || (this.saveAsSticker && this.file.type !== 'image/webp')) {

        const b64 = this.canvas.nativeElement.toDataURL(this.saveAsSticker ? 'image/webp' : 'image/jpeg');
        const thumbb64 = this.thumbnail.nativeElement.toDataURL(this.saveAsSticker ? 'image/webp' : 'image/jpeg');

        const re = {
          title: this.title,
          data: b64.split('base64,')[1],
          thumbnail: thumbb64.split('base64,')[1],
          mimetype: this.saveAsSticker ? 'image/webp' : 'image/jpeg',
          filename: this.saveAsSticker ? this.file.name.replace('png', 'webp').replace('gif', 'webp').replace('jpeg', 'webp').replace('jpg', 'webp') : this.file.name.replace('png', 'jpeg').replace('gif', 'jpeg').replace('webp', 'jpeg'),
          width: this.width,
          height: this.height
        };

        this.http.post(BASE_URL + '/predefinedtexts/createGallery', re, {

          observe: "response"
        }).subscribe(r => {
          this.notifications.success($localize`Sucesso`, $localize`Nova imagem cadastrada com sucesso!`);
          this.dialogRef.close(true);
        }, err => {
          this.notifications.error($localize`Erro ao salvar`, err.statusText);
        });

      } else if (this.file.type === 'video/mp4') {

        const thumbb64 = this.thumbnail.nativeElement.toDataURL('image/jpeg');
        const file = new FileReader();

        file.onload = (event: any) => {

          const byteString = event.target.result;

          const re = {
            title: this.title,
            data: btoa(byteString),
            thumbnail: thumbb64.split('base64,')[1],
            mimetype: this.file.type,
            filename: this.file.name,
            width: this.width,
            height: this.height,
            duration: this.duration
          };

          this.http.post(BASE_URL + '/predefinedtexts/createGallery', re, {

            observe: "response"
          }).subscribe(r => {
            this.notifications.success($localize`Sucesso`, $localize`Novo vídeo cadastrada com sucesso!`);
            this.dialogRef.close(true);
          }, err => {
            this.notifications.error($localize`Erro ao salvar`, err.statusText);
          });

        };
        file.readAsBinaryString(this.file);

      } else {
        const file = new FileReader();
        file.onload = (event: any) => {

          const byteString = event.target.result;

          const re = {
            title: this.title,
            data: btoa(byteString),
            mimetype: this.file.type || this.status.getMimetype(this.file.type.split('.').pop()),
            filename: this.file.name,
            width: this.width,
            height: this.height
          };

          this.http.post(BASE_URL + '/predefinedtexts/createGallery', re, {

            observe: "response"
          }).subscribe(r => {
            this.notifications.success($localize`Sucesso`, $localize`Novo arquivo cadastrada com sucesso!`);
            this.dialogRef.close(true);
          }, err => {
            this.notifications.error($localize`Erro ao salvar`, err.statusText);
          });

        };
        file.readAsBinaryString(this.file);
      }
    }

  }

}
