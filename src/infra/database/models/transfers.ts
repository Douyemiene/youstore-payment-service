import * as mongoose from "mongoose";
import { Status } from "../../../domain/transfer";

export interface ITransfer {
  status: Status;
  amount: number;
  customerId: string;
  accName: string;
  accNo: string
}

const TransferSchema = new mongoose.Schema<ITransfer>({
  status: String,
  amount: Number,
  customerId: String,
  accName: String,
  accNo: String

});

export const Transfers = mongoose.model<ITransfer>("Transfer", TransferSchema);
export default Transfers;
