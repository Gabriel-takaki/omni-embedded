import {PipeTransform, Pipe} from "@angular/core";
import * as _ from "lodash";
import {StatusService} from "../services/status.service";

@Pipe({name: 'orderInternalChats'})
export class OrderInternalChatsPipe implements PipeTransform {

  constructor(private status: StatusService) {
  }

  transform(chats: any[]) {
    return _.orderBy(chats, ['lastMessageTimestamp'], ['desc']);
  }
}
