import amqp from "amqplib";
import type {
	PublishSetupConfig,
	Queue,
	QueueSetupConfig,
} from "../../application/queue/queue";

type ConsumeCallbackInfo = {
	fields: amqp.ConsumeMessageFields;
	properties: amqp.MessageProperties;
};

type ConsumeCallback<T> = (
	message: T,
	info: ConsumeCallbackInfo,
) => Promise<void>;

const DEFAULT_SETUP_CONFIG: QueueSetupConfig = {
	type: "direct",
	routingKey: "",
};

export class RabbitMQAdapter implements Queue {
	connection!: amqp.ChannelModel;
	channel!: amqp.Channel;

	async connect(): Promise<void> {
		this.connection = await amqp.connect("amqp://localhost");
		this.channel = await this.connection.createChannel();
	}

	async setup(
		exchange: string,
		queue: string,
		config = DEFAULT_SETUP_CONFIG,
	): Promise<void> {
		this.channel.assertExchange(exchange, config.type, { durable: true });
		this.channel.assertQueue(queue, { durable: true });
		this.channel.bindQueue(queue, exchange, config.routingKey);
	}

	async publish(
		exchange: string,
		message: any,
		config?: PublishSetupConfig,
	): Promise<void> {
		this.channel.publish(
			exchange,
			config?.routingKey || "",
			Buffer.from(JSON.stringify(message)),
		);
	}

	async consume<T = any>(
		queue: string,
		callback: ConsumeCallback<T>,
	): Promise<void> {
		await this.channel.consume(queue, async (msg) => {
			if (!msg) return;

			const info = {
				fields: msg.fields,
				properties: msg.properties,
			};

			try {
				const input = JSON.parse(msg.content.toString());
				await callback(input, info);
				this.channel.ack(msg);
			} catch (error) {
				console.error(error);
			}
		});
	}
}
