package pipeline

import (
	"slices"
	"time"

	"github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/shared/vo"
)

var VALID_OPERATIONS = []string{"sum", "subtract", "multiply", "divide"}

type Step struct {
	ID          vo.UUID
	PipelineID  vo.UUID
	Name        string
	Description string
	NextStepID  vo.UUID
	Operation   string
	By          int
	CreatedAt   string
	UpdatedAt   string
}

type NewStepPayload struct {
	ID          *string
	Name        *string
	PipelineID  *string
	Description *string
	NextStepID  *string
	Operation   string
	By          int
}

func NewStep(payload NewStepPayload) (*Step, error) {
	now := time.Now().String()

	id, err := getStepId(payload.ID)
	if err != nil {
		return nil, err
	}

	nextStepId, err := getNextStepId(payload.NextStepID)
	if err != nil {
		return nil, err
	}

	if payload.PipelineID == nil {
		return nil, RequiredOperationError
	}

	pipelineId, err := vo.RestoreUUID(payload.PipelineID)
	if err != nil {
		return nil, err
	}

	if err := validateOperation(&payload.Operation); err != nil {
		return nil, err
	}

	return &Step{
		ID:          id,
		PipelineID:  pipelineId,
		Name:        *payload.Name,
		Description: *payload.Description,
		NextStepID:  *nextStepId,
		Operation:   payload.Operation,
		By:          payload.By,
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}

type RestorePayload struct {
	ID          string
	PipelineID  string
	Name        *string
	Description *string
	NextStepID  *string
	Operation   string
	By          int
	CreatedAt   string
	UpdatedAt   string
}

func RestoreStep(payload RestorePayload) (*Step, error) {
	id, err := vo.RestoreUUID(&payload.ID)
	if err != nil {
		return nil, err
	}

	pipelineId, err := vo.RestoreUUID(&payload.PipelineID)
	if err != nil {
		return nil, err
	}

	nextStepId, err := getNextStepId(payload.NextStepID)
	if err != nil {
		return nil, err
	}

	if err := validateOperation(&payload.Operation); err != nil {
		return nil, err
	}

	return &Step{
		ID:          id,
		PipelineID:  pipelineId,
		Name:        *payload.Name,
		Description: *payload.Description,
		NextStepID:  *nextStepId,
		Operation:   payload.Operation,
		By:          payload.By,
		CreatedAt:   payload.CreatedAt,
		UpdatedAt:   payload.UpdatedAt,
	}, nil
}

func (entity *Step) GetId() string {
	return entity.ID.GetValue()
}

func (entity *Step) GetPipelineId() string {
	return entity.PipelineID.GetValue()
}

func (entity *Step) GetName() string {
	return entity.Name
}

func (entity *Step) GetDescription() string {
	return entity.Description
}

func (entity *Step) GetNextStepId() string {
	return entity.NextStepID.GetValue()
}

func (entity *Step) GetOperation() string {
	return entity.Operation
}

func (entity *Step) GetBy() int {
	return entity.By
}

func (entity *Step) GetCreatedAt() string {
	return entity.CreatedAt
}

func (entity *Step) GetUpdatedAt() string {
	return entity.UpdatedAt
}

func getStepId(value *string) (vo.UUID, error) {
	if value != nil {
		id, err := vo.RestoreUUID(value)

		if err != nil {
			return vo.UUID{}, err
		}

		return id, nil
	}

	return vo.NewUUID(), nil
}

func getNextStepId(value *string) (*vo.UUID, error) {
	if value != nil {
		id, err := vo.RestoreUUID(value)

		if err != nil {
			return nil, err
		}

		return &id, nil
	}

	return nil, nil
}

func validateOperation(operation *string) error {
	if operation == nil {
		return RequiredOperationError
	}

	if !slices.Contains(VALID_OPERATIONS, *operation) {
		return InvalidOperationError
	}

	return nil
}
