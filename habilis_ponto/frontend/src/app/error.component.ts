/**
 * Created by filipe on 25/09/16.
 */
import {Component} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  moduleId: module.id,
  templateUrl: './error.component.html'
})

export class ErrorComponent {

  constructor(private router: Router) {

  }

  returnToApp() {
    this.router.navigate(['']);
  }

}
