package usecases

import (
	"context"

	"github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/pipeline"
	"github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/shared/errors"
)

type UpdatePipelineUseCaseDependencies struct {
	PipelineRepository *pipeline.PipelineRepository
}

type UpdatePipelineUseCase struct {
	UpdatePipelineUseCaseDependencies
}

func NewUpdatePipelineUseCase(deps UpdatePipelineUseCaseDependencies) UpdatePipelineUseCase {
	return UpdatePipelineUseCase{
		UpdatePipelineUseCaseDependencies: deps,
	}
}

type UpdatePipelineInput struct {
	ID          string
	Name        *string
	Description *string
	Canvas      *string
}

func (u *UpdatePipelineUseCase) Execute(input UpdatePipelineInput) error {
	p, err := u.PipelineRepository.GetByID(context.Background(), input.ID)
	if err != nil {
		return err
	}

	if p == nil {
		return errors.PipelineNotFoundError(input.ID)
	}

	if input.Name != nil {
		p.SetName(input.Name)
	}

	if input.Description != nil {
		p.SetDescription(input.Description)
	}

	if input.Canvas != nil {
		if err := p.SetCanvas(input.Canvas); err != nil {
			return err
		}
	}

	return u.PipelineRepository.Update(context.Background(), p)
}
