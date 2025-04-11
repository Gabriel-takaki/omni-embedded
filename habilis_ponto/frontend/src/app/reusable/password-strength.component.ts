/**
 * Created by filipe on 17/09/16.
 */
import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import * as passScoreCalc from 'zxcvbn';
import {texts} from "../app.texts";

@Component({
  selector: 'app-password-strength',
  templateUrl: 'password-strength.component.html',
  styleUrls: ['password-strength.component.scss']
})

export class PasswordStrengthComponent implements OnChanges {

  @Input() password = '';
  @Output() scoreChanged = new EventEmitter<number>();
  texts = texts;
  score = 0;

  constructor() {

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.calcScore();
  }

  calcScore() {
    this.score = 0;
    if (this.password) {
      const result = passScoreCalc(this.password);
      this.score = result.score;
    }
    this.scoreChanged.emit(this.score);
  }


}
