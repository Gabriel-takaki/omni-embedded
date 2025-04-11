import {PipeTransform, Pipe} from "@angular/core";
import {StatusService} from "../services/status.service";
import * as _ from 'lodash';

/**
 * Created by filipe on 16/02/17.
 */
@Pipe({name: 'filterStageOpportunitiesPipe'})
export class FilterStageOpportunitiesPipe implements PipeTransform {

  constructor(private status: StatusService) {
  }

  transform(opportunities: any[], search = '', tagsFilter = [], showFrozen = false, counter = 0) {

    const result = [];

    if (opportunities?.length) {
      for (const opportunity of opportunities) {
        const origin = this.status.allOriginsMap[opportunity.origin];
        const responsable = this.status.allUsersMap[opportunity.responsableid];
        if ((!search
          || (opportunity.title && opportunity.title?.toLowerCase().indexOf(search.toLowerCase()) !== -1)
          || (opportunity.formattedlocation && opportunity.formattedlocation?.toLowerCase().indexOf(search.toLowerCase()) !== -1)
          || (opportunity.mainphone && opportunity.mainphone?.toLowerCase().indexOf(search.toLowerCase()) !== -1)
          || (opportunity.mainmail && opportunity.mainmail?.toLowerCase().indexOf(search.toLowerCase()) !== -1)
          || (opportunity.id && opportunity.id?.toString().toLowerCase() === search.toLowerCase())
          || (origin?.name && origin?.name?.toLowerCase().indexOf(search.toLowerCase()) !== -1)
          || (responsable?.fullName && responsable?.fullName?.toLowerCase().indexOf(search.toLowerCase()) !== -1))
          && (showFrozen || !opportunity.status)) {
          if (tagsFilter.length) {
             const hasAny = _.intersection(opportunity.tags, tagsFilter).length > 0;
              if (hasAny) {
                result.push(opportunity);
              }
          } else {
            result.push(opportunity);
          }
        }
      }
    }

    return result;

  }

}
