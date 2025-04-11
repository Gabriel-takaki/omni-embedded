import {PipeTransform, Pipe} from "@angular/core";
import * as _ from "lodash";
import {StatusService} from "../services/status.service";

@Pipe({name: 'orderChats'})
export class OrderChatsPipe implements PipeTransform {

  constructor(private status: StatusService) {
  }

  transform(chats: any, field: string, direction: 'asc' | 'desc', chatsCount = 0, resultsLimit = 0) {

    if (field === 'agentName') {
      for (const a of chats) {
        a.agentName = this.status.allAgentsMap[a.agentId]?.fullName;
      }
    } else if (field === 'openTimeCount') {
      for (const a of chats) {
        a.openTimeCount = this.status.now - a.beginTime;
      }
    } else if (field === 'desigTimeCount') {
      for (const a of chats) {
        a.desigTimeCount = !a.agentId ? 0 : this.status.now - a.desigBeginTime;
      }
    }

    const result = _.orderBy(chats, ['sessionLocked', 'responded', 'userResponded', field], ['desc', 'asc', 'asc', direction]);

    if (resultsLimit > 0) {
      return result.slice(0, resultsLimit);
    }

    return result;

  }
}
