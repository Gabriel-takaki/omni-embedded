import {PipeTransform, Pipe} from '@angular/core';
import * as _ from 'lodash';

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'filterItens', pure: true})
export class FilterItensPipe implements PipeTransform {

  transform(itens: any, filter: any) {

    const firstFilter = this.checkStatus(itens, filter.showInactive);
    let firstList = firstFilter;

    if (filter.filters.length) {

      let secondList = firstFilter;

      for (const e of filter.filters) {
        secondList = [];
        for (const ou of e) {
          const i = this.checkFilter(firstList, secondList, ou);
          secondList = secondList.concat(i);
        }
        firstList = secondList;
      }

    }

    return firstList;

  }

  /**
   * Verifica os items em relação ao filtro
   * @param itens - Lista de items a serem verificados
   * @param dedup - Lista de items já selecionados nesse for OU para não haver duplicação
   * @param filter - Filtro que será verificado
   */
  checkFilter(itens, dedup, filter) {
    const ret = [];
    for (const i of itens) {
      if (i.hasOwnProperty(filter.field)) {
        switch (filter.operator) {
          case '=':
            if (i[filter.field].toString() === filter.value.toString() && !dedup.includes(i)) {
              ret.push(i);
            }
            break;

          case '>':
            if (i[filter.field] > Number(filter.value) && !dedup.includes(i)) {
              ret.push(i);
            }
            break;

          case '>=':
            if (i[filter.field] >= Number(filter.value) && !dedup.includes(i)) {
              ret.push(i);
            }
            break;

          case '<':
            if (i[filter.field] < Number(filter.value) && !dedup.includes(i)) {
              ret.push(i);
            }
            break;

          case '<=':
            if (i[filter.field] <= Number(filter.value) && !dedup.includes(i)) {
              ret.push(i);
            }
            break;

          case '!=':
            if (i[filter.field].toString() !== filter.value.toString() && !dedup.includes(i)) {
              ret.push(i);
            }
            break;
        }
      }
    }
    return ret;
  }

  checkStatus(itens, showInactive) {

    return showInactive ? itens : _.filter(itens, {active: true});

  }

}
