import { Request, Response } from "express";
import { IMessenger } from "../../../infra/messaging/messenger";
import PaymentUseCase from "../../../usecases/PaymentUseCase";
import { Status } from "../../../domain/payment";
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
        const paidAmt = result.data.data.amount;

        const paymentRecord = await this.paymentUseCase.getpaymentByRef(
          reference
        );
        //console.log(`${paymentRecord} ${paidAmt} ${status}`);
        if (paymentRecord) {
          if (paidAmt == paymentRecord.amount && status === "success") {
            await this.paymentUseCase.findByRefAndUpdateStatus(
              reference,
              Status.SUCCESS
            );
            res.json({
              success: true,
              message: "Payment was successful",
              data: reference,
            });
          } else {
            await this.paymentUseCase.findByRefAndUpdateStatus(
              reference,
              Status.FAILURE
            );
            this.messenger.assertQueue("payment_failure");
            this.messenger.sendToQueue("payment_failure", { ref: reference });

            res.json({
              success: false,
              message: "Payment verification failed",
              data: reference,
            });
          }
        } else {
          return;
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

    if (hash == req.headers["x-paystack-signature"]) {
      var { event } = req.body;
      if ((event = "charge.success")) {
        const ref = req.body.data.reference;

        const paymentRecord = await this.paymentUseCase.getpaymentByRef(ref);

        try {
          if (paymentRecord.amount != req.body.data.amount) {
            await this.paymentUseCase.findByRefAndUpdateStatus(
              ref,
              Status.FAILURE
            );
            this.messenger.assertQueue("payment_failure");
            this.messenger.sendToQueue("payment_failure", { ref });
            res.status(200).send({ success: true });
          } else {
            await this.paymentUseCase.findByRefAndUpdateStatus(
              ref,
              Status.SUCCESS
            );

            this.messenger.assertQueue("payment_success");
            this.messenger.sendToQueue("payment_success", { ref });
            res.status(200).send({ success: true });
          }
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
      if (!order) {
        res.status(404).json({ success: true, data: null });
      }
      res.status(200).json({ success: true, data: order });
    } catch ({ name, message }) {
      res.status(404).json({ success: false, data: null });
    }
  }
}

export default PaymentController;
