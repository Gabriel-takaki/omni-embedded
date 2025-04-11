/**
 * Created by filipe on 28/09/16.
 */

import {Injectable} from "@angular/core";
import {Subject} from "rxjs/internal/Subject";


@Injectable({providedIn: 'root'})
export class LoadingService {

  public status = new Subject();
  private _active = false;

  public get active() {
    return this._active;
  }

  public set active(b: boolean) {
    this._active = b;
    this.status.next(b);
  }

  public start(): void {
    this.active = true;
  }

  public stop(): void {
    this.active = false;
  }

}
