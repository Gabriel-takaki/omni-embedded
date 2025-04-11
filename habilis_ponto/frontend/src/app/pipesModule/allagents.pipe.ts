import {PipeTransform, Pipe} from "@angular/core";
import * as _ from 'lodash';

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'allAgents', pure: true})
export class AllAgentsPipe implements PipeTransform {

  transform(agents: any) {

    let result;
    result = _.filter(agents, this.filter);
    // result = _.orderBy(result, ['locked', 'paused', 'queueLogged', 'fullName'], ['desc', 'desc', 'desc', 'asc']);
    return result;

  }

  filter(o) {

    return o.type === 2 || o.type === 4 || o.type === 3;

  }

}
