package pipeline

import (
	"slices"
	"time"

	"github.com/maurodesouza/calculation-pipeline/backend/go/api/internal/shared/vo"
)

var VALID_OPERATIONS = []string{"sum", "subtract", "multiply", "divide"}

type Step struct {
	id          vo.UUID
	pipelineID  vo.UUID
	name        string
	description string
	nextStepID  vo.UUID
	operation   string
	by          int
	createdAt   string
	updatedAt   string
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
	now := time.Now().Format(time.RFC3339)

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
		id:          id,
		pipelineID:  pipelineId,
		name:        *payload.Name,
		description: *payload.Description,
		nextStepID:  *nextStepId,
		operation:   payload.Operation,
		by:          payload.By,
		createdAt:   now,
		updatedAt:   now,
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
		id:          id,
		pipelineID:  pipelineId,
		name:        *payload.Name,
		description: *payload.Description,
		nextStepID:  *nextStepId,
		operation:   payload.Operation,
		by:          payload.By,
		createdAt:   payload.CreatedAt,
		updatedAt:   payload.UpdatedAt,
	}, nil
}

func (entity *Step) GetId() string {
	return entity.id.GetValue()
}

func (entity *Step) GetPipelineId() string {
	return entity.pipelineID.GetValue()
}

func (entity *Step) GetName() string {
	return entity.name
}

func (entity *Step) GetDescription() string {
	return entity.description
}

func (entity *Step) GetNextStepId() string {
	return entity.nextStepID.GetValue()
}

func (entity *Step) GetOperation() string {
	return entity.operation
}

func (entity *Step) GetBy() int {
	return entity.by
}

func (entity *Step) GetCreatedAt() string {
	return entity.createdAt
}

func (entity *Step) GetUpdatedAt() string {
	return entity.updatedAt
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
