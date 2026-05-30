import amqp from "amqplib";

export type PublishConfig = {
	headers?: Record<string, string | number | boolean>;
};

export type ConsumeCallback<T> = (
	message: T,
	metadata: { event: string },
	headers: Record<string, unknown>,
) => Promise<void>;

export type Queue = {
	connect(): Promise<void>;
	setup(topology: unknown): Promise<void>;
	publish(event: string, message: unknown, config?: PublishConfig): Promise<void>;
	consume<T = unknown>(queue: string, callback: ConsumeCallback<T>): Promise<void>;
};

export class RabbitMQAdapter implements Queue {
	connection!: amqp.ChannelModel;
	channel!: amqp.Channel;

	async connect(): Promise<void> {
		this.connection = await amqp.connect("amqp://localhost");
		this.channel = await this.connection.createChannel();
	}

	async setup(topologies: RabbitQMTopology[]): Promise<void> {
		for (const topology of topologies) {
			await this.channel.assertExchange(
				topology.exchange.name,
				topology.exchange.type,
				topology.exchange.config,
			);

			for (const queue of topology.queues) {
				await this.channel.assertQueue(queue.name, queue.config);

				for (const binding of queue.bindings) {
					await this.channel.bindQueue(
						queue.name,
						topology.exchange.name,
						binding,
					);
				}
			}
		}
	}

	async publish(
		event: string,
		message: unknown,
		config?: PublishConfig,
	): Promise<void> {
		this.channel.publish(
			"sum.randomize",
			event,
			Buffer.from(JSON.stringify(message)),
			config,
		);
	}

	async consume<T = unknown>(
		queue: string,
		callback: ConsumeCallback<T>,
	): Promise<void> {
		await this.channel.consume(queue, async (msg) => {
			if (!msg) return;

			const metadata = { event: msg.fields.routingKey };
			const headers = msg.properties.headers ?? {};

			try {
				const input = JSON.parse(msg.content.toString()) as T;
				await callback(input, metadata, headers);
				this.channel.ack(msg);
			} catch (error) {
				console.error(error);
			}
		});
	}
}

type ExchangeType = "direct" | "topic" | "headers" | "fanout";

type Exchange = {
	name: string;
	type: ExchangeType;
	config?: amqp.Options.AssertExchange;
};

type QueueDef = {
	name: string;
	config?: amqp.Options.AssertQueue;
	bindings: string[];
};

export type RabbitQMTopology = {
	exchange: Exchange;
	queues: QueueDef[];
};
