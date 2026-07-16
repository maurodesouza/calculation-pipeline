package usecases

import (
	"context"

	pipelineRepository "github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/pipeline/repository"
	"github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/queue"
	runPkg "github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/run"
	"github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/run/entities"
	"github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/run/repository"
	"github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/shared/errors"
)

type CreateRunUseCaseDependencies struct {
	Queue              queue.RabbitMQ
	RunRepository      *repository.RunRepository
	PipelineRepository *pipelineRepository.PipelineRepository
}

type CreateRunUseCase struct {
	CreateRunUseCaseDependencies
}

func NewCreateRunUseCase(deps CreateRunUseCaseDependencies) CreateRunUseCase {
	return CreateRunUseCase{
		CreateRunUseCaseDependencies: deps,
	}
}

type CreateRunInput struct {
	PipelineId *string
	Payload    float64
}

func (u *CreateRunUseCase) Execute(input CreateRunInput) error {
	pipeline, err := u.PipelineRepository.GetByID(context.Background(), *input.PipelineId)
	if err != nil {
		return err
	}

	if pipeline == nil {
		return errors.PipelineNotFoundError(*input.PipelineId)
	}

	run, err := entities.NewRun(entities.NewRunPayload{
		PipelineId: input.PipelineId,
		Payload:    input.Payload,
	})

	if err != nil {
		return err
	}

	err = u.RunRepository.Save(context.Background(), run)
	if err != nil {
		return err
	}

	u.Queue.Publish("run.created", runPkg.RunCreatedMapper(run, pipeline), queue.PublishConfig{})

	return nil
}
