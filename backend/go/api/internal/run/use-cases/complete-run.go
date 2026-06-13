package usecases

import (
	"context"

	runPkg "github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/run"
)

type CompleteRunUseCaseDependencies struct {
	RunRepository *runPkg.RunRepository
}

type CompleteRunUseCase struct {
	CompleteRunUseCaseDependencies
}

func NewCompleteRunUseCase(deps CompleteRunUseCaseDependencies) CompleteRunUseCase {
	return CompleteRunUseCase{
		CompleteRunUseCaseDependencies: deps,
	}
}

type CompleteRunInput struct {
	RunId  string
	Result float64
}

func (u *CompleteRunUseCase) Execute(input CompleteRunInput) error {
	run, err := u.RunRepository.GetById(context.Background(), input.RunId)
	if err != nil {
		return err
	}

	if run == nil {
		return runPkg.RunNotFoundError
	}

	err = run.Complete(input.Result)
	if err != nil {
		return err
	}

	err = u.RunRepository.Update(context.Background(), run)
	if err != nil {
		return err
	}

	return nil
}
