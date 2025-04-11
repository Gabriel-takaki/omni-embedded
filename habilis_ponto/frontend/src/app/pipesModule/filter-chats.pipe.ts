import {PipeTransform, Pipe} from "@angular/core";
import * as _ from 'lodash';
import {StatusService} from "../services/status.service";

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'filterChats'})
export class FilterChatsPipe implements PipeTransform {

  constructor(private status: StatusService) {
  }

  transform(chats: any, filter: string, timer: number = 0, advanced = false, markerId = 0) {

    let result = [];

    if (filter) {

      if (filter.length < 3 || !advanced) {
        for (const x of chats) {
          if (x.clientName?.toLowerCase().includes(filter.toLowerCase()) ||
            x.name?.toLowerCase().includes(filter.toLowerCase()) ||
            (x.type === 1 && this.status.allUsersMap[x.id.split('-')[0]]?.fullName?.toLowerCase().includes(filter.toLowerCase())) ||
            x.clientEmail?.toString().toLowerCase().includes(filter.toLowerCase()) ||
            x.queueName?.toString().toLowerCase().includes(filter.toLowerCase()) ||
            x.clientNumber?.toString().toLowerCase().includes(filter.toLowerCase())) {
            result.push({type: 0, chat: x, msgText: '', msgTime: '', msgId: ''});
          }
        }
      } else {

        // Alimenta primeiro os chats encontrados
        for (const x of chats) {
          if (x.clientName?.toLowerCase().includes(filter.toLowerCase()) ||
            x.name?.toLowerCase().includes(filter.toLowerCase()) ||
            (x.type === 1 && this.status.allUsersMap[x.id.split('-')[0]]?.fullName?.toLowerCase().includes(filter.toLowerCase())) ||
            x.clientEmail?.toString().toLowerCase().includes(filter.toLowerCase()) ||
            x.queueName?.toString().toLowerCase().includes(filter.toLowerCase()) ||
            x.clientNumber?.toString().toLowerCase().includes(filter.toLowerCase())) {
            result.push({type: 0, chat: x, msgText: '', msgTime: 0, msgId: ''});
          }
        }

        // Busca em seguida pelas mensagens
        for (const x of chats) {
          for (const m of x.messages) {
            this.verifyMessage(result, m, x, filter);
          }
          for (const m of x.oldMessages) {
            this.verifyMessage(result, m, x, filter);
          }
        }

        result = _.orderBy(result, ['type', 'msgTime'], ['asc', 'desc']);

      }

    } else {

      for (const c of chats) {
        result.push({type: 0, chat: c, msgText: '', msgTime: '', msgId: ''});
      }

    }

    if (result.length && markerId) {
      return result.filter(x => x.chat.markerId === markerId);
    } else {
      return result;
    }

  }

  verifyMessage(result, m, x, filter) {
    if (m.direction !== 'system-info' && m.text?.toLowerCase().includes(filter.toLowerCase())) {
      const textPos = m.text.toLowerCase().indexOf(filter.toLowerCase());
      const originalText = m.text.slice(textPos, textPos + filter.length);
      const msgSize = 56;
      const initialPos = textPos - (msgSize - filter.length) / 2 > 0 ? textPos - (msgSize - filter.length) / 2 : 0;
      const headText = initialPos > 0 ? '...' : '';
      const finalPos = initialPos + msgSize;
      const tailText = finalPos < m.text.length ? '...' : '';
      const finalText = m.text.slice(initialPos, finalPos).replace(originalText, `<b>${originalText}</b>`);
      result.push({
        type: 1,
        chat: x,
        msgText: `${headText}${finalText}${tailText}`,
        msgTime: m.formattedTime,
        msgId: m.messageid
      });
    }
    if (m.direction !== 'system-info' && m.file_name?.toLowerCase().includes(filter.toLowerCase())) {
      const textPos = m.file_name?.toLowerCase().indexOf(filter.toLowerCase());
      const originalText = m.file_name?.slice(textPos, textPos + filter.length);
      result.push({
        type: 1,
        chat: x,
        msgText: m.file_name?.replace(originalText, `<b>${originalText}</b>`),
        msgTime: m.formattedTime,
        msgId: m.messageid
      });
    }
  }

}
