---
trigger: always_on
description: Use this rule when implementing event-driven architecture in the application.
---

# Frontend Event Architecture

## Overview

The project uses a type-safe event bus system with hierarchical event naming. Events are organized into two categories:

- **Global events**: Application-wide events defined in `frontend/src/events/global.ts`
- **Feature events**: Feature-specific events defined in `frontend/src/features/[feature]/events.ts`

---

## File Structure

```
frontend/src/
  events/
    index.ts          # Event bus and proxy API
    event-bus.ts      # EventBus implementation
    global.ts         # Global event definitions
  features/
    [feature]/
      events.ts       # Feature event definitions
      components/
        handles/
          index.tsx   # Handles registry
          [domain].tsx # Domain-specific handle
```

---

## Defining Events

### Global Events

Define global events in `frontend/src/events/global.ts`:

```typescript
export enum GlobalEvents {
	APP_INIT = "app.init",
	APP_READY = "app.ready",
}

declare module "#/events/index" {
	interface Events {
		app: {
			init: (payload?: unknown) => void;
			ready: (payload?: unknown) => void;
		};
	}
}
```

### Feature Events

Define feature events in `frontend/src/features/[feature]/events.ts`:

```typescript
export enum PipelineEvents {
	CANVAS_NODES_ADD = "pipelines.canvas.nodes.add",
	CANVAS_NODES_REMOVE = "pipelines.canvas.nodes.remove",
	SAVE_PIPELINE = "pipelines.save",
}

declare module "#/events/index" {
	interface Events {
		pipelines: {
			save: () => void;

			canvas: {
				nodes: {
					add: (payload: Node | Node[]) => void;
					remove: (payload: string | string[]) => void;
				};
			};
		};
	}
}
```

---

## Event Naming Convention

- Use **dot notation** for hierarchical structure: `feature.category.action`
- Enum values must match the full event path
- Structure mirrors the TypeScript interface hierarchy
- Examples:
  - `app.init` → `events.app.init()`
  - `pipelines.canvas.nodes.add` → `events.pipelines.canvas.nodes.add()`

---

## TypeScript Module Augmentation

All event files must augment the `#/events/index` module to provide type safety:

```typescript
declare module "#/events/index" {
	interface Events {
		[feature]: {
			[category]: {
				[action]: (payload?: T) => void;
			};
		};
	}
}
```

The interface structure must match the event hierarchy defined in the enum.

---

## Using Events

### Emitting Events

```typescript
import { events } from "#/events/index";

// Emit with payload
events.pipelines.canvas.nodes.add({ id: "1", type: "custom" });

// Emit without payload
events.pipelines.save();
```

### Listening to Events

```typescript
import { events } from "#/events/index";
import { PipelineEvents } from "#/features/pipeline/events";

// Subscribe to event
const unsubscribe = events.on(PipelineEvents.CANVAS_NODES_ADD, (payload) => {
	console.log("Node added:", payload);
});

// Unsubscribe when done
unsubscribe();
```

### Auto-unsubscribe in Components

```typescript
import { events } from "#/events/index";
import { PipelineEvents } from "#/features/pipeline/events";

useEffect(() => {
	const unsubscribe = events.on(PipelineEvents.CANVAS_NODES_ADD, (payload) => {
		// Handle event
	});

	return () => unsubscribe();
}, []);
```

---

## Event Handles

Event handles are React components that subscribe to feature-specific events and handle side effects (e.g., updating state, calling APIs). Each domain has its own handle component.

### Creating a Domain Handle

```typescript
// frontend/src/features/pipeline/components/handles/canvas.tsx
import { useCallback, useEffect } from "react";
import { events } from "#/events";
import { PipelineEvents } from "#/features/pipeline/events";
import { usePipelineContext } from "../../store";

export function CanvasHandle() {
	const { store } = usePipelineContext();

	const onAddNode = useCallback(
		(node: Node | Node[]) => {
			const nodes = Array.isArray(node) ? node : [node];
			store.setState((state) => ({
				...state,
				nodes: [...state.nodes, ...nodes],
			}));
		},
		[store],
	);

	useEffect(() => {
		const unsubscribe1 = events.on(PipelineEvents.CANVAS_NODES_ADD, onAddNode);
		const unsubscribe2 = events.on(PipelineEvents.CANVAS_NODES_CHANGE, onChangeNodes);

		return () => {
			unsubscribe1();
			unsubscribe2();
		};
	}, [onAddNode, onChangeNodes]);

	return null;
}
```

### Registering Handles

```typescript
// frontend/src/features/pipeline/components/handles/index.tsx
import { CanvasHandle } from "./canvas";

export function Handles() {
	return <CanvasHandle />;
}
```

### Mounting Handles

Mount the `Handles` component in the feature's root or page component:

```typescript
// frontend/src/features/pipeline/pages/canvas.tsx
import { Handles } from "../components/handles";

export function CanvasPage() {
	return (
		<>
			<Handles />
			{/* Other UI */}
		</>
	);
}
```

---

## Event Bus Implementation

The `EventBus` class (`event-bus.ts`) provides:

- `on(event, callback)`: Subscribe to event, returns unsubscribe function
- `emit(event, payload)`: Emit event with optional payload
- `off(event, callback)`: Manually unsubscribe from event

The proxy-based API (`index.ts`) converts method calls like `events.app.init()` into `eventBus.emit("app.init", payload)`.

---

## Best Practices

- **Define events where they belong**: Global events in `global.ts`, feature events in feature directory
- **Use hierarchical naming**: Group related events under feature and category
- **Type payloads**: Always define payload types in the interface
- **Clean up subscriptions**: Always call the unsubscribe function, especially in React effects
- **Keep enums in sync**: Enum values must match the full event path string
- **Import from feature**: When using feature events, import from the feature's events file to ensure type augmentation is loaded

---

## Implementation Checklist

- [ ] Define event enum in appropriate location (`global.ts` or feature `events.ts`)
- [ ] Augment `#/events/index` module with type-safe interface
- [ ] Create domain handle component in `components/handles/[domain].tsx` if it doesn't exist
- [ ] Mount `Handles` component in feature page or root
- [ ] Register handle in `components/handles/index.tsx`
- [ ] Emit events using proxy API (`events.feature.category.action()`)
- [ ] Subscribe to events using `events.on(EnumEvents.EVENT_NAME, callback)`
- [ ] Clean up subscriptions in useEffect cleanup function

---

## Example: Complete Feature Event Setup

```typescript
// frontend/src/features/pipeline/events.ts
import type { Node } from "@xyflow/react";

export enum PipelineEvents {
	NODE_ADD = "pipelines.node.add",
	NODE_REMOVE = "pipelines.node.remove",
}

declare module "#/events/index" {
	interface Events {
		pipelines: {
			node: {
				add: (payload: Node) => void;
				remove: (payload: string) => void;
			};
		};
	}
}
```

```typescript
// Usage in component
import { events } from "#/events/index";
import { PipelineEvents } from "#/features/pipeline/events";

useEffect(() => {
	const unsubscribe = events.on(PipelineEvents.NODE_ADD, (node) => {
		console.log("Node added:", node);
	});

	return () => unsubscribe();
}, []);
```
