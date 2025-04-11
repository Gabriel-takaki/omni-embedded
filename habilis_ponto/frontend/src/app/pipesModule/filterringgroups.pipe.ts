import {PipeTransform, Pipe} from "@angular/core";
import * as _ from 'lodash';

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'filterRingGroups'})
export class FilterRingGroupsPipe implements PipeTransform {
  transform(dados: any, filter: string = '') {

    let keys = [];

    if (filter === '') {
      keys = dados;
    } else {
      for (const x of dados) {
        if (x.description.toLowerCase().includes(filter.toLowerCase()) || x.grpnum.toString().toLowerCase().includes(filter.toLowerCase()) || x.grplist.toString().toLowerCase().includes(filter.toLowerCase())) {
          keys.push(x)
        }
      }
    }

    // const ord = (order === 1) ? ['avaiable', 'description'] : ['avaiable', 'exten'];
    // const testa = keys.length > 1 ? _.orderBy(keys, ord, ['desc', 'asc']) : keys

    // return _.orderBy(keys, ord, ['desc', 'asc']);
    return keys;

  }
}
