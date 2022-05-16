import amqp, { Channel, Connection, Message } from "amqplib";
import PaymentUseCase from "../../usecases/PaymentUseCase";
import { Status } from "../../domain/payment";

export interface IMessenger {
  createChannel(): Promise<void>;
  sendToQueue(queue: string, content: Object): void;
  assertQueue(queue: string): Promise<void>;
  publishToExchange(exchange: string, key: string, msg: Object)
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
    await this.assertExchange('orderEvents','topic')
    await this.assertExchange('paymentEvents','topic')
    await this.assertQueue("payments");
    await this.bindQueue('payments', 'orderEvents', 'orders.status.created');
    this.consumeOrder()
  }


  async assertQueue(queue: string): Promise<void> {
    await this.channel.assertQueue(queue, {
      durable: true,
    });
  }

  
  async assertExchange(exchange: string, exchangeType: string){
    await this.channel.assertExchange(exchange, exchangeType, {
      durable: true
    });
  }

  async bindQueue(queue: string, exchange: string, key: string): Promise<void> {
    await this.channel.bindQueue(queue, exchange, key);
  }

  async publishToExchange(exchange: string, key: string, msg: Object){
    await this.channel.publish(exchange, key, Buffer.from(JSON.stringify(msg)));
  }

  sendToQueue(queue: string, content: Object): void {
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(content)));
  }

  async consumeOrder(){
    this.channel.consume(
      "payments",
      (msg: Message | null) => {
        if (msg) {
          
          const data = JSON.parse(msg.content.toString());
          const routingKey = msg.fields.routingKey
          console.log(`msg ${routingKey}`)
          if(routingKey !== 'orders.status.created'){
            return
          }
          try {
            this.paymentUseCase.createPayment({
              status: Status.PENDING,
              reference: data.orderID,
              amount: data.amount,
            });
          } catch (err) {
            console.log("err", err);
          }
        }
      },
      { noAck: true }
    );
  }

 }

export default Messenger;
