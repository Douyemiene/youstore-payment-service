import * as mongoose from "mongoose";
import { Status } from "../../../domain/transfer";

export interface ITransfer {
  reference: string;
  status: Status;
  amount: number;
  customerId: string;
}

const TransferSchema = new mongoose.Schema<ITransfer>({
  reference: String,
  status: String,
  amount: Number,
  customerId: String
});

export const Transfers = mongoose.model<ITransfer>("Transfer", TransferSchema);
export default Transfers;
