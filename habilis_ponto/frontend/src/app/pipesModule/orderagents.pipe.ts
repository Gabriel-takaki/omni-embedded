import {PipeTransform, Pipe} from "@angular/core";
import * as _ from "lodash";

@Pipe({name: 'orderAgents'})
export class OrderAgentsPipe implements PipeTransform {

  constructor() {
  }

  transform(agents: any, field: string, direction: 'asc' | 'desc', resultsLimit = 0) {

    if (field === 'chatsCount') {
      for (const a of agents) {
        a.chatsCount = a.chats.length;
      }
    } else if (field === 'callsCount') {
      for (const a of agents) {
        a.callsCount = a.calls.length;
      }
    }

    const result = _.orderBy(agents, ['locked', 'paused', 'queueLogged', field], ['desc', 'desc', 'desc', direction]);

    if (resultsLimit > 0) {
      return result.slice(0, resultsLimit);
    }
    return result;

  }
}
