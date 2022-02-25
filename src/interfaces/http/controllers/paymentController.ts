import { Request, Response } from "express";
import { IMessenger } from "../../../infra/messaging/messenger";
import PaymentUseCase from "../../../usecases/PaymentUseCase";
import crypto from "crypto";

export class PaymentController {
  paymentUseCase: PaymentUseCase;
  messenger: IMessenger;
  //hey
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
        const ref = req.body.data.reference;
        try {
          await this.paymentUseCase.findByRefAndUpdateStatus(ref, true);
          this.messenger.assertQueue("payment_success");
          this.messenger.sendToQueue("payment_success", { ref });
          res.status(200).send({ success: true });
        } catch {
          res.status(400).send({ success: false });
        }
      }
    }
  }
}

export default PaymentController;
