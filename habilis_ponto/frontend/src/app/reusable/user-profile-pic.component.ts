/**
 * Created by filipe on 17/09/16.
 */
import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {BASE_URL} from "../app.consts";

@Component({
  selector: 'user-profile-pic',
  templateUrl: 'user-profile-pic.component.html',
  styleUrls: ['user-profile-pic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfilePicComponent implements OnChanges {

  @Input() id: number|string;
  @Input() picVersion = 0;
  @Input() auth = '';
  @Input() fontSize = 14;
  @Input() fontBold = true;
  @Input() initials = '';
  @Input() toolTip = '';
  @Input() alertRing = false;
  @Input() blink = false;
  @Input() alertLevel = 0;
  @Input() dark = false;
  @Input() grayLevel = 5;
  @Input() transparentBorder = false;

  img = true;
  base = BASE_URL;

  constructor() {

  }

  ngOnChanges(changes: SimpleChanges) {
    this.img = true;
  }

  imgError() {
    this.img = false;
  }

}
