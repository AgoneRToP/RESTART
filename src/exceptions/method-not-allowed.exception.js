import { BaseException } from "./base.exception.js";

export class MethodNotAllowedException extends BaseException {
  constructor(message) {
    super(message);
    this.status = 405;
    this.name = "Method Not Allowed Exception";
  }
}