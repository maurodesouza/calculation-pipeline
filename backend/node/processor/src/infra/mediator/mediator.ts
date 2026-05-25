import { Event } from "../../domain/events/event";

type EventConstructor<T extends Event> = new (...args: any[]) => T;

export class Mediator {
  handles: Map<string, Function[]> = new Map();

  constructor () {}

  register<T extends Event>(event: EventConstructor<T>, callback: Function) {
    const eventName = new event().getEventName();

    if (!this.handles.has(eventName)) this.handles.set(eventName, []);

    this.handles.get(eventName)?.push(callback);
  }

  async notifyAll<T extends Event>(event: T) {
    const callbacks = this.handles.get(event.getEventName()) ?? [];

    for (const callback of callbacks) await callback(event);
  }
}
