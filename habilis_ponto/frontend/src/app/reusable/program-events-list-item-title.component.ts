/**
 * Created by filipe on 17/09/16.
 */
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-events-program-list-item-title',
  templateUrl: 'program-events-list-item-title.component.html',
  styleUrls: ['program-events-list-item-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgramEventsListItemTitleComponent {

  @Input() icon = '';
  @Input() title = '';

  constructor(public sanitizer: DomSanitizer) {

  }

}
