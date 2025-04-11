import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-waveform-bars',
  templateUrl: 'waveform-bars.component.html',
  styleUrls: ['waveform-bars.component.scss']
})
export class WaveformBarsComponent {

  @Input() waveform = [];
  @Input() bgColorClass = 'outline-white';

  constructor() {

  }

}
