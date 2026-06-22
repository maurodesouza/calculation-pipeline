import type { DeepKeys } from "#/types/helpers";
import { CommandBus } from "./command-bus";
import type { Actions } from "./global";
import { InstanceRegistry } from "./instance-registry";
import { TransitionStore } from "./transitions-store";
import type {
	ActionPath,
	ActionPayload,
	ActionReturn,
	CommandMeta,
	Config,
	Handler,
	ScopedCommands,
	UnscopedCommands,
} from "./types";

export type { Actions } from "./global";
export type {
	Action,
	HandleConfig,
	IsScopedCommand,
	ScopedAction,
	UnscopedCommands,
} from "./types";

export class Command {
	// Core subsystems
	private $commandBus: CommandBus;
	private $transitions: TransitionStore;
	private $instanceRegistry: InstanceRegistry;

	constructor() {
		// Initialize singleton instances for transitions and instance registry
		this.$transitions = TransitionStore.getInstance();
		this.$commandBus = new CommandBus(this.$transitions);
		this.$instanceRegistry = InstanceRegistry.getInstance();
	}

	handle<TCommand extends ScopedCommands>(
		command: TCommand,
		handler: Handler<ActionPayload<TCommand>, ActionReturn<TCommand>>,
		config: {
			instanceId: string;
			meta?: CommandMeta;
		},
	): () => void;
	handle<TCommand extends UnscopedCommands>(
		command: TCommand,
		handler: Handler<ActionPayload<TCommand>, ActionReturn<TCommand>>,
		config?: {
			meta?: CommandMeta;
		},
	): () => void;
	handle<TCommand extends ActionPath>(
		command: TCommand,
		handler: Handler<ActionPayload<TCommand>, ActionReturn<TCommand>>,
		config?: {
			instanceId?: string;
			meta?: CommandMeta;
		},
	) {
		// Parse command to extract domain, key, and instanceId
		const result = this.parseCommand(command, config?.instanceId);
		const { domain, key, instanceId } = result;

		// Register instance if this is a scoped command
		if (domain && instanceId) {
			this.$instanceRegistry.add(domain, {
				id: instanceId,
				label: config?.meta?.label,
			});
		}

		// Register handler with command bus
		const dispose = this.$commandBus.handle<
			ActionPayload<TCommand>,
			ActionReturn<TCommand>
		>(key, handler);

		// Return cleanup function
		return () => {
			if (domain && instanceId)
				this.$instanceRegistry.remove(domain, instanceId);
			dispose();
		};
	}

	dispatch<TCommand extends ActionPath>(
		command: TCommand,
		payload?: ActionPayload<TCommand>,
		config?: Config,
	) {
		// Parse command to get the internal key
		const result = this.parseCommand(command, config?.instanceId);
		// Dispatch to command bus with optional transition tracking
		return this.$commandBus.dispatch<ActionPayload<TCommand>>(
			result.key,
			payload,
			config,
		);
	}

	getActionsProxy(path: DeepKeys<Actions>[] = []): Actions {
		const self = this;

		// Create a proxy that builds the command path and dispatches when called
		return new Proxy(() => {}, {
			// Build nested path for command access (e.g., actions.pipelines.canvas.nodes.add)
			get(_target, prop: DeepKeys<Actions>) {
				return self.getActionsProxy([...path, prop]);
			},

			// When called as a function, dispatch the command with the built path
			apply(_target, _thisArg, args: [ActionPayload<ActionPath>, Config?]) {
				const commandName = path.join(".") as ActionPath;
				return self.dispatch(commandName, args[0], args[1]);
			},
		}) as unknown as Actions;
	}

	private parseCommand(command: ActionPath, instanceId?: string) {
		// Split command path to extract domain and action
		const parts = command.split(".");
		const hasDomain = parts.length > 1;

		// Global commands have no domain (e.g., "counter.increment")
		if (!hasDomain) {
			return { domain: undefined, instanceId, key: command };
		}

		// Scoped commands have a domain (e.g., "pipelines.canvas.nodes.add")
		const domain = parts[0];
		const path = parts.slice(1).join(".");
		// For scoped commands, prepend instanceId to create unique key
		const key = instanceId ? `${instanceId}:${domain}.${path}` : command;

		return { domain, instanceId, key };
	}
}

export const command = new Command();

export const actions = command.getActionsProxy();
