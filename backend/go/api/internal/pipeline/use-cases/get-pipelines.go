package usecases

import (
	"context"

	"github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/pipeline"
)

type GetPipelinesUseCaseDependencies struct {
	PipelineRepository *pipeline.PipelineRepository
}

type GetPipelinesUseCase struct {
	GetPipelinesUseCaseDependencies
}

func NewGetPipelinesUseCase(deps GetPipelinesUseCaseDependencies) GetPipelinesUseCase {
	return GetPipelinesUseCase{
		GetPipelinesUseCaseDependencies: deps,
	}
}

type GetPipelinesInput struct {
	Page   *int
	Limit  *int
	Name   string
	ID     string
	SortBy string
}

type PipelineSummary struct {
	ID            string
	Name          *string
	Description   *string
	InitialStepId *string
	CreatedAt     string
	UpdatedAt     string
}

type GetPipelinesOutput struct {
	Data  []PipelineSummary
	Total int
	Page  int
	Limit int
}

func (u *GetPipelinesUseCase) Execute(input GetPipelinesInput) (GetPipelinesOutput, error) {
	page := 1
	if input.Page != nil && *input.Page > 0 {
		page = *input.Page
	}

	limit := 10
	if input.Limit != nil && *input.Limit > 0 {
		limit = *input.Limit
	}

	offset := (page - 1) * limit
	sortBy := input.SortBy
	if sortBy == "" {
		sortBy = "created_at"
	}

	pipelines, err := u.PipelineRepository.List(context.Background(), pipeline.ListFilters{
		Limit:  limit,
		Offset: offset,
		Name:   input.Name,
		ID:     input.ID,
		SortBy: sortBy,
	})
	if err != nil {
		return GetPipelinesOutput{}, err
	}

	total, err := u.PipelineRepository.Count(context.Background(), pipeline.CountFilters{
		Name: input.Name,
		ID:   input.ID,
	})
	if err != nil {
		return GetPipelinesOutput{}, err
	}

	data := make([]PipelineSummary, len(pipelines))
	for i, p := range pipelines {
		data[i] = PipelineSummary{
			ID:            p.GetId(),
			Name:          p.GetName(),
			Description:   p.GetDescription(),
			InitialStepId: p.GetInitialStepId(),
			CreatedAt:     p.GetCreatedAt(),
			UpdatedAt:     p.GetUpdatedAt(),
		}
	}

	return GetPipelinesOutput{
		Data:  data,
		Total: total,
		Page:  page,
		Limit: limit,
	}, nil
}
