export type Pipeline = {
	id: string;
	name?: string;
	description?: string;
	initialStepId?: string;
	canvas?: string;
	createdAt: Date;
	updatedAt: Date;
};

export type SavePipelinePayload = {
	id?: string;
	name?: string;
	description?: string;

	canvas?: string;
};

export type StepInput = {
	id: string;
	name?: string;
	description?: string;
	operation: string;
	by: number;
	nextStepId?: string;
};
