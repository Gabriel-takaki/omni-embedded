/**
 * Created by filipe on 17/09/16.
 */
import {Component, Input} from '@angular/core';
import {StatusService} from "../services/status.service";

@Component({
  selector: 'news-card',
  templateUrl: 'news-card.component.html',
  styleUrls: ['news-card.component.scss']
})
export class NewsCardComponent {

  @Input() newsData;

  constructor(public status: StatusService) {

  }

}
