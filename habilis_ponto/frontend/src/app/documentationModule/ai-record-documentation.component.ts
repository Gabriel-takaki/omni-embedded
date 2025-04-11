import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {StatusService} from "../services/status.service";
import {ScreenRecorderService} from "../services/screen-recorder.service";
import {ConfirmAction} from "../reusable/confirmaction.decorator";

@Component({
    templateUrl: 'ai-record-documentation.component.html',
    styleUrls: ['ai-record-documentation.component.scss']
})
export class AiRecordDocumentationComponent {

    public tags = [];
    docRecordingConfig = {
        title: '',
        description: '',
        type: 0,
        createNewAudio: false,
        includeVideo: false,
        faq_groups: [],
        tags: [],
        blob: null
    };

    file = null;
    fileSrc = null;

    processing = false;

    constructor(private dialogRef: MatDialogRef<AiRecordDocumentationComponent>, public status: StatusService,
                private dialog: MatDialog, private screen: ScreenRecorderService, @Inject(MAT_DIALOG_DATA) public data: any) {
        status.docRecordingConfig = this.docRecordingConfig;
        this.file = data.file;
        this.fileSrc = data.fileSrc;
        this.tags = status.faqTags;
    }

    close() {
        this.dialogRef.close();
    }

    startProcessing() {

        this.dialogRef.close();
    }

}
