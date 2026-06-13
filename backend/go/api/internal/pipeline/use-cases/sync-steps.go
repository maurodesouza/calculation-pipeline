package usecases

import (
	"context"

	"github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/pipeline"
	"github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/shared/errors"
)

type SyncStepsUseCaseDependencies struct {
	PipelineRepository *pipeline.PipelineRepository
}

type SyncStepsUseCase struct {
	SyncStepsUseCaseDependencies
}

func NewSyncStepsUseCase(deps SyncStepsUseCaseDependencies) SyncStepsUseCase {
	return SyncStepsUseCase{
		SyncStepsUseCaseDependencies: deps,
	}
}

type StepInput struct {
	ID          string
	Name        *string
	Description *string
	Operation   string
	By          int
	NextStepId  *string
}

type SyncStepsInput struct {
	PipelineId string
	Steps      []StepInput
}

type SyncStepsOutput struct {
	Created int
	Updated int
	Deleted int
}

func (u *SyncStepsUseCase) Execute(input SyncStepsInput) (SyncStepsOutput, error) {
	p, err := u.PipelineRepository.GetByID(context.Background(), input.PipelineId)
	if err != nil {
		return SyncStepsOutput{}, err
	}

	if p == nil {
		return SyncStepsOutput{}, errors.PipelineNotFoundError(input.PipelineId)
	}

	stepInputs := make([]pipeline.StepInput, len(input.Steps))
	for i, s := range input.Steps {
		stepInputs[i] = pipeline.StepInput{
			ID:          s.ID,
			Name:        s.Name,
			Description: s.Description,
			Operation:   s.Operation,
			By:          s.By,
			NextStepId:  s.NextStepId,
		}
	}

	chain, err := pipeline.RestoreSteps(p, stepInputs)
	if err != nil {
		return SyncStepsOutput{}, err
	}

	if err := p.SetSteps(chain); err != nil {
		return SyncStepsOutput{}, err
	}

	result, err := u.PipelineRepository.Sync(context.Background(), p)
	if err != nil {
		return SyncStepsOutput{}, err
	}

	return SyncStepsOutput{
		Created: result.Created,
		Updated: result.Updated,
		Deleted: result.Deleted,
	}, nil
}
