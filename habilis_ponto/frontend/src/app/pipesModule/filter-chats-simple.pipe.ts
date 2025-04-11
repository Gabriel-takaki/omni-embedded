import {PipeTransform, Pipe} from "@angular/core";
import * as _ from 'lodash';

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'filterChatsSimple'})
export class FilterChatsSimplePipe implements PipeTransform {
  transform(chats: any, filter: string, call = false) {

    const trimmedFilter = filter?.trim().toLowerCase();

    if (trimmedFilter) {

      const result = [];

      if (!call) {
        // Alimenta primeiro os chats encontrados
        for (const x of chats) {
          if (x.clientName?.toLowerCase().includes(trimmedFilter) ||
            x.name?.toLowerCase().includes(trimmedFilter) ||
            x.clientEmail?.toString().toLowerCase().includes(trimmedFilter) ||
            x.queueName?.toString().toLowerCase().includes(trimmedFilter) ||
            x.clientNumber?.toString().toLowerCase().includes(trimmedFilter)) {
            result.push(x);
          }
        }
      } else {
        for (const x of chats) {
          if (x.clientName?.toLowerCase().includes(trimmedFilter) ||
            x.number?.toLowerCase().includes(trimmedFilter) ||
            x.clientDocument?.toString().toLowerCase().includes(trimmedFilter)) {
            result.push(x);
          }
        }
      }

      return result;
    } else {
      return chats;
    }

  }

}
