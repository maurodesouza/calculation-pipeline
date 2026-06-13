package usecases

import (
	"context"

	"github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/pipeline"
	"github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/queue"
	runPkg "github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/run"
	"github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/shared/errors"
)

type CreateRunUseCaseDependencies struct {
	Queue              queue.RabbitMQ
	RunRepository      *runPkg.RunRepository
	PipelineRepository *pipeline.PipelineRepository
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

	run, err := runPkg.NewRun(runPkg.NewRunPayload{
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
