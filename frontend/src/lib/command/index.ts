import { CommandBus } from "./command-bus";
import type { Actions } from "./global";
import { InstanceRegistry } from "./instance-registry";
import { TransitionStore } from "./transitions-store";
import type {
	Action,
	CommandMeta,
	Config,
	Dispose,
	Handler,
	ScopedAction,
} from "./types";

export type { Actions } from "./global";
export type { Action, ScopedAction } from "./types";

export class Command {
	private $commandBus: CommandBus;
	private $transitions: TransitionStore;
	private $registry: InstanceRegistry;

	constructor() {
		this.$transitions = TransitionStore.getInstance();
		this.$registry = InstanceRegistry.getInstance();
		this.$commandBus = new CommandBus(this.$transitions);
	}

	get bus() {
		return this.$commandBus;
	}

	get transitions() {
		return this.$transitions;
	}

	get registry() {
		return this.$registry;
	}

	handle(
		command: string,
		handler: Handler,
		_config?: { instanceId?: string; meta?: CommandMeta },
	): Dispose {
		return this.$commandBus.handle(command, handler);
	}

	dispatch(
		command: string,
		payload?: unknown,
		config?: Config,
	): Promise<unknown> {
		return this.$commandBus.dispatch(command, payload, config);
	}

	scoped(instanceId: string) {
		return new ScopedCommandProxy(this, instanceId);
	}

	createProxy(path: string[] = []): unknown {
		const self = this;
		return new Proxy(() => {}, {
			get(_target, prop: string) {
				if (prop === "handle") {
					return (
						command: string,
						handler: Handler,
						config?: { instanceId?: string; meta?: CommandMeta },
					) => self.handle(command, handler, config);
				}

				if (prop === "dispatch") {
					return (command: string, payload?: unknown, config?: Config) =>
						self.dispatch(command, payload, config);
				}

				if (prop === "scoped") {
					return (instanceId: string) => self.scoped(instanceId);
				}

				if (prop === "bus") {
					return self.$commandBus;
				}

				if (prop === "transitions") {
					return self.$transitions;
				}

				if (prop === "registry") {
					return self.$registry;
				}

				return self.createProxy([...path, prop]);
			},

			apply(_target, _thisArg, args: unknown[]) {
				const command = path.join(".");
				const payload = args[0];
				const config = args[1] as Config | undefined;

				return self.dispatch(command, payload, config);
			},
		});
	}
}

class ScopedCommandProxy {
	private $command: Command;
	private $instanceId: string;

	constructor(command: Command, instanceId: string) {
		this.$command = command;
		this.$instanceId = instanceId;
	}

	createProxy(path: string[] = []): unknown {
		const self = this;
		return new Proxy(() => {}, {
			get(_target, prop: string) {
				if (prop === "handle") {
					return (
						command: string,
						handler: Handler,
						config?: { meta?: CommandMeta },
					) =>
						self.$command.handle(command, handler, {
							instanceId: self.$instanceId,
							...config,
						});
				}

				if (prop === "dispatch") {
					return (
						command: string,
						payload?: unknown,
						config?: Omit<Config, "instanceId">,
					) =>
						self.$command.dispatch(command, payload, {
							...config,
							instanceId: self.$instanceId,
						});
				}

				return self.createProxy([...path, prop]);
			},

			apply(_target, _thisArg, args: unknown[]) {
				const command = path.join(".");
				const payload = args[0];
				const config = args[1] as Omit<Config, "instanceId"> | undefined;

				return self.$command.dispatch(command, payload, {
					...config,
					instanceId: self.$instanceId,
				});
			},
		});
	}
}

const command = new Command();

export const commands = command.createProxy() as Actions & {
	handle: (
		command: string,
		handler: Handler,
		config?: { instanceId?: string; meta?: CommandMeta },
	) => Dispose;
	dispatch: (
		command: string,
		payload?: unknown,
		config?: Config,
	) => Promise<unknown>;
	scoped: (instanceId: string) => unknown;
	bus: CommandBus;
	transitions: TransitionStore;
	registry: InstanceRegistry;
};
