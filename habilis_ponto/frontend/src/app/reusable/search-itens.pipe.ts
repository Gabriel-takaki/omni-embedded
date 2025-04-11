import {PipeTransform, Pipe} from '@angular/core';

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'searchItens'})
export class SearchItensPipe implements PipeTransform {
  transform(itens: any, searchEnabled: boolean, searchText: string, searchFields: string[], resultsLimit = 0) {

    if (searchEnabled && searchText && searchFields.length) {

      const result = [];
      for (const i of itens) {
        for (const f of searchFields) {
          if (i[f] && !Array.isArray(i[f]) && i[f].toString().toLowerCase().includes(searchText.toLowerCase())) {
            result.push(i);
            break;
          } else if (i[f] && Array.isArray(i[f]) && i[f].join(' ').toLowerCase().includes(searchText.toLowerCase())) {
            result.push(i);
            break;
          }
        }
      }

      if (resultsLimit > 0) {
        return result.slice(0, resultsLimit);
      }

      return result;

    } else if (searchEnabled && searchText) {

      const result = [];

      for (const i of itens) {
        if (i && i.toString().toLowerCase().includes(searchText.toLowerCase())) {
          result.push(i);
          break;
        }
      }

      if (resultsLimit > 0) {
        return result.slice(0, resultsLimit);
      }

      return result;
    } else {
      if (resultsLimit > 0) {
        return itens.slice(0, resultsLimit);
      }
      return itens;
    }

  }
}
