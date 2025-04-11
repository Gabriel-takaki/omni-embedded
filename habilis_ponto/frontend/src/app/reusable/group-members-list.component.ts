/**
 * Created by filipe on 19/09/16.
 */
import {Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {StatusService} from "../services/status.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import * as _ from "lodash";
import {SimpleUser} from "../definitions";

@Component({
  templateUrl: 'group-members-list.component.html',
  styleUrls: ['group-members-list.component.scss'],
  animations: [
    trigger('visibilityState', [
      state('void', style({
        opacity: 0
      })),
      transition('void <=> visible', [
        animate('0.3s ease-in-out')
      ])
    ])
  ]
})
export class GroupMembersListComponent {

  searchText = '';
  groupId = 0;
  itens: SimpleUser[] = [];

  scrollMax = 15;
  resetScrollMaxTimer = null;

  @ViewChild('usersList') usersList: ElementRef<HTMLDivElement>;

  constructor(private dialogRef: MatDialogRef<GroupMembersListComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              public service: StatusService) {

    this.groupId = data?.groupId;
    this.itens = service.allUsers.filter(i => {
      return [0, 98, 99].includes(i.type) || i.contactsGroups.includes(this.groupId);
    });

  }

  scrollEvent() {
    if (this.usersList.nativeElement.scrollTop > this.usersList.nativeElement.scrollHeight - this.usersList.nativeElement.offsetHeight - 200) {
      this.scrollMax = this.scrollMax + 15 >= this.itens.length ? this.itens.length : this.scrollMax + 15;
    }
    if (this.resetScrollMaxTimer) {
      clearTimeout(this.resetScrollMaxTimer);
    }
    if (this.usersList.nativeElement.scrollTop < 150) {
      this.resetScrollMaxTimer = setTimeout(() => {
        this.resetScrollMaxTimer = null;
        this.scrollMax = 15;
      }, 1000);
    }
  }

  keyPress(e, i) {
    if (e.code === 'ArrowDown') {
      this.keytab(e, 1);
    } else if (e.code === 'ArrowUp') {
      this.keytab(e, -1);
    }
  }

  keytab(event, direction = 1) {
    const curIndex = event.target.tabIndex;
    const inputs = document.querySelectorAll('.selection-item');
    for (const i of Array.from(inputs)) {
      // @ts-ignore
      if (i.tabIndex === (curIndex + direction)) {
        // @ts-ignore
        i.focus();
        break;
      }
    }
  }

  close() {
    this.dialogRef.close(false);
  }

}
