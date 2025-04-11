import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input, OnChanges, SimpleChanges
} from '@angular/core';

@Component({
  selector: 'app-waveform-viewer',
  templateUrl: 'waveform-viewer.component.html',
  styleUrls: ['waveform-viewer.component.scss']
})
export class WaveformViewerComponent implements AfterViewInit, OnChanges {

  @Input() waveform = [];
  @Input() bars = 48;
  @Input() fallBackWidth = 240;
  @Input() bgColorClass = 'outline-white';

  resampledWaveform = [];

  constructor(private change: ChangeDetectorRef) {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('waveform')) {
      this.resampleWaveform();
    }
  }

  //
  // resampleWaveform() {
  //   this.resampledWaveform = [];
  //   if (!this.waveform?.length) {
  //     return;
  //   }
  //   const workWaveform = JSON.parse(JSON.stringify(this.waveform));
  //   const size = Math.floor(workWaveform.length / this.bars);
  //   for (let i = 0; i < this.bars; i++) {
  //     this.resampledWaveform.push(Math.max(...workWaveform.splice(0, size)));
  //   }
  // }

  resampleWaveform() {
    this.resampledWaveform = !this.waveform?.length ? [] : this.waveform.slice(0, this.bars);
  }

  async ngAfterViewInit() {
    this.resampleWaveform();
  }

}
