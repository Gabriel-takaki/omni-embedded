import {PipeTransform, Pipe} from "@angular/core";
import * as _ from 'lodash';

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'filterReasons'})
export class FilterReasonsPipe implements PipeTransform {
  transform(reasons: any, filter: string) {

    if (filter) {

      const result = [];
      for (const x of reasons) {
        if (x.text?.toLowerCase().includes(filter.toLowerCase())) {
          result.push(x);
        }
      }

      return result;

    } else {
      return reasons;
    }

  }
}
