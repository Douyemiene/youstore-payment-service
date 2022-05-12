import { IPaymentRepo } from "../infra/repositories/payments";
import { IPaymentProps, Payment, Status } from "../domain/payment";
import { IPayment } from "../infra/database/models/payments";

export class PaymentUsecase {
  private paymentRepo: IPaymentRepo;

  constructor({ payments }: { payments: IPaymentRepo }) {
    this.paymentRepo = payments;
  }

  async createPayment(payment: IPaymentProps): Promise<string> {
    const paymentToSave = Payment.create(payment).props;
    const id = this.paymentRepo.save(paymentToSave);
    return id;
  }

  async getpaymentById(id: string): Promise<IPayment | null> {
    const payment = await this.paymentRepo.getPaymentById(id);
    return payment;
  }

  async getpaymentByRef(id: string): Promise<IPayment | null> {
    const payment = await this.paymentRepo.getPaymentByRef(id);
    return payment;
  }

  async findByRefAndUpdateStatus(
    reference: string,
    status: Status
  ): Promise<void> {
    const payment = await this.paymentRepo.findByRefAndUpdate(
      reference,
      status
    );
  }
}

export default PaymentUsecase;
