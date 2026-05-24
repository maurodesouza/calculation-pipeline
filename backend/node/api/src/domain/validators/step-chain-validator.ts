import { InvalidStateTransitionError } from "../errors";
import { Step } from "../entities/step";

export function validateStepChain(steps: Step[]): [undefined, undefined] | [undefined, Error] {
	for (let i = 0; i < steps.length; i++) {
		const currentStep = steps[i]!;
		const isLastStep = i === steps.length - 1;

		if (isLastStep) {
			if (currentStep.getNextStepId()) {
				return [undefined, new InvalidStateTransitionError('step', 'undefined', 'last step should not have nextStepId')];
			}

			continue
		}

		const nextStep = steps[i + 1]!;

		if (currentStep.getNextStepId() !== nextStep.getId()) {
			return [undefined, new InvalidStateTransitionError('step', currentStep.getNextStepId() || 'undefined', nextStep.getId())];
		}
	}

	return [undefined, undefined];
}
