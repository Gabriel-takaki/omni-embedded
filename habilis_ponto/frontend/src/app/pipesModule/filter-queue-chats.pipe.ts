import {PipeTransform, Pipe} from "@angular/core";
import * as _ from 'lodash';
import {StatusService} from "../services/status.service";

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'filterQueueItemsPipe'})
export class FilterQueueItemsPipePipe implements PipeTransform {

  constructor(private status: StatusService) {
  }

  transform(items: any, filter: string, isCall = false, resultsLimit = 0) {

    const trimmedFilter = filter?.trim().toLowerCase();

    if (trimmedFilter && trimmedFilter.length >= 2) {

      const result = [];

      if (!isCall) {
        // Alimenta primeiro os chats encontrados
        for (const chat of items) {
          const x = this.status.allChatsMap[chat];
          if (x) {
            if (x.clientName?.toLowerCase().includes(trimmedFilter) ||
              x.clientNumber?.toLowerCase().includes(trimmedFilter) ||
              x.clientEmail?.toString().toLowerCase().includes(trimmedFilter) ||
              x.clientUsername?.toString().toLowerCase().includes(trimmedFilter) ||
              x.clientProfileName?.toString().toLowerCase().includes(trimmedFilter)) {
              result.push(chat);
            }
          }
        }
      } else {
        // Alimenta primeiro os chats encontrados
        for (const call of items) {
          if (call.number?.toLowerCase().includes(trimmedFilter)) {
            result.push(call);
          }
        }
      }

      if (resultsLimit > 0) {
        return result.slice(0, resultsLimit);
      }

      return result;

    } else {

      if (resultsLimit > 0) {
        return items?.slice(0, resultsLimit) || [];
      }
      return items || [];

    }

  }

}
