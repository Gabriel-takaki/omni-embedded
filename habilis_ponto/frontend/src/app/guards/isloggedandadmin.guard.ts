import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from "@angular/router";
import {Injectable} from "@angular/core";
import {AuthService} from "../services/auth.service";
import {Observable} from "rxjs/internal/Observable";
import {StatusService} from "../services/status.service";

/**
 * Created by filipe on 30/12/16.
 */
@Injectable()
export class IsLoggedAndAdminGuard implements CanActivate {

  constructor(private router: Router, private autenticador: AuthService, private status: StatusService) {

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.autenticador.isLogged().then((res: any) => {
        if (res && this.status.adminTypesNoSup.includes(this.status.user.type)) {
          resolve(true);
        } else {
          this.router.navigate(['']);
          resolve(false);
        }
      }).catch((err) => {
        resolve(false)
      });
    });
  }

}
