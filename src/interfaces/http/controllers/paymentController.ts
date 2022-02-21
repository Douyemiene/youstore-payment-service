import { Request, Response } from "express";
import { IMessenger } from "../../../infra/messaging/messenger";
import OrderUseCase from "../../../usecases/OrderUseCase";

export class OrderController {
  orderUseCase: OrderUseCase;
  messenger: IMessenger;

  constructor({
    orderUseCase,
    messenger,
  }: {
    orderUseCase: OrderUseCase;
    messenger: IMessenger;
  }) {
    this.orderUseCase = orderUseCase;
    this.messenger = messenger;
  }

  async createOrder(req: Request, res: Response): Promise<void> {
    const {
      customerId,
      total,
      products,
    }: {
      customerId: string;
      total: number;
      products: Array<{ name: string; quantity: number }>;
    } = req.body;
    try {
      const orderID = await this.orderUseCase.createOrder({
        customerId,
        total,
        products,
      });
      //this.messenger.assertQueue("order_created");
      this.messenger.sendToQueue("order_created", { orderID });
      res.status(201).json({ success: true, data: { id: orderID } });
    } catch (err) {
      res.status(400).json({ success: false });
    }
  }

  async getOrdersfromCustomer(req: Request, res: Response): Promise<void> {
    const customerID = req.params.id;

    try {
      const order = await this.orderUseCase.getOrdersfromCustomer(customerID);
      res.status(200).json({ success: true, data: order });
    } catch (err) {
      res.status(400).json({ success: false });
    }
  }

  async getOrderById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const order = await this.orderUseCase.getOrderById(id);
      res.status(200).json({ success: true, data: order });
    } catch ({ name, message }) {
      res.status(400).json({ success: false, error: name, message: message });
    }
  }

  async findByIdAndUpdateStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { orderStatus } = req.body;
    try {
      const order = await this.orderUseCase.findByIdAndUpdateStatus(
        id,
        orderStatus
      );
      res.status(200).json({ success: true, data: order });
    } catch (err) {
      res.status(400).json({ success: false, err: err });
    }
  }
}

export default OrderController;
