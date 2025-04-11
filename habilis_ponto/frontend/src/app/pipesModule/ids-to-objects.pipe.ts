import {PipeTransform, Pipe} from "@angular/core";

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'idstoobjects'})
export class IdsToObjectsPipe implements PipeTransform {

  transform(ids: any, objectMap, counter = 0) {

    if (!ids || !ids.length) {
      return [];
    }

    const result = [];

    for (const id of ids) {
      const chat = objectMap[id];
      if (chat) {
        result.push(chat);
      }
    }

    return result;


  }


}
