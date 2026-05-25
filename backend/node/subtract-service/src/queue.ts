import amqp from "amqplib";

export type QueueSetupConfig = {
  type: string
  routingKey: string
}

export type PublishSetupConfig = {
  routingKey?: string
}

export type Queue = {
    connect(): Promise<void>;
    setup(exchange: string, queue: string, config: QueueSetupConfig): Promise<void>;
    publish(exchange: string, message: any, config?: PublishSetupConfig): Promise<void>;
    consume(queue: string, callback: Function): Promise<void>;
};

const DEFAULT_SETUP_CONFIG: QueueSetupConfig = {
  type: "direct",
  routingKey: "",
}

export class RabbitMQAdapter implements Queue {
  connection!: amqp.ChannelModel
  channel!: amqp.Channel

  async connect(): Promise<void> {
    this.connection = await amqp.connect("amqp://localhost");
    this.channel = await this.connection.createChannel();
  }

  async setup(exchange: string, queue: string, config = DEFAULT_SETUP_CONFIG): Promise<void> {
    this.channel.assertExchange(exchange, config.type, { durable: true });
    this.channel.assertQueue(queue, { durable: true });
    this.channel.bindQueue(queue, exchange, config.routingKey);
  }

  async publish(exchange: string, message: any, config?: PublishSetupConfig): Promise<void> {
    this.channel.publish(exchange, config?.routingKey || "", Buffer.from(JSON.stringify(message)));
  }

  async consume(queue: string, callback: Function): Promise<void> {
    await this.channel.consume(queue, async (msg) => {
        if (!msg) return;

        try {
          const input = JSON.parse(msg.content.toString());
          await callback(input);
          this.channel.ack(msg);
        } catch (error) {
          console.error(error);
        }
    });
  }
}
