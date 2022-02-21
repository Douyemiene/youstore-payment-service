import * as mongoose from "mongoose";

export interface IPayment {
  reference: string;
  status: boolean | null;
  orderid: string;
}

const PaymentSchema = new mongoose.Schema<IPayment>({
  reference: String,
  status: Boolean,
  orderid: String,
});

export const Payments = mongoose.model<IPayment>("Payment", PaymentSchema);
export default Payments;
