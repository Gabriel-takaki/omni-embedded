/**
 * Created by filipe on 17/09/16.
 */
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-program-list-item-title',
  templateUrl: 'program-list-item-title.component.html',
  styleUrls: ['program-list-item-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgramListItemTitleComponent {

  @Input() icon = '';
  @Input() title = '';
  @Input() description = '';

  constructor(public sanitizer: DomSanitizer) {

  }

}
