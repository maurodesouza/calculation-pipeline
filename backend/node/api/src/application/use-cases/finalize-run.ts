import type { Queue } from "../../application/queue/queue";
import { inject } from "../../infra/DI/container";

type Input = {
	runId: string;
};

export class FinalizeRunUseCase {
	@inject("queue")
	private declare readonly queue: Queue;

	async execute(input: Input): Promise<[true, undefined] | [undefined, Error]> {
		await this.queue.publish(
			"api.randomize",
			{ runId: input.runId },
			{ routingKey: "run.finalize-requested" },
		);

		return [true, undefined];
	}
}
