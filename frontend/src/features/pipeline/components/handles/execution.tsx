import { useCallback, useEffect } from "react";
import { useSelector } from "@tanstack/react-store";
import { usePipelineContext } from "#/features/pipeline/store";
import type { CanvasOperationNode } from "#/features/pipeline/types/canvas-node";
import { canvas } from "#/features/pipeline/utils/canvas";
import { command } from "#/lib/command/index";
import type {
	RunStartedPayload,
	RunCompletedPayload,
	RunFailedPayload,
	RunPausedPayload,
	RunResumedPayload,
	ExecutionRunFinalizedPayload,
	StepStartedPayload,
	StepFinishedPayload,
} from "#/features/pipeline/commands";

export function ExecutionHandle() {
	const { store } = usePipelineContext();
	const pipelineId = useSelector(store, (state) => state.id);

	const handleRunStarted = useCallback(
		({ runId }: RunStartedPayload) => {
			const state = store.state;

			if (state.run.id !== runId) return;

			store.setState((prev) => ({
				...prev,
				run: { ...prev.run, status: "started" as const },
			}));
		},
		[store],
	);

	const handleRunCompleted = useCallback(
		({ runId }: RunCompletedPayload) => {
			const state = store.state;

			if (state.run.id !== runId) return;

			store.setState((prev) => ({
				...prev,
				run: { ...prev.run, status: "completed" as const },
			}));
		},
		[store],
	);

	const handleRunFailed = useCallback(
		({ runId }: RunFailedPayload) => {
			const state = store.state;

			if (state.run.id !== runId) return;

			store.setState((prev) => ({
				...prev,
				run: { ...prev.run, status: "failed" as const },
			}));
		},
		[store],
	);

	const handleRunPaused = useCallback(
		({ runId }: RunPausedPayload) => {
			const state = store.state;

			if (state.run.id !== runId) return;

			store.setState((prev) => ({
				...prev,
				run: { ...prev.run, status: "paused" as const },
			}));
		},
		[store],
	);

	const handleRunResumed = useCallback(
		({ runId }: RunResumedPayload) => {
			const state = store.state;

			if (state.run.id !== runId) return;

			store.setState((prev) => ({
				...prev,
				run: { ...prev.run, status: "started" as const },
			}));
		},
		[store],
	);

	const handleRunFinalized = useCallback(
		({ runId }: ExecutionRunFinalizedPayload) => {
			const state = store.state;

			if (state.run.id !== runId) return;

			store.setState((prev) => ({
				...prev,
				run: { ...prev.run, id: null, status: "idle" as const },
				nodes: prev.nodes.map(
					canvas.nodes.map.clearExecution(),
				) as CanvasOperationNode[],
			}));
		},
		[store],
	);

	const handleStepStarted = useCallback(
		({ runId, stepId }: StepStartedPayload) => {
			const state = store.state;

			if (state.run.id !== runId) return;

			const node = state.nodes.find(canvas.nodes.find.byId(stepId)) as
				| CanvasOperationNode
				| undefined;

			if (!node || node.data.execution?.state !== "pending") return;

			store.setState((prev) => ({
				...prev,
				nodes: prev.nodes.map(
					canvas.nodes.map.updateData(stepId, {
						execution: {
							state: "running" as const,
							runId,
						},
					}),
				) as CanvasOperationNode[],
			}));
		},
		[store],
	);

	const handleStepFinished = useCallback(
		({ runId, stepId, result, error }: StepFinishedPayload) => {
			const state = store.state;

			if (state.run.id !== runId) return;

			const node = state.nodes.find(canvas.nodes.find.byId(stepId)) as
				| CanvasOperationNode
				| undefined;

			if (
				!node ||
				!["pending", "running"].includes(node.data.execution?.state || "")
			)
				return;

			const newState = error ? "failed" : "completed";

			store.setState((prev) => ({
				...prev,
				nodes: prev.nodes.map(
					canvas.nodes.map.updateData(node.id, {
						execution: {
							state: newState,
							runId,
							result,
							error,
						},
					}),
				) as CanvasOperationNode[],
			}));
		},
		[store],
	);

	const handleClearExecution = useCallback(() => {
		store.setState((prev) => ({
			...prev,
			run: { ...prev.run, id: null, status: "idle" as const },
			nodes: prev.nodes.map(
				canvas.nodes.map.clearExecution(),
			) as CanvasOperationNode[],
		}));
	}, [store]);

	useEffect(() => {
		// Command handlers for execution events
		const disposeRunStarted = command.handle(
			"pipelines.execution.run.started",
			async (payload: unknown) => {
				handleRunStarted(payload as RunStartedPayload);
			},
			{
				instanceId: pipelineId,
				meta: { label: `Pipeline ${pipelineId}` },
			},
		);

		const disposeRunCompleted = command.handle(
			"pipelines.execution.run.completed",
			async (payload: unknown) => {
				handleRunCompleted(payload as RunCompletedPayload);
			},
			{
				instanceId: pipelineId,
				meta: { label: `Pipeline ${pipelineId}` },
			},
		);

		const disposeRunFailed = command.handle(
			"pipelines.execution.run.failed",
			async (payload: unknown) => {
				handleRunFailed(payload as RunFailedPayload);
			},
			{
				instanceId: pipelineId,
				meta: { label: `Pipeline ${pipelineId}` },
			},
		);

		const disposeRunPaused = command.handle(
			"pipelines.execution.run.paused",
			async (payload: unknown) => {
				handleRunPaused(payload as RunPausedPayload);
			},
			{
				instanceId: pipelineId,
				meta: { label: `Pipeline ${pipelineId}` },
			},
		);

		const disposeRunResumed = command.handle(
			"pipelines.execution.run.resumed",
			async (payload: unknown) => {
				handleRunResumed(payload as RunResumedPayload);
			},
			{
				instanceId: pipelineId,
				meta: { label: `Pipeline ${pipelineId}` },
			},
		);

		const disposeRunFinalized = command.handle(
			"pipelines.execution.run.finalized",
			async (payload: unknown) => {
				handleRunFinalized(payload as ExecutionRunFinalizedPayload);
			},
			{
				instanceId: pipelineId,
				meta: { label: `Pipeline ${pipelineId}` },
			},
		);

		const disposeStepStarted = command.handle(
			"pipelines.execution.step.started",
			async (payload: unknown) => {
				handleStepStarted(payload as StepStartedPayload);
			},
			{
				instanceId: pipelineId,
				meta: { label: `Pipeline ${pipelineId}` },
			},
		);

		const disposeStepFinished = command.handle(
			"pipelines.execution.step.finished",
			async (payload: unknown) => {
				handleStepFinished(payload as StepFinishedPayload);
			},
			{
				instanceId: pipelineId,
				meta: { label: `Pipeline ${pipelineId}` },
			},
		);

		const disposeClearExecution = command.handle(
			"pipelines.execution.clear",
			async () => {
				handleClearExecution();
			},
			{
				instanceId: pipelineId,
				meta: { label: `Pipeline ${pipelineId}` },
			},
		);

		return () => {
			disposeRunStarted();
			disposeRunCompleted();
			disposeRunFailed();
			disposeRunPaused();
			disposeRunResumed();
			disposeRunFinalized();
			disposeStepStarted();
			disposeStepFinished();
			disposeClearExecution();
		};
	}, [
		pipelineId,
		handleRunStarted,
		handleRunCompleted,
		handleRunFailed,
		handleRunPaused,
		handleRunResumed,
		handleRunFinalized,
		handleStepStarted,
		handleStepFinished,
		handleClearExecution,
	]);

	return null;
}
