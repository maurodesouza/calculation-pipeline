import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { events } from "#/events";
import {
	type CreateRunEventPayload,
	type FinalizeRunEventPayload,
	type PauseRunEventPayload,
	PipelineEvents,
	type ResumeRunEventPayload,
	type RunUpdatePayloadEventPayload,
} from "#/features/pipeline/events";
import { usePipelineContext } from "#/features/pipeline/store";
import type { CanvasOperationNode } from "#/features/pipeline/types/canvas-node";
import { canvas } from "#/features/pipeline/utils/canvas";
import { createRunMutationOptions } from "../../lib/react-query/create-run-mutation-options";
import { finalizeRunMutationOptions } from "../../lib/react-query/finalize-run-mutation-options";
import { pauseRunMutationOptions } from "../../lib/react-query/pause-run-mutation-options";
import { resumeRunMutationOptions } from "../../lib/react-query/resume-run-mutation-options";

export function RunHandle() {
	const { store } = usePipelineContext();
	const createRunMutation = useMutation(createRunMutationOptions());
	const finalizeRunMutation = useMutation(finalizeRunMutationOptions());
	const pauseRunMutation = useMutation(pauseRunMutationOptions());
	const resumeRunMutation = useMutation(resumeRunMutationOptions());

	const createRun = useCallback(
		async (payload: CreateRunEventPayload) => {
			const { id } = await createRunMutation.mutateAsync(payload);

			store.setState((state) => ({
				...state,
				run: { id, status: "pending" as const, payload: state.run.payload },
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

	const finalizeRun = useCallback(
		async (payload: FinalizeRunEventPayload) => {
			await finalizeRunMutation.mutateAsync({ runId: payload.runId });
		},
		[finalizeRunMutation],
	);

	const updatePayload = useCallback(
		({ payload }: RunUpdatePayloadEventPayload) => {
			store.setState((prev) => ({
				...prev,
				run: { ...prev.run, payload },
			}));
		},
		[store],
	);

	useEffect(() => {
		const unsubscribe1 = events.on(PipelineEvents.CREATE_RUN, createRun);
		const unsubscribe2 = events.on(PipelineEvents.RUN_PAUSE, pauseRun);
		const unsubscribe3 = events.on(PipelineEvents.RUN_RESUME, resumeRun);
		const unsubscribe4 = events.on(PipelineEvents.RUN_FINALIZE, finalizeRun);
		const unsubscribe5 = events.on(
			PipelineEvents.RUN_UPDATE_PAYLOAD,
			updatePayload,
		);

		return () => {
			unsubscribe1();
			unsubscribe2();
			unsubscribe3();
			unsubscribe4();
			unsubscribe5();
		};
	}, [createRun, pauseRun, resumeRun, finalizeRun, updatePayload]);

	return null;
}
