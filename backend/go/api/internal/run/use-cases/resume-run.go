package usecases

import (
	"context"

	"github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/queue"
	runPkg "github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/run"
)

type ResumeRunUseCaseDependencies struct {
	RunRepository *runPkg.RunRepository
	Queue         *queue.RabbitMQ
}

type ResumeRunUseCase struct {
	ResumeRunUseCaseDependencies
}

func NewResumeRunUseCase(deps ResumeRunUseCaseDependencies) ResumeRunUseCase {
	return ResumeRunUseCase{
		ResumeRunUseCaseDependencies: deps,
	}
}

type ResumeRunInput struct {
	RunId string
}

func (u *ResumeRunUseCase) Execute(input ResumeRunInput) error {
	run, err := u.RunRepository.GetById(context.Background(), input.RunId)
	if err != nil {
		return err
	}

	if run == nil {
		return runPkg.RunNotFoundError
	}

	err = run.Resume()
	if err != nil {
		return err
	}

	err = u.RunRepository.Update(context.Background(), run)
	if err != nil {
		return err
	}

	err = u.Queue.Publish("run.resume-requested", runPkg.RunResumeRequestedMapper(run), queue.PublishConfig{})
	if err != nil {
		return err
	}

	return nil
}
