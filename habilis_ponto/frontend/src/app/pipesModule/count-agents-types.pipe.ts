import {PipeTransform, Pipe} from "@angular/core";

@Pipe({name: 'countAgentsPerType'})
export class CountAgentsTypesPipe implements PipeTransform {
  transform(agents: any, filterType: number) {

    let result = 0;
    for (const x of agents) {
      if (x.type === filterType) {
          result++;
      }
    }

    return result;

  }
}
