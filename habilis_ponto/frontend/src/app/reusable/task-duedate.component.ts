/**
 * Created by filipe on 18/09/16.
 */
import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from "@angular/core";
import * as moment from 'moment';
import {StatusService} from "../services/status.service";

@Component({
  selector: 'app-task-duedate',
  templateUrl: './task-duedate.component.html',
  styleUrls: ['./task-duedate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskDuedateComponent implements OnChanges {

  @Input() duedate: any;
  @Input() finishdate: any;
  @Input() taskStatus: any = 0;
  @Input() fontSize: any = 12;
  @Input() editable = false;
  @Input() scheduleMode = false;
  @Input() showScheduleText = false;
  @Output() dateChange: EventEmitter<any> = new EventEmitter();

  date;
  finishDate;

  todayBegin = moment().startOf('day');
  todayEnd = moment().endOf('day');
  tommorowBegin = moment().add(1, 'days').startOf('day');
  tommorowEnd = moment().add(1, 'days').endOf('day');
  now = moment();

  isToday = false;
  isTommorow = false;
  isPast = false;
  finishedDue = false;

  constructor(public status: StatusService) {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('duedate')) {
      this.date = this.duedate?.toDate();
      this.isPast = this.duedate?.isBefore(this.now);
      this.isTommorow = this.duedate?.isBetween(this.tommorowBegin, this.tommorowEnd, '', true);
      this.isToday = this.duedate?.isBetween(this.todayBegin, this.todayEnd, '', true) && this.duedate?.isSameOrAfter(this.now);
      if (this.finishdate) {
        this.finishDate = this.finishdate.toDate();
        this.finishedDue = this.finishdate?.isAfter(this.duedate);
      }
    }
  }

  clearDate(e){
    this.dateChange.emit(null)
    e.stopPropagation();
    e.preventDefault();
  }

  changeDueDate(e) {
    this.dateChange.emit(e.value);
  }

}
