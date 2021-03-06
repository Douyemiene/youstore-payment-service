import { Model } from "mongoose";
import { ITransferProps, Status } from "../../domain/transfer";
import { ITransfer } from "../database/models/transfers";

export interface ITransferRepo {
  save(transfer: ITransferProps): Promise<string>;
  getTransferById(id: string): Promise<ITransfer | null>;
  findByRefAndUpdate(id: string, transferStatus: Status): Promise<ITransfer | null>;
  getTransferByCustomer(id: string): Promise<ITransfer[] | null> 
}

export class TransferRepo implements ITransferRepo {
  private transfers: Model<ITransfer>;

  constructor({ transferModel }: { transferModel: Model<ITransfer> }) {
    this.transfers = transferModel;
  }

  async save(transfer: ITransferProps): Promise<string> {
    //transfer.transferStatus = null;
    const { _id } = await this.transfers.create(transfer);
    return _id.toString();
  }

 

  async getTransferById(id: string): Promise<ITransfer | null> {
    const transfer = await this.transfers.findById(id).exec();
    return transfer;
  }

  async getTransferByCustomer(id: string): Promise<ITransfer[] | null> {
    const transfer: ITransfer[] = await this.transfers.find({customerId: id}).exec();
    return transfer;
  }

  async findByRefAndUpdate(reference: string, status: Status): Promise<ITransfer | null> {
    //an array?
    try {
      const transfer = await this.transfers.findByIdAndUpdate(
        reference,
        { status },
        {
          new: true,
        }
      );
      return transfer
    } catch (err) {
      console.log("err in repo", err);
    }
  }
}

export default TransferRepo;
