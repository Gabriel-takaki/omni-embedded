import {PipeTransform, Pipe} from "@angular/core";

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'weekDayNumberToText'})
export class WeekDayNumberToTextPipe implements PipeTransform {
  transform(dados: any, format: string = 'short') {

    dados = Number(dados);

    if (format === 'short') {

      return dados === 0 ? $localize`:Domingo:Dom` : dados === 1 ? $localize`:Segunda-feira:Seg` : dados === 2 ?
        $localize`:Terça-feira:Ter` : dados === 3 ? $localize`:Quarta-feira:Qua` : dados === 4 ? $localize`:Quinta-feira:Qui` :
          dados === 5 ? $localize`:Sexta-feira:Sex` : $localize`:Sábado:Sáb`;


    } else if (format === 'firstFull') {

      return dados === 0 ? $localize`Domingo` : dados === 1 ? $localize`:Dia da semana:Segunda` : dados === 2 ? $localize`:Dia da semana:Terça` :
        dados === 3 ? $localize`:Dia da semana:Quarta` : dados === 4 ? $localize`:Dia da semana:Quinta` :
          dados === 5 ? $localize`:Dia da semana:Sexta` : $localize`:Dia da semana:Sábado`;

    } else {

      return dados === 0 ? $localize`Domingo` : dados === 1 ? $localize`Segunda-feira` : dados === 2 ? $localize`Terça-feira` :
        dados === 3 ? $localize`Quarta-feira` : dados === 4 ? $localize`Quinta-feira` :
          dados === 5 ? $localize`Sexta-feira` : $localize`Sábado`;

    }

  }
}
