import { useCallback, useEffect } from "react";
import { events } from "#/events";
import { usePipelineContext } from "#/features/pipeline/store";
import type { CanvasOperationNode } from "#/features/pipeline/types/canvas-node";
import { canvas } from "#/features/pipeline/utils/canvas";
import { command } from "#/lib/command/index";

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

type RunPausedPayload = {
	runId: string;
};

type RunResumedPayload = {
	runId: string;
};

type RunFinalizedPayload = {
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
	stepId: string;
	result?: number;
	error?: string;
};

export function ExecutionHandle() {
	const { store } = usePipelineContext();
	const pipelineId = store.state.id;

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
		({ runId }: RunFinalizedPayload) => {
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
		({ runId, stepId }: StepRequestedPayload) => {
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
		const unsub1 = events.on("run.started", handleRunStarted);
		const unsub2 = events.on("run.completed", handleRunCompleted);
		const unsub3 = events.on("run.failed", handleRunFailed);
		const unsub7 = events.on("run.paused", handleRunPaused);
		const unsub8 = events.on("run.resumed", handleRunResumed);
		const unsub9 = events.on("run.finalized", handleRunFinalized);
		const unsub4 = events.on("step.started", handleStepStarted);
		const unsub5 = events.on("step.finished", handleStepFinished);

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
			unsub1();
			unsub2();
			unsub3();
			unsub4();
			unsub5();
			disposeClearExecution();
			unsub7();
			unsub8();
			unsub9();
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
