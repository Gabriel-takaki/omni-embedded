import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from "@angular/router";
import {Injectable} from "@angular/core";
import {AuthService} from "../services/auth.service";
import {Observable} from "rxjs/internal/Observable";
import {StatusService} from "../services/status.service";

/**
 * Created by filipe on 30/12/16.
 */
@Injectable()
export class IsTaskMonitorActiveGuard implements CanActivate {

  constructor(private router: Router, private autenticador: AuthService, private status: StatusService) {

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.status.taskManagerEnabled;
  }

}
