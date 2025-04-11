/**
 * Created by filipe on 18/09/16.
 */
import {LoadingService} from "../loadingModule/loading.service";
import {Component, OnInit} from "@angular/core";
import {StatusService} from "../services/status.service";
import {SocketService} from "../services/socket.service";
import {DomSanitizer} from "@angular/platform-browser";
import {MatDialog} from "@angular/material/dialog";
import {HttpClient} from "@angular/common/http";
import {EventsService} from "../services/events.service";
import SwaggerUi from 'swagger-ui';
import {BASE_URL} from "../app.consts";

@Component({
  selector: 'ca-api',
  templateUrl: 'api.component.html',
  styleUrls: ['./api.component.scss']
})
export class ApiComponent implements OnInit {

  constructor(private loading: LoadingService, public status: StatusService, private socket: SocketService,
              public sanitizer: DomSanitizer, public dialog: MatDialog,
              private http: HttpClient, private events: EventsService) {

  }

  ngOnInit(): void {
    const ui = SwaggerUi({
      dom_id: '#swagger-ui',
      layout: 'BaseLayout',
      presets: [
        SwaggerUi.presets.apis,
        SwaggerUi.SwaggerUIStandalonePreset
      ],
      url: `${BASE_URL}/static/${this.status.gatewayMode ? 'getAPISpecs' : 'getAPPAPISpecs'}`,
      docExpansion: 'none',
      operationsSorter: 'alpha'
    });
  }

}
