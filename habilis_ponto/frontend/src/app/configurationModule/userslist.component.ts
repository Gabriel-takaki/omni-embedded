/**
 * Created by filipe on 25/09/16.
 */
import {Component} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {StatusService} from "../services/status.service";
import {SocketService} from "../services/socket.service";
import {HttpClient} from "@angular/common/http";
import {BASE_URL} from "../app.consts";
import {UserFormComponent} from "./userform.component";
import {ChangePassComponent} from "./changepass.component";
import {MatChipInputEvent} from "@angular/material/chips";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatDialog} from "@angular/material/dialog";
import {ImageCropperComponent} from "../reusable/image-cropper.component";
import {texts} from "../app.texts";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ConfirmAction} from "../reusable/confirmaction.decorator";
import {UserTimeTableFormComponent} from "./usertimetableform.component";

@Component({
  templateUrl: 'userslist.component.html',
  styleUrls: ['userslist.component.scss']
})
export class UsersListComponent {

  texts = texts;
  public columns = [
    {caption: '', dataField: '', cssClass: 'pad5A', width: 50, cellTemplate: 'photoTemplate'},
    {caption: $localize`Nome`, dataField: 'fullname', cssClass: 'pad5A'},
    {caption: $localize`Usuário`, dataField: 'username', cssClass: 'pad5A'},
    {caption: $localize`Tipo`, dataField: 'type', cellTemplate: 'typeTemplate', width: 140, cssClass: 'pad5A'},
    {
      caption: $localize`:Abreviação de identificação:ID`,
      dataField: 'id',
      width: 50,
      cssClass: 'pad5A',
      alignment: 'center'
    },
    {
      caption: $localize`Funções`,
      dataField: 'id',
      encodeHtml: false,
      cellTemplate: 'functionsTemplate',
      width: 200,
      cssClass: 'pad5A', alignment: 'center'
    }
  ];

  defaultCountry = 'BR';

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  public users = [];
  public contactsgroups = [];
  public queues = [];
  public visualgroups = [];

  base = BASE_URL;

  constructor(public service: StatusService, private notifications: NotificationsService,
              private socket: SocketService, private http: HttpClient, public dialog: MatDialog, private snack: MatSnackBar) {

    this.defaultCountry = service.defaultCountry || 'BR';

    this.loadUsers();
    this.loadContactGroups();
    this.loadVisualGroups();

  }

  loadVisualGroups() {
    this.http.get(BASE_URL + '/visualgroup/?limit=500').subscribe((r: any[]) => {
      this.visualgroups = r;
    }, err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao recuperar dados.`);
    });
  }

  checkUserNumber(user) {
    if (user.validNumber && user.wanumber2) {
      user.waid = '';
      user.wanumber = '';
      user.checking = true;
      user.notExists = false;
      this.http.post(BASE_URL + '/api/checkNumber', {
        number: user.wanumber2,
        country: user.selectedCountry || this.defaultCountry
      }).subscribe((r: any) => {
        user.checking = false;
        if (r.exists) {
          user.wanumber = user.wanumber2;
          user.waid = r.clientId;
        } else {
          user.notExists = true;
        }
      }, err => {
        user.checking = false;
        this.notifications.error($localize`Erro`, $localize`Erro ao verificar número.`);
      });
    }
  }

  countryChanged(event, user) {
    user.selectedCountry = event.flagClass;
  }

  copyData(e) {

    // Cria uma cópia do objeto para que o grid não atualize junto com o formulário
    const copy = JSON.parse(JSON.stringify(e.key));
    e.key.copy = copy;

  }

  loadUsers() {
    this.http.get(BASE_URL + '/users/?status=1&limit=500').subscribe((r: any[]) => {
      console.log(r)
      for (const u of r) {
        u.fk_visualgroup = u.fk_visualgroup || 0;
        u.copy = {};
        const qu = [];
        const squ = [];
        for (const q of u.queues) {
          qu.push(q.id);
        }
        for (const q of u.supQueues) {
          squ.push(q.id);
        }
        u.queues = qu;
        u.supQueues = squ;
        try {
          u.tags = u.tags ? JSON.parse(u.tags) : [];
        } catch (e) {
          u.tags = [];
        }
        try {
          u.agentsfilter = u.agentsfilter ? JSON.parse(u.agentsfilter) : [];
        } catch (e) {
          u.agentsfilter = [];
        }
      }
      this.users = r;
    }, err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao recuperar dados.`);
    });
  }

  loadContactGroups() {
    this.http.get(BASE_URL + '/contactsgroups/getGroups').subscribe((r: any[]) => {
      this.contactsgroups = r;
    }, err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao recuperar dados.`);
    });
  }

  addUser() {
    const newUser = this.dialog.open(UserFormComponent);
    const sub = newUser.afterClosed().subscribe(r => {
      sub.unsubscribe();
      if (r) {
        this.loadUsers();
      }
    })
  }

  changePass(user) {
    this.dialog.open(ChangePassComponent, {
      data: {
        username: user.username,
        fullname: user.fullname,
        id: user.id
      }
    });
  }


  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja deslogar e invalidar todas as sessões deste usuário?`,
    title: $localize`Invalidar sessões`,
    yesButtonText: $localize`Invalidar sessões`,
    noButtonText: $localize`Cancelar`
  })
  logoutAndInvalidate(user) {
    this.http.post(BASE_URL + '/users/logoutAndInvalidateUserTokens', {id: user.id}).subscribe((r: any[]) => {
      this.notifications.success($localize`Sucesso`, $localize`Solicitação enviada com sucesso.`);
    }, err => {
      this.notifications.error($localize`Erro`, $localize`Erro ao enviar solicitação.`);
    });
  }

  openTimeTable(id) {
    this.dialog.open(UserTimeTableFormComponent, {data: {id: id}});
  }

  saveConfig(user) {

    let tags = '[]';

    if (user.copy.tags) {
      try {
        tags = JSON.stringify(user.copy.tags);
      } catch (e) {
        tags = '[]';
      }
    }

    const u = {
      fullname: user.copy.fullname,
      sipuser: user.copy.sipuser,
      sippass: user.copy.sippass,
      enablesoftphone: user.copy.enablesoftphone ? 1 : 0,
      autoanswer: user.copy.autoanswer ? 1 : 0,
      candropqueuecall: user.copy.candropqueuecall ? 1 : 0,
      canaccessabandoned: user.copy.canaccessabandoned ? 1 : 0,
      canreopenchat: user.copy.canreopenchat ? 1 : 0,
      cancreatetasksforeveryone: user.copy.cancreatetasksforeveryone ? 1 : 0,
      canreopenotherschat: user.copy.canreopenotherschat ? 1 : 0,
      canopennewchat: user.copy.canopennewchat ? 1 : 0,
      canexportchat: user.copy.canexportchat ? 1 : 0,
      canreadhistorymessages: user.copy.canreadhistorymessages ? 1 : 0,
      canseechatssummary: user.copy.canseechatssummary ? 1 : 0,
      canrequestaisummary: user.copy.canrequestaisummary ? 1 : 0,
      showscoreondashboard: user.copy.showscoreondashboard ? 1 : 0,
      chatenabled: user.copy.chatenabled ? 1 : 0,
      tasksenabled: user.copy.tasksenabled ? 1 : 0,
      tasksmonitor: user.copy.tasksmonitor ? 1 : 0,
      autologin: user.copy.autologin ? 1 : 0,
      locklogout: user.copy.locklogout ? 1 : 0,
      remotelogin: user.copy.remotelogin ? 1 : 0,
      partnerpanelaccess: user.copy.partnerpanelaccess ? 1 : 0,
      limitpulledchats: user.copy.limitpulledchats ? 1 : 0,
      ignorelimitsforblockedchats: user.copy.ignorelimitsforblockedchats ? 1 : 0,
      partnerpanelbillingaccess: user.copy.partnerpanelbillingaccess ? 1 : 0,
      forcesurvey: user.copy.forcesurvey ? 1 : 0,
      maxchats: user.copy.maxchats || 0,
      canuseinternalchat: user.copy.canuseinternalchat ? 1 : 0,
      canchangepreferredagents: user.copy.canchangepreferredagents ? 1 : 0,
      canaccesschatgroups: user.copy.canaccesschatgroups ? 1 : 0,
      caneditgallery: user.copy.caneditgallery ? 1 : 0,
      cancreatecampaigns: user.copy.cancreatecampaigns ? 1 : 0,
      caneditcatalog: user.copy.caneditcatalog ? 1 : 0,
      caneditnews: user.copy.caneditnews ? 1 : 0,
      caneditfaq: user.copy.caneditfaq ? 1 : 0,
      keeponline: user.copy.keeponline ? 1 : 0,
      allcontactsgroups: user.copy.allcontactsgroups ? 1 : 0,
      queues: user.copy.queues,
      fk_visualgroup: user.copy.fk_visualgroup,
      supQueues: user.copy.supQueues,
      contactsgroups: user.copy.contactsgroups,
      botkey: user.copy.botkey,
      extid: user.copy.extid,
      extdata: user.copy.extdata,
      wanumber: user.copy.wanumber,
      waid: user.copy.waid,
      tags: tags,
      agentsfilter: JSON.stringify(user.copy.agentsfilter),
      clockinenabled: user.copy.clockinenabled ? 1 : 0,
      clockinmethod: user.copy.clockinmethod,
    };

    console.log(u)

    const sub = this.http.put(BASE_URL + '/users/' + user.id, u, {

      observe: 'response'
    }).subscribe(r => {
      sub.unsubscribe();
      this.notifications.success($localize`Sucesso`, $localize`Configurações salvas com sucesso!`);
      user.fullname = user.copy.fullname;
      user.sipuser = user.copy.sipuser;
      user.sippass = user.copy.sippass;
      user.enablesoftphone = user.copy.enablesoftphone;
      user.autoanswer = user.copy.autoanswer;
      user.candropqueuecall = user.copy.candropqueuecall;
      user.canaccessabandoned = user.copy.canaccessabandoned;
      user.cancreatetasksforeveryone = user.copy.cancreatetasksforeveryone;
      user.showscoreondashboard = user.copy.showscoreondashboard;
      user.canreopenchat = user.copy.canreopenchat;
      user.canreopenotherschat = user.copy.canreopenotherschat;
      user.canexportchat = user.copy.canexportchat;
      user.canrequestaisummary = user.copy.canrequestaisummary;
      user.canseechatssummary = user.copy.canseechatssummary;
      user.remotelogin = user.copy.remotelogin;
      user.partnerpanelaccess = user.copy.partnerpanelaccess;
      user.canopennewchat = user.copy.canopennewchat;
      user.caneditgallery = user.copy.caneditgallery;
      user.canchangepreferredagents = user.copy.canchangepreferredagents;
      user.cancreatecampaigns = user.copy.cancreatecampaigns;
      user.caneditcatalog = user.copy.caneditcatalog;
      user.caneditnews = user.copy.caneditnews;
      user.caneditfaq = user.copy.caneditfaq;
      user.keeponline = user.copy.keeponline;
      user.allcontactsgroups = user.copy.allcontactsgroups;
      user.chatenabled = user.copy.chatenabled;
      user.tasksenabled = user.copy.tasksenabled;
      user.tasksmonitor = user.copy.tasksmonitor;
      user.autologin = user.copy.autologin;
      user.maxchats = user.copy.maxchats;
      user.locklogout = user.copy.locklogout;
      user.forcesurvey = user.copy.forcesurvey;
      user.fk_visualgroup = user.copy.fk_visualgroup || 0;
      user.canuseinternalchat = user.copy.canuseinternalchat;
      user.canaccesschatgroups = user.copy.canaccesschatgroups;
      user.type = user.copy.type;
      user.queues = user.copy.queues;
      user.supQueues = user.copy.supQueues;
      user.botkey = user.copy.botkey;
      user.extid = user.copy.extid;
      user.clockinenabled = user.copy.clockinenabled,
      user.clockinmethod = user.copy.clockinmethod

    }, error => {
      this.notifications.error($localize`Erro ao salvar`, error.statusText);
    });

  }


  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja excluir este usuário?`,
    title: $localize`Excluir usuário`,
    yesButtonText: $localize`Excluir`,
    noButtonText: $localize`Cancelar`
  })
  removeItem(user) {
    this.http.put(BASE_URL + '/users/' + user.id, {
      status: 0,
      username: Date.now() + user.username.slice(0, 17),
      oldusername: user.username,
      oldsipuser: user.sipuser,
      fullname: user.fullname + $localize` - Excluído`,
      sipuser: Date.now().toString() + Math.round(Math.random() * 10000).toString()
    }, {
      observe: "response"
    }).subscribe(res => {
      this.notifications.success($localize`Sucesso`, $localize`Usuário inativado com sucesso!`);
      this.socket.socket.emit('supervisorQuery', {type: 'agents'});
      this.loadUsers();
    }, err => {
      this.notifications.error($localize`Erro ao inativar fila.`, err.statusText);
    });
  }


  addTag(event: MatChipInputEvent, tags): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removeTag(option, tags) {
    tags.splice(tags.indexOf(option), 1);
  }

  changeProfilePhoto(item, photo) {

    if (item && photo) {
      item.copy.photoLoading = true;
      item.copy.editPhoto = true;
      this.http.post(BASE_URL + '/api/changeUserProfilePic', {
        userId: item.id,
        mimeType: photo.split(';base64')[0].split(':')[1],
        data: photo.split('base64,')[1]
      }, {

        observe: "response"
      }).subscribe((res: any) => {
        this.notifications.success($localize`Sucesso`, $localize`Foto atualizada com sucesso.`);
        setTimeout(() => {
          item.userpicversion = res.version;
          item.copy.userpicversion = res.version;
          item.copy.imgError = false;
          item.copy.photoLoading = false;
          item.copy.editPhoto = false;
        }, 1500);
      }, err => {
        this.notifications.error($localize`Erro ao atualizar foto.`, err.statusText);
        item.copy.photoLoading = false;
        item.copy.editPhoto = false;
      });
    }

  }

  photoChange(item, e) {
    if (e.srcElement.files.length) {
      this.dialog.open(ImageCropperComponent, {data: {imageEvent: e}}).afterClosed().subscribe(r => {
        if (r) {
          this.changeProfilePhoto(item, r);
        }
      });
    }
  }

  imgError(item) {
    item.imgError = true;
  }

  copyTag(tag) {
    navigator.clipboard.writeText(tag + "\n");
    this.snack.open($localize`Copiado!`, '', {duration: 700});
  }

  pasteEvent(e, a) {
    const data = e.clipboardData.getData('text').split("\n");
    if (data.length) {
      for (const i of data) {
        if (i) {
          a.push(i);
        }
      }
    }
    e.preventDefault();
  }

  copyAllTags(a) {
    navigator.clipboard.writeText(a.join("\n"));
    this.snack.open($localize`Copiado!`, '', {duration: 700});
  }

}
