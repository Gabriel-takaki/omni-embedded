import {PipeTransform, Pipe} from "@angular/core";
import * as _ from 'lodash';

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'countAgents'})
export class CountAgentsPipe implements PipeTransform {
  transform(agents: any, counter: string, queue: number = 0) {

    let result = 0;
    for (const x of agents) {

      const hasQueue = _.find(x.queues, {number: queue});

      if ((queue && hasQueue) || queue === 0) {
        if (counter === "lockedAvaiable" && x.locked && x.avaiable) {
          result++;
        } else if (counter === "lockedNotAvaiable" && x.locked && !x.avaiable) {
          result++;
        } else if (counter === "avaiableLoggedNotInCall" && !x.locked && x.avaiable && x.logged && x.opStatus !== 1 && x.opStatus !== 4) {
          result++;
        } else if (counter === "avaiableLoggedInCall" && !x.locked && x.avaiable && x.logged && (x.opStatus === 1 || x.opStatus === 4)) {
          result++;
        } else if (counter === "avaiableNotLoggedNotInCall" && !x.locked && x.avaiable && !x.logged && x.opStatus !== 1 && x.opStatus !== 4) {
          result++;
        } else if (counter === "avaiableNotLoggedInCall" && !x.locked && x.avaiable && !x.logged && (x.opStatus === 1 || x.opStatus === 4)) {
          result++;
        } else if (counter === "unavaiable" && !x.locked && !x.avaiable) {
          result++;
        } else if (counter === "logged" && x.avaiable && x.logged) {
          result++;
        } else if (counter === "paused" && x.paused && !x.locked) {
          result++;
        } else if (counter === "inCall" && (x.opStatus === 1 || x.opStatus === 2 || x.opStatus === 9) && x.direction === 'in') {
          result++;
        } else if (counter === "outCall" && (x.opStatus === 1 || x.opStatus === 2 || x.opStatus === 9) && x.direction === 'out') {
          result++;
        } else if (counter === "loggedFree" && x.avaiable && x.logged && !x.paused && x.opStatus !== 1 && x.opStatus !== 4) {
          result++;
        } else if (counter === "locked" && x.locked) {
          result++;
        } else if (counter === "queueLogged" && x.queueLogged && !x.paused && !x.locked) {
          result++;
        } else if (counter === "availableNotLogged" && !x.queueLogged && !x.paused && !x.locked) {
          result++;
        }
      }

    }

    return result;

  }
}
