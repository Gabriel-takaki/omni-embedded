import {PipeTransform, Pipe} from "@angular/core";

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'filterSystemMessages'})
export class FilterSystemMessagesPipe implements PipeTransform {

  constructor() {

  }

  transform(messages: any, showSystem = false, counter = 0) {

    return showSystem ? messages : messages.filter((message) => {
      return message.direction !== 'system-info'
    });

  }
}
