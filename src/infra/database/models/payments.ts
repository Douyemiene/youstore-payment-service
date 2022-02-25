import * as mongoose from "mongoose";

export interface IPayment {
  reference: string;
  status: boolean | null;
}

const PaymentSchema = new mongoose.Schema<IPayment>({
  reference: String,
  status: Boolean,
});

export const Payments = mongoose.model<IPayment>("Payment", PaymentSchema);
export default Payments;
