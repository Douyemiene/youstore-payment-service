import { Request, Response } from "express";
import { IMessenger } from "../../../infra/messaging/messenger";
import PaymentUseCase from "../../../usecases/PaymentUseCase";
import crypto from "crypto";
const axios = require("axios").default;

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

  async verifyPayment(req: Request, res: Response) {
    const reference = req.params.reference;
    await axios
      .get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          authorization:
            "Bearer sk_test_55ceccf870fc585f49df71a6decd01ff457c583c",
          "content-type": "application/json",
          "cache-control": "no-cache",
        },
      })
      .then(async (result) => {
        const { status, reference } = result.data.data;
        // console.log("res", status);
        // console.log("res", reference);
        if (status === "success") {
          await this.paymentUseCase.findByRefAndUpdateStatus(reference, true);
          res.json({
            success: true,
            message: "Payment was successfully processed",
            data: reference,
          });
        } else {
          //status == 'failed'
          console.log("failure", status);
          await this.paymentUseCase.findByRefAndUpdateStatus(reference, false);
          this.messenger.assertQueue("payment_failure");
          this.messenger.sendToQueue("payment_failure", { ref: reference });

          res.json({
            success: false,
            message: "Payment was not processed successfully",
            data: reference,
          });
        }
      })
      .catch((err) => {
        res.json({ success: false, error: "Payment verification failed." });
      });
  }

  async consumePaystackEvent(req: Request, res: Response): Promise<void> {
    const secret = process.env.PAYSTACK_SECRET || "";
    var hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");
    console.log("hash", hash);
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

  async getpaymentById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const order = await this.paymentUseCase.getpaymentById(id);
      res.status(200).json({ success: true, data: order });
    } catch ({ name, message }) {
      res.status(404).json({ success: false, data: null });
    }
  }

  async getpaymentByRef(req: Request, res: Response): Promise<void> {
    const { reference } = req.params;
    try {
      const order = await this.paymentUseCase.getpaymentByRef(reference);
      res.status(200).json({ success: true, data: order });
    } catch ({ name, message }) {
      res.status(404).json({ success: false, data: null });
    }
  }
}

export default PaymentController;
