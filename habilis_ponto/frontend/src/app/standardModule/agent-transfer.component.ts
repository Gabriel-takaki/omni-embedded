import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from "@angular/core";
import {StatusService} from "../services/status.service";
import {FilterAgentsPipe} from "../pipesModule/filteragents.pipe";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {HttpClient} from "@angular/common/http";
import {BASE_URL} from "../app.consts";
import {UtilitiesService} from "../services/utilities.service";

@Component({
  templateUrl: 'agent-transfer.component.html',
  styleUrls: ['agent-transfer.component.scss']
})
export class AgentTransferComponent implements AfterViewInit {

  public filter = '';
  public allOptions = [];
  public filters = [];
  public queueId = 0;
  public selectedItem = 0;
  public filteredItems = [];
  private queueAgents = [];

  private filterAgentsPipe = new FilterAgentsPipe(this.status);

  @ViewChild('searchField') searchField: ElementRef<HTMLInputElement>;
  @ViewChild('scrollDiv') scrollDiv: ElementRef<HTMLDivElement>;

  constructor(private dialogRef: MatDialogRef<AgentTransferComponent>, public status: StatusService,
              @Inject(MAT_DIALOG_DATA) public data: any, public http: HttpClient, private utils: UtilitiesService) {

    console.log(data);

    this.filters = data?.tags || [];
    this.queueId = data?.queueId || 0;
    this.loadAgents();

  }

  ngAfterViewInit() {
    this.focusTimer();
  }

  async loadAgents() {
    if (this.queueId) {
      await this.loadQueueAgents();
    }
    await this.createAgentsList();
  }

  loadQueueAgents() {
    return new Promise((resolve, reject) => {
      this.http.post(`${BASE_URL}/queues/getQueueAgents?t=${Date.now()}`, {id: this.queueId}).subscribe((data: any[]) => {
        this.queueAgents = data || [];
        return resolve(null);
      });
    });
  }

  async createAgentsList() {

    let counter = 0;

    // Constrói a lista de opções de transferência para a própria fila
    for (const f of this.filters) {
      this.allOptions.unshift({
        fullName: 'Transferir para a fila.',
        paused: false,
        logged: false,
        id: f,
        sipUser: f,
        chats: 0,
        calls: 0,
        tags: [f]
      });
    }
    this.filteredItems = this.allOptions;

    // Espera até 3 segundos pela lista de agentes logados
    while (!this.status.loggedAgents.length && counter < 30) {
      await this.utils.sleep(100);
      counter++;
    }

    if (this.status.loggedAgents.length) {

      for (const loggedAgent of this.status.loggedAgents) {
        const agent = this.status.allUsersMap[loggedAgent.id];
        if (!agent) continue;
        loggedAgent.fullName = agent.fullName;
        if (!this.queueId || this.queueAgents.includes(loggedAgent.id)) {
          this.allOptions.push(loggedAgent);
        }
      }

    }

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
        this.transfer(this.filteredItems[this.selectedItem].id);
      }
    }
  }

  changeSelectedItem(index, ignoreScroll = false) {
    this.selectedItem = index;
    if (index === this.filteredItems.length - 1 && !ignoreScroll) {
      this.scrollDiv?.nativeElement?.scrollTo({
        top: this.scrollDiv?.nativeElement?.scrollHeight,
        behavior: 'smooth'
      })
    } else if (index > 1 && !ignoreScroll) {
      const scroll = ((index) % 3 === 0);
      if (scroll) {
        this.scrollDiv?.nativeElement?.scrollTo({
          top: Math.min(index * 59, this.scrollDiv?.nativeElement?.scrollHeight),
          behavior: 'smooth'
        });
      } else if (this.scrollDiv?.nativeElement?.scrollTop > index * 59) {
        this.scrollDiv?.nativeElement?.scrollTo({top: (index - (index % 3)) * 59, behavior: 'smooth'});
      }
    } else {
      if (!ignoreScroll) {
        this.scrollDiv?.nativeElement?.scrollTo({top: 0, behavior: 'smooth'})
      }
    }
  }

  applyFilter() {
    this.filteredItems = this.filterAgentsPipe.transform(this.allOptions, this.filter);
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

  transfer(id) {
    this.dialogRef.close(id);
  }

}
