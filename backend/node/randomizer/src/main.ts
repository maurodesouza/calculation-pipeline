import { RabbitMQAdapter } from "./infra/queue/rabbitmq-adapter";

async function main() {
	const queue = new RabbitMQAdapter();
	await queue.connect()

	await Promise.all([
		queue.setup("api.randomize", "randomizer", { type: "direct", routingKey: "run.created" })
	])

	queue.consume("randomizer", async (message: any, info) => {
		const exchange = `${info.fields.exchange.split(".")[0]}.events`
		const routingKey = info.fields.routingKey

		await new Promise((resolve) => setTimeout(resolve, 5000))

		await queue.publish(exchange, message, {routingKey})
	})

	console.log("🚀 randomizer is running")
}

main()
