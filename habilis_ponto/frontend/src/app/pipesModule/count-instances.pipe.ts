import {PipeTransform, Pipe} from "@angular/core";

@Pipe({name: 'countInstances'})
export class CountInstancesPipe implements PipeTransform {
  transform(instances: any, filterType: number) {

    let result = 0;
    for (const x of instances) {
      if (x.statusCode === filterType) {
          result++;
      }
    }

    return result;

  }
}
