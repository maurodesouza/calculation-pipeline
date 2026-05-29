import { useCallback, useEffect } from "react";
import { events } from "#/events";
import { PipelineEvents } from "#/features/pipeline/events";
import { usePipelineContext } from "#/features/pipeline/store";
import type { CanvasOperationNode } from "#/features/pipeline/types/canvas-node";
import { canvas } from "#/features/pipeline/utils/canvas";

type RunStartedPayload = {
	runId: string;
};

type StepRequestedPayload = {
	runId: string;
	stepId: string;
	operation: string;
	value: number;
	by: number;
};

type StepFinishedPayload = {
	runId: string;
	result?: number;
	error?: string;
};

export function ExecutionHandle() {
	const { store } = usePipelineContext();

	const handleRunStarted = useCallback(
		({ runId }: RunStartedPayload) => {
			const state = store.state;

			if (state.currentRunId !== runId) return;

			store.setState((prev) => ({
				...prev,
				nodes: prev.nodes.map(
					canvas.nodes.map.updateOperationData({
						execution: {
							state: "pending" as const,
							runId,
						},
					}),
				) as CanvasOperationNode[],
			}));
		},
		[store],
	);

	const handleStepRequested = useCallback(
		({ runId, stepId }: StepRequestedPayload) => {
			const state = store.state;

			if (state.currentRunId !== runId) return;

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
		({ runId, result, error }: StepFinishedPayload) => {
			const state = store.state;

			if (state.currentRunId !== runId) return;

			const runningNode = state.nodes.find(
				canvas.nodes.find.byExecutionState(runId, "running"),
			) as CanvasOperationNode | undefined;

			if (!runningNode) return;

			const newState = error ? "failed" : "completed";

			store.setState((prev) => ({
				...prev,
				nodes: prev.nodes.map(
					canvas.nodes.map.updateData(runningNode.id, {
						execution: {
							state: newState as "completed" | "failed",
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
			nodes: prev.nodes.map(
				canvas.nodes.map.clearExecution(),
			) as CanvasOperationNode[],
		}));
	}, [store]);

	useEffect(() => {
		const unsub1 = events.on("run.started", handleRunStarted);
		const unsub2 = events.on("step.requested", handleStepRequested);
		const unsub3 = events.on("step.finished", handleStepFinished);
		const unsub4 = events.on(
			PipelineEvents.EXECUTION_CLEAR,
			handleClearExecution,
		);

		return () => {
			unsub1();
			unsub2();
			unsub3();
			unsub4();
		};
	}, [
		handleRunStarted,
		handleStepRequested,
		handleStepFinished,
		handleClearExecution,
	]);

	return null;
}
