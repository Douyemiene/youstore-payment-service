import { IPaymentRepo } from "../infra/repositories/payments";
import { IPaymentProps, Payment } from "../domain/payment";
import { IPayment } from "../infra/database/models/payments";

export class paymentUsecase {
  private paymentRepo: IPaymentRepo;

  constructor({ payments }: { payments: IPaymentRepo }) {
    this.paymentRepo = payments;
  }

  async createpayment(payment: IPaymentProps): Promise<string> {
    if (!payment.reference) {
      throw new Error();
    }
    const paymentToSave = Payment.create(payment).props;
    const id = this.paymentRepo.save(paymentToSave);
    return id;
  }

  // async getpaymentById(id: string): Promise<IPayment | null> {
  //   const payment = await this.paymentRepo.getPaymentById(id);
  //   return payment;
  // }

  async getpaymentByRef(id: string): Promise<IPayment | null> {
    const payment = await this.paymentRepo.getPaymentByRef(id);
    return payment;
  }

  async findByRefAndUpdateStatus(
    reference: string,
    status: boolean
  ): Promise<void> {
    console.log("update uscase");
    const payment = await this.paymentRepo.findByIdAndUpdate(reference, status);
  }
}

export default paymentUsecase;
