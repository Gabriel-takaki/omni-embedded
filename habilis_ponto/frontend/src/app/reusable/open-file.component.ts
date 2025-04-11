/**
 * Created by filipe on 19/09/16.
 */
import {AfterViewInit, Component, Inject, OnDestroy} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {BASE_URL} from "../app.consts";
import Viewer from 'viewerjs';
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  templateUrl: 'open-file.component.html'
})

export class OpenFileComponent implements OnDestroy, AfterViewInit {

  public fileId = '';
  public fileAuth = '';
  public fileCdn = '';
  public fileMime = '';
  public pdfUrl;

  public gallery = [];
  public viewIndex = 0;

  baseUrl = BASE_URL;
  viewer;

  constructor(public dialogRef: MatDialogRef<OpenFileComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private sanitizer: DomSanitizer) {

    if (data && (data.id || data.cdn)) {
      this.fileId = data.id;
      this.fileAuth = data.auth;
      this.fileCdn = data.cdn;
      this.fileMime = data.mime || 'image/jpeg';
    }

    if (data.chat && this.fileMime.includes('image')) {
      for (const message of data.chat.oldMessages) {
        if (message.file_mimetype?.includes('image') && (message.fk_file || message.file_cdn)) {
          this.gallery.push({
            fileId: message.fk_file,
            fileAuth: message.file_auth,
            fileCdn: message.file_cdn,
            fileMime: message.file_mimetype
          });
        }
      }
      for (const message of data.chat.messages) {
        if (message.file_mimetype?.includes('image') && (message.fk_file || message.file_cdn)) {
          this.gallery.push({
            fileId: message.fk_file,
            fileAuth: message.file_auth,
            fileCdn: message.file_cdn,
            fileMime: message.file_mimetype
          });
        }
      }
      if (this.gallery.length > 1) {
        for (let x = 0; x < this.gallery.length; x++) {
          const img = this.gallery[x];
          if (img.fileId === this.fileId || img.fileCdn === this.fileCdn) {
            this.viewIndex = x;
            break;
          }
        }
      }
    } else if (data.gallery?.length) {
      this.gallery = data.gallery;
      this.fileMime = 'image/jpeg';
      this.fileId = this.gallery[0].fileId;
      this.fileAuth = this.gallery[0].fileAuth;
      this.viewIndex = 0;
    }

    if (this.fileMime.includes('application/pdf')) {
      this.pdfUrl = sanitizer.bypassSecurityTrustResourceUrl(this.baseUrl + '/static/downloadMedia?id=' + this.fileId + '&auth=' + this.fileAuth)
    }

  }

  keyupEvent(e) {
    if (this.viewer && this.gallery.length > 1) {
      if (e.key === 'ArrowRight') {
        this.viewer.next();
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.key === 'ArrowLeft') {
        this.viewer.prev();
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }

  ngAfterViewInit() {
    if (this.fileMime.includes('image')) {
      this.openViewer();
    }
  }

  ngOnDestroy() {
    if (this.viewer) {
      this.viewer.destroy();
      delete this.viewer;
    }
  }

  openViewer() {
    setTimeout(() => {
      if (this.gallery.length > 1) {
        this.viewer = new Viewer(document.getElementById('images'), {
          inline: true,
          initialViewIndex: this.viewIndex,
          toolbar: {
            zoomIn: 2,
            zoomOut: 2,
            oneToOne: 2,
            reset: 2,
            prev: 1,
            play: 0,
            next: 1,
            rotateLeft: 2,
            rotateRight: 2,
            flipHorizontal: 2,
            flipVertical: 2,
          },
          keyboard: true,
          fullscreen: false
        });
      } else {
        this.viewer = new Viewer(document.getElementById('imageViewer'), {
          inline: true,
          toolbar: {
            zoomIn: 2,
            zoomOut: 2,
            oneToOne: 2,
            reset: 2,
            prev: 0,
            play: 0,
            next: 0,
            rotateLeft: 2,
            rotateRight: 2,
            flipHorizontal: 2,
            flipVertical: 2,
          },
          keyboard: false,
          fullscreen: false
        });
      }
    }, 200);
  }

}
