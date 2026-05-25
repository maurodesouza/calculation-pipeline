export class Container {
	private static instance: Container;
	private dependencies: Map<string, any> = new Map();

	private constructor() {}

	get(key: string) {
		if (!this.dependencies.has(key)) {
			throw new Error(`[container]: dependency ${key} not found`);
		}

		return this.dependencies.get(key);
	}

	register<T>(key: string, value: T): void {
		this.dependencies.set(key, value);
	}

	static getInstance(): Container {
		if (!Container.instance) {
			Container.instance = new Container();
		}
		return Container.instance;
	}
}

export function inject(name: string) {
	return (target: any, propertyKey: string) => {
		target[propertyKey] = new Proxy(
			{},
			{
				get: (_, property) => Container.getInstance().get(name)[property],
			},
		);
	};
}
