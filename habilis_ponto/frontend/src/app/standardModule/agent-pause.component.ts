import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from "@angular/core";
import {StatusService} from "../services/status.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FilterReasonsPipe} from "../pipesModule/filterreasons.pipe";
import {SocketService} from "../services/socket.service";
import {texts} from "../app.texts";

@Component({
  templateUrl: 'agent-pause.component.html',
  styleUrls: ['agent-pause.component.scss']
})
export class AgentPauseComponent implements AfterViewInit {

  public filter = '';
  public allOptions = [];
  public filters = [];
  public selectedItem = 0;
  public filteredItems = [];

  public texts = texts;

  private filterReasonsPipe = new FilterReasonsPipe();

  @ViewChild('searchField') searchField: ElementRef<HTMLInputElement>;
  @ViewChild('scrollDiv') scrollDiv: ElementRef<HTMLDivElement>;

  constructor(private dialogRef: MatDialogRef<AgentPauseComponent>, public status: StatusService,
              @Inject(MAT_DIALOG_DATA) public data: any, private s: SocketService) {

    this.filters = data || [];
    this.allOptions = status.reasons;

  }

  ngAfterViewInit() {
    this.focusTimer();
    setTimeout(() => {
      this.allOptions = this.status.reasons;
      this.applyFilter();
    }, 250);
  }

  handleKeyUp(e) {
    if (e.key === 'ArrowUp') {
      if (this.selectedItem - 1 >= 0) {
        this.changeSelectedItem(this.selectedItem - 1);
      } else {
        this.changeSelectedItem(this.filteredItems.length - 1);
      }
    } else if (e.key === 'ArrowDown') {
      if (this.filteredItems.length - 1 > this.selectedItem) {
        this.changeSelectedItem(this.selectedItem + 1);
      } else {
        this.changeSelectedItem(0);
      }
    } else if (e.key === 'Enter') {
      if (this.filteredItems[this.selectedItem]) {
        this.pause(this.filteredItems[this.selectedItem].id);
      }
    }
  }

  changeSelectedItem(index, ignoreScroll = false) {
    this.selectedItem = index;
    if (index === this.filteredItems.length - 1 && !ignoreScroll) {
      this.scrollDiv?.nativeElement?.scrollTo({
        top: this.scrollDiv.nativeElement.scrollHeight,
        behavior: 'smooth'
      })
    } else if (index > 1 && !ignoreScroll) {
      const scroll = ((index) % 2 === 0);
      if (scroll) {
        this.scrollDiv?.nativeElement?.scrollTo({
          top: Math.min(index * 67, this.scrollDiv.nativeElement.scrollHeight),
          behavior: 'smooth'
        });
      } else if (this.scrollDiv?.nativeElement?.scrollTop > index * 67) {
        this.scrollDiv?.nativeElement?.scrollTo({top: (index - (index % 2)) * 67, behavior: 'smooth'});
      }
    } else {
      if (!ignoreScroll) {
        this.scrollDiv?.nativeElement?.scrollTo({top: 0, behavior: 'smooth'})
      }
    }
  }

  applyFilter() {
    this.filteredItems = this.filterReasonsPipe.transform(this.allOptions, this.filter);
    this.selectedItem = 0;
  }

  focusTimer() {
    setTimeout(() => {
      if (this.searchField) {
        this.searchField.nativeElement.focus();
      } else {
        this.focusTimer();
      }
    }, 50)
  }

  pause(id) {
    this.s.socket.emit('action', {type: 'pauseAgent', paused: true, reason: id});
    this.status.pause.pauseTimeCount = 0;
    this.status.pause.beginTime = Date.now();
    this.dialogRef.close();
  }

}
