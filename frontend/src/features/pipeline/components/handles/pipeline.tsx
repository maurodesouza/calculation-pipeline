import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";
import { z } from "zod";
import { events } from "#/events";
import { PipelineEvents } from "#/features/pipeline/events";
import { queryClient } from "#/integrations/tanstack-query/root-provider";
import { getPipelineQueryOptions } from "../../lib/react-query/get-pipeline-query-options";
import { getPipelinesQueryOptions } from "../../lib/react-query/get-pipelines-query-options";
import { savePipelineMutationOptions } from "../../lib/react-query/save-pipeline-mutation-options";
import { syncStepsMutationOptions } from "../../lib/react-query/sync-steps-mutation-options";
import { usePipelineContext } from "../../store";
import type { StepInput } from "../../types/pipeline";
import { canvas } from "../../utils/canvas";

const nameSchema = z.string().max(50, "Name must be at most 50 characters");

export function PipelineHandle() {
	const { store } = usePipelineContext();
	const navigate = useNavigate({ from: "/pipelines/$id" as never });

	const savePipelineMutation = useMutation(savePipelineMutationOptions());
	const syncStepsMutation = useMutation(syncStepsMutationOptions());

	const onUpdateName = useCallback(
		(name: string) => {
			const result = nameSchema.safeParse(name);

			if (result.success) {
				store.setState((state) => ({
					...state,
					name: result.data,
				}));
			}
		},
		[store],
	);

	const savePipeline = useCallback(async () => {
		const state = store.get();

		const result = await savePipelineMutation.mutateAsync({
			id: state.id,
			name: state.name,
			description: state.description,
			canvas: JSON.stringify({
				nodes: state.nodes,
				edges: state.edges,
			}),
		});

		const pipelineId = state.id === "new" ? result.id : state.id;
		const chain = canvas.chain.build(state.nodes, state.edges);
		const steps: StepInput[] = chain.map(canvas.nodes.map.toStepInput());

		if (steps.length > 0) {
			await syncStepsMutation.mutateAsync({
				pipelineId,
				steps,
			});
		}

		queryClient.invalidateQueries(getPipelinesQueryOptions());

		if (state.id === "new") {
			store.setState((s) => ({ ...s, id: result.id }));

			navigate({
				to: "/pipelines/$id" as never,
				params: {
					id: result.id,
				} as never,
			});

			return;
		}

		queryClient.invalidateQueries(getPipelineQueryOptions(state.id));
	}, [savePipelineMutation, syncStepsMutation, store, navigate]);

	useEffect(() => {
		const unsubscribe1 = events.on(PipelineEvents.UPDATE_NAME, onUpdateName);
		const unsubscribe2 = events.on(PipelineEvents.SAVE_PIPELINE, savePipeline);

		return () => {
			unsubscribe1();
			unsubscribe2();
		};
	}, [onUpdateName, savePipeline]);

	return null;
}
