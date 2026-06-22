import type { DeepKeys } from "#/types/helpers";
import { CommandBus } from "./command-bus";
import { InstanceRegistry } from "./instance-registry";
import { TransitionStore } from "./transitions-store";
import type { Actions } from "./global";
import type {
	ActionPath,
	ActionPayload,
	ActionReturn,
	CommandMeta,
	Config,
	Handler,
	IsScopedCommand,
	ScopedAction,
	UnscopedCommands,
} from "./types";

export type {
	Action,
	Actions,
	HandleConfig,
	IsScopedCommand,
	ScopedAction,
	UnscopedCommands,
} from "./types";

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

	handle<TCommand extends ActionPath>(
		command: TCommand,
		handler: Handler<ActionPayload<TCommand>, ActionReturn<TCommand>>,
		config: { instanceId?: string; meta?: CommandMeta },
	): Dispose {
		const commandString = command as string;
		return this.$commandBus.handle(commandString, handler);
	}

	dispatch<TCommand extends ActionPath>(
		command: TCommand,
		payload?: ActionPayload<TCommand>,
		config?: Config,
	): Promise<ActionReturn<TCommand>> {
		const commandString = command as string;
		return this.$commandBus.dispatch(commandString, payload, config);
	}

	scoped(instanceId: string) {
		return new ScopedCommandProxy(this, instanceId);
	}

	private createProxy(path: string[] = []): unknown {
		return new Proxy(() => {}, {
			get(_target, prop: string) {
				if (prop === "handle") {
					return (
						command: string,
						handler: Handler,
						config: { instanceId?: string; meta?: CommandMeta },
					) => this.handle(command, handler, config);
				}

				if (prop === "dispatch") {
					return (
						command: string,
						payload?: unknown,
						config?: Config,
					) => this.dispatch(command, payload, config);
				}

				if (prop === "scoped") {
					return (instanceId: string) => this.scoped(instanceId);
				}

				if (prop === "bus") {
					return this.$commandBus;
				}

				if (prop === "transitions") {
					return this.$transitions;
				}

				if (prop === "registry") {
					return this.$registry;
				}

				return this.createProxy([...path, prop]);
			},

			apply(_target, _thisArg, args: unknown[]) {
				const command = path.join(".");
				const payload = args[0];
				const config = args[1] as Config | undefined;

				return this.dispatch(command, payload, config);
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

	private createProxy(path: string[] = []): unknown {
		return new Proxy(() => {}, {
			get(_target, prop: string) {
				if (prop === "handle") {
					return (
						command: string,
						handler: Handler,
						config: { meta?: CommandMeta },
					) =>
						this.$command.handle(command, handler, {
							instanceId: this.$instanceId,
							...config,
						});
				}

				if (prop === "dispatch") {
					return (
						command: string,
						payload?: unknown,
						config?: Omit<Config, "instanceId">,
					) =>
						this.$command.dispatch(command, payload, {
							...config,
							instanceId: this.$instanceId,
						});
				}

				return this.createProxy([...path, prop]);
			},

			apply(_target, _thisArg, args: unknown[]) {
				const command = path.join(".");
				const payload = args[0];
				const config = args[1] as Omit<Config, "instanceId"> | undefined;

				return this.$command.dispatch(command, payload, {
					...config,
					instanceId: this.$instanceId,
				});
			},
		});
	}
}

const command = new Command();

export const commands = command.createProxy() as Actions & {
	handle: <TCommand extends ActionPath>(
		command: TCommand,
		handler: Handler<ActionPayload<TCommand>, ActionReturn<TCommand>>,
		config?: { instanceId?: string; meta?: CommandMeta },
	) => Dispose;
	dispatch: <TCommand extends ActionPath>(
		command: TCommand,
		payload?: ActionPayload<TCommand>,
		config?: Config,
	) => Promise<ActionReturn<TCommand>>;
	scoped: (instanceId: string) => unknown;
	bus: CommandBus;
	transitions: TransitionStore;
	registry: InstanceRegistry;
};
