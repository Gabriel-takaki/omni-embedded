/**
 * Created by filipe on 18/09/16.
 */
import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from "@angular/core";
import {StatusService} from "../services/status.service";
import {texts} from "../app.texts";
import {BASE_URL} from "../app.consts";
import * as momentjs from "moment/moment";
import {HttpClient} from "@angular/common/http";

@Component({
    selector: 'app-task-action-selection',
    templateUrl: './task-action-selection.component.html',
    styleUrls: ['./task-action-selection.component.scss'],
})
export class TaskActionSelectionComponent implements OnChanges {

    @Input() action: any = 0;
    @Input() actionData: any = '';
    @Output() selectionChange: EventEmitter<any> = new EventEmitter();
    @Input() fontSize: any = 12;
    @Input() editable = false;
    @Input() contacts = [];
    
    contactsMap = {};

    constructor(public status: StatusService, private http: HttpClient) {

    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.contacts) {
            for (const contact of this.contacts) {
                if (!this.contactsMap[contact]) {
                    this.contactsMap[contact] = {loading: true};
                    this.loadContact(contact);
                }
            }
        }
    }

    loadContact(id) {

        this.http.post(BASE_URL + '/contacts/getContact', {id}).subscribe((r: any) => {
            this.contactsMap[id].id = r.id || '';
            this.contactsMap[id].name = r.name || this.contactsMap[id].name || '';
            this.contactsMap[id].number = r.number || this.contactsMap[id].number || '';
            this.contactsMap[id].gbid = r.gbid || this.contactsMap[id].gbid || '';
            this.contactsMap[id].instagram = r.instagram || this.contactsMap[id].instagram || '';
            this.contactsMap[id].facebook = r.facebook || this.contactsMap[id].facebook || '';
            this.contactsMap[id].email = r.email || this.contactsMap[id].email || '';
            this.contactsMap[id].comments = r.comments || '';
            this.contactsMap[id].preferredagent = r.preferredagent?.id || 0;
            this.contactsMap[id].external = r.external || '';
            this.contactsMap[id].postalcode = r.postalcode || '';
            this.contactsMap[id].address = r.address || '';
            this.contactsMap[id].city = r.city || '';
            this.contactsMap[id].neighborhood = r.neighborhood || '';
            this.contactsMap[id].state = r.state || '';
            this.contactsMap[id].country = r.country || '';
            this.contactsMap[id].addresscomp = r.addresscomp || '';
            this.contactsMap[id].housenumber = r.housenumber || '';
            this.contactsMap[id].document = r.document || '';
            this.contactsMap[id].fk_company = r.fk_company || 0;
            this.contactsMap[id].free1 = r.free1 || '';
            this.contactsMap[id].free2 = r.free2 || '';
            this.contactsMap[id].donotdisturb = r.donotdisturb || false;
            this.contactsMap[id].blockmarketingcampaigns = r.blockmarketingcampaigns || false;
            this.contactsMap[id].blockutilitiescampaigns = r.blockutilitiescampaigns || false;
            this.contactsMap[id].tags = r.tagsIds || [];
            this.contactsMap[id].groups = r.groups || [];
            this.contactsMap[id].birthdate = r.birthdate ? momentjs(r.birthdate) : null;
            this.contactsMap[id].preferredagents = r.preferredagents?.length ? r.preferredagents : r.preferredagent ? [r.preferredagent] : [];
            this.contactsMap[id].tagsTmp = new Set(r.tagsIds);
            this.contactsMap[id].extradata = r.extradata;
        }, err => {
        });

    }

    select(id, contact, title = '') {
        this.selectionChange.emit({
            actionId: id,
            actionTitle: title,
            actionData: contact?.number ? `${contact.number} [${contact.name}]` : ''
        });
    }

    protected readonly texts = texts;
}
