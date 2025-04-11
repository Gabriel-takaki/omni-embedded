import {PipeTransform, Pipe} from "@angular/core";
import * as _ from 'lodash';

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'availableAgents'})
export class AvailableAgentsPipe implements PipeTransform {

  transform(agents: any, counter: number = 0) {

    let result;
    result = _.filter(agents, this.filter);
    result = _.orderBy(result, ['locked', 'paused', 'queueLogged', 'fullName'], ['desc', 'desc', 'desc', 'asc']);
    return result;

  }

  filter(o) {

    return o.available && (o.type === 2 || o.type === 4 || o.type === 3);

  }

}
