import { Request, Response } from "express";
import { IMessenger } from "../../../infra/messaging/messenger";
import PaymentUseCase from "../../../usecases/PaymentUseCase";
import TransferUseCase from "../../../usecases/TransferUseCase"
import { Status } from "../../../domain/payment";
import crypto from "crypto";
const axios = require("axios").default;

export class PaymentController {
  paymentUseCase: PaymentUseCase;
  transferUseCase: TransferUseCase;
  messenger: IMessenger;
  //hey
  constructor({
    paymentUseCase,
    transferUseCase,
    messenger,
  }: {
    paymentUseCase: PaymentUseCase;
    transferUseCase: TransferUseCase;
    messenger: IMessenger;
  }) {
    this.paymentUseCase = paymentUseCase;
    this.transferUseCase = transferUseCase;
    this.messenger = messenger;
  }

  async verifyPayment(req: Request, res: Response) {
    const reference = req.params.reference;
    await axios
      .get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          authorization:
            `Bearer ${process.env.PAYSTACK_SECRET}`,
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

  async bankTransfer(req: Request, res: Response) {
    // const account_number = '0061009733'
    // const bank_code = '063'
    const reference = ''
    // const amount = 1000
    // const customerId = 'douyeszn'
    const {account_number, bank_code, amount, customerId, name} = req.body
    const transferID = await this.transferUseCase.createTransfer({reference,amount,customerId, status: Status.PENDING})

     try{
      const resolveAccount = await axios
      .get(`https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`, {
        headers: {
          authorization:
            `Bearer ${process.env.PAYSTACK_SECRET}`,
          "content-type": "application/json",
          "cache-control": "no-cache",
        },
      })
      // Account number resolved
      console.log(resolveAccount.data.message)

      const recipientResponse = await axios.post(
        `https://api.paystack.co/transferrecipient`,
        {
          type: "nuban", 
          name, 
          account_number: account_number, 
          bank_code: bank_code, 
          currency: "NGN"
        },
        {
          headers: {
            authorization:
              `Bearer ${process.env.PAYSTACK_SECRET}`,
            "content-type": "application/json",
            "cache-control": "no-cache",
          },
        }
      );

      const recipient_code = recipientResponse.data.data.recipient_code
      console.log('recipent code', recipient_code )
      const makeTransfer = await axios.post(
        `https://api.paystack.co/transfer`,
        {
          source: "balance", 
          amount: 100, 
          recipient: recipient_code, 
          reason: "Holiday Flexing",
          reference: transferID
        },
        {
          headers: {
            authorization:
              `Bearer ${process.env.PAYSTACK_SECRET}`,
            "content-type": "application/json",
            "cache-control": "no-cache",
          },
        }
      );

      
      //console.log('makeTransfer', makeTransfer )

      res.status(200).json({message:'transfer successful',data:{reference:transferID}})
    }catch(e){
      //console.log({e})
      res.status(400).json({message:'transfer failed',data:null})
    }
      
  }

  async consumePaystackEvent(req: Request, res: Response): Promise<void> {
    const secret = process.env.PAYSTACK_SECRET || "";
    var hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash == req.headers["x-paystack-signature"]) {
      var { event } = req.body;
      console.log('event',event);
      let ref = req.body.data.reference;
      console.log('ref',ref)
      if ((event == "charge.success")) {
        

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
            return
          }
        } catch {
          res.status(400).send({ success: false });
          return
        }
      }else if ((event == "transfer.success")) {
        //change transfer status to success
        //ref is not an obj id?
        //handle sending double response in webhook
        console.log('transfer success', ref)
        
        await this.transferUseCase.findByRefAndUpdateStatus(
          ref,
          Status.SUCCESS
        );
        const withdraw = await this.transferUseCase.gettransferById(ref)
        console.log('success', withdraw)
        this.messenger.assertQueue("withdrawal_success");
        this.messenger.sendToQueue("withdrawal_success", { withdraw });
        res.status(200).send({ success: true });
        return
      }else if ((event == "transfer.failed")) {
        //change transfer status to failed
    
        console.log('transfer failed', ref)
         await this.transferUseCase.findByRefAndUpdateStatus(
              ref,
              Status.FAILURE
            );
            const withdraw = await this.transferUseCase.gettransferById(ref)
            this.messenger.assertQueue("withdrawal_failure");
            this.messenger.sendToQueue("withdrawal_failure", { withdraw });
            res.status(200).send({ success: true });
            return
      }
    }

    res.status(400).send({ success: false });
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
