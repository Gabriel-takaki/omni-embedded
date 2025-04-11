import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {StatusService} from 'app/services/status.service';
import {YesNoComponent} from './yes-no.component';

@Component({
    selector: 'ca-conclude-task',
    templateUrl: './conclude-task.component.html',
    styleUrls: ['./conclude-task.component.scss']
})
export class ConcludeTaskComponent implements AfterViewInit {

    taskId;
    big = false;
    @ViewChild('yesAndNewButton') yesAndNewButton: ElementRef<HTMLButtonElement>;

    constructor(private dialogRef: MatDialogRef<YesNoComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
                public status: StatusService) {

    }

    ngAfterViewInit() {
        this.focusTimer();
    }

    focusTimer() {
        setTimeout(() => {
            if (this.yesAndNewButton) {
                this.yesAndNewButton.nativeElement.focus();
            } else {
                this.focusTimer();
            }
        }, 50);
    }

    cancel() {
        this.dialogRef.close({conclude: false, reopen: false});
    }

    conclude() {
        this.dialogRef.close({conclude: true, reopen: false});
    }

    concludeAndOpenTask() {
        this.dialogRef.close({conclude: true, reopen: true});
    }

}
