/**
 * Created by filipe on 28/09/16.
 */
import {Component} from '@angular/core';
import {LoadingService} from "./loading.service";

@Component({
  selector: 'ca-loading-screen',
  template: `
    <div id="loading" *ngIf="active">
      <div class="spinner">
        <div class="bounce1"></div>
        <div class="bounce2"></div>
        <div class="bounce3"></div>
      </div>
    </div>`
})

export class LoadingComponent {

  public active = false;

  constructor(private loading: LoadingService) {
    loading.status.subscribe((status: boolean) => {
      this.active = status;
    });
  }

}
