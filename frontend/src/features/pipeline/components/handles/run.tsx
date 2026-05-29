import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { events } from "#/events";
import {
	type CreateRunEventPayload,
	type PauseRunEventPayload,
	PipelineEvents,
	type ResumeRunEventPayload,
} from "#/features/pipeline/events";
import { usePipelineContext } from "#/features/pipeline/store";
import type { CanvasOperationNode } from "#/features/pipeline/types/canvas-node";
import { canvas } from "#/features/pipeline/utils/canvas";
import { createRunMutationOptions } from "../../lib/react-query/create-run-mutation-options";
import { pauseRunMutationOptions } from "../../lib/react-query/pause-run-mutation-options";
import { resumeRunMutationOptions } from "../../lib/react-query/resume-run-mutation-options";

export function RunHandle() {
	const { store } = usePipelineContext();
	const createRunMutation = useMutation(createRunMutationOptions());
	const pauseRunMutation = useMutation(pauseRunMutationOptions());
	const resumeRunMutation = useMutation(resumeRunMutationOptions());

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

	const pauseRun = useCallback(
		async (payload: PauseRunEventPayload) => {
			await pauseRunMutation.mutateAsync({ runId: payload.runId });
		},
		[pauseRunMutation],
	);

	const resumeRun = useCallback(
		async (payload: ResumeRunEventPayload) => {
			await resumeRunMutation.mutateAsync({ runId: payload.runId });
		},
		[resumeRunMutation],
	);

	useEffect(() => {
		const unsubscribe1 = events.on(PipelineEvents.CREATE_RUN, createRun);
		const unsubscribe2 = events.on(PipelineEvents.RUN_PAUSE, pauseRun);
		const unsubscribe3 = events.on(PipelineEvents.RUN_RESUME, resumeRun);

		return () => {
			unsubscribe1();
			unsubscribe2();
			unsubscribe3();
		};
	}, [createRun, pauseRun, resumeRun]);

	return null;
}
