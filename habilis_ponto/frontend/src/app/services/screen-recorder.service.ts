import {Injectable} from "@angular/core";
import {AudioService} from "./audio.service";
import {StatusService} from "./status.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import * as moment from "moment";
import {SocketService} from "./socket.service";
import {HttpClient} from "@angular/common/http";
import {AiRecordDocumentationComponent} from "../documentationModule/ai-record-documentation.component";
import {DomSanitizer} from "@angular/platform-browser";
import {ConfirmAction} from "../reusable/confirmaction.decorator";

@Injectable({providedIn: 'root'})
export class ScreenRecorderService {

    public startTime = 0;
    public recorderStream;
    public mediaRecorder;

    public get recording() {
        return this.startTime && this.mediaRecorder;
    }

    constructor(private audio: AudioService, private status: StatusService, private snack: MatSnackBar,
                private sanitizer: DomSanitizer,
                private dialog: MatDialog, private http: HttpClient, private socket: SocketService) {

    }

    /**
     * Inicia a gravação da tela, utilizando a API de gravação de tela do navegador.
     */
    @ConfirmAction('dialog', {
        text: $localize`Iniciar a gravação da tela?`,
        title: $localize`Gravar vídeo`,
        yesButtonText: $localize`Iniciar`,
        yesButtonStyle: 'warning'
    })
    startRecording() {

        if (this.recording) {
            this.snack.open($localize`Já existe uma gravação em andamento.`, $localize`Fechar`, {duration: 5000});
            return;
        }

        if (navigator.mediaDevices) {

            // Para nossa aplicação, não desejamos o áudio da aba, mas sim o áudio do microfone
            // @ts-ignore
            navigator.mediaDevices.getDisplayMedia({video: true, audio: false, selfBrowserSurface: "include"}).then(async stream => {

                this.startTime = moment().unix();
                this.recorderStream = stream;

                console.log('Iniciando gravação da tela.');

                // Busca o áudio do microfone e adiciona ao stream
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.addTrack(audioStream.getAudioTracks()[0]); // Adiciona o microfone no stream

                // Inicia a gravação do vídeo e cria os handles para os eventos de gravação.
                this.mediaRecorder = new MediaRecorder(stream, {mimeType: 'video/mp4;codecs=avc1,opus'});

                const chunks = [];

                this.mediaRecorder.ondataavailable = e => {
                    chunks.push(e.data);
                };

                this.mediaRecorder.onstop = e => {
                    const blob = new Blob(chunks, {type: 'video/mp4'});
                    const file = new File([blob], `screen-recording-${this.startTime}.mp4`);
                    const fileSrc = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(file));
                    this.recorderStream = null;
                    this.mediaRecorder = null;
                    this.startTime = 0;
                    this.dialog.open(AiRecordDocumentationComponent, {data: {file, fileSrc}});
                };

                this.mediaRecorder.start();

            }).catch(err => {
                if (err?.message?.includes('NotAllowedError')) {
                    this.snack.open($localize`Acesso a tela não permitido.`, $localize`Fechar`, {duration: 5000});
                } else {
                    this.snack.open($localize`Erro ao iniciar gravação de tela.`, $localize`Fechar`, {duration: 5000});
                }
            });

        } else {
            this.snack.open($localize`Gravação de tela não disponível.`, $localize`Fechar`, {duration: 5000});
        }

    }

    stopRecording() {
        if (!this.recording) {
            return;
        }
        // Interrompe a gravação
        this.mediaRecorder.stop();
        this.recorderStream.getTracks().forEach(track => track.stop());
    }


}
