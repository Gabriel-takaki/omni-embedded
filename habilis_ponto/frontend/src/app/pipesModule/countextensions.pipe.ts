import {PipeTransform, Pipe} from "@angular/core";

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'countExtensions'})
export class CountExtensionsPipe implements PipeTransform {
  transform(extens: any, counter: string) {

    let result = 0;
    for (const x of extens) {
      if (counter === "avaiable" && x.avaiable) {
        result++;
      } else if (counter === "notAvaiable" && !x.avaiable) {
        result++;
      } else if (counter === "inCall" && x.avaiable && x.incall) {
        result++;
      }
    }

    return result;

  }
}
