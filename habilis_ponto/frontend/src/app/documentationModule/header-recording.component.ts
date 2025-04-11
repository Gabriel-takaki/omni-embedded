import {Component, Input} from "@angular/core";
import {ScreenRecorderService} from "../services/screen-recorder.service";

@Component({
  selector: 'ca-header-recording',
  templateUrl: 'header-recording.component.html',
  styleUrls: ['./header-recording.component.scss']
})
export class HeaderRecordingComponent {

  @Input() now: number;

  protected readonly Math = Math;

  constructor(public screen: ScreenRecorderService) {

  }

  stopRecording() {
    this.screen.stopRecording();
  }

}
