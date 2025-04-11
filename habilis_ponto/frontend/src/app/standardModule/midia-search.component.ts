/**
 * Created by filipe on 18/09/16.
 */
import {AfterViewInit, Component, ElementRef, Input, ViewChild} from "@angular/core";
import {StatusService} from "../services/status.service";
import {SocketService} from "../services/socket.service";
import {DomSanitizer} from "@angular/platform-browser";
import {BASE_URL} from "../app.consts";
import {HttpClient} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {EventsService} from "../services/events.service";

@Component({
  selector: 'ca-midia-search',
  templateUrl: 'midia-search.component.html',
  styleUrls: ['./midia-search.component.scss'],
  animations: [
    trigger('visibilityState', [
      state('void', style({
        opacity: 0
      })),
      state('transparent', style({
        opacity: 0.25
      })),
      transition('void <=> visible', [
        animate('0.2s ease-in-out'),
      ]),
      transition('transparent => void', [
        animate('0.2s ease-in-out'),
      ]),
      transition('transparent <=> visible', [
        animate('0.2s ease-in-out'),
      ])
    ])
  ]
})
export class MidiaSearchComponent implements AfterViewInit {

  @Input() chat;
  @ViewChild('searchField') searchField: ElementRef<HTMLInputElement>;

  searchRegexp;
  baseUrl = BASE_URL;
  searchText = '';
  visibilityState = 'visible';
  mouseOver = false;
  inputFocus = true;

  constructor(public status: StatusService, private socket: SocketService, private events: EventsService,
              public sanitizer: DomSanitizer, private snackbar: MatSnackBar, private http: HttpClient) {

  }

  ngAfterViewInit() {
    this.focusTimer();
  }

  hide() {
    if (this.chat){
      this.chat.showMidias = false;
    }
  }

  updateRegexp() {
    this.searchRegexp = new RegExp(this.searchText, 'ig');
  }

  goToMessage(message) {
    this.events.emit('goToMessage', {id: message.messageid, chatid: this.chat.id});
  }

  focusTimer() {
    setTimeout(() => {
      if (this.searchField) {
        this.searchField.nativeElement.focus();
      } else {
        this.focusTimer();
      }
    }, 50)
  }

}
