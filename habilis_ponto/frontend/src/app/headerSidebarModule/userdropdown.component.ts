/**
 * Created by filipe on 18/09/16.
 */
import {Component, Input} from '@angular/core';
import {AuthService} from "../services/auth.service";
import {StatusService} from "../services/status.service";
import {ChangePassComponent} from "../configurationModule/changepass.component";
import {ImageCropperComponent} from "../reusable/image-cropper.component";
import {MatDialog} from "@angular/material/dialog";
import {agentType, BASE_URL} from "../app.consts";
import {HttpClient} from "@angular/common/http";
import {NotificationsService} from "angular2-notifications";
import {ConfirmAction} from "../reusable/confirmaction.decorator";
import {YesNoComponent} from "../reusable/yes-no.component";
import {ShortcutsDialogComponent} from "../reusable/shortcuts-dialog.component";

@Component({
  selector: 'ca-userdropdown',
  templateUrl: 'userdropdown.component.html',
  styleUrls: ['userdropdown.component.scss']
})

export class UserDropDownComponent {

  @Input() headerFontColor = '';
  public visibility = 'hidden';
  imgError = false;
  base = BASE_URL;
  editPhoto = false;
  loading = false;

  constructor(public autenticador: AuthService, public status: StatusService,
              private notifications: NotificationsService,
              private http: HttpClient, public dialog: MatDialog) {

  }

  changePass(user) {
    const chPass = this.dialog.open(ChangePassComponent, {
      data: {
        username: user.username,
        fullname: user.fullname,
        id: user.id
      }
    });
  }

  systemShortcuts() {
    this.dialog.open(ShortcutsDialogComponent);
  }

  bugReport() {
    // @ts-ignore
    const userBack = window.Userback;
    if (userBack) {
      try {
        userBack.setData({
          account_id: this.status.user.id,
          user_type: this.status.user.type,
          instance_name: window.location.origin,
          name: this.status.user.fullname
        });
        userBack.identify(this.status.user.id, {
          name: this.status.user.fullname,
          company: window.location.origin,
          type: this.status.user.type
        });
      } catch (e) {
        console.log(e);
      }
      userBack.name = this.status.user.fullname;
      userBack.open();
    }
  }

  @ConfirmAction('dialog', {
    text: $localize`Tem certeza que deseja sair do sistema? Todos os chats atribuídos a você serão retornados a fila e caso não estejam travados serão redistribuídos para outros agentes.`,
    title: $localize`Sair do sistema`,
    yesButtonText: $localize`Sair`,
    yesButtonStyle: 'danger'
  })
  logout() {
    if (this.status.user?.type === 2 && this.status.user?.keeponline) {
      const diag = this.dialog.open(YesNoComponent, {
        data: {
          text: $localize`Deseja deslogar de todas as filas e devolver os atendimentos para a fila?`,
          title: $localize`Sair da fila`,
          yesButtonText: $localize`Deslogar`,
          yesButtonStyle: 'warning',
          noButtonText: $localize`Não deslogar`
        }
      });
      const diagSub = diag.afterClosed().subscribe((r: boolean) => {
        diagSub.unsubscribe();
        this.autenticador.logout(r);
      });
    } else {
      this.autenticador.logout();
    }
  }

  changeProfilePhoto(item, photo) {

    if (item && photo) {
      this.loading = true;
      this.editPhoto = true;
      this.http.post(BASE_URL + '/api/changeUserProfilePic', {
        userId: item.id,
        mimeType: photo.split(';base64')[0].split(':')[1],
        data: photo.split('base64,')[1]
      }, {

        observe: "response"
      }).subscribe((res: any) => {
        this.notifications.success($localize`Sucesso`, $localize`Foto atualizada com sucesso.`);
        setTimeout(() => {
          // item.userpicversion++;
          this.imgError = false;
          this.loading = false;
          this.editPhoto = false;
        }, 1000);
      }, err => {
        this.loading = false;
        this.editPhoto = false;
        this.notifications.error($localize`Erro ao atualizar foto.`, err.statusText);
      });
    }

  }

  photoChange(item, e) {
    if (item && e.srcElement.files.length) {
      this.dialog.open(ImageCropperComponent, {data: {imageEvent: e}}).afterClosed().subscribe(r => {
        if (r) {
          this.changeProfilePhoto(item, r);
        }
      });
    }
  }

  error() {
    this.imgError = true;
  }

}
