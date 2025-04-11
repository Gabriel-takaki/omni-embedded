import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from "@angular/router";
import {Injectable} from "@angular/core";
import {AuthService} from "../services/auth.service";
import {Observable} from "rxjs/internal/Observable";

/**
 * Created by filipe on 30/12/16.
 */
@Injectable()
export class IsLoggedGuard implements CanActivate {

  constructor(private router: Router, private autenticador: AuthService) {

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.autenticador.isLogged().then((res: any) => {
        if (res) {
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
