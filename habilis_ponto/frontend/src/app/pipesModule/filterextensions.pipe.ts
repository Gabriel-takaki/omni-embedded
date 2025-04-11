import {PipeTransform, Pipe} from "@angular/core";
import * as _ from 'lodash';

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'filterExtensions'})
export class FilterExtensionsPipe implements PipeTransform {

  transform(dados: any, filter: string = '', ringing = false, incall = false, priority = false, paging = false, pageSize = 1, actualPage = 1) {

    let result = [];

    function filterText(exts) {
      let keys = [];
      if (filter === '') {
        keys = exts;
      } else {
        for (const x of exts) {
          if (x.description.toLowerCase().includes(filter.toLowerCase()) || x.exten.toString().toLowerCase().includes(filter.toLowerCase())) {
            keys.push(x)
          }
        }
      }
      return keys;
    }

    function filterActions(exts) {
      let keys = [];
      if (!ringing && !incall && !priority) {
        keys = exts;
      } else {
        for (const x of exts) {
          if ((x.ringing && ringing) || (incall && x.incall) || (priority && x.prime)) {
            keys.push(x);
          }
        }
      }
      return keys;
    }

    result = filterActions(dados);
    result = filterText(result);

    if (paging) {
      result = _.slice(result, actualPage * pageSize, (actualPage + 1) * pageSize > result.length ? result.length : (actualPage + 1) * pageSize);
    }

    return result;

  }
}
