/**
 * Created by filipe on 17/09/16.
 */
import {
  ChangeDetectionStrategy,
  Component,
  Input,
} from '@angular/core';

@Component({
  selector: 'app-dialog-close-button',
  templateUrl: 'dialog-close-button.component.html',
  styleUrls: ['dialog-close-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogCloseButtonComponent {

  @Input() size = 32;
  @Input() white = false;
  @Input() color = '';
  @Input() icon: any = 'times';
  @Input() toolTip: any = $localize`Fechar`;
  @Input() rotateOnMouseOver = true;

  rotate = false;

  constructor() {

  }

}
