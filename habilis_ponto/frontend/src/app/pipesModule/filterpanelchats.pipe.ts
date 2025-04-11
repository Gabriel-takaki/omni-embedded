import {PipeTransform, Pipe} from "@angular/core";
import {StatusService} from "../services/status.service";

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'filterPanelChats'})
export class FilterPanelChatsPipe implements PipeTransform {

  constructor(private status: StatusService) {
  }

  transform(chats: any, filter: string, filterBy = 0, chatsCount = 0) {

    if (filter) {

      const result = [];
      for (const x of chats) {

        // Se o usuário é supervisor, verifica se o atendimento está atribuído a um dos usuários aos quais ele possue permissão.
        if (this.status.user?.type === 1) {
          // Se o atendimento já está atribuído e o supervisor não possui acesso a esse
          if (x.agentId && !this.status.allAgentsMap[x.agentId]) {
            continue;
          }
        }

        if (filterBy === 0) {
          const agent = this.status.allAgentsMap[x.agentId];
          if ((agent?.fullName?.toLowerCase().includes(filter.toLowerCase()) ||
            agent?.sipUser?.toString().toLowerCase().includes(filter.toLowerCase())) && !result.includes(x)) {
            result.push(x);
            continue;
          }
        }

        if (filterBy === 1) {
          const chat = x;
          if ((chat.clientName?.toLowerCase().includes(filter.toLowerCase()) ||
            chat.name?.toLowerCase().includes(filter.toLowerCase()) ||
            chat.clientEmail?.toString().toLowerCase().includes(filter.toLowerCase()) ||
            chat.queueName?.toString().toLowerCase().includes(filter.toLowerCase()) ||
            chat.clientNumber?.toString().toLowerCase().includes(filter.toLowerCase())) && !result.includes(x)) {
            result.push(x);
            continue;
          }
        }

      }

      return result;

    } else if (this.status.user?.type === 1) {

      // Se o usuário é do tipo supervisor
      const result = [];
      for (const x of chats) {
        // Se o atendimento já está atribuído e o supervisor não possui acesso a esse
        if (x.agentId && !this.status.allAgentsMap[x.agentId]) {
          continue;
        }
        result.push(x);
      }

      return result;

    } else {
      return chats;
    }

  }
}
