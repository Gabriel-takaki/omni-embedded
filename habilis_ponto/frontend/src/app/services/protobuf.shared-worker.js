import {parse} from 'protobufjs';

export class ProtobufService {

  Objects = null;
  Queue = null;
  loaded = false;
  failed = false;

  constructor() {
  }

  async load(base_url) {

    if (!this.loaded) {
      try {
        const protoSpecs = await fetch(`${base_url}/static/getProtoDataNoCache?t=${Date.now()}`);
        this.Objects = parse(protoSpecs).root.lookup('objects.Objects');
        this.Queue = parse(protoSpecs).root.lookup('objects.Queue');
        this.loaded = true;
        this.failed = false;
      } catch (e) {
        this.failed = true;
        this.loaded = false;
        this.Objects = null;
        this.Queue = null;
      }
    }

  }

  async finishLoad() {
    while (!this.loaded && !this.failed) {
      await this.sleep(50);
    }
  }

  decode(data) {
    return this.Objects.decode(data);
  }

  decodeQueue(data) {
    return this.Queue.decode(data);
  }

  sleep(time) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, time);
    });
  }

}
