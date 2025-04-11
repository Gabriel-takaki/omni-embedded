import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output
} from '@angular/core';
import {StatusService} from "../services/status.service";

@Component({
    selector: 'app-ai-model-selection',
    templateUrl: 'ai-model-selecion.component.html',
    styleUrls: ['ai-model-selection.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AiModelSelectionComponent {

    @Input() model = 0;
    @Input() disabled = false;
    @Output() modelChange = new EventEmitter<number>();

    constructor(public status: StatusService) {

    }

    change() {
        this.modelChange.emit(this.model);
    }

}
