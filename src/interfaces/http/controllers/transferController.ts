import { Request, Response } from "express";
import { IMessenger } from "../../../infra/messaging/messenger";
import TransferUseCase from "../../../usecases/TransferUseCase";
import { Status } from "../../../domain/transfer";

const axios = require("axios").default;

export class TransferController {
  transferUseCase: TransferUseCase;
  messenger: IMessenger;
  constructor({
    transferUseCase,
    messenger,
  }: {
    transferUseCase: TransferUseCase;
    messenger: IMessenger;
  }) {
    this.transferUseCase = transferUseCase;
    this.messenger = messenger;
  }

  async gettransferById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const order = await this.transferUseCase.gettransferById(id);
      res.status(200).json({ success: true, data: order });
    } catch ({ name, message }) {
      res.status(404).json({ success: false, data: null });
    }
  }

 
}

export default TransferController;