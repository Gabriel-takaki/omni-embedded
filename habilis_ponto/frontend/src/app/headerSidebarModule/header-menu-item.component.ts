/**
 * Created by filipe on 18/09/16.
 */
import {Component, Input} from "@angular/core";
import {StatusService} from "../services/status.service";

@Component({
  selector: 'ca-header-menu-item',
  templateUrl: 'header-menu-item.component.html',
  styleUrls: ['./header-menu-item.component.scss']
})
export class HeaderMenuItemComponent {

  @Input() title = '';
  @Input() link = [];
  @Input() section = '';
  @Input() selectedMenu = '';
  @Input() selectedMenuText = '';
  @Input() icon = '';
  @Input() badge = 0;
  @Input() badgeColor = '';
  @Input() badgeFlash = false;
  @Input() smallBadge = false;
  @Input() disabled = false;
  @Input() opened = false;

  constructor(public status: StatusService) {
  }

}
