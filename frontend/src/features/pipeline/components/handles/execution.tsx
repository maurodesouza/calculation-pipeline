import { useSelector } from "@tanstack/react-store";
import { useCallback, useEffect } from "react";
import type {
	ExecutionRunFinalizedPayload,
	RunCompletedPayload,
	RunFailedPayload,
	RunPausedPayload,
	RunResumedPayload,
	RunStartedPayload,
	StepFinishedPayload,
	StepStartedPayload,
} from "#/features/pipeline/commands";
import { usePipelineContext } from "#/features/pipeline/store";
import type { CanvasOperationNode } from "#/features/pipeline/types/canvas-node";
import { canvas } from "#/features/pipeline/utils/canvas";
import { command } from "#/lib/command/index";

export function ExecutionHandle() {
	const { store } = usePipelineContext();
	const pipelineId = useSelector(store, (state) => state.id);

	const onRunStarted = useCallback(
		async ({ runId }: RunStartedPayload) => {
			const state = store.state;

			if (state.run.id !== runId) return;

			store.setState((prev) => ({
				...prev,
				run: { ...prev.run, status: "started" as const },
			}));
		},
		[store],
	);

	const onRunCompleted = useCallback(
		async ({ runId }: RunCompletedPayload) => {
			const state = store.state;

			if (state.run.id !== runId) return;

			store.setState((prev) => ({
				...prev,
				run: { ...prev.run, status: "completed" as const },
			}));
		},
		[store],
	);

	const onRunFailed = useCallback(
		async ({ runId }: RunFailedPayload) => {
			const state = store.state;

			if (state.run.id !== runId) return;

			store.setState((prev) => ({
				...prev,
				run: { ...prev.run, status: "failed" as const },
			}));
		},
		[store],
	);

	const onRunPaused = useCallback(
		async ({ runId }: RunPausedPayload) => {
			const state = store.state;

			if (state.run.id !== runId) return;

			store.setState((prev) => ({
				...prev,
				run: { ...prev.run, status: "paused" as const },
			}));
		},
		[store],
	);

	const onRunResumed = useCallback(
		async ({ runId }: RunResumedPayload) => {
			const state = store.state;

			if (state.run.id !== runId) return;

			store.setState((prev) => ({
				...prev,
				run: { ...prev.run, status: "started" as const },
			}));
		},
		[store],
	);

	const onRunFinalized = useCallback(
		async ({ runId }: ExecutionRunFinalizedPayload) => {
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

	const onStepStarted = useCallback(
		async ({ runId, stepId }: StepStartedPayload) => {
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

	const onStepFinished = useCallback(
		async ({ runId, stepId, result, error }: StepFinishedPayload) => {
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

	const onClearExecution = useCallback(async () => {
		store.setState((prev) => ({
			...prev,
			run: { ...prev.run, id: null, status: "idle" as const },
			nodes: prev.nodes.map(
				canvas.nodes.map.clearExecution(),
			) as CanvasOperationNode[],
		}));
	}, [store]);

	useEffect(() => {
		const config = {
			instanceId: pipelineId,
			meta: { label: `Pipeline ${pipelineId}` },
		};

		const disposeRunStarted = command.handle(
			"pipelines.execution.run.started",
			onRunStarted,
			config,
		);

		const disposeRunCompleted = command.handle(
			"pipelines.execution.run.completed",
			onRunCompleted,
			config,
		);

		const disposeRunFailed = command.handle(
			"pipelines.execution.run.failed",
			onRunFailed,
			config,
		);

		const disposeRunPaused = command.handle(
			"pipelines.execution.run.paused",
			onRunPaused,
			config,
		);

		const disposeRunResumed = command.handle(
			"pipelines.execution.run.resumed",
			onRunResumed,
			config,
		);

		const disposeRunFinalized = command.handle(
			"pipelines.execution.run.finalized",
			onRunFinalized,
			config,
		);

		const disposeStepStarted = command.handle(
			"pipelines.execution.step.started",
			onStepStarted,
			config,
		);

		const disposeStepFinished = command.handle(
			"pipelines.execution.step.finished",
			onStepFinished,
			config,
		);

		const disposeClearExecution = command.handle(
			"pipelines.execution.clear",
			onClearExecution,
			config,
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
		onRunStarted,
		onRunCompleted,
		onRunFailed,
		onRunPaused,
		onRunResumed,
		onRunFinalized,
		onStepStarted,
		onStepFinished,
		onClearExecution,
	]);

	return null;
}
