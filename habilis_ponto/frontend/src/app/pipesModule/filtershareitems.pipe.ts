import {PipeTransform, Pipe} from "@angular/core";

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'filterShareItems'})
export class FilterShareItemsPipe implements PipeTransform {

  constructor() {
  }

  transform(chats: any, filter: string) {

    if (filter) {

      const result = [];
      for (const chat of chats) {
        if (chat.clientName?.toLowerCase().includes(filter.toLowerCase()) ||
          chat.name?.toLowerCase().includes(filter.toLowerCase()) ||
          chat.clientEmail?.toString().toLowerCase().includes(filter.toLowerCase()) ||
          chat.queueName?.toString().toLowerCase().includes(filter.toLowerCase()) ||
          chat.clientNumber?.toString().toLowerCase().includes(filter.toLowerCase())) {
          result.push(chat);
        }
      }

      return result;

    } else {
      return chats;
    }

  }
}
