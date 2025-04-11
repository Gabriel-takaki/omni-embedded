import {PipeTransform, Pipe} from "@angular/core";
import * as moment from 'moment';
import * as _ from 'lodash';
import {StatusService} from "../services/status.service";

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'filterTasksAgentDashboard'})
export class FilterTasksAgentDashboardPipe implements PipeTransform {

  constructor(private status: StatusService) {
  }

  transform(tasks: any, search: string, actions = [], period = 0, counter = 0) {

    let result = [];

    // Filtra por data
    for (const x of tasks) {

      if (actions.includes(x.action)) {
        result.push(x);
      }

    }

    if (period !== 0) {
      const tmpTasks = result;
      result = [];

      const initialDate = period === 1 ? moment().startOf('day') :
        period === 2 ? moment().add(1, 'day').startOf('day') :
          moment().startOf('week');
      const finalDate = period === 1 ? moment().endOf('day') :
        period === 2 ? moment().add(1, 'day').endOf('day') :
          moment().endOf('week');

      for (const x of tmpTasks) {

        if ([1, 2, 3].includes(period)) {
          if (x.duedate?.isBetween?.(initialDate, finalDate, '', true) ||
            x.schedulebegin?.isBetween?.(initialDate, finalDate, '', true)) {
            result.push(x);
          }
        } else if (period === 4) {
          const initialDate = moment();
          if (x.duedate?.isBefore?.(initialDate) || x.scheduleend?.isBefore?.(initialDate)) {
            result.push(x);
          }
        }

      }
    }


    // Filtra por texto da busca
    if (search) {
      const tmp = result;
      result = [];
      for (const task of tmp) {
        if (task.title?.toLowerCase().includes(search.toLowerCase())) {
          result.push(task);
        }
        for (const contactId of task.contacts) {
          const contact = this.status.allContactsMap[contactId];
          if (contact?.name?.toLowerCase().includes(search.toLowerCase()) ||
            contact?.number?.toLowerCase().includes(search.toLowerCase())) {
            result.push(task);
            break;
          }
        }
      }
    }

    result = _.orderBy(result, ['schedulebegin', 'duedate'], ['asc', 'asc']);
    return result;

  }

}
