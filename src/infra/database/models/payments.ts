import * as mongoose from "mongoose";
import { Status } from "../../../domain/payment";

export interface IPayment {
  reference: string;
  status: Status;
  amount: number;
}

const PaymentSchema = new mongoose.Schema<IPayment>({
  reference: String,
  status: String,
  amount: Number,
});

export const Payments = mongoose.model<IPayment>("Payment", PaymentSchema);
export default Payments;
