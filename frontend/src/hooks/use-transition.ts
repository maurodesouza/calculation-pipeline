import { useSyncExternalStore } from "react";
import { events } from "#/events/index";

export function useTransition(key: unknown[]) {
	const transitionKey = JSON.stringify(key);

	return useSyncExternalStore(
		(callback) => events.subscribe(callback),

		() => events.isExecuting(transitionKey),
	);
}
