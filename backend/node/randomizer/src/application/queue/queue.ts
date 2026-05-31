export type PublishConfig = {
	headers?: Record<string, string | number | boolean>;
};

export type MessageMetadata = {
	event: string;
	topic: string;
};

export type ConsumeCallback<T> = (
	message: T,
	metadata: MessageMetadata,
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
