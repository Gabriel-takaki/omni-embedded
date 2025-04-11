import {PipeTransform, Pipe} from '@angular/core';
import * as moment from 'moment';

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'timeFromTimestamp'})
export class TimeFromTimestampPipe implements PipeTransform {

  transform(dados: any, format: string = 'full') {

    if (typeof dados === 'number') {
      return moment.unix(dados).format('DD/MM/YYYY - HH:mm:ss');
    } else {
      return '';
    }

  }
}
