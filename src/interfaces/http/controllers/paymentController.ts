import { Request, Response } from "express";
import { IMessenger } from "../../../infra/messaging/messenger";
import PaymentUseCase from "../../../usecases/PaymentUseCase";
import crypto from "crypto";

export class PaymentController {
  paymentUseCase: PaymentUseCase;
  messenger: IMessenger;

  constructor({
    paymentUseCase,
    messenger,
  }: {
    paymentUseCase: PaymentUseCase;
    messenger: IMessenger;
  }) {
    this.paymentUseCase = paymentUseCase;
    this.messenger = messenger;
  }

  async consumePaystackEvent(req: Request, res: Response): Promise<void> {
    const secret = process.env.PAYSTACK_SECRET || "";
    var hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");
    if (hash == req.headers["x-paystack-signature"]) {
      var { event } = req.body;
      if ((event = "charge.success")) {
        //send a 200 resp if what you did was successful
        const ref = req.body.data.response;
        try {
          await this.paymentUseCase.findByRefAndUpdateStatus(ref, true);
          res.status(200);
        } catch {
          res.status(400);
        }
      }
    }
  }
}

export default PaymentController;
