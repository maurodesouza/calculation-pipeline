import React from "react";
import type { Renderable } from "#/types/renderable";

type FlexibleRenderProps = {
	render?: Renderable;
};

export function FlexibleRender(props: FlexibleRenderProps) {
	const { render: Render } = props;

	if (!Render) return <React.Fragment />;

	if (React.isValidElement(Render)) return <>{Render}</>;

	if (typeof Render === "function") return <Render />;

	return <React.Fragment />;
}
