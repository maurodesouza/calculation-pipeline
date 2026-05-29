import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { events } from "#/events";
import {
	type CreateRunEventPayload,
	PipelineEvents,
} from "#/features/pipeline/events";
import { usePipelineContext } from "#/features/pipeline/store";
import type { CanvasOperationNode } from "#/features/pipeline/types/canvas-node";
import { canvas } from "#/features/pipeline/utils/canvas";
import { createRunMutationOptions } from "../../lib/react-query/create-run-mutation-options";

export function RunHandle() {
	const { store } = usePipelineContext();
	const createRunMutation = useMutation(createRunMutationOptions());

	const createRun = useCallback(
		async (payload: CreateRunEventPayload) => {
			const { id } = await createRunMutation.mutateAsync(payload);

			store.setState((state) => ({
				...state,
				run: { id, status: "pending" as const },
				nodes: state.nodes.map(
					canvas.nodes.map.updateOperationData({
						execution: {
							state: "pending" as const,
							runId: id,
						},
					}),
				) as CanvasOperationNode[],
			}));

			return { runId: id };
		},
		[createRunMutation, store],
	);

	useEffect(() => {
		const unsubscribe1 = events.on(PipelineEvents.CREATE_RUN, createRun);

		return () => {
			unsubscribe1();
		};
	}, [createRun]);

	return null;
}
