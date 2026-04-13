import { BaseException } from "./base.exception.js";

export class RequestTimeoutException extends BaseException {
  constructor(message) {
    super(message);
    this.status = 408;
    this.name = "Request Timeout Exception";
  }
}