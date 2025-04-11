/**
 * Created by filipe on 08/10/16.
 */

import {Injectable} from "@angular/core";
import {StatusService} from "./status.service";

@Injectable({providedIn: 'root'})
export class IvrService {

    lineSize = 4
    defaultLineColor = '#8e8e8e';
    defaultBlueColor = '#29bdff';
    defaultOrangeColor = '#ff784b';
    defaultPurpleColor = '#9400d3'
    defaultRedColor = '#ff3b3b';
    defaultGreenColor = '#06c270';

    draggingElement = false;

    constructor(private status: StatusService) {

    }

    /**
     * Limpa todas as linhas de conexão que ligam a um elemento de destino
     * @param id - ID do elemento de destino cujas conexões serão limpas
     */
    clearConnections(id) {
        if (this.status.selectedIvr.initialtext === id) {
            this.status.selectedIvr.initialtext = '';
            this.removeLine(this.status.selectedIvr['ivr-start-outLine']);
            this.status.selectedIvr['ivr-start-outLine'] = '';
        }
        if (this.status.selectedIvr.finishtext === id) {
            this.status.selectedIvr.finishtext = '';
            this.removeLine(this.status.selectedIvr['ivr-timeout-outLine']);
            this.status.selectedIvr['ivr-timeout-outLine'] = '';
        }
        for (const widget of this.status.selectedIvr.options) {
            for (const option of (widget.config.options || [])) {
                if (option.nextElementId === id) {
                    this.removeLine(option.outLine);
                    option.outLine = null;
                    option.nextElementId = '';
                }
            }
            if (widget.config.nextElementId === id) {
                widget.config.nextElementId = '';
                this.removeLine(widget.outLine);
                widget.outLine = '';
            }
            if (widget.config.transferNextElementId === id) {
                widget.config.transferNextElementId = '';
                this.removeLine(widget.transferOutLine);
                widget.transferOutLine = '';
            }
        }
    }

    removeLine(line) {
        try {
            line?.remove();
        } catch (e) {
            console.log(e);
        }
    }

    droppedConnection(element, event) {
        if (event.item.data.id !== element.id) {
            if (event.item.data.id === 'ivr-start') {
                this.status.selectedIvr.initialtext = element.id;
            } else if (event.item.data.id === 'ivr-timeout') {
                this.status.selectedIvr.finishtext = element.id;
            } else {
                for (const o of (this.status.selectedIvr?.options || [])) {
                    if (o.id === event.item.data.id) {
                        if (event.item.data.option) {
                            if (event.item.data.option === 'transfer') {
                                o.config.transferNextElementId = element.id;
                            } else {
                                for (const option of (o.config.options || [])) {
                                    if (option.id === event.item.data.option) {
                                        option.nextElementId = element.id;
                                    }
                                }
                            }
                        } else {
                            o.config.nextElementId = element.id;
                        }
                    }
                }
            }
        }
    }

    updateArrivingLines(element) {
        for (const o of (this.status.selectedIvr?.options || [])) {
            if (o.config.nextElementId === element.id && o.outLine) {
                this.positionLine(o.outLine);
            }
            if (o.config.transferNextElementId === element.id && o.transferOutLine) {
                this.positionLine(o.transferOutLine);
            }
            if ([2, 8, 11].includes(o.type)) {
                for (const option of (o.config.options || [])) {
                    if (option.nextElementId === element.id && option.outLine) {
                        this.positionLine(option.outLine);
                    }
                }
            }
        }
        if (this.status.selectedIvr?.initialtext === element.id && this.status.selectedIvr['ivr-start-outLine']) {
            this.positionLine(this.status.selectedIvr['ivr-start-outLine']);
        }
        if (this.status.selectedIvr?.finishtext === element.id && this.status.selectedIvr['ivr-timeout-outLine']) {
            this.positionLine(this.status.selectedIvr['ivr-timeout-outLine']);
        }
    }

    positionLine(line) {
        if (line) {
            try {
                line.position();
            } catch (e) {

            }
        }
    }

}
