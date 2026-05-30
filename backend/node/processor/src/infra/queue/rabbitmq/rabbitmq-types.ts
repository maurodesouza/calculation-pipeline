import type * as amqp from "amqplib";

type ExchangeType = "direct" | "topic" | "headers" | "fanout";

type Exchange = {
	name: string;
	type: ExchangeType;
	config?: amqp.Options.AssertExchange;
};

type Queue = {
	name: string;
	config?: amqp.Options.AssertQueue;
	bindings: string[];
};

export type RabbitQMTopology = {
	exchange: Exchange;
	queues: Queue[];
};
