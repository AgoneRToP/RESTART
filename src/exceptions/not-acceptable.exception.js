import { BaseException } from "./base.exception.js";

export class NotAcceptableException extends BaseException {
  constructor(message) {
    super(message);
    this.status = 406;
    this.name = "Not Acceptable Exception";
  }
}