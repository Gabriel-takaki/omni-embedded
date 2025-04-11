import {PipeTransform, Pipe} from "@angular/core";

@Pipe({name: 'filterIvrWidgetsPipe'})
export class FilterIvrWidgetsPipe implements PipeTransform {

    constructor() {
    }

    transform(elements: any, filter: string, type = 0) {

        const types = [0, type];
        const result = [];

        for (const x of elements) {
            if (types.includes(x.availableAt) && (!filter || (x.title?.toLowerCase().includes(filter?.toLowerCase()) ||
                x.description?.toLowerCase().includes(filter?.toLowerCase())))) {
                result.push(x);
            }
        }

        return result;

    }

}
