import {Injectable} from "@angular/core";
import {Opportunity, Task} from '../definitions';
import {v4} from "uuid";
import {CheckListItem} from "../ivr.definitions";

@Injectable({providedIn: 'root'})
export class ModelsService {

  constructor() {

  }

  task(owner, users): Task {
    return {
      title: '',
      fkOpportunity: 0,
      tags: [],
      description: '',
      duedate: null,
      status: 0,
      finishdate: null,
      progress: 0,
      owner,
      schedulebegin: null,
      scheduleend: null,
      checklist: [],
      files: [],
      contacts: [],
      watchers: [],
      alerts: [],
      spenttime: 0,
      users
    };
  }

  checkListItem(): CheckListItem {
    return {id: v4().split('-')[0], title: '', checked: false, isNew: true}
  }

  opportunity(): Opportunity {
    return {
      id: 0,
      clientid: '',
      title: '',
      mainphone: '',
      mainmail: '',
      contactsCount: 0,
      filesCount: 0,
      stagebegintime: 0,
      value: 0,
      recurrentvalue: 0,
      origin: 0,
      formattedlocation: '',
      country: '',
      city: '',
      countrycode: '',
      locationtype: '',
      state: '',
      address1: '',
      address2: '',
      postalcode: '',
      lat: 0,
      lon: 0,
      probability: 0,
      description: '',
      fkCompany: 0,
      fkPipeline: 0,
      fkStage: 0,
      expectedclosedate: null,
      frozenuntil: null,
      visibility: 0,
      createdby: 0,
      responsableid: 0,
      status: 0,
      closedat: null,
      closedby: 0,
      parentopportunity: [],
      contacts: [],
      tags: [],
      files: [],
      products: [],
      notes: [],
      history: [],
      interactions: [],
      tasks: [],
      followers: [],
      formsdata: {},
      processing: false
    };
  }

}
