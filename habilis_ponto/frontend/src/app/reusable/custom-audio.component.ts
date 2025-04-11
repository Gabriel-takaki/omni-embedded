/**
 * Created by filipe on 17/09/16.
 */
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input, OnChanges, SimpleChanges,
  ViewChild
} from '@angular/core';
import {BASE_URL} from "../app.consts";

@Component({
  selector: 'app-custom-audio',
  templateUrl: 'custom-audio.component.html',
  styleUrls: ['custom-audio.component.scss']
})
export class CustomAudioComponent implements AfterViewInit, OnChanges {

  @Input() src: string;
  @Input() waveform = [];
  @Input() bars = 48;
  @Input() fallBackWidth = 240;
  @Input() bgColorClass = 'outline-white';
  @Input() type = 'audio/ogg; codecs=opus';
  @Input() auth = '';
  @Input() fileId = '';
  @Input() compact = false;
  @ViewChild('player') player: ElementRef<HTMLAudioElement>;

  playBackSpeed = 1;
  duration = 0;
  playing = false;
  source;
  resampledWaveform = [];

  constructor(private change: ChangeDetectorRef) {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('waveform')) {
      this.resampleWaveform();
    }
  }

  resampleWaveform() {
    this.resampledWaveform = [];
    if (!this.waveform?.length) {
      return;
    }
    const workWaveform = typeof this.waveform === 'string' ? [] : JSON.parse(JSON.stringify(this.waveform)) || [];
    if (!workWaveform.length || !Array.isArray(workWaveform)) {
      return;
    }
    const size = Math.floor(workWaveform.length / this.bars);
    for (let i = 0; i < this.bars; i++) {
      this.resampledWaveform.push(Math.max(...workWaveform.splice(0, size)));
    }
  }

  timer() {
    if (this.playing) {
      requestAnimationFrame(this.timer.bind(this));
      this.change.detectChanges();
    }
  }

  downloadFile() {
    window.open(BASE_URL + `/${this.auth ? 'static' : 'api'}/downloadMedia?id=${this.fileId}&download=true&auth=${this.auth}`, '_blank');
  }

  changeEvent(e) {
    this.player.nativeElement.currentTime = Number(e.target.value);
  }

  async ngAfterViewInit() {
    this.resampleWaveform();
    // if (this.type.includes('audio/ogg')) {
    //   ogv.OGVLoader.base = 'https://static.atenderbem.com/';
    //   this.ogvPlayer = new ogv.OGVPlayer();
    //   this.ogvPlayer.src = this.src;
    //   this.ogvPlayer.addEventListener('canplay', function () {
    //     this.duration = this.ogvPlayer.duration;
    //   });
    //   this.ogvPlayer.addEventListener('ended', function () {
    //     this.playing = false;
    //     this.player.nativeElement.currentTime = 0;
    //     this.change.detectChanges();
    //   });
    //   this.ogvPlayer.addEventListener('play', function () {
    //     this.playing = true;
    //     this.timer();
    //   });
    //   this.ogvPlayer.addEventListener('pause', function () {
    //     this.playing = false;
    //     this.change.detectChanges();
    //   });
    //   return;
    // }
    // else {
    //   this.audioCtx = new AudioContext();
    // }
    // const track = this.audioCtx.createMediaElementSource(this.player.nativeElement);
    // track.connect(this.audioCtx.destination);
    // if (this.type.includes('audio/ogg')) {
    //   this.audioCtx = new oggmentedAudioContext();
    //   return;
    // } else {
    //   this.audioCtx = new AudioContext();
    // }
    // const track = this.audioCtx.createMediaElementSource(this.player.nativeElement);
    // track.connect(this.audioCtx.destination);

    this.player.nativeElement.oncanplay = (e) => {
      this.duration = this.player.nativeElement.duration;
    }
    this.player.nativeElement.onplay = (e) => {
      this.playing = true;
      this.timer();
    }
    this.player.nativeElement.onpause = (e) => {
      this.playing = false;
      this.change.detectChanges();
    }
    this.player.nativeElement.onended = (e) => {
      this.playing = false;
      this.player.nativeElement.currentTime = 0;
      this.change.detectChanges();
    }
  }

  changePlaybackRate() {
    if (this.playBackSpeed === 1) {
      this.playBackSpeed = 1.25
    } else if (this.playBackSpeed === 1.25) {
      this.playBackSpeed = 1.5
    } else if (this.playBackSpeed === 1.5) {
      this.playBackSpeed = 1.75
    } else if (this.playBackSpeed === 1.75) {
      this.playBackSpeed = 2
    } else if (this.playBackSpeed === 2) {
      this.playBackSpeed = 1
    }
  }

  play() {
    this.player?.nativeElement.play();
  }

  pause() {
    this.player?.nativeElement.pause();
  }

}
