import {Component, Input} from '@angular/core';
import {BASE_URL} from "../app.consts";
import {StatusService} from "../services/status.service";

@Component({
  selector: 'client-profile-pic',
  templateUrl: 'client-profile-pic.component.html',
  styleUrls: ['client-profile-pic.component.scss']
})
export class ClientProfilePicComponent {

  @Input() id = '';
  @Input() type = 1;

  base = BASE_URL;

  constructor(public status: StatusService) {

  }

}
