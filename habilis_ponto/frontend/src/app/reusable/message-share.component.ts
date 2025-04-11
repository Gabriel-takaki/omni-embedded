import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from "@angular/core";
import {StatusService} from "../services/status.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FilterShareItemsPipe} from "../pipesModule/filtershareitems.pipe";
import {SocketService} from "../services/socket.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {texts} from "../app.texts";

@Component({
  templateUrl: 'message-share.component.html',
  styleUrls: ['message-share.component.scss']
})
export class MessageShareComponent implements AfterViewInit {

  public filter = '';
  public allOptions = [];
  public message;
  public selectedItem = 0;
  public filteredItems = [];

  private filterAgentsPipe = new FilterShareItemsPipe();

  @ViewChild('searchField') searchField: ElementRef<HTMLInputElement>;
  @ViewChild('scrollDiv') scrollDiv: ElementRef<HTMLDivElement>;

  constructor(private dialogRef: MatDialogRef<MessageShareComponent>, public status: StatusService,
              @Inject(MAT_DIALOG_DATA) public data: any, private socket: SocketService, private snack: MatSnackBar) {

    if (!data.message) {
      dialogRef.close();
    } else {
      this.message = data.message;
      this.agentsListTimer();
    }

  }

  ngAfterViewInit() {
    this.focusTimer();
  }

  agentsListTimer() {

    for (const chat of this.status.internalChats) {
      this.allOptions.push({type: 'internal', id: chat.id});
    }
    for (const chat of this.status.chats) {
      this.allOptions.push({type: 'external', id: chat.id});
    }
    this.allOptions = [].concat(this.status.internalChats || []);
    this.allOptions = this.allOptions.concat(this.status.chats || []);
    for (const o of this.allOptions) {
      if (o.id) {
        o.parsedId = o.type === 2 ? 0 : typeof o.id === 'string' ? Number(o.id?.split('-')[0]) : o.id;
      }
    }
    // console.log(this.allOptions);
    this.applyFilter();
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
        this.share(this.filteredItems[this.selectedItem]);
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
      const scroll = ((index) % 3 === 0);
      if (scroll) {
        this.scrollDiv?.nativeElement?.scrollTo({
          top: Math.min(index * 59, this.scrollDiv.nativeElement.scrollHeight),
          behavior: 'smooth'
        });
      } else if (this.scrollDiv?.nativeElement?.scrollTop > index * 59) {
        this.scrollDiv.nativeElement.scrollTo({top: (index - (index % 3)) * 59, behavior: 'smooth'});
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

  share(chat) {

    if (!chat.queueId || chat.type === 3) {
      // Mensagem para chat interno
      // Mensagem para grupo de chat interno
      // Mensagem de grupo do whatsapp
      this.socket.socket.emit('action', {
        type: 'sendInternalMessage',
        chatId: chat.id,
        queueId: chat.queueId,
        fk_file: this.message.fk_file,
        file_mimetype: '',
        latitude: this.message.latitude,
        longitude: this.message.longitude,
        locationThumbnail: this.message.locationThumbnail,
        text: this.message.text,
        chatType: chat.type
      });
    } else {
      // Mensagem para atendimento do usuário
      this.socket.socket.emit('action', {
        type: 'sendMessage',
        chatId: chat.id,
        fk_file: this.message.fk_file,
        file_mimetype: this.message.file_mimetype,
        latitude: this.message.latitude,
        longitude: this.message.longitude,
        locationThumbnail: this.message.locationThumbnail,
        text: this.message.text
      });
    }

    this.snack.open('Mensagem encaminhada.', 'Fechar', {duration: 1500})
    this.dialogRef.close(true);

  }

    protected readonly texts = texts;
}
