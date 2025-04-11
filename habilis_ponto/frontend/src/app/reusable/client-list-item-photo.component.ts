/**
 * Created by filipe on 17/09/16.
 */
import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {BASE_URL} from "../app.consts";
import {StatusService} from "../services/status.service";

@Component({
  selector: 'app-client-list-item-photo',
  templateUrl: 'client-list-item-photo.component.html',
  styleUrls: ['client-list-item-photo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientListItemPhotoComponent implements OnChanges {

  @Input() type = 0;
  @Input() fontSize = 18;
  @Input() picHash = '';
  @Input() queueId = 0;
  @Input() picId = '';
  @Input() queueName = '';
  @Input() pageName = '';
  @Input() showBorder = true;
  @Input() call = false;
  @Input() group = false;
  @Input() new = true;

  public baseUrl = BASE_URL;
  img = true;

  constructor(public sanitizer: DomSanitizer, public status: StatusService) {

  }

  ngOnChanges(changes: SimpleChanges) {
    this.img = true;
  }

  imgError() {
    this.img = false;
  }

}
