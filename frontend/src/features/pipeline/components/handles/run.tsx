import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import type {
	CreateRunPayload,
	FinalizeRunPayload,
	PauseRunPayload,
	ResumeRunPayload,
	RunUpdatePayloadPayload,
} from "#/features/pipeline/commands";
import { usePipelineContext } from "#/features/pipeline/store";
import type { CanvasOperationNode } from "#/features/pipeline/types/canvas-node";
import { canvas } from "#/features/pipeline/utils/canvas";
import { command } from "#/lib/command";
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

	const pipelineId = store.state.id;

	const createRun = useCallback(
		async (payload: CreateRunPayload) => {
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
		async (payload: PauseRunPayload) => {
			await pauseRunMutation.mutateAsync({ runId: payload.runId });
		},
		[pauseRunMutation],
	);

	const resumeRun = useCallback(
		async (payload: ResumeRunPayload) => {
			await resumeRunMutation.mutateAsync({ runId: payload.runId });
		},
		[resumeRunMutation],
	);

	const finalizeRun = useCallback(
		async (payload: FinalizeRunPayload) => {
			await finalizeRunMutation.mutateAsync({ runId: payload.runId });
		},
		[finalizeRunMutation],
	);

	const updatePayload = useCallback(
		({ payload }: RunUpdatePayloadPayload) => {
			store.setState((prev) => ({
				...prev,
				run: { ...prev.run, payload },
			}));
		},
		[store],
	);

	useEffect(() => {
		const dispose1 = command.handle("pipelines.run.create", createRun as any, {
			instanceId: pipelineId,
			meta: { label: `Pipeline ${pipelineId}` },
		});
		const dispose2 = command.handle("pipelines.run.pause", pauseRun as any, {
			instanceId: pipelineId,
			meta: { label: `Pipeline ${pipelineId}` },
		});
		const dispose3 = command.handle("pipelines.run.resume", resumeRun as any, {
			instanceId: pipelineId,
			meta: { label: `Pipeline ${pipelineId}` },
		});
		const dispose4 = command.handle(
			"pipelines.run.finalize",
			finalizeRun as any,
			{
				instanceId: pipelineId,
				meta: { label: `Pipeline ${pipelineId}` },
			},
		);
		const dispose5 = command.handle(
			"pipelines.run.update.payload",
			updatePayload as any,
			{
				instanceId: pipelineId,
				meta: { label: `Pipeline ${pipelineId}` },
			},
		);

		return () => {
			dispose1();
			dispose2();
			dispose3();
			dispose4();
			dispose5();
		};
	}, [createRun, pauseRun, resumeRun, finalizeRun, updatePayload, pipelineId]);

	return null;
}
