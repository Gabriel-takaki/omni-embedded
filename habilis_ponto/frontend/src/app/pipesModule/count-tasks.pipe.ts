import {PipeTransform, Pipe} from "@angular/core";
import {Task} from "../definitions";
import * as moment from "moment";

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'countTasks'})
export class CountTasksPipe implements PipeTransform {
  transform(tasks: Task[], what: number, counter = 0) {

    const now = moment();
    const todayBegin = moment().startOf('day');
    const todayEnd = moment().endOf('day');

    if (!tasks?.length) {
      return 0;
    }

    switch (what) {

      // Retorna a quantidade de tarefas que estão agendadas para hoje
      case 1:
        return tasks.filter(t => t.schedulebegin?.isBetween?.(todayBegin, todayEnd, null, '[]')).length;
      // return tasks.filter(t => t.schedulebegin?.isBetween(todayBegin, todayEnd, null, '[]')).length;

      // Retorna a quantidade de tarefas que vencem hoje
      case 2:
        return tasks.filter(t => t.duedate?.isBetween?.(todayBegin, todayEnd, null, '[]')).length;

      // Retorna a quantidade de tarefas que estão vencidas
      case 3:
        return tasks.filter(t => t.duedate?.isBefore?.(now)).length;

      // Retorna a quantidade de tarefas que estão atrasadas
      case 4:
        return tasks.filter(t => t.schedulebegin?.isBefore?.(now)).length;

    }

  }
}
