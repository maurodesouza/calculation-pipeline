package usecases

import (
	"context"

	runPkg "github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/run"
)

type StartRunUseCaseDependencies struct {
	RunRepository *runPkg.RunRepository
}

type StartRunUseCase struct {
	StartRunUseCaseDependencies
}

func NewStartRunUseCase(deps StartRunUseCaseDependencies) StartRunUseCase {
	return StartRunUseCase{
		StartRunUseCaseDependencies: deps,
	}
}

type StartRunInput struct {
	RunId string
}

func (u *StartRunUseCase) Execute(input StartRunInput) error {
	run, err := u.RunRepository.GetById(context.Background(), input.RunId)
	if err != nil {
		return err
	}

	if run == nil {
		return runPkg.RunNotFoundError
	}

	err = run.Start()
	if err != nil {
		return err
	}

	err = u.RunRepository.Update(context.Background(), run)
	if err != nil {
		return err
	}

	return nil
}
