import {PipeTransform, Pipe} from "@angular/core";
import {StatusService} from "../services/status.service";

@Pipe({name: 'countUnreadMessages'})
export class CountUnreadMessagesPipe implements PipeTransform {

  constructor(private status: StatusService) {
  }

  transform(messages: any, timestamp: number) {

    let result = 0;
    for (const x of messages) {
      if (!['event', 'system-info'].includes(x.direction) && !x.readedby?.includes(this.status.user?.id)) {
        result++;
      }
    }

    return result;

  }
}
