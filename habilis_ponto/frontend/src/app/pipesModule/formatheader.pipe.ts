import {PipeTransform, Pipe} from "@angular/core";

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'formatHeader'})
export class FormatHeaderPipe implements PipeTransform {
  transform(dados: any, position: any) {
    const arr = dados.column.caption.split("|||");
    return arr[position];
  }
}
