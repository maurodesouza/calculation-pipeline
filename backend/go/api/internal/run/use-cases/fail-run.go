package usecases

import (
	"context"

	runPkg "github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/run"
)

type FailRunUseCaseDependencies struct {
	RunRepository *runPkg.RunRepository
}

type FailRunUseCase struct {
	FailRunUseCaseDependencies
}

func NewFailRunUseCase(deps FailRunUseCaseDependencies) FailRunUseCase {
	return FailRunUseCase{
		FailRunUseCaseDependencies: deps,
	}
}

type FailRunInput struct {
	RunId string
	Error string
}

func (u *FailRunUseCase) Execute(input FailRunInput) error {
	run, err := u.RunRepository.GetById(context.Background(), input.RunId)
	if err != nil {
		return err
	}

	if run == nil {
		return runPkg.RunNotFoundError
	}

	err = run.Fail(input.Error)
	if err != nil {
		return err
	}

	err = u.RunRepository.Update(context.Background(), run)
	if err != nil {
		return err
	}

	return nil
}
