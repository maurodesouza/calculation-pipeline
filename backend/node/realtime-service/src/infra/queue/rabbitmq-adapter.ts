import amqp from "amqplib";

type ConsumeCallback<T> = (message: T) => Promise<void>;

type SetupConfig = {
	type: "direct" | "fanout" | "topic";
	routingKey: string;
};

const DEFAULT_CONFIG: SetupConfig = {
	type: "direct",
	routingKey: "",
};

export class RabbitMQAdapter {
	private connection!: amqp.ChannelModel;
	private channel!: amqp.Channel;

	async connect(): Promise<void> {
		this.connection = await amqp.connect("amqp://localhost");
		this.channel = await this.connection.createChannel();
	}

	async setup(
		exchange: string,
		queue: string,
		config = DEFAULT_CONFIG,
	): Promise<void> {
		this.channel.assertExchange(exchange, config.type, { durable: true });
		this.channel.assertQueue(queue, { durable: true });
		this.channel.bindQueue(queue, exchange, config.routingKey);
	}

	async consume<T = unknown>(
		queue: string,
		callback: ConsumeCallback<T>,
	): Promise<void> {
		await this.channel.consume(queue, async (msg) => {
			if (!msg) return;

			try {
				const input = JSON.parse(msg.content.toString()) as T;
				await callback(input);
				this.channel.ack(msg);
			} catch (error) {
				console.error(error);
			}
		});
	}
}
