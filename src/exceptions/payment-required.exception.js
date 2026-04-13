import { BaseException } from "./base.exception.js";

export class PaymentRequiredException extends BaseException {
  constructor(message) {
    super(message);
    this.status = 402;
    this.name = "Payment Required Exception";
  }
}