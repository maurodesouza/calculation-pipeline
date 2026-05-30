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
	publish(
		event: string,
		message: unknown,
		config?: PublishConfig,
	): Promise<void>;
	consume<T = unknown>(
		queue: string,
		callback: ConsumeCallback<T>,
	): Promise<void>;
};
