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

  //get a payment by its id
  async getpaymentById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const order = await this.paymentUseCase.getpaymentById(id);
      res.status(200).json({ success: true, data: order });
    } catch ({ name, message }) {
      res.status(404).json({ success: false, data: null });
    }
  }

  //get a payment by its reference
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
  
  async verifyPayment(req: Request, res: Response) {
    const reference: string = req.params.reference;
    try{
      const isVerified = await this.paymentUseCase.verifyPayment(reference)
      if(!isVerified){
        throw Error
      }

      res.json({success: true,
        message: "Payment was successful",
        data: reference})
    }catch(e){
      res.json({
        success: false,
        message: "Payment verification failed",
    })
    }
   
   
  }

  async bankTransfer(req: Request, res: Response) {
    const reference = ''
    const {acc_name, account_number, bank_code, amount, customerId, name} = req.body
    const transferID = await this.transferUseCase.createTransfer({amount,customerId, status: Status.PENDING, accName: acc_name, accNo: account_number})

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
      const makeTransfer = await axios.post(
        `https://api.paystack.co/transfer`,
        {
          source: "balance", 
          amount, 
          recipient: recipient_code, 
          reason: "Youstore payment",
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

      
      

      res.status(200).json({message:'transfer successful',data:{reference:transferID}})
    }catch(e){
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
      
      let ref = req.body.data.reference;
      
      try{
      if ((event == "charge.success")) {
        
        
        const paymentRecord = await this.paymentUseCase.getpaymentByRef(ref);
          if (paymentRecord.amount != req.body.data.amount) {
            await this.paymentUseCase.findByRefAndUpdateStatus(
              ref,
              Status.FAILURE
            );
            
            // this.messenger.assertQueue("payment_failure");
            // this.messenger.sendToQueue("payment_failure", { ref });
            this.messenger.publishToExchange('paymentEvents', 'payments.status.failed', {
              ref
            })
            
            res.status(200).send({ success: true });
            return
          } else {
            await this.paymentUseCase.findByRefAndUpdateStatus(
              ref,
              Status.SUCCESS
            );

            // this.messenger.assertQueue("payment_success");
            // this.messenger.sendToQueue("payment_success", { ref });
            this.messenger.publishToExchange('paymentEvents', 'payments.status.success', {
              ref
            })
            
            res.status(200).send({ success: true });
            return
          }
        
      }else if ((event == "transfer.success")) {
        const withdraw = await this.transferUseCase.findByRefAndUpdateStatus(
          ref,
          Status.SUCCESS
        );
        this.messenger.assertQueue("withdrawal_success");
        this.messenger.sendToQueue("withdrawal_success", { withdraw });
        
        res.status(200).send({ success: true });
        return
      }else if ((event == "transfer.failed")) {
        //create a func that does this
        const withdraw = await this.transferUseCase.findByRefAndUpdateStatus(
              ref,
              Status.FAILURE
            );
            this.messenger.assertQueue("withdrawal_failure");
            this.messenger.sendToQueue("withdrawal_failure", { withdraw });
            res.status(200).send({ success: true });
            return
      }}
    catch {
      res.status(400).send({ success: false });
      return
    }
      
    }

    res.status(400).send({ success: false });
  }

  
}

export default PaymentController;
