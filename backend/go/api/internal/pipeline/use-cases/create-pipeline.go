package usecases

import (
	"context"

	"github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/pipeline"
)

type CreatePipelineUseCaseDependencies struct {
	PipelineRepository *pipeline.PipelineRepository
}

type CreatePipelineUseCase struct {
	CreatePipelineUseCaseDependencies
}

func NewCreatePipelineUseCase(deps CreatePipelineUseCaseDependencies) CreatePipelineUseCase {
	return CreatePipelineUseCase{
		CreatePipelineUseCaseDependencies: deps,
	}
}

type CreatePipelineInput struct {
	Name        *string
	Description *string
	Canvas      *string
}

type CreatePipelineOutput struct {
	ID string
}

func (u *CreatePipelineUseCase) Execute(input CreatePipelineInput) (CreatePipelineOutput, error) {
	p, err := pipeline.NewPipeline(pipeline.NewPipelinePayload{
		Name:        input.Name,
		Description: input.Description,
		Canvas:      input.Canvas,
	})
	if err != nil {
		return CreatePipelineOutput{}, err
	}

	err = u.PipelineRepository.Save(context.Background(), p)
	if err != nil {
		return CreatePipelineOutput{}, err
	}

	return CreatePipelineOutput{ID: p.GetId()}, nil
}
