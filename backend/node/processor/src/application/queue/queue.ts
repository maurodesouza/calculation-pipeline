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
