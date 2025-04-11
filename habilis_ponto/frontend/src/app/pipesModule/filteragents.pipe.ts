import {PipeTransform, Pipe} from "@angular/core";
import {StatusService} from "../services/status.service";

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'filterAgents'})
export class FilterAgentsPipe implements PipeTransform {

  constructor(private status: StatusService) {
  }

  transform(agents: any, filter: string, filterBy = 0) {

    if (filter) {

      const result = [];
      for (const x of agents) {
        if (!x.hidden) {

          if (filterBy === 0) {
            if ((x.fullName?.toLowerCase().includes(filter.toLowerCase()) ||
              x.userName?.toLowerCase().includes(filter.toLowerCase()) ||
              x.sipUser?.toString().toLowerCase().includes(filter.toLowerCase())) && !result.includes(x)) {
              result.push(x);
              continue;
            }
            const tags = x.tags?.map((e) => e?.toLowerCase());
            if (tags?.length) {
              for (const t of tags) {
                if (t.includes(filter.toLowerCase()) && !result.includes(x)) {
                  result.push(x);
                  break;
                }
              }
            }
          }

          if (filterBy === 1) {
            for (const c of x.chats) {
              const chat = this.status.allChatsMap[c];
              if ((chat.clientName?.toLowerCase().includes(filter.toLowerCase()) ||
                chat.name?.toLowerCase().includes(filter.toLowerCase()) ||
                chat.clientEmail?.toString().toLowerCase().includes(filter.toLowerCase()) ||
                chat.queueName?.toString().toLowerCase().includes(filter.toLowerCase()) ||
                chat.clientNumber?.toString().toLowerCase().includes(filter.toLowerCase())) && !result.includes(x)) {
                result.push(x);
                break;
              }
            }
          }

        }
      }

      return result;

    } else {
      return agents;
    }

  }
}
