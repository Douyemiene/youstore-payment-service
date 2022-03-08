import { Model } from "mongoose";
import { IPaymentProps, Status } from "../../domain/payment";
import { IPayment } from "../database/models/payments";

export interface IPaymentRepo {
  save(payment: IPaymentProps): Promise<string>;
  getPaymentByRef(reference: string): Promise<IPayment | null>;
  getPaymentById(id: string): Promise<IPayment | null>;
  findByRefAndUpdate(id: string, paymentStatus: Status): Promise<void>;
}

export class PaymentRepo implements IPaymentRepo {
  private payments: Model<IPayment>;

  constructor({ paymentModel }: { paymentModel: Model<IPayment> }) {
    this.payments = paymentModel;
  }

  async save(payment: IPaymentProps): Promise<string> {
    //payment.paymentStatus = null;
    const { _id } = await this.payments.create(payment);
    return _id.toString();
  }

  async getPaymentByRef(reference: string): Promise<IPayment | null> {
    const payment = await this.payments.findOne({ reference }).exec();
    return payment;
  }

  async getPaymentById(id: string): Promise<IPayment | null> {
    const payment = await this.payments.findById(id).exec();
    return payment;
  }

  async findByRefAndUpdate(reference: string, status: Status): Promise<void> {
    //an array?
    try {
      const payment = await this.payments.findOneAndUpdate(
        { reference },
        { status },
        {
          new: true,
        }
      );
    } catch (err) {
      console.log("err in repo", err);
    }
  }
}

export default PaymentRepo;
