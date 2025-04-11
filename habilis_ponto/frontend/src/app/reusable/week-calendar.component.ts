/**
 * Created by filipe on 17/09/16.
 */
import {Component, EventEmitter, Input, Output} from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-week-calendar',
  templateUrl: 'week-calendar.component.html',
  styleUrls: ['week-calendar.component.scss']
})
export class WeekCalendarComponent {

  @Input() markedDays: string[] = [];
  @Input() disabledDays: string[] = [];
  @Output() dateSelected = new EventEmitter<moment.Moment>();

  private privateSelectedDate = moment();
  selectedMonth = 0;
  selectedYear = 0;
  selectedMonthString = '';
  currentWeek = 0;
  currentWeek2 = 0;
  currentWeekDays = [[], [], []];
  lastChange = Date.now();

  preDiv = 0;
  currentDiv = 1;
  posDiv = 2;

  noTransition = false;

  transform = 0;

  get selectedDate() {
    return this.privateSelectedDate;
  }

  set selectedDate(date) {
    this.privateSelectedDate = date;
    this.dateSelected.emit(this.privateSelectedDate);
  }

  constructor() {
    this.getWeekData();
  }

  addWeek() {

    if (Date.now() - this.lastChange > 350) {
      this.lastChange = Date.now();
      this.currentWeek++;
      this.delayedOp('up');
    }

  }

  subWeek() {

    // Evita que o evento swipe e panend disparem juntos e movem duas semanas ao mesmo tempo
    if (Date.now() - this.lastChange > 350) {
      this.lastChange = Date.now();
      this.currentWeek--;
      this.delayedOp('down');
    }

  }

  delayedOp(direction) {

    setTimeout(() => {
      this.currentWeek2 = this.currentWeek;
      if (direction === 'up') {
        const pre = this.preDiv;
        this.preDiv = this.currentDiv;
        this.currentDiv = this.posDiv;
        this.posDiv = pre;

        this.selectedDate = this.currentWeekDays[this.currentDiv][0];
        this.getWeekData(this.posDiv);
      } else {
        const pos = this.posDiv;
        this.posDiv = this.currentDiv;
        this.currentDiv = this.preDiv;
        this.preDiv = pos;

        this.selectedDate = this.currentWeekDays[this.currentDiv][0];
        this.getWeekData(this.preDiv);
      }
    }, 330);

  }

  selectDate(date) {
    if (date) {
      this.selectedDate = date;
      this.getDateInfo();
    }
  }

  getWeekData(position = 0) {

    // Recalcula somente a posição informada
    if (position) {
      this.currentWeekDays[position] = [];
      for (let x = 0; x < 7; x++) {
        const day = position === this.currentDiv ? moment(this.selectedDate).startOf('week').add(x, 'day') : position === this.preDiv ?
          moment(this.selectedDate).subtract(1, 'week').startOf('week').add(x, 'day') :
          moment(this.selectedDate).add(1, 'week').startOf('week').add(x, 'day');
        this.currentWeekDays[position].push(day);
      }
    } else {
      // Recalcula todas as posições
      this.currentWeekDays[0] = [];
      this.currentWeekDays[1] = [];
      this.currentWeekDays[2] = [];
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 7; x++) {
          const day = y === this.currentDiv ? moment(this.selectedDate).startOf('week').add(x, 'day') : y === this.preDiv ?
            moment(this.selectedDate).subtract(1, 'week').startOf('week').add(x, 'day') :
            moment(this.selectedDate).add(1, 'week').startOf('week').add(x, 'day');
          this.currentWeekDays[y].push(day);
        }
      }
    }

    this.getDateInfo();

  }

  panStart(e) {
    this.transform = e.deltaX;
    this.noTransition = true;
  }

  panMove(e) {
    this.transform = e.deltaX;
  }

  swipeRight(e) {
    this.subWeek();
    this.transform = 0;
  }

  swipeLeft(e) {
    this.addWeek();
    this.transform = 0;
  }

  panEnd(e) {
    this.noTransition = false;
    if (Math.abs(e.deltaX) > 190) {
      if (e.deltaX > 0) {
        this.subWeek();
      } else {
        this.addWeek();
      }
    }
    this.transform = 0;
  }

  getDateInfo() {
    this.selectedMonth = this.selectedDate.month();
    this.selectedMonthString = this.getMonthName();
    this.selectedYear = this.selectedDate.year();
  }

  getMonthName(month = this.selectedMonth) {
    switch (month + 1) {
      case 1:
        return $localize`Janeiro`;

      case 2:
        return $localize`Fevereiro`;

      case 3:
        return $localize`Março`;

      case 4:
        return $localize`Abril`;

      case 5:
        return $localize`Maio`;

      case 6:
        return $localize`Junho`;

      case 7:
        return $localize`Julho`;

      case 8:
        return $localize`Agosto`;

      case 9:
        return $localize`Setembro`;

      case 10:
        return $localize`Outubro`;

      case 11:
        return $localize`Novembro`;

      case 12:
        return $localize`Dezembro`;

    }
  }

}
