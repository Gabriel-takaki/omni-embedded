/**
 * Created by filipe on 19/09/16.
 */
import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {WebhookConfigFormComponent} from "./webhookconfigform.component";

@Component({
  templateUrl: 'webhookform.component.html'
})
export class WebhookFormComponent {

  public hooks = {
    authStatusHook: '',
    callReceivedHook: '',
    typingHook: '',
    msgReceivedByServerHook: '',
    msgReceivedByUserHook: '',
    msgReceivedHook: '',
    msgDeletedHook: '',
    msgReadedHook: '',
    newChatHook: '',
    chatClosedHook: '',
    apiKey: ''
  };

  constructor(private dialogRef: MatDialogRef<WebhookFormComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialog) {

    this.hooks = data.hooks;

  }

  save() {

    this.dialogRef.close(this.hooks);

  }

  close() {
    this.dialogRef.close();
  }

  openHookConfigEditor(hook) {

    this.dialog.open(WebhookConfigFormComponent);

  }

}
