/**
 * Created by filipe on 19/09/16.
 */
import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {StatusService} from "../services/status.service";

@Component({
    templateUrl: 'confirmation-with-typing.component.html'
})

export class ConfirmationWithTypingComponent implements AfterViewInit {

    confirmationTitle = '';
    confirmationText = '';
    confirmationKeyWord = $localize`APAGAR`;
    confirmationInput = '';

    @ViewChild('yesButton') yesButton: ElementRef<HTMLButtonElement>;
    @ViewChild('confirmationInputElement') confirmationInputElement: ElementRef<HTMLButtonElement>;
    @ViewChild('noButton') noButton: ElementRef<HTMLButtonElement>;

    constructor(private dialogRef: MatDialogRef<ConfirmationWithTypingComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
                public status: StatusService) {

        this.confirmationText = data.text;
        this.confirmationTitle = data.title;
        this.confirmationKeyWord = data.keyword;

    }

    ngAfterViewInit() {
        this.focusTimer();
    }

    handleArrows(e, button) {
        if (['ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) {
            if (button === 'yesButton') {
                this.noButton.nativeElement.focus();
            } else {
                this.yesButton.nativeElement.focus();
            }
            e.stopPropagation();
            e.preventDefault();
        }
    }

    focusTimer() {
        setTimeout(() => {
            if (this.confirmationInputElement && this.confirmationInputElement.nativeElement) {
                this.confirmationInputElement.nativeElement.focus();
            } else {
                this.focusTimer();
            }
        }, 10)
    }

    result(r, e) {
        this.dialogRef.close(r);
        e.preventDefault();
    }

}
