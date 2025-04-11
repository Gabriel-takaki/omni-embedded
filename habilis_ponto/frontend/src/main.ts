import {ApplicationRef, enableProdMode} from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { RootModule } from './app/root.module';
import { environment } from './environments/environment';
import 'hammerjs';
import {enableDebugTools} from "@angular/platform-browser";

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(RootModule);
  // .then(module => enableDebugTools(module.injector.get(ApplicationRef).components[0]));
