/**
 * Created by filipe on 17/09/16.
 */
import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {StatusService} from "../services/status.service";
import {texts} from "../app.texts";

@Component({
    selector: 'app-client-list-item-face',
    templateUrl: 'client-list-item-face.component.html',
    styleUrls: ['client-list-item-face.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientListItemFaceComponent implements OnChanges {

    @Input() chat: any = {};
    @Input() msgText = '';
    @Input() resultType = 0;

    @Input() msgsCount = 0;
    @Input() index = 0;
    @Input() selected = false;
    @Input() typing = false;
    @Input() now = 0;

    @Input() msgId = '';
    @Input() msgTime = '';

    texts = texts;
    showMarkerTooltip = false;
    lastText = '';

    constructor(public status: StatusService) {
        this.updateLastText();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.msgsCount) {
            this.updateLastText();
        }
    }

    updateLastText() {
        this.lastText = '';
        for (let x = this.chat?.messages?.length - 1; x >= 0; x--) {
            if (['out', 'system-out', 'in'].includes(this.chat?.messages[x]?.direction)) {
                this.lastText = this.chat?.messages[x]?.text;
                break;
            }
        }
        if (!this.lastText) {
            this.lastText = this.chat?.messages?.length ? this.chat?.messages[this.chat?.messages?.length - 1]?.text : '';
        }
    }

    showTooltip(show) {
        if (this.status.isMobile) {
            return;
        }
        this.showMarkerTooltip = show;
    }

}
