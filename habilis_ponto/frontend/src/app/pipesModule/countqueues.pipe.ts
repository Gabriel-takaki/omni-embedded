import {PipeTransform, Pipe} from "@angular/core";
import {FormatTimePipe} from "./formattime.pipe";
import {PercentPipe} from "@angular/common";

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'countQueues'})
export class CountQueuesPipe implements PipeTransform {

  transform(queues: any, counter: string, queue: number = 0, unformatted = false) {

    let result = 0;
    let totalWeight = 0;
    for (const x of queues) {
      if ((queue && x.number === queue) || queue === 0) {
        if (counter === "totalCalls") {
          result += x.callscount;
        } else if (counter === "answeredCallsNSLA" || counter === "answeredCallsPNSLA") {
          result += x.nsla;
          totalWeight += x.callscount;
        } else if (counter === "answeredCallsSLA" || counter === "answeredCallsPSLA") {
          result += x.sla;
          totalWeight += x.callscount;
        } else if (counter === "abandonedCalls" || counter === "abandonedCallsP") {
          result += x.abandonedcount;
          totalWeight += x.callscount;
        } else if (counter === "TMA") {
          result += x.talktime;
          totalWeight += x.answeredcount;
        } else if (counter === "TME") {
          result += x.holdtime;
          totalWeight += x.answeredcount;
        }
      }
    }

    if (counter === 'abandonedCallsP' || counter === 'answeredCallsPNSLA' || counter === 'answeredCallsPSLA') {
      const pipe = new PercentPipe(navigator.language);
      return pipe.transform(totalWeight > 0 && result > 0 ? (result / totalWeight) : 0, '1.0-0');
    } else if (counter !== 'TMA' && counter !== 'TME') {
      return result;
    } else {

      if (unformatted) {
        return (totalWeight > 0 ? result / totalWeight : 0);
      } else {
        const pipe = new FormatTimePipe();
        return pipe.transform(totalWeight > 0 ? result / totalWeight : 0);
      }

    }


  }
}
