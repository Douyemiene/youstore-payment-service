import { ITransferRepo } from "../infra/repositories/transfers";
import { ITransferProps, Transfer, Status } from "../domain/transfer";
import { ITransfer } from "../infra/database/models/transfers";

export class TransferUsecase {
  private transferRepo: ITransferRepo;

  constructor({ transfers }: { transfers: ITransferRepo }) {
    this.transferRepo = transfers;
  }

  async createTransfer(transfer: ITransferProps): Promise<string> {
    const transferToSave = Transfer.create(transfer).props;
    const id = this.transferRepo.save(transferToSave);
    return id;
  }

  async gettransferById(id: string): Promise<ITransfer | null> {
    const transfer = await this.transferRepo.getTransferById(id);
    return transfer;
  }


  async gettransferByCustomer(id: string): Promise<ITransfer[] | null> {
    const transfer = await this.transferRepo.getTransferByCustomer(id);
    return transfer;
  }

  async findByRefAndUpdateStatus(
    reference: string,
    status: Status
  ): Promise<ITransfer | null> {
    const transfer = await this.transferRepo.findByRefAndUpdate(
      reference,
      status
    );

    return transfer
  }
}

export default TransferUsecase;
