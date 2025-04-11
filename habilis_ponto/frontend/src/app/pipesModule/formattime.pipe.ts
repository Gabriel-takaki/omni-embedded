import {PipeTransform, Pipe} from "@angular/core";
import * as moment from 'moment';

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'formatTime'})
export class FormatTimePipe implements PipeTransform {

  transform(dados: any, format: string = 'full', human = false, timeDiff = true) {

    dados = Math.round(dados);

    if (!human) {
      if (format === 'short') {

        const minutes = Math.floor(dados / 60) < 10 ? '0' + Math.floor(dados / 60).toString() : Math.floor(dados / 60).toString();
        const seconds = Math.floor((dados % 3600) % 60) < 10 ? '0' + Math.floor((dados % 3600) % 60).toString() : Math.floor((dados % 3600) % 60).toString();

        return minutes + ':' + seconds;

      } else {

        const hours = Math.floor(dados / 3600) < 10 ? '0' + Math.floor(dados / 3600).toString() : Math.floor(dados / 3600).toString();
        const minutes = Math.floor((dados % 3600) / 60) < 10 ? '0' + Math.floor((dados % 3600) / 60).toString() : Math.floor((dados % 3600) / 60).toString();
        const seconds = Math.floor((dados % 3600) % 60) < 10 ? '0' + Math.floor((dados % 3600) % 60).toString() : Math.floor((dados % 3600) % 60).toString();

        return hours + ':' + minutes + ':' + seconds;

      }
    } else {

      const time = timeDiff ? moment().unix() - dados : dados;

      const days = Math.floor(time / 86400);
      const hours = Math.floor((time % 86400) / 3600);
      const minutes = Math.floor(((time % 86400) % 3600) / 60);

      if (format === 'short') {
        if (!days && !hours && !minutes) {
          return $localize`Agora`;
        } else if (!days && !hours && minutes) {
          return $localize`Há ${minutes} minutos`;
        } else if (!days && hours) {
          if (hours === 1) {
            return $localize`Há ${hours} hora`;
          }
          return $localize`Há ${hours} horas`;
        } else {
          if (days === 1) {
            return $localize`Há ${days} dia`;
          }
          return $localize`Há ${days} dias`;
        }
      } else {
        if (days) {
          return `${days}d ${hours}h`;
        } else {
          return `${hours}h ${minutes}m`;
        }
      }


    }

  }

}
