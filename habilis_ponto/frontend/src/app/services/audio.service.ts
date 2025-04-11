/**
 * Created by filipe on 17/09/16.
 */

import {Injectable} from '@angular/core';
import {StatusService} from './status.service';

@Injectable({providedIn: 'root'})
export class AudioService {

  private context = null;
  public playing = false;
  public initialized = false;

  private osc1 = null;
  private osc2 = null;
  private gainNode = null;
  private filter = null;

  private ringToneSoundTimeTimer = null;
  private ringToneSilenceTimeTimer = null;

  private dtmfFrequencies = {
    '1': {f1: 697, f2: 1209},
    '2': {f1: 697, f2: 1336},
    '3': {f1: 697, f2: 1477},
    '4': {f1: 770, f2: 1209},
    '5': {f1: 770, f2: 1336},
    '6': {f1: 770, f2: 1477},
    '7': {f1: 852, f2: 1209},
    '8': {f1: 852, f2: 1336},
    '9': {f1: 852, f2: 1477},
    '*': {f1: 941, f2: 1209},
    '0': {f1: 941, f2: 1336},
    '#': {f1: 941, f2: 1477}
  };

  constructor(private status: StatusService) {

    console.log('Carregando audio service.');

  }

  initialize() {

    if (!this.context) {
      console.log('Inicializando audio service.');
      this.initialized = true;
      this.context = new AudioContext();
      this.playing = false;

      this.osc1 = this.context.createOscillator();
      this.osc2 = this.context.createOscillator();
      this.gainNode = this.context.createGain();
      this.filter = this.context.createBiquadFilter();

      this.filter.type = 'lowpass';
      this.filter.frequency.value = 8000.0;
      this.osc1.connect(this.gainNode);
      this.osc2.connect(this.gainNode);
      this.gainNode.connect(this.filter);

      this.osc1.start(0);
      this.osc2.start(0);
    }

  }

  playRingingAlert(volume = 0.15) {
    this.status.ringingAudio.volume = volume;
    this.status.ringingAudio.currentTime = 0;
    this.status.ringingAudio.play();
  }

  stopRingingAlert() {
    this.status.ringingAudio.pause();
  }

  startRingTone(volume = 0.1) {

    if (this.playing) {
      return;
    }

    this.gainNode.gain.value = volume;
    this.playing = true;
    this.filter.connect(this.context.destination);

    this.osc1.frequency.value = 450;
    this.osc2.frequency.value = 400;

    this.soundTime(volume);

  }

  soundTime(volume = 0.1) {
    this.ringToneSoundTimeTimer = setTimeout(() => {
      if (!this.playing) {
        return;
      }
      this.silenceTime(volume);
      this.gainNode.gain.value = 0;
    }, 1100);
  }

  silenceTime(volume = 0.1) {
    this.ringToneSilenceTimeTimer = setTimeout(() => {
      if (!this.playing) {
        return;
      }
      this.soundTime(volume);
      this.gainNode.gain.value = volume;
    }, 4000);
  }

  playDigits(number, volume = 0.1) {

    for (let x = 0; x < number.length; x++) {

      this.playDtmf(number.slice(x, x + 1), (x * 120), volume);
      // this.stopRingTone(((x + 1) * 120) - 30);

    }

    // this.stopRingTone(number.length * 120);

  }

  playDtmf(digit, when = 0, volume = 0.1) {

    console.log('Tocando digito DTMF ' + digit);

    if (this.playing) {
      return;
    }

    const freq = this.dtmfFrequencies[digit];

    if (freq) {
      this.playing = true;
      this.filter.connect(this.context.destination);
      this.osc1.frequency.value = freq ? freq.f1 : 450;
      this.osc2.frequency.value = freq ? freq.f2 : 400;
      this.gainNode.gain.value = volume;

      setTimeout(() => {
        this.stopRingTone();
      }, 150);
    }

  }

  stopRingTone() {
    if (this.ringToneSoundTimeTimer) {
      clearTimeout(this.ringToneSoundTimeTimer);
    }
    if (this.ringToneSilenceTimeTimer) {
      clearTimeout(this.ringToneSilenceTimeTimer);
    }
    if (this.playing) {
      this.playing = false;
      this.filter.disconnect(this.context.destination);
    }
  }

}
