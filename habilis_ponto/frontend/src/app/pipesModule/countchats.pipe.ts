import {PipeTransform, Pipe} from "@angular/core";
import * as _ from 'lodash';

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'countChats'})
export class CountChatsPipe implements PipeTransform {
  transform(chats: any, counter: string) {

    let result = 0;
    for (const x of chats) {

        if (counter === "notRespondend" && !x.responded && !x.userResponded) {
          result++;
        } else if (counter === "respondedByAny" && x.responded && !x.userResponded) {
          result++;
        } else if (counter === "respondedByAgent" && x.userResponded) {
          result++;
        }

    }

    return result;

  }
}
