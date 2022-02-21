import amqp, { Channel, Connection, Message } from "amqplib";
import PaymentUseCase from "../../usecases/PaymentUseCase";

export interface IMessenger {
  createChannel(): Promise<void>;
  sendToQueue(queue: string, content: Object): void;
  assertQueue(queue: string): Promise<void>;
}

export class Messenger implements IMessenger {
  private channel!: Channel;
  private paymentUseCase: PaymentUseCase;

  constructor({ paymentUseCase }: { paymentUseCase: PaymentUseCase }) {
    this.paymentUseCase = paymentUseCase;
  }

  async createChannel(): Promise<void> {
    const amqp_url = process.env.AMQP_URL || "";
    const connection: Connection = await amqp.connect(amqp_url);

    this.channel = await connection.createChannel();
  }
  async assertQueue(queue: string): Promise<void> {
    await this.channel.assertQueue(queue, {
      durable: false,
    });
  }
  sendToQueue(queue: string, content: Object): void {
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(content)));
  }
}

export default Messenger;
