import {Pipe, PipeTransform} from '@angular/core';
import {TemplateParam} from "../definitions";
import {CurrencyPipe} from "@angular/common";
import * as moment from 'moment';

@Pipe({name: 'templateMessageFormattingPipe'})
export class TemplateMessageFormattingPipe implements PipeTransform {

  constructor() {
  }

  transform(msg: string, params: TemplateParam[] = [], formData: any[] = []) {

    if (!msg) {
      return '';
    }

    let message = msg.trim();
    const pipe = new CurrencyPipe(navigator.language);

    if (params?.length) {
      let index = 1;
      for (const param of params) {
        if (formData?.[index - 1]) {
          let replaceValue = formData[index - 1];
          if (param.type === 2 && !isNaN(Number(replaceValue))) {
            replaceValue = pipe.transform(Number(replaceValue), param.currencyCode || 'BRL', true);
          } else if (param.type === 3) {
            replaceValue = moment(replaceValue).format('DD/MM/YYYY');
          }
          message = message.replace(`{{${index}}}`, replaceValue);
        } else if (param.default) {
          let replaceValue = param.default;
          if (param.type === 2 && !isNaN(Number(param.default))) {
            replaceValue = pipe.transform(Number(param.default), param.currencyCode || 'BRL', true);
          } else if (param.type === 3) {
            replaceValue = moment(param.default).format('DD/MM/YYYY');
          }
          message = message.replace(`{{${index}}}`, replaceValue);
        } else {
          message = message.replace(`{{${index}}}`, `{{${param.name}}}`);
        }
        index++;
      }
    }

    let replaces = message?.match(new RegExp(/\*(.*?)\*/g));

    if (replaces?.length) {
      for (const r of replaces) {
        message = message.replace(r, '<b>' + r.replace(new RegExp(/\*/g), '') + '</b>');
      }
    }

    replaces = message?.match(new RegExp(/_(.*?)_/g));

    if (replaces?.length) {
      for (const r of replaces) {
        message = message.replace(r, '<i>' + r.replace(new RegExp(/_/g), '') + '</i>');
      }
    }

    replaces = message?.match(new RegExp(/~(.*?)~/g));

    if (replaces?.length) {
      for (const r of replaces) {
        message = message.replace(r, '<s>' + r.replace(new RegExp(/\~/g), '') + '</s>');
      }
    }

    return message;

  }

}
