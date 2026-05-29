import { useCallback, useEffect } from "react";
import { events } from "#/events";
import { PipelineEvents } from "#/features/pipeline/events";
import { usePipelineContext } from "#/features/pipeline/store";
import type { CanvasOperationNode } from "#/features/pipeline/types/canvas-node";
import { canvas } from "#/features/pipeline/utils/canvas";

type RunStartedPayload = {
	runId: string;
};

type RunCompletedPayload = {
	runId: string;
};

type RunFailedPayload = {
	runId: string;
	error?: string;
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

	const handleStepRequested = useCallback(
		({ runId, stepId }: StepRequestedPayload) => {
			const state = store.state;

			if (state.run.id !== runId) return;

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

			if (state.run.id !== runId) return;

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
			run: { id: null, status: "idle" as const },
			nodes: prev.nodes.map(
				canvas.nodes.map.clearExecution(),
			) as CanvasOperationNode[],
		}));
	}, [store]);

	useEffect(() => {
		const unsub1 = events.on("run.started", handleRunStarted);
		const unsub2 = events.on("run.completed", handleRunCompleted);
		const unsub3 = events.on("run.failed", handleRunFailed);
		const unsub4 = events.on("step.requested", handleStepRequested);
		const unsub5 = events.on("step.finished", handleStepFinished);
		const unsub6 = events.on(
			PipelineEvents.EXECUTION_CLEAR,
			handleClearExecution,
		);

		return () => {
			unsub1();
			unsub2();
			unsub3();
			unsub4();
			unsub5();
			unsub6();
		};
	}, [
		handleRunStarted,
		handleRunCompleted,
		handleRunFailed,
		handleStepRequested,
		handleStepFinished,
		handleClearExecution,
	]);

	return null;
}
