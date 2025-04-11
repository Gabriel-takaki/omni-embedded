import {PipeTransform, Pipe} from "@angular/core";

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'limitTextSize'})
export class LimitTextSizePipe implements PipeTransform {
  transform(dados: any, size: number = 0) {

    if (dados && size > 0 && dados.length > size) {

      return dados.substr(0, size) + '..';

    } else {

      return dados;

    }

  }
}
