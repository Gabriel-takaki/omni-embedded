/**
 * Created by filipe on 19/09/16.
 */
import {Component, OnDestroy} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {BASE_URL} from "../app.consts";
import {SocketService} from "../services/socket.service";
import OpusMediaRecorder from 'opus-media-recorder';
import {HttpClient} from "@angular/common/http";
import {StatusService} from "../services/status.service";
import {DomSanitizer} from "@angular/platform-browser";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MediaRecorder, register} from "extendable-media-recorder";
import {connect} from "extendable-media-recorder-wav-encoder";
import {ConfirmAction} from "../reusable/confirmaction.decorator";
import {texts} from "../app.texts";

@Component({
  templateUrl: 'recordaudioform.component.html',
  styleUrls: ['./recordaudioform.component.scss']
})

export class RecordAudioFormComponent implements OnDestroy {

  private duration = 0;
  private width;
  private height;
  mp4Audio = false;
  title = '';
  canRecord = false;
  mediaRecorder;
  instantSamples = [];
  samples = [];
  waveform = [];
  sampleTimerRef;
  analizer: AnalyserNode;
  source: MediaStreamAudioSourceNode;
  audioCtx: AudioContext;

  recordingAudio = false;
  recordTime = 0;
  recording;
  recordingChunks = [];
  recordingTimer;
  audioUrl;

  workerOptions = {
    encoderWorkerFactory: function () {
      // UMD should be used if you don't use a web worker bundler for this.
      return new Worker('assets/audio/encoderWorker.umd.js');
    },
    OggOpusEncoderWasmPath: './OggOpusEncoder.wasm',
    WebMOpusEncoderWasmPath: './WebMOpusEncoder.wasm'
  };

  constructor(public socket: SocketService, private notifications: NotificationsService, public status: StatusService,
              private dialogRef: MatDialogRef<RecordAudioFormComponent>, private http: HttpClient,
              private sanitizer: DomSanitizer, private snack: MatSnackBar, public dialog: MatDialog) {

    this.testRecording();
    this.timer();

  }

  ngOnDestroy() {
    if (this.recordingTimer) {
      clearTimeout(this.recordingTimer);
    }
    if (this.sampleTimerRef) {
      clearTimeout(this.sampleTimerRef);
    }
    if (this.recordingAudio) {
      this.mediaRecorder?.stop();
    }
  }

  timer() {
    this.recordingTimer = setTimeout(() => {
      this.timer();
      if (this.recordingAudio) {
        this.recordTime++;
      }
    }, 1000);
  }

  async testRecording() {
    if (navigator.mediaDevices) {

      let stream;

      try {

        stream = await navigator.mediaDevices.getUserMedia({audio: true});
        this.canRecord = true;

        try {
          await register(await connect());
        } catch (e) {

        }

        stream.getTracks().forEach(function (track) {
          track.stop();
        });

      } catch (err) {
        this.canRecord = false;
      }

    } else {
      console.log('Gravação de áudio não disponível.');
      this.canRecord = false;
    }
  }


  startRecording(e: Event) {

    if (!this.canRecord || this.recordingAudio) {
      return;
    }

    this.recording = null;
    this.recordingChunks = [];
    this.audioUrl = null;
    this.recordTime = 0;

    this.instantSamples = [];
    this.samples = [];

    navigator.mediaDevices.getUserMedia({audio: true}).then(async (stream) => {

      for (let x = 0; x < 48; x++) {
        // Inicializa as amostras instantaneas com 0
        this.instantSamples.push(0);
      }

      if (!this.status.disableWaveform) {

        // @ts-ignore
        this.audioCtx = new AudioContext({latencyHint: 'interactive', sinkId: {type: 'none'}, sampleRate: 16000});
        this.source = this.audioCtx.createMediaStreamSource(stream);
        this.analizer = this.audioCtx.createAnalyser();
        this.analizer.fftSize = 64;
        this.source.connect(this.analizer);

      }

      this.mediaRecorder = this.mp4Audio ? new MediaRecorder(stream, {mimeType: 'audio/wav'}) :
        (!window.MediaRecorder?.isTypeSupported('audio/ogg;codecs=opus') ?
          new OpusMediaRecorder(stream, {mimeType: 'audio/ogg; codecs=opus'}, this.workerOptions) :
          new MediaRecorder(stream, {mimeType: 'audio/ogg;codecs=opus'}));

      this.mediaRecorder.ondataavailable = (event) => {
        this.recordingChunks.push(event.data);
      }

      this.mediaRecorder.onstop = (event) => {
        this.recordingAudio = false;
        this.recording = new Blob(this.recordingChunks, this.mp4Audio ? {'type': 'video/mp4'} : {'type': 'audio/ogg; codecs=opus'});
        this.audioUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(this.recording));
        this.analizer?.disconnect();
        this.analizer = null;
        this.source?.disconnect();
        this.source = null;
        this.audioCtx?.close();
        this.audioCtx = null;
        this.sampleTimerRef = null;
        stream.getTracks().forEach(function (track) {
          track.stop();
        });
        this.waveform = this.reduceArray(this.samples);
      }

      this.mediaRecorder.onstart = (event) => {
        this.recordingAudio = true;
        if (!this.status.disableWaveform) {
          requestAnimationFrame(this.sampleTimer.bind(this));
        }
      }

      this.mediaRecorder.start();

    }).catch(function (err) {
      console.log('Ocorreu um erro na gravação: ' + err);
      this.snack.open('Erro ao iniciar gravação de áudio', 'Fechar', {duration: 3000});
      this.canRecord = false;
    });

    e.stopPropagation();

  }

  reduceArray(data) {
    if (!data.length) {
      let reduced = [];
      for (let i = 0; i < 64; i++) {
        reduced.push(5);
      }
      return reduced;
    }
    const stepSize = Math.floor(data.length / 64);
    const reduced = [];
    for (let i = 0; i < 64; i++) {
      const slice = data.splice(0, stepSize);
      // const max = _.sum(slice);
      const max = slice.reduce((acc, val) => acc + Math.min(255, Math.round(Math.abs(val - 128) * 8)), 0);
      reduced.push(Math.round(max / slice.length));
    }
    return reduced;
  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja descartar o áudio?`,
    title: $localize`Descartar áudio`,
    yesButtonText: $localize`Descartar`,
    noButtonText: 'Não'
  })
  clearRecording() {
    this.doClear();
  }

  stopRecording(e: Event) {
    if (!this.mediaRecorder) {
      return;
    }
    this.mediaRecorder?.stop();
    e.stopPropagation();
  }

  doClear() {
    this.recording = null;
    this.recordingChunks = [];
    this.audioUrl = null;
    this.recordTime = 0;
  }

  sampleTimer() {
    if (!this.recordingAudio || !this.analizer) {
      this.sampleTimerRef = null;
      return;
    }
    if (!this.analizer) {
      return;
    }
    const frequencyArray = new Uint8Array(64);
    this.analizer.getByteTimeDomainData(frequencyArray);
    const actualSamples = Array.from(frequencyArray);
    const averageAmplitude = (actualSamples.reduce((acc, val) => acc + Math.min(255, Math.round(Math.abs(val - 128) * 8)), 0) / 64);
    this.instantSamples = [...this.instantSamples.slice(1), averageAmplitude];
    this.samples = this.samples.concat(actualSamples);
    this.sampleTimerRef = null;
    if (this.recordingAudio) {
      // Mesmo em computadores rápidos, quero limitar a 10 fps
      setTimeout(() => {
        requestAnimationFrame(this.sampleTimer.bind(this));
      }, 125);
    }
  }

  convertToBinaryString(blob) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = function (event) {
        return resolve(event.target.result);
      };
      fileReader.readAsBinaryString(blob);
    });
  }

  arrayToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  close() {
    this.dialogRef.close();
  }

  save() {

    if (this.recording && this.title) {

      this.convertToBinaryString(this.recording).then((data: string) => {
        const re = {
          title: this.title,
          data: btoa(data),
          mimetype: 'audio/ogg; codecs=opus',
          waveform: this.arrayToBase64(this.waveform),
          duration: this.recordTime,
          filename: 'audio.ogg'
        };
        this.http.post(BASE_URL + '/predefinedtexts/createGallery', re, {
          observe: "response"
        }).subscribe(r => {
          this.notifications.success($localize`Sucesso`, $localize`Novo áudio cadastrado com sucesso!`);
          this.dialogRef.close(true);
        }, err => {
          this.notifications.error($localize`Erro ao salvar`, err.statusText);
        });
      });

    }

  }

}
