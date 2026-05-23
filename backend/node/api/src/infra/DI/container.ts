export class Container {
	private static instance: Container
	private dependencies: Map<string, any> = new Map()

	private constructor() {}

	get(key: string) {
		if (!this.dependencies.has(key)) {
			throw new Error(`[container]: dependency ${key} not found`)
		}

		console.log("chegou aqui???")

		return this.dependencies.get(key)
	}

	register<T>(key: string, value: T): void {
		this.dependencies.set(key, value)
	}

	static getInstance(): Container {
		if (!Container.instance) {
			Container.instance = new Container()
		}
		return Container.instance
	}
}

export function inject(name: string) {
	return function (target: any, propertyKey: string) {
		console.log('inject name', name)
		console.log('inject propertyKey', propertyKey)
		console.log('inject target', target)

		// console.log('inject dep', Container.getInstance().get(name))

		target[propertyKey] = new Proxy({}, {
			get: function (_, property) {
				console.log('inject proxy get: property', property)

				return Container.getInstance().get(name)[property]
			}
		})
	}
}
