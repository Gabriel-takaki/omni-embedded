import {AfterViewInit, Component, ElementRef, Inject, OnDestroy, ViewChild} from '@angular/core';
import {SocketService} from '../services/socket.service';
import {DomSanitizer} from '@angular/platform-browser';
import {StatusService} from '../services/status.service';
import {MatSnackBar} from "@angular/material/snack-bar";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {UtilitiesService} from "../services/utilities.service";

@Component({
    templateUrl: './send-media.component.html'
})
export class SendMediaComponent implements AfterViewInit, OnDestroy {

    public fileSrc;
    public file;
    public showError = false;

    public files = [];
    public multiple = false;
    public filesSelected = 0;

    @ViewChild('filesDialog') filesDialog;
    @ViewChild('videosDialog') videosDialog;
    @ViewChild('imagesDialog') imagesDialog;
    @ViewChild('stickerDialog') stickerDialog;
    @ViewChild('canvasEl') canvas;
    @ViewChild('canvasThumbEl') thumbnail;
    @ViewChild('videoEl') video;
    @ViewChild('sendBtn') sendBtn: ElementRef<HTMLButtonElement>;

    private width;
    private height;
    private duration;
    private chatId;
    private queueId;
    private chatType;
    private internal = false;
    private sticker = false;
    private reducedQuality = 0.89;
    private chat;

    constructor(private dialogRef: MatDialogRef<SendMediaComponent>, private socket: SocketService, private snack: MatSnackBar,
                @Inject(MAT_DIALOG_DATA) public data: any, private sanitizer: DomSanitizer, public status: StatusService,
                private utils: UtilitiesService) {

        if (data.type === 'sticker') {
            this.sticker = true;
        }

        this.chatId = data.chatId;
        this.queueId = data.queueId;
        this.file = data.file;
        this.chat = data.chat;
        this.internal = !!data.internal;
        this.chatType = data.chatType;

    }

    ngAfterViewInit() {

        if (this.data.type === 'video' && !this.file) {
            this.videosDialog.nativeElement.click();
        } else if ((this.data.type === 'image' || this.data.type === 'sticker') && !this.file) {
            this.imagesDialog.nativeElement.click();
        } else if (!this.file) {
            this.filesDialog.nativeElement.click();
        }

        if (this.file) {
            this.fileSelected();
        }

    }

    ngOnDestroy() {
        // this.status.events.removeAllListeners('fileSaved');
    }

    async fileSelected(e = null) {

        if (e?.target.files.length > 1) {

            for (const file of e.target.files) {
                if (file && file.size <= this.status.config.maxfilesize && !this.status.config.blockedextensions.includes(file.name.slice(-3))
                    && !this.status.config.blockedextensions.includes(file.name.slice(-4))) {

                    await new Promise((resolve, reject) => {
                        if (['application/pdf'].includes(file.type) || file.type.includes('audio/') || (file.type.includes('video/') && file.type !== 'video/mp4')) {
                            file.fileSrc = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(file));
                            file.mimetype = file.type || this.status.getMimetype(file.type.split('.').pop());
                            this.files.push(file);
                            return resolve('');
                        } else if (file.type === 'video/mp4') {
                            const newVideo = document.createElement("video");
                            newVideo.autoplay = false;
                            newVideo.crossOrigin = 'Anonymous';
                            newVideo.src = window.URL.createObjectURL(file);
                            newVideo.oncanplay = () => {
                                file.width = newVideo.videoWidth;
                                file.height = newVideo.videoHeight;
                                file.duration = newVideo.duration;
                                file.mimetype = file.type;
                                const scale = 100 / file.width;
                                this.thumbnail.nativeElement.width = Math.round(file.width * scale);
                                this.thumbnail.nativeElement.height = Math.round(file.height * scale);
                                this.thumbnail.nativeElement.getContext('2d').drawImage(newVideo, 0, 0, Math.round(file.width * scale), Math.round(file.height * scale));
                                file.thumb = this.thumbnail.nativeElement.toDataURL('image/jpeg', this.reducedQuality).split('base64,')[1];
                                this.files.push(file);
                                return resolve('');
                            };
                        } else if (file.type.includes('image/')) {
                            const img = new Image();
                            img.crossOrigin = 'Anonymous';
                            const url = window.URL.createObjectURL(file);
                            img.src = url;
                            img.onload = async () => {
                                img.crossOrigin = 'Anonymous';
                                const scale = this.status.config.reduceimgquality ? img.height > img.width && img.height > 1280 ? 1280 / img.height : img.width > 1280 ? 1280 / img.width : 1 : 1;
                                file.width = Math.round(img.width * scale);
                                file.height = Math.round(img.height * scale);
                                const thumbScale = 100 / img.width;
                                this.canvas.nativeElement.width = file.width;
                                this.canvas.nativeElement.height = file.height;
                                this.canvas.nativeElement.getContext('2d').drawImage(img, 0, 0, file.width, file.height);
                                this.thumbnail.nativeElement.width = Math.round(img.width * thumbScale);
                                this.thumbnail.nativeElement.height = Math.round(img.height * thumbScale);
                                this.thumbnail.nativeElement.getContext('2d').drawImage(img, 0, 0, Math.round(img.width * thumbScale), Math.round(img.height * thumbScale));
                                file.img = await new Promise((res, rej) => {
                                    this.canvas.nativeElement.toBlob((blob) => {
                                        return res(blob);
                                    }, this.sticker ? 'image/webp' : 'image/jpeg', this.status.config.reduceimgquality ? this.reducedQuality : null);
                                });
                                file.mimetype = this.sticker ? 'image/webp' : 'image/jpeg';
                                file.thumb = this.thumbnail.nativeElement.toDataURL(this.sticker ? 'image/webp' : 'image/jpeg', this.reducedQuality).split('base64,')[1];
                                this.files.push(file);
                                // console.log('terminou o processimento de uma imagem');
                                return resolve('');
                            };
                            this.fileSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
                        } else {
                            this.files.push(file);
                        }
                    });

                } else if (file && file.size > this.status.config.maxfilesize) {
                    this.snack.open($localize`O arquivo que você está tentando enviar é maior que o permitido. (Tamanho máx. ${Math.round(this.status.config.maxfilesize / 1024)} KB)`, $localize`Fechar`, {
                        panelClass: 'bg-warning'
                    });
                    this.dialogRef.close();
                } else if (file && (this.status.config.blockedextensions.includes(file.name.slice(-3))
                    || this.status.config.blockedextensions.includes(file.name.slice(-4)))) {
                    this.snack.open($localize`O formato do arquivo que você está tentando enviar não é permitido.`, $localize`Fechar`, {
                        panelClass: 'bg-warning'
                    });
                    this.dialogRef.close();
                }
            }

            // Múltiplos arquivos selecionados
            this.files = this.files.slice(0, 20);
            this.multiple = true;
            this.filesSelected = this.files.length;

        } else {
            // Apenas um arquivo selecionado
            if (e?.target.files[0]) {
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
                    const img = new Image();
                    img.crossOrigin = 'Anonymous';
                    const url = window.URL.createObjectURL(this.file);
                    img.src = url;
                    img.onload = () => {
                        img.crossOrigin = 'Anonymous';
                        const scale = this.status.config.reduceimgquality ? img.height > img.width && img.height > 1280 ? 1280 / img.height : img.width > 1280 ? 1280 / img.width : 1 : 1;
                        this.width = Math.round(img.width * scale);
                        this.height = Math.round(img.height * scale);
                        const thumbScale = 100 / img.width;
                        this.canvas.nativeElement.width = this.width;
                        this.canvas.nativeElement.height = this.height;
                        this.canvas.nativeElement.getContext('2d').drawImage(img, 0, 0, this.width, this.height);
                        this.thumbnail.nativeElement.width = Math.round(this.width * thumbScale);
                        this.thumbnail.nativeElement.height = Math.round(this.height * thumbScale);
                        this.thumbnail.nativeElement.getContext('2d').drawImage(img, 0, 0, Math.round(this.width * thumbScale), Math.round(this.height * thumbScale));
                    };
                    this.fileSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
                } else {
                    this.fileSrc = null;
                }

            } else if (this.file && this.file.size > this.status.config.maxfilesize) {
                this.snack.open($localize`O arquivo que você está tentando enviar é maior que o permitido. (Tamanho máx. ${Math.round(this.status.config.maxfilesize / 1024)}:TamanhoMaximo: KB)`, $localize`Fechar`, {
                    panelClass: 'bg-warning'
                });
                this.dialogRef.close();
            } else if (this.file && (this.status.config.blockedextensions.includes(this.file.name.slice(-3))
                || this.status.config.blockedextensions.includes(this.file.name.slice(-4)))) {
                this.snack.open($localize`O formato do arquivo que você está tentando enviar não é permitido.`, $localize`Fechar`, {
                    panelClass: 'bg-warning'
                });
                this.dialogRef.close();
            }
        }

        // Aplica um atraso, para o que o botão de enviar seja habilitado com a seleção do arquivo, depois aplica o foco
        setImmediate(() => {
            this.sendBtn.nativeElement.focus();
        });

    }

    close() {

        this.dialogRef.close('cancel');

    }

    async send() {

        this.dialogRef.close('sent');

        if (this.data.type === 'image' && this.file || (this.file.type !== 'image/webp' && this.data.type === 'sticker')) {

            const mimeType = this.sticker ? 'image/webp' : 'image/jpeg';
            const img: Blob = await new Promise((resolve, reject) => {
                this.canvas.nativeElement.toBlob((blob: Blob) => {
                    return resolve(blob);
                }, mimeType, this.status.config.reduceimgquality ? this.reducedQuality : null);
            });

            const thumb = this.thumbnail.nativeElement.toDataURL(mimeType, this.reducedQuality).split('base64,')[1];

            const fileId = await this.utils.saveFile({
                data: img,
                mimetype: mimeType,
                name: this.file.name,
                thumbnail: thumb,
                width: this.width,
                height: this.height
            }, this.chat);

            this.socket.socket.emit('action', {
                type: this.internal ? 'sendInternalMessage' : 'sendMessage',
                chatId: this.chatId,
                queueId: this.queueId,
                ...(this.chatType ? {chatType: this.chatType} : {}),
                fk_file: fileId,
                file_name: this.file.name || '',
                file_mimetype: mimeType,
                text: ''
            });

        } else if (this.file.type === 'video/mp4') {

            const thumb = this.thumbnail.nativeElement.toDataURL('image/jpeg').split('base64,')[1];
            const fileId = await this.utils.saveFile({
                name: this.file.name,
                data: this.file,
                mimetype: this.file.type,
                thumbnail: thumb,
                width: this.width,
                height: this.height,
                duration: this.duration
            }, this.chat);

            this.socket.socket.emit('action', {
                type: this.internal ? 'sendInternalMessage' : 'sendMessage',
                chatId: this.chatId,
                queueId: this.queueId,
                ...(this.chatType ? {chatType: this.chatType} : {}),
                file_name: this.file.name || '',
                fk_file: fileId,
                file_mimetype: this.file.type,
                text: ''
            });

        } else {

            const fileId = await this.utils.saveFile({
                name: this.file.name,
                data: this.file,
                mimetype: this.file.type
            }, this.chat);

            this.socket.socket.emit('action', {
                type: this.internal ? 'sendInternalMessage' : 'sendMessage',
                chatId: this.chatId,
                queueId: this.queueId,
                ...(this.chatType ? {chatType: this.chatType} : {}),
                file_name: this.file.name || '',
                fk_file: fileId,
                file_mimetype: this.file.type,
                text: ''
            });

        }

    }

    sendMulti() {
        this.dialogRef.close('sent');
        if (this.files.length) {
            for (const file of this.files) {
                if (file) {
                    this.sendFile(file);
                }
            }
        }
    }

    async sendFile(file) {

        const fileId = await this.utils.saveFile({
            data: file.img || file,
            mimetype: file.mimetype,
            name: file.name,
            thumbnail: file.thumb || '',
            width: file.width || 0,
            height: file.height || 0,
            duration: file.duration || 0
        }, this.chat);

        this.socket.socket.emit('action', {
            type: this.internal ? 'sendInternalMessage' : 'sendMessage',
            chatId: this.chatId,
            queueId: this.queueId,
            ...(this.chatType ? {chatType: this.chatType} : {}),
            fk_file: fileId,
            file_mimetype: file.mimetype,
            text: ''
        });
    }

}
