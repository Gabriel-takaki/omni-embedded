import {PipeTransform, Pipe} from "@angular/core";
import * as _ from 'lodash';

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'filterContact'})
export class FilterContactPipe implements PipeTransform {
  transform(dados: any, filter: string = '', timer: number = 0, resultsLimit = 0) {

    let keys = [];

    if (!filter) {
      keys = dados;
    } else {
      for (const x of dados || []) {
        if (x.name?.toLowerCase().includes(filter.toLowerCase()) ||
          x.number?.toString().toLowerCase().includes(filter.toLowerCase())) {
          keys.push(x)
        } else {
          for (const t of (x.tags || [])) {
            if (t.title?.toLowerCase().includes(filter.toLowerCase())) {
              keys.push(x);
              break;
            }
          }
        }
      }
    }

    // const ord = (order === 1) ? ['avaiable', 'description'] : ['avaiable', 'exten'];
    // const testa = keys.length > 1 ? _.orderBy(keys, ord, ['desc', 'asc']) : keys

    // return _.orderBy(keys, ord, ['desc', 'asc']);

    if (resultsLimit > 0) {
      return keys.slice(0, resultsLimit);
    }
    return keys;

  }
}
