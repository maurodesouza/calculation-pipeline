package run

import "github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/pipeline"

type Steps struct {
	ID         string `json:"id"`
	Operation  string `json:"operation"`
	By         int    `json:"by"`
	NextStepId string `json:"nextStepId"`
}

type RunCreated struct {
	RunID   string  `json:"runId"`
	Payload float64 `json:"payload"`
	Steps   []Steps `json:"steps"`
}

func RunCreatedMapper(run *Run, pipeline *pipeline.Pipeline) RunCreated {
	steps := make([]Steps, 0)
	for _, step := range pipeline.GetSteps() {
		steps = append(steps, Steps{
			ID:         step.GetId(),
			Operation:  step.GetOperation(),
			By:         step.GetBy(),
			NextStepId: step.GetNextStepId(),
		})
	}

	return RunCreated{
		RunID:   run.GetId(),
		Payload: run.GetPayload(),
		Steps:   steps,
	}
}

type RunPauseRequested struct {
	RunID string `json:"runId"`
}

func RunPauseRequestedMapper(run *Run) RunPauseRequested {
	return RunPauseRequested{
		RunID: run.GetId(),
	}
}

type RunResumeRequested struct {
	RunID string `json:"runId"`
}

func RunResumeRequestedMapper(run *Run) RunResumeRequested {
	return RunResumeRequested{
		RunID: run.GetId(),
	}
}
