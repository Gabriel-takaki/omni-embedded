/**
 * Created by filipe on 17/09/16.
 */
import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-comments-box',
  templateUrl: 'comments-box.component.html',
  styleUrls: ['comments-box.component.scss']
})
export class CommentsBoxComponent {

  comment = '';
  @Input() comments = [];
  @Output() commentSubmitted = new EventEmitter<string>();

  constructor() {

  }

  publish() {

    this.commentSubmitted.emit(this.comment);
    this.comment = '';

  }

}
