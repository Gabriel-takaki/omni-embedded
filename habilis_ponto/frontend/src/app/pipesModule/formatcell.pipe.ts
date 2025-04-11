import {PipeTransform, Pipe} from "@angular/core";
import {CurrencyPipe, DecimalPipe, PercentPipe} from "@angular/common";
/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'formatCell'})
export class FormatCellPipe implements PipeTransform {
  transform(dados: any) {
    if (dados.data.format === 1) {
      const pipe = new CurrencyPipe('BRL');
      return pipe.transform(dados.value, 'BRL', true);
    } else if (dados.data.format === 2) {
      const pipe = new PercentPipe('BRL');
      return pipe.transform(dados.value, '1.' + dados.data.precision.toString() + '-' + dados.data.precision.toString());
    } else {
      const pipe = new DecimalPipe('BRL');
      return pipe.transform(dados.value, '1.' + dados.data.precision.toString() + '-' + dados.data.precision.toString());
    }
  }
}
