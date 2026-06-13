package usecases

import (
	"context"

	"github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/pipeline"
	"github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/shared/errors"
)

type GetPipelineUseCaseDependencies struct {
	PipelineRepository *pipeline.PipelineRepository
}

type GetPipelineUseCase struct {
	GetPipelineUseCaseDependencies
}

func NewGetPipelineUseCase(deps GetPipelineUseCaseDependencies) GetPipelineUseCase {
	return GetPipelineUseCase{
		GetPipelineUseCaseDependencies: deps,
	}
}

type GetPipelineInput struct {
	ID string
}

type GetPipelineOutput struct {
	ID            string
	Name          *string
	Description   *string
	InitialStepId *string
	Canvas        string
	CreatedAt     string
	UpdatedAt     string
}

func (u *GetPipelineUseCase) Execute(input GetPipelineInput) (GetPipelineOutput, error) {
	p, err := u.PipelineRepository.GetByID(context.Background(), input.ID)
	if err != nil {
		return GetPipelineOutput{}, err
	}

	if p == nil {
		return GetPipelineOutput{}, errors.PipelineNotFoundError(input.ID)
	}

	return GetPipelineOutput{
		ID:            p.GetId(),
		Name:          p.GetName(),
		Description:   p.GetDescription(),
		InitialStepId: p.GetInitialStepId(),
		Canvas:        p.GetCanvas(),
		CreatedAt:     p.GetCreatedAt(),
		UpdatedAt:     p.GetUpdatedAt(),
	}, nil
}
