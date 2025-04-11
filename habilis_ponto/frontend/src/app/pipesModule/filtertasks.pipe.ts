import {PipeTransform, Pipe} from "@angular/core";
import * as moment from 'moment';
import * as _ from 'lodash';
import {StatusService} from "../services/status.service";

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'filterTasks'})
export class FilterTasksPipe implements PipeTransform {

  constructor(private status: StatusService) {
  }

  transform(tasks: any, search: string, filterBy = 0, tags = [],
            orderBy = 0, counter = 0) {

    let result = !filterBy ? tasks : [];

    if (filterBy !== 0) {

      // Filtra por data
      for (const x of tasks) {

        if (!x.duedate) {
          result.push(x);
          continue;
        }

        if ([1, 2].includes(filterBy)) {
          const initialDate = filterBy === 1 ? moment().startOf('day') :
            moment().add(1, 'day').startOf('day');
          const finalDate = filterBy === 1 ? moment().endOf('day') :
            moment().add(1, 'day').endOf('day');
          if (x.duedate.isBetween(initialDate, finalDate, '', true)) {
            result.push(x);
            continue;
          }
        } else if (filterBy === 3) {
          const initialDate = moment().startOf('day');
          if (x.duedate.isBefore(initialDate)) {
            result.push(x);
            continue;
          }
        }

      }

    }

    // Filtra por texto da busca
    if (search) {
      const tmp = [...result];
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

    // Filtra por tags
    if (tags.length) {
      const tmp = [...result];
      result = [];
      for (const task of tmp) {
        let found = false;
        for (const tag of tags) {
          if (task.tags?.includes(tag)) {
            found = true;
            break;
          }
        }
        if (found) {
          result.push(task);
        }
      }
    }

    switch (orderBy) {

      case 0:
        result = _.orderBy(result, ['schedulebegin', 'duedate'], ['asc', 'asc']);
        break;

      case 1:
        result = _.orderBy(result, ['schedulebegin', 'duedate'], ['desc', 'desc']);
        break;

      case 2:
        result = _.orderBy(result, ['progress'], ['asc']);
        break;

      case 3:
        result = _.orderBy(result, ['progress'], ['desc']);
        break;

      case 4:
        result = _.orderBy(result, ['duedate'], ['asc']);
        break;

      case 5:
        result = _.orderBy(result, ['duedate'], ['desc']);
        break;

    }

    return result;

  }

}
