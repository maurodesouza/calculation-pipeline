package usecases

import (
	"context"

	runPkg "github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/run"
)

type FinalizeRunUseCaseDependencies struct {
	RunRepository *runPkg.RunRepository
}

type FinalizeRunUseCase struct {
	FinalizeRunUseCaseDependencies
}

func NewFinalizeRunUseCase(deps FinalizeRunUseCaseDependencies) FinalizeRunUseCase {
	return FinalizeRunUseCase{
		FinalizeRunUseCaseDependencies: deps,
	}
}

type FinalizeRunInput struct {
	RunId string
}

func (u *FinalizeRunUseCase) Execute(input FinalizeRunInput) error {
	run, err := u.RunRepository.GetById(context.Background(), input.RunId)
	if err != nil {
		return err
	}

	if run == nil {
		return runPkg.RunNotFoundError
	}

	err = run.Finalize()
	if err != nil {
		return err
	}

	err = u.RunRepository.Update(context.Background(), run)
	if err != nil {
		return err
	}

	return nil
}
