import type { JSX } from "react";

export type Renderable<T = unknown> =
	| React.ReactNode
	| ((props?: T) => JSX.Element)
	| React.ReactElement;
