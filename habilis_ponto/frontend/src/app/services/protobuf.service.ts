/**
 * Created by filipe on 17/09/16.
 */

import {Injectable} from "@angular/core";
import {parse} from 'protobufjs';
import {BASE_URL, NUMERIC_VERSION} from "../app.consts";
import {HttpClient} from "@angular/common/http";

@Injectable({providedIn: 'root'})
export class ProtobufService {

  private Objects = null;
  private Queue = null;
  public loaded = false;
  public loading = false;
  public failed = false;

  constructor(private http: HttpClient) {

  }

  load() {
    if (this.loading || this.loaded) {
      return;
    }
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.http.get(`${BASE_URL}/static/getProtoDataNoCache?t=${Date.now()}`, {responseType: 'text'}).subscribe((data) => {
        try {
          this.Objects = parse(data).root.lookup('objects.Objects');
          this.Queue = parse(data).root.lookup('objects.Queue');
          this.loaded = true;
          this.failed = false;
        } catch (e) {
          this.failed = true;
          this.loaded = false;
          this.Objects = null;
          this.Queue = null;
        }
        return resolve(null);
      });
    });
  }

  async finishLoad() {
    while (!this.loaded && !this.failed) {
      await this.sleep(50);
    }
  }

  async decode(data) {
    if (!this.loaded) {
      this.load();
    }
    await this.finishLoad();
    return this.Objects?.decode(data);
  }

  async decodeQueue(data) {
    if (!this.loaded) {
      this.load();
    }
    await this.finishLoad();
    return this.Queue?.decode(data);
  }

  sleep(time) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, time);
    });
  }

}
