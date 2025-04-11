/**
 * Created by filipe on 18/09/16.
 */
// import {trigger, state, transition, animate, style} from '@angular/animations';
import {ChangeDetectionStrategy, Component, Input} from "@angular/core";
import {StatusService} from "../services/status.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'ca-helpdropdown',
  templateUrl: 'helpdropdown.component.html',
  // animations: [
  //   trigger('visibilityChanged', [
  //     state('shown', style({
  //       "max-height": 500,
  //       "overflow-y": "visible",
  //       "box-shadow": "0 1px 7px 2px rgba(135, 158, 171, 0.2)"
  //     })),
  //     state('hidden', style({
  //       "max-height": 0,
  //       margin: 0,
  //       padding: 0,
  //       "overflow-y": "hidden",
  //       "box-shadow": "0 0px 0px 0px"
  //     })),
  //     transition('* => *',
  //       animate('0.3s'))
  //   ])
  // ],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class HelpDropDownComponent {

  @Input() headerFontColor = '';
  public visibility = 'hidden';

  constructor(public status: StatusService, private snack: MatSnackBar) {
  }

  dropDown(close = false) {
    this.visibility = close ? 'hidden' : (this.visibility === 'shown') ? 'hidden' : 'shown';
  }

  openUserback() {
    // @ts-ignore
    Userback.open();
  }

  copyPhone() {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.status.supportPhone.replace('(', '').replace(')', '').replace(/ /g, '').replace(/-/g, '');
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.snack.open('Telefone copiado!', 'Fechar', {duration: 3000});
  }

}
