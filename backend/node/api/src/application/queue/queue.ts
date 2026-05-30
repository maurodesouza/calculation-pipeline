export type PublishConfig = {
	headers?: Record<string, unknown>;
};

type Metadata = {
	event: string;
};

export type ConsumeCallback<T> = (
	message: T,
	metadata: Metadata,
	headers?: Record<string, unknown>,
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
		event: string,
		callback: ConsumeCallback<T>,
	): Promise<void>;
};
