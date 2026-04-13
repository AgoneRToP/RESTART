import { BaseException } from "./base.exception.js";

export class ProxyAuthRequiredException extends BaseException {
  constructor(message) {
    super(message);
    this.status = 407;
    this.name = "Proxy Auth Required Exception";
  }
}