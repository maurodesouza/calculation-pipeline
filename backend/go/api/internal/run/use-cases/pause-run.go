package usecases

import (
	"context"

	"github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/queue"
	runPkg "github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/run"
)

type PauseRunUseCaseDependencies struct {
	RunRepository *runPkg.RunRepository
	Queue         *queue.RabbitMQ
}

type PauseRunUseCase struct {
	PauseRunUseCaseDependencies
}

func NewPauseRunUseCase(deps PauseRunUseCaseDependencies) PauseRunUseCase {
	return PauseRunUseCase{
		PauseRunUseCaseDependencies: deps,
	}
}

type PauseRunInput struct {
	RunId string
}

func (u *PauseRunUseCase) Execute(input PauseRunInput) error {
	run, err := u.RunRepository.GetById(context.Background(), input.RunId)
	if err != nil {
		return err
	}

	if run == nil {
		return runPkg.RunNotFoundError
	}

	err = run.Pause()
	if err != nil {
		return err
	}

	err = u.RunRepository.Update(context.Background(), run)
	if err != nil {
		return err
	}

	err = u.Queue.Publish("run.pause-requested", runPkg.RunPauseRequestedMapper(run), queue.PublishConfig{})
	if err != nil {
		return err
	}

	return nil
}
