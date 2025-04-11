/**
 * Created by filipe on 17/09/16.
 */
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'app-client-list-item-clock',
  templateUrl: 'client-list-item-clock.component.html',
  styleUrls: ['client-list-item-clock.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientListItemClockComponent {

  @Input() now = 0;
  @Input() beginTime = 0;

  constructor() {

  }

}
